"""Regression tests for MongoDB connectivity handling in server.startup_db().

Covers:
- Real MONGO_URL + successful ping -> connects to the real DB_NAME database.
- Real MONGO_URL + failed ping in production -> never falls back to
  MockDatabase; every collection access raises DatabaseUnavailableError.
- Real MONGO_URL + failed ping outside production -> falls back to
  MockDatabase (existing local/dev convenience, unchanged).
- /api/health reflects the resulting database status.
- A write against an unavailable database returns 503, never 201.
"""
import asyncio
import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient
from pymongo.errors import ServerSelectionTimeoutError

import server  # noqa: E402

REAL_MONGO_URL = "mongodb+srv://appuser:S3cur3Pass!@cluster0.ab12c.mongodb.net/tiny_explorers"


def _fake_client(ping_should_fail: bool):
    fake_admin = MagicMock()
    if ping_should_fail:
        fake_admin.command = AsyncMock(side_effect=ServerSelectionTimeoutError("fake cluster unreachable"))
    else:
        fake_admin.command = AsyncMock(return_value={"ok": 1})

    fake_client = MagicMock()
    fake_client.admin = fake_admin
    fake_client.__getitem__.side_effect = lambda name: f"connected-db:{name}"
    return MagicMock(return_value=fake_client)


@pytest.fixture(autouse=True)
def _restore_db_state():
    """Every test mutates module globals directly; always restore them."""
    original_db = server.db
    original_client = server.client
    original_status = server.mongo_status
    yield
    server.db = original_db
    server.client = original_client
    server.mongo_status = original_status


class TestStartupDbConnectsWhenReachable:
    def test_successful_ping_connects_to_configured_db_name(self):
        with patch.object(server, "MONGO_URL", REAL_MONGO_URL), patch.object(
            server, "DB_NAME", "tiny_explorers"
        ), patch.object(server, "AsyncIOMotorClient", _fake_client(ping_should_fail=False)):
            asyncio.run(server.startup_db())

        assert server.mongo_status == "connected"
        assert server.db == "connected-db:tiny_explorers"


class TestStartupDbNeverSilentlyFallsBackInProduction:
    def test_unreachable_mongo_in_production_never_uses_mock_database(self):
        with patch.object(server, "MONGO_URL", REAL_MONGO_URL), patch.object(
            server, "ENVIRONMENT", "production"
        ), patch.object(server, "AsyncIOMotorClient", _fake_client(ping_should_fail=True)):
            asyncio.run(server.startup_db())

        assert server.mongo_status == "unavailable"
        assert isinstance(server.db, server.UnavailableDatabase)

    def test_unavailable_database_raises_instead_of_succeeding(self):
        with patch.object(server, "MONGO_URL", REAL_MONGO_URL), patch.object(
            server, "ENVIRONMENT", "production"
        ), patch.object(server, "AsyncIOMotorClient", _fake_client(ping_should_fail=True)):
            asyncio.run(server.startup_db())

        with pytest.raises(server.DatabaseUnavailableError):
            asyncio.run(server.db.newsletter.insert_one({"email": "a@example.com"}))


class TestStartupDbFallsBackOutsideProductionOnly:
    def test_unreachable_mongo_outside_production_uses_mock_database(self):
        with patch.object(server, "MONGO_URL", REAL_MONGO_URL), patch.object(
            server, "ENVIRONMENT", "development"
        ), patch.object(server, "AsyncIOMotorClient", _fake_client(ping_should_fail=True)):
            asyncio.run(server.startup_db())

        assert server.mongo_status == "unavailable"
        assert isinstance(server.db, server.MockDatabase)


class TestHealthReflectsDatabaseStatus:
    def test_health_reports_connected(self):
        # Enter the TestClient context first (runs the real startup event),
        # then override the post-startup state to simulate the scenario.
        with TestClient(server.app) as client:
            server.mongo_status = "connected"
            resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["database"] == "connected"

    def test_health_reports_unavailable(self):
        with TestClient(server.app) as client:
            server.mongo_status = "unavailable"
            resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["database"] == "unavailable"


class TestFailedWriteNeverReturns201:
    def test_newsletter_post_returns_503_when_database_unavailable(self):
        server.limiter.reset()  # rate-limit state persists across tests in this session
        with TestClient(server.app) as client:
            server.db = server.UnavailableDatabase()
            resp = client.post("/api/newsletter", json={"email": "parent@example.com"})
        assert resp.status_code == 503
        assert resp.status_code != 201

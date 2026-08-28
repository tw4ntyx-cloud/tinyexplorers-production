"""Unit tests for the Google Workspace newsletter integration.

Unlike tests/test_api.py (which exercises a live running server via HTTP),
these tests import the FastAPI app and google_workspace module directly and
mock all Google API calls — no real network access or credentials involved.
"""
import asyncio
import os
import sys
import uuid
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import google_workspace  # noqa: E402
import server  # noqa: E402

ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]


class FakeHttpError(Exception):
    class _Resp:
        def __init__(self, status: int) -> None:
            self.status = status

    def __init__(self, status: int) -> None:
        self.resp = FakeHttpError._Resp(status)


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        yield c


@pytest.fixture(autouse=True)
def _isolated_newsletter_collection():
    """Give every test a clean in-memory newsletter collection."""
    server.db.newsletter = server.MockDatabase().newsletter
    yield


def _admin_headers():
    return {"X-Admin-Key": ADMIN_API_KEY}


# ----- google_workspace module (pure unit tests, no HTTP) -----
class TestGoogleWorkspaceModule:
    def test_not_configured_when_env_vars_missing(self):
        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", ""), patch.object(
            google_workspace, "GOOGLE_WORKSPACE_ADMIN_EMAIL", ""
        ), patch.object(google_workspace, "GOOGLE_NEWSLETTER_GROUP_EMAIL", ""):
            assert google_workspace.is_configured() is False

    def test_add_subscriber_not_configured_returns_without_network_call(self):
        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", ""):
            result = asyncio.run(google_workspace.add_subscriber_to_group("someone@example.com"))
        assert result == "not_configured"

    def test_add_subscriber_success(self):
        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", "{}"), patch.object(
            google_workspace, "GOOGLE_WORKSPACE_ADMIN_EMAIL", "admin@example.com"
        ), patch.object(google_workspace, "GOOGLE_NEWSLETTER_GROUP_EMAIL", "newsletter@example.com"), patch.object(
            google_workspace, "_insert_member_sync", return_value=None
        ):
            result = asyncio.run(google_workspace.add_subscriber_to_group("someone@example.com"))
        assert result == "added"

    def test_add_subscriber_already_member(self):
        def _raise_conflict(email):
            raise FakeHttpError(409)

        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", "{}"), patch.object(
            google_workspace, "GOOGLE_WORKSPACE_ADMIN_EMAIL", "admin@example.com"
        ), patch.object(google_workspace, "GOOGLE_NEWSLETTER_GROUP_EMAIL", "newsletter@example.com"), patch.object(
            google_workspace, "_insert_member_sync", side_effect=_raise_conflict
        ):
            result = asyncio.run(google_workspace.add_subscriber_to_group("someone@example.com"))
        assert result == "already_member"

    def test_add_subscriber_unavailable_returns_failed_not_raises(self):
        def _raise_server_error(email):
            raise FakeHttpError(503)

        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", "{}"), patch.object(
            google_workspace, "GOOGLE_WORKSPACE_ADMIN_EMAIL", "admin@example.com"
        ), patch.object(google_workspace, "GOOGLE_NEWSLETTER_GROUP_EMAIL", "newsletter@example.com"), patch.object(
            google_workspace, "_insert_member_sync", side_effect=_raise_server_error
        ):
            result = asyncio.run(google_workspace.add_subscriber_to_group("someone@example.com"))
        assert result == "failed"

    def test_remove_subscriber_not_a_member_treated_as_success(self):
        def _raise_not_found(email):
            raise FakeHttpError(404)

        with patch.object(google_workspace, "GOOGLE_SERVICE_ACCOUNT_JSON", "{}"), patch.object(
            google_workspace, "GOOGLE_WORKSPACE_ADMIN_EMAIL", "admin@example.com"
        ), patch.object(google_workspace, "GOOGLE_NEWSLETTER_GROUP_EMAIL", "newsletter@example.com"), patch.object(
            google_workspace, "_delete_member_sync", side_effect=_raise_not_found
        ):
            result = asyncio.run(google_workspace.remove_subscriber_from_group("someone@example.com"))
        assert result == "not_member"


# ----- /api/newsletter wired to Google Workspace results -----
class TestNewsletterGoogleWorkspaceWiring:
    def test_subscribe_marks_subscribed_when_added(self, client):
        email = f"gw_added_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="added"):
            r = client.post("/api/newsletter", json={"email": email})
        assert r.status_code == 201
        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "subscribed"

    def test_subscribe_marks_subscribed_when_already_member(self, client):
        email = f"gw_member_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="already_member"):
            r = client.post("/api/newsletter", json={"email": email})
        assert r.status_code == 201
        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "subscribed"

    def test_subscribe_stays_pending_when_not_configured(self, client):
        email = f"gw_noconf_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="not_configured"):
            r = client.post("/api/newsletter", json={"email": email})
        assert r.status_code == 201
        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "pending"

    def test_subscribe_stays_pending_when_google_workspace_fails(self, client):
        email = f"gw_fail_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="failed"):
            r = client.post("/api/newsletter", json={"email": email})
        assert r.status_code == 201
        # The subscription is still stored even though Google Workspace failed.
        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "pending"

    def test_subscribe_response_never_leaks_google_errors(self, client):
        email = f"gw_safe_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="failed"):
            r = client.post("/api/newsletter", json={"email": email})
        body = r.text.lower()
        assert "traceback" not in body
        assert "credential" not in body
        assert "service_account" not in body


# ----- POST /api/admin/newsletter/sync -----
class TestNewsletterSyncEndpoint:
    def test_sync_requires_admin_key(self, client):
        r = client.post("/api/admin/newsletter/sync")
        assert r.status_code == 401

    def test_sync_rejects_wrong_admin_key(self, client):
        r = client.post("/api/admin/newsletter/sync", headers={"X-Admin-Key": "wrong"})
        assert r.status_code == 401

    def test_sync_retries_and_marks_subscribed(self, client):
        email = f"sync_ok_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="not_configured"):
            client.post("/api/newsletter", json={"email": email})

        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="added"):
            r = client.post("/api/admin/newsletter/sync", headers=_admin_headers())
        assert r.status_code == 200
        data = r.json()
        assert data["subscribed"] >= 1
        assert data["success"] is True

        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "subscribed"

    def test_sync_preserves_still_failing_records_as_pending(self, client):
        email = f"sync_fail_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="not_configured"):
            client.post("/api/newsletter", json={"email": email})
            r = client.post("/api/admin/newsletter/sync", headers=_admin_headers())

        assert r.status_code == 200
        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "pending"


# ----- POST /api/admin/newsletter/unsubscribe -----
class TestNewsletterUnsubscribeEndpoint:
    def test_unsubscribe_requires_admin_key(self, client):
        r = client.post("/api/admin/newsletter/unsubscribe", json={"email": "someone@example.com"})
        assert r.status_code == 401

    def test_unsubscribe_unknown_email_returns_404(self, client):
        r = client.post(
            "/api/admin/newsletter/unsubscribe",
            json={"email": f"unknown_{uuid.uuid4().hex[:8]}@example.com"},
            headers=_admin_headers(),
        )
        assert r.status_code == 404

    def test_unsubscribe_marks_status_and_attempts_group_removal(self, client):
        email = f"unsub_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="added"):
            client.post("/api/newsletter", json={"email": email})

        with patch.object(server.google_workspace, "remove_subscriber_from_group", return_value="removed") as mock_remove:
            r = client.post(
                "/api/admin/newsletter/unsubscribe",
                json={"email": email},
                headers=_admin_headers(),
            )
        assert r.status_code == 200
        assert r.json()["status"] == "unsubscribed"
        mock_remove.assert_called_once_with(email)

        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        row = next(x for x in rows if x["email"] == email)
        assert row["status"] == "unsubscribed"


# ----- Malformed / rapid-duplicate requests -----
class TestNewsletterEdgeCases:
    def test_malformed_json_body_rejected(self, client):
        r = client.post(
            "/api/newsletter",
            content="not-json",
            headers={"Content-Type": "application/json"},
        )
        assert r.status_code == 422

    def test_missing_email_field_rejected(self, client):
        r = client.post("/api/newsletter", json={})
        assert r.status_code == 422

    def test_rapid_duplicate_submissions_only_store_once(self, client):
        # Isolate from rate-limit state accumulated by earlier tests in this file —
        # this test is specifically about duplicate handling, not rate limiting.
        server.limiter.reset()
        email = f"rapid_{uuid.uuid4().hex[:8]}@example.com"
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="not_configured"):
            responses = [client.post("/api/newsletter", json={"email": email}) for _ in range(3)]

        assert responses[0].status_code == 201
        assert responses[0].json().get("already_subscribed") is not True
        for r in responses[1:]:
            assert r.status_code in (200, 201)
            assert r.json().get("already_subscribed") is True

        rows = client.get("/api/newsletter", headers=_admin_headers()).json()
        assert sum(1 for x in rows if x["email"] == email) == 1

    def test_rapid_submissions_beyond_rate_limit_are_throttled(self, client):
        server.limiter.reset()
        with patch.object(server.google_workspace, "add_subscriber_to_group", return_value="not_configured"):
            responses = [
                client.post("/api/newsletter", json={"email": f"burst_{uuid.uuid4().hex[:8]}@example.com"})
                for _ in range(12)
            ]
        assert any(r.status_code == 429 for r in responses)

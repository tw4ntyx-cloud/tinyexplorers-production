"""Regression test: a Resend failure must never lose a persisted submission.

Existing tests only cover the "RESEND_API_KEY unset" no-op path. This test
simulates RESEND_API_KEY being configured but the Resend API call itself
raising, and confirms the HTTP response is still a successful 201 with the
record already persisted before the notification was attempted.
"""
import os
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient

import email_service
import server  # noqa: E402

ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        yield c


@pytest.fixture(autouse=True)
def _isolated_collections():
    """Give every test a clean in-memory store."""
    server.db = server.MockDatabase()
    server.limiter.reset()
    yield


class TestNotificationFailureNeverLosesSubmission:
    def test_enrollment_persists_and_returns_201_even_when_resend_raises(self, client):
        with patch.object(email_service, "RESEND_API_KEY", "dummy-key-for-test"), patch.object(
            email_service.resend.Emails, "send", side_effect=RuntimeError("Resend is temporarily unavailable")
        ):
            resp = client.post(
                "/api/enrollment",
                json={
                    "parent_name": "Jamie Test",
                    "email": "jamie@example.com",
                    "child_age": "3 years",
                    "program": "Preschool (3–5 yr)",
                },
            )

        assert resp.status_code == 201
        assert resp.json()["success"] is True

        listing = client.get("/api/enrollment", headers={"X-Admin-Key": ADMIN_API_KEY})
        assert listing.status_code == 200
        assert any(row["email"] == "jamie@example.com" for row in listing.json())

    def test_admissions_persists_and_returns_201_even_when_resend_raises(self, client):
        with patch.object(email_service, "RESEND_API_KEY", "dummy-key-for-test"), patch.object(
            email_service.resend.Emails, "send", side_effect=RuntimeError("Resend is temporarily unavailable")
        ):
            resp = client.post(
                "/api/admissions",
                json={
                    "parent_name": "Robin Test",
                    "email": "robin@example.com",
                    "program": "Toddler Program",
                },
            )

        assert resp.status_code == 201
        assert resp.json()["success"] is True

        listing = client.get("/api/admissions", headers={"X-Admin-Key": ADMIN_API_KEY})
        assert listing.status_code == 200
        assert any(row["email"] == "robin@example.com" for row in listing.json())

    def test_inquiry_persists_and_returns_201_even_when_resend_raises(self, client):
        with patch.object(email_service, "RESEND_API_KEY", "dummy-key-for-test"), patch.object(
            email_service.resend.Emails, "send", side_effect=RuntimeError("Resend is temporarily unavailable")
        ):
            resp = client.post(
                "/api/inquiry",
                json={
                    "parent_name": "Casey Test",
                    "email": "casey@example.com",
                    "child_age": "4 years",
                },
            )

        assert resp.status_code == 201
        assert resp.json()["success"] is True

        listing = client.get("/api/inquiry", headers={"X-Admin-Key": ADMIN_API_KEY})
        assert listing.status_code == 200
        assert any(row["email"] == "casey@example.com" for row in listing.json())

    def test_newsletter_persists_and_returns_201_even_when_resend_raises(self, client):
        with patch.object(email_service, "RESEND_API_KEY", "dummy-key-for-test"), patch.object(
            email_service.resend.Emails, "send", side_effect=RuntimeError("Resend is temporarily unavailable")
        ):
            resp = client.post(
                "/api/newsletter",
                json={"email": "morgan@example.com"},
            )

        assert resp.status_code == 201
        assert resp.json()["success"] is True

        listing = client.get("/api/newsletter", headers={"X-Admin-Key": ADMIN_API_KEY})
        assert listing.status_code == 200
        assert any(row["email"] == "morgan@example.com" for row in listing.json())

"""Inquiry submissions that ask for a phone/text reply must include a phone number."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient

import server  # noqa: E402

ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]

BASE = {"parent_name": "Jamie Test", "email": "jamie@example.com", "child_age": "3 years"}


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        yield c


@pytest.fixture(autouse=True)
def _isolated_collections():
    server.db = server.MockDatabase()
    server.limiter.reset()
    yield


@pytest.mark.parametrize("method", ["Phone", "Text message", "phone"])
def test_phone_contact_without_phone_is_rejected(client, method):
    resp = client.post("/api/inquiry", json={**BASE, "contact_method": method})
    assert resp.status_code == 422


@pytest.mark.parametrize("method", ["Phone", "Text message"])
def test_blank_phone_is_treated_as_missing(client, method):
    resp = client.post("/api/inquiry", json={**BASE, "contact_method": method, "phone": "   "})
    assert resp.status_code == 422


def test_phone_contact_with_phone_is_stored(client):
    resp = client.post("/api/inquiry", json={**BASE, "contact_method": "Phone", "phone": " +1 441 555 1212 "})
    assert resp.status_code == 201

    rows = client.get("/api/inquiry", headers={"X-Admin-Key": ADMIN_API_KEY}).json()
    assert rows[0]["phone"] == "+1 441 555 1212"
    assert rows[0]["contact_method"] == "Phone"


def test_email_contact_does_not_require_phone(client):
    resp = client.post("/api/inquiry", json={**BASE, "contact_method": "Email"})
    assert resp.status_code == 201
    rows = client.get("/api/inquiry", headers={"X-Admin-Key": ADMIN_API_KEY}).json()
    assert rows[0]["phone"] is None


def test_overlong_phone_is_rejected(client):
    resp = client.post("/api/inquiry", json={**BASE, "contact_method": "Phone", "phone": "1" * 41})
    assert resp.status_code == 422

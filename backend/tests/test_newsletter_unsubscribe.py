"""Self-service newsletter unsubscribe: token-only lookup, no enumeration, hashed storage."""
import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient

import server  # noqa: E402


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        server.db = server.MockDatabase()
        server.limiter.reset()
        yield c


@pytest.fixture()
def welcome():
    with patch.object(server, "send_newsletter_welcome", new=AsyncMock()) as sent, \
         patch.object(server.google_workspace, "add_subscriber_to_group", new=AsyncMock(return_value="not_configured")), \
         patch.object(server.google_workspace, "remove_subscriber_from_group", new=AsyncMock(return_value="removed")) as removed:
        yield sent, removed


def _subscribe(client, welcome, email="parent@example.com"):
    assert client.post("/api/newsletter", json={"email": email}).status_code == 201
    return welcome[0].call_args.args[1]  # the token passed to the welcome email


def test_welcome_email_gets_a_token_and_only_its_hash_is_stored(client, welcome):
    token = _subscribe(client, welcome)
    assert token and len(token) >= 40
    row = server.db.newsletter._documents[0]
    assert row["unsubscribe_token_hash"] == server._token_hash(token)
    assert token not in str(row)


def test_valid_token_unsubscribes_and_removes_from_group(client, welcome):
    token = _subscribe(client, welcome)
    reply = client.post("/api/newsletter/unsubscribe", json={"token": token})
    assert reply.status_code == 200 and reply.json() == server.UNSUBSCRIBE_REPLY
    assert server.db.newsletter._documents[0]["status"] == "unsubscribed"
    welcome[1].assert_awaited_once_with("parent@example.com")


def test_unknown_token_gets_the_same_reply_and_changes_nothing(client, welcome):
    _subscribe(client, welcome)
    reply = client.post("/api/newsletter/unsubscribe", json={"token": "x" * 43})
    assert reply.status_code == 200 and reply.json() == server.UNSUBSCRIBE_REPLY
    assert server.db.newsletter._documents[0]["status"] == "pending"
    welcome[1].assert_not_awaited()


def test_email_address_cannot_be_used_as_a_token(client, welcome):
    _subscribe(client, welcome)
    client.post("/api/newsletter/unsubscribe", json={"token": "parent@example.com-padding-padding"})
    assert server.db.newsletter._documents[0]["status"] == "pending"


def test_resubscribing_after_unsubscribe_reactivates_with_a_new_token(client, welcome):
    first = _subscribe(client, welcome)
    client.post("/api/newsletter/unsubscribe", json={"token": first})
    second = _subscribe(client, welcome)
    assert second != first
    row = server.db.newsletter._documents[0]
    assert len(server.db.newsletter._documents) == 1
    assert row["status"] == "pending" and row["unsubscribe_token_hash"] == server._token_hash(second)
    # The old link no longer works.
    client.post("/api/newsletter/unsubscribe", json={"token": first})
    assert server.db.newsletter._documents[0]["status"] == "pending"


def test_admin_listing_never_exposes_token_hashes(client, welcome):
    _subscribe(client, welcome)
    rows = client.get("/api/newsletter", headers={"X-Admin-Key": os.environ["ADMIN_API_KEY"]}).json()
    assert rows and "unsubscribe_token_hash" not in rows[0]


def test_unsubscribe_is_rate_limited(client, welcome):
    codes = [client.post("/api/newsletter/unsubscribe", json={"token": "y" * 43}).status_code for _ in range(12)]
    assert 429 in codes

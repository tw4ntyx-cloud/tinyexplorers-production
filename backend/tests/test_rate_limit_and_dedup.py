"""Rate-limit client identification behind proxies, and newsletter de-duplication."""
import asyncio
import os
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import httpx
import pytest
from fastapi.testclient import TestClient
from pymongo.errors import OperationFailure
from starlette.requests import Request

import google_workspace
import server  # noqa: E402

ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]
ENROLLMENT = {"parent_name": "Jamie", "email": "jamie@example.com", "child_age": "3", "program": "Preschool"}


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        yield c


@pytest.fixture(autouse=True)
def _isolated_collections():
    server.db = server.MockDatabase()
    server.limiter.reset()
    yield


def _request(forwarded=None, peer="10.0.0.1"):
    headers = [(b"x-forwarded-for", forwarded.encode())] if forwarded else []
    return Request({"type": "http", "headers": headers, "client": (peer, 1234)})


# ----- client_ip_key -----

def test_without_trusted_proxies_forwarded_header_is_ignored():
    with patch.object(server, "TRUSTED_PROXY_HOPS", 0):
        assert server.client_ip_key(_request("1.2.3.4", peer="10.0.0.1")) == "10.0.0.1"


def test_one_trusted_hop_uses_the_proxy_appended_address():
    with patch.object(server, "TRUSTED_PROXY_HOPS", 1):
        assert server.client_ip_key(_request("203.0.113.9")) == "203.0.113.9"
        # A client-supplied prefix cannot change the key.
        assert server.client_ip_key(_request("6.6.6.6, 203.0.113.9")) == "203.0.113.9"


def test_missing_forwarded_header_falls_back_to_peer():
    with patch.object(server, "TRUSTED_PROXY_HOPS", 1):
        assert server.client_ip_key(_request(None, peer="10.9.9.9")) == "10.9.9.9"


def test_limits_are_per_client_behind_a_trusted_proxy(client):
    with patch.object(server, "TRUSTED_PROXY_HOPS", 1):
        family_a = {"X-Forwarded-For": "203.0.113.10"}
        statuses = [client.post("/api/enrollment", json=ENROLLMENT, headers=family_a).status_code for _ in range(6)]
        assert statuses == [201] * 5 + [429]
        # A different family behind the same proxy is unaffected.
        family_b = {"X-Forwarded-For": "198.51.100.20"}
        assert client.post("/api/enrollment", json=ENROLLMENT, headers=family_b).status_code == 201
        # Spoofing an extra leading address does not reset family A's limit.
        spoofed = {"X-Forwarded-For": "1.1.1.1, 203.0.113.10"}
        assert client.post("/api/enrollment", json=ENROLLMENT, headers=spoofed).status_code == 429


def test_forged_forwarded_header_cannot_bypass_limits_by_default(client):
    with patch.object(server, "TRUSTED_PROXY_HOPS", 0):
        statuses = [
            client.post("/api/enrollment", json=ENROLLMENT, headers={"X-Forwarded-For": f"192.0.2.{i}"}).status_code
            for i in range(6)
        ]
        assert statuses[-1] == 429


# ----- newsletter de-duplication -----

def test_concurrent_duplicate_signups_store_one_record():
    async def slow_group_add(email):
        await asyncio.sleep(0.05)  # both requests pass the find_one() check first
        return "not_configured"

    async def scenario():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            return await asyncio.gather(
                *(c.post("/api/newsletter", json={"email": "Race@Example.com"}) for _ in range(3))
            )

    with patch.object(google_workspace, "add_subscriber_to_group", side_effect=slow_group_add):
        responses = asyncio.run(scenario())

    assert all(r.status_code in (200, 201) for r in responses)
    assert all(r.json()["success"] for r in responses)
    assert sum(1 for r in responses if r.json().get("already_subscribed")) == 2
    rows = asyncio.run(server.db.newsletter.find({}).to_list(10))
    assert [row["email"] for row in rows] == ["race@example.com"]


class _FakeCollection:
    def __init__(self, calls, fail_on=None):
        self.calls, self.fail_on = calls, fail_on

    async def create_index(self, keys, **options):
        if options.get("name") == self.fail_on:
            raise OperationFailure("E11000 duplicate key error")
        self.calls.append((keys, options))


class _FakeDatabase:
    def __init__(self, fail_on=None):
        self.calls = []
        self.fail_on = fail_on

    def __getitem__(self, name):
        return _FakeCollection(self.calls, self.fail_on)


def test_ensure_indexes_creates_unique_newsletter_email_index():
    database = _FakeDatabase()
    assert asyncio.run(server.ensure_indexes(database)) is True
    assert ([("email", 1)], {"unique": True, "name": "email_unique"}) in database.calls


def test_ensure_indexes_failure_does_not_raise():
    database = _FakeDatabase(fail_on="email_unique")
    assert asyncio.run(server.ensure_indexes(database)) is False
    # The remaining indexes are still attempted.
    assert len(database.calls) == len(server.INDEXES) - 1

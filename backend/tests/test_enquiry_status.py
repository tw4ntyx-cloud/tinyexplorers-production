"""Enquiry outcome workflow: admin-only, known statuses only, dated history, feeds retention."""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient

import retention
import server  # noqa: E402

ADMIN = {"X-Admin-Key": os.environ["ADMIN_API_KEY"]}
INQUIRY = {"parent_name": "Jamie", "email": "jamie@example.com", "child_age": "3", "contact_method": "email"}


@pytest.fixture()
def client():
    with TestClient(server.app) as c:
        server.db = server.MockDatabase()
        server.limiter.reset()
        yield c


def _new_inquiry(client):
    return client.post("/api/inquiry", json=INQUIRY).json()["id"]


def test_requires_admin_key(client):
    enquiry = _new_inquiry(client)
    assert client.post(f"/api/admin/enquiries/inquiry/{enquiry}/status", json={"status": "contacted"}).status_code == 401


def test_rejects_unknown_status_type_and_record(client):
    enquiry = _new_inquiry(client)
    assert client.post(f"/api/admin/enquiries/inquiry/{enquiry}/status", json={"status": "deleted"}, headers=ADMIN).status_code == 422
    assert client.post(f"/api/admin/enquiries/newsletter/{enquiry}/status", json={"status": "keep"}, headers=ADMIN).status_code == 404
    assert client.post("/api/admin/enquiries/inquiry/nope/status", json={"status": "keep"}, headers=ADMIN).status_code == 404


def test_records_status_with_dated_history(client):
    enquiry = _new_inquiry(client)
    for status in ("contacted", "toured", "not_proceeding"):
        assert client.post(f"/api/admin/enquiries/inquiry/{enquiry}/status", json={"status": status}, headers=ADMIN).status_code == 200
    row = server.db.inquiry._documents[0]
    assert row["status"] == "not_proceeding"
    assert [h["status"] for h in row["status_history"]] == ["contacted", "toured", "not_proceeding"]
    assert all(set(h) == {"status", "at"} for h in row["status_history"])


def test_only_not_proceeding_becomes_eligible_and_keep_is_protected(client):
    old = (datetime.now(timezone.utc) - timedelta(days=400)).isoformat()
    ids = {}
    for status in ("not_proceeding", "keep", "new", "enrolled"):
        ids[status] = _new_inquiry(client)
        server.db.inquiry._documents[-1]["created_at"] = old
        if status != "new":
            client.post(f"/api/admin/enquiries/inquiry/{ids[status]}/status", json={"status": status}, headers=ADMIN)
    report = asyncio.run(retention.plan(server.db, collections=("inquiry",)))
    assert report["collections"]["inquiry"]["eligible"] == [ids["not_proceeding"]]

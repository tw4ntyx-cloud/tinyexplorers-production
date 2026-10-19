"""Six-month enquiry retention: safe by default, never touches protected or recent records."""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import pytest
from fastapi.testclient import TestClient

import retention
import server  # noqa: E402

ADMIN = {"X-Admin-Key": os.environ["ADMIN_API_KEY"]}
NOW = datetime(2026, 10, 19, 12, 0, tzinfo=timezone.utc)
OLD = (NOW - timedelta(days=200)).isoformat()
RECENT = (NOW - timedelta(days=30)).isoformat()


def cfg(**overrides):
    base = {"months": 6, "clock_field": "created_at", "eligible_statuses": frozenset({"not_enrolling", "closed"}),
            "delete_enabled": True, "max_delete": 200}
    base.update(overrides)
    return base


async def seed(db):
    rows = [
        ("inquiry", {"id": "old-not-enrolling", "created_at": OLD, "status": "not_enrolling"}),
        ("inquiry", {"id": "old-new", "created_at": OLD, "status": "new"}),
        ("inquiry", {"id": "recent-not-enrolling", "created_at": RECENT, "status": "not_enrolling"}),
        ("admissions", {"id": "old-enrolled", "created_at": OLD, "status": "enrolled"}),
        ("admissions", {"id": "old-held", "created_at": OLD, "status": "closed", "retention_hold": True}),
        ("enrollment", {"id": "old-closed", "created_at": OLD, "status": "closed"}),
        ("enrollment", {"id": "bad-date", "created_at": "not a date", "status": "closed"}),
        ("newsletter", {"id": "nl-old", "email": "x@example.com", "created_at": OLD, "status": "subscribed"}),
    ]
    for name, row in rows:
        await getattr(db, name).insert_one(dict(row))


def ids(db, name):
    return {row["id"] for row in asyncio.run(getattr(db, name).find({}).to_list(100))}


@pytest.fixture()
def db():
    database = server.MockDatabase()
    asyncio.run(seed(database))
    return database


def test_months_before_handles_month_ends():
    assert retention.months_before(datetime(2026, 8, 31, tzinfo=timezone.utc), 6).date().isoformat() == "2026-02-28"
    assert retention.months_before(datetime(2028, 8, 31, tzinfo=timezone.utc), 6).date().isoformat() == "2028-02-29"
    assert retention.months_before(datetime(2026, 3, 15, tzinfo=timezone.utc), 6).date().isoformat() == "2025-09-15"


def test_plan_classifies_without_changing_anything(db):
    report = asyncio.run(retention.plan(db, now=NOW, config=cfg()))
    assert report["eligible_total"] == 2
    assert report["collections"]["inquiry"]["eligible"] == ["old-not-enrolling"]
    assert report["collections"]["inquiry"]["not_marked_non_enrolling"] == 1
    assert report["collections"]["inquiry"]["younger_than_cutoff"] == 1
    assert report["collections"]["admissions"]["protected"] == 2
    assert report["collections"]["enrollment"]["eligible"] == ["old-closed"]
    assert report["collections"]["enrollment"]["unreadable_date"] == 1
    assert "newsletter" not in report["collections"]
    assert ids(db, "inquiry") == {"old-not-enrolling", "old-new", "recent-not-enrolling"}


def test_dry_run_deletes_nothing_and_is_audited(db):
    report = asyncio.run(retention.run(db, dry_run=True, now=NOW, config=cfg()))
    assert report["outcome"] == "dry_run" and report["deleted"] == {}
    assert len(ids(db, "inquiry")) == 3 and len(ids(db, "enrollment")) == 2
    audit = asyncio.run(db.retention_runs.find({}).to_list(10))
    assert audit[0]["outcome"] == "dry_run"


def test_real_run_blocked_unless_enabled(db):
    report = asyncio.run(retention.run(db, dry_run=False, now=NOW, config=cfg(delete_enabled=False)))
    assert report["outcome"] == "blocked_delete_disabled"
    assert len(ids(db, "inquiry")) == 3


def test_real_run_blocked_over_limit(db):
    report = asyncio.run(retention.run(db, dry_run=False, now=NOW, config=cfg(max_delete=1)))
    assert report["outcome"] == "blocked_over_limit"
    assert len(ids(db, "enrollment")) == 2


def test_enabled_run_deletes_only_old_explicitly_non_enrolling_records(db):
    report = asyncio.run(retention.run(db, dry_run=False, now=NOW, config=cfg()))
    assert report["outcome"] == "deleted"
    assert report["deleted"] == {"inquiry": 1, "enrollment": 1}
    assert ids(db, "inquiry") == {"old-new", "recent-not-enrolling"}
    assert ids(db, "admissions") == {"old-enrolled", "old-held"}
    assert ids(db, "enrollment") == {"bad-date"}
    assert ids(db, "newsletter") == {"nl-old"}


def test_default_settings_are_safe(monkeypatch):
    for name in ("RETENTION_DELETE_ENABLED", "RETENTION_ELIGIBLE_STATUSES", "RETENTION_MONTHS", "RETENTION_CLOCK_FIELD"):
        monkeypatch.delenv(name, raising=False)
    defaults = retention.settings()
    assert defaults["delete_enabled"] is False
    assert defaults["months"] == 6
    assert "new" not in defaults["eligible_statuses"]


def test_protected_statuses_cannot_be_made_eligible(monkeypatch):
    monkeypatch.setenv("RETENTION_ELIGIBLE_STATUSES", "enrolled,closed,legal_hold")
    assert retention.settings()["eligible_statuses"] == frozenset({"closed"})


def test_unsupported_clock_field_is_refused(db):
    with pytest.raises(ValueError):
        asyncio.run(retention.plan(db, now=NOW, config=cfg(clock_field="last_contact_at")))


def test_endpoint_requires_admin_key_and_defaults_to_dry_run(monkeypatch):
    monkeypatch.delenv("RETENTION_DELETE_ENABLED", raising=False)
    with TestClient(server.app) as client:
        server.db = server.MockDatabase()
        asyncio.run(seed(server.db))
        assert client.post("/api/admin/retention/run", json={}).status_code == 401
        body = client.post("/api/admin/retention/run", json={}, headers=ADMIN).json()
        assert body["dry_run"] is True and body["outcome"] == "dry_run"
        blocked = client.post("/api/admin/retention/run", json={"dry_run": False}, headers=ADMIN).json()
        assert blocked["outcome"] == "blocked_delete_disabled"
        assert len(ids(server.db, "inquiry")) == 3

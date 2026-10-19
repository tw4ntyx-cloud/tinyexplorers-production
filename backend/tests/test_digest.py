"""Daily summary content: correct counts, and no personal contact details or messages."""
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import digest

NOW = datetime(2026, 10, 20, 11, 0, tzinfo=timezone.utc)
SINCE = NOW - timedelta(days=1)
RECENT = (NOW - timedelta(hours=3)).isoformat()
OLD = (NOW - timedelta(days=3)).isoformat()

RECORDS = {
    "admissions": [{"id": "a1b2c3d4-0000", "parent_name": "Jamie Testperson", "email": "jamie.secret@example.com",
                    "child_name": "Olive Secretchild", "child_age": "2", "program": "Toddler", "connect": "email",
                    "child_focus": "Private detail about my child", "created_at": RECENT, "status": "new"}],
    "enrollment": [{"id": "e5f6a7b8-0000", "parent_name": "Ana Example", "email": "ana@example.com",
                    "phone": "+1 441 555 0199", "child_age": "4", "program": "Preschool", "created_at": OLD, "status": "new",
                    "message": "Confidential message text"}],
    "inquiry": [],
}


def test_counts_and_sections():
    out = digest.build_digest(RECORDS, NOW, SINCE, newsletter=[{"created_at": RECENT, "status": "pending"}])
    assert out["counts"]["admissions"] == 1 and out["counts"]["enrollment"] == 0
    assert out["counts"]["outstanding"] == 1 and out["counts"]["unanswered_messages"] == 1
    assert out["counts"]["newsletter"] == 1
    assert out["subject"].startswith("Tiny Explorers: 1 new enquiry")
    assert "Google Calendar" in out["text"]
    assert "waiting to be added to the Google Group" in out["text"]
    assert "Follow-up tracking is not switched on yet" in out["text"]


def test_no_contact_details_child_names_or_messages():
    out = digest.build_digest(RECORDS, NOW, SINCE)
    for body in (out["text"], out["html"], out["subject"]):
        for secret in ("jamie.secret@example.com", "ana@example.com", "555 0199", "Secretchild", "Olive",
                       "Private detail", "Confidential message", "Testperson"):
            assert secret not in body
    assert "Jamie" in out["text"]  # first name only


def test_empty_day_says_so():
    out = digest.build_digest({"admissions": [], "enrollment": [], "inquiry": []}, NOW, SINCE)
    assert "No new enquiries since the last summary." in out["text"]
    assert out["subject"].startswith("Tiny Explorers: 0 new enquiries")


def test_status_tracking_hides_handled_enquiries():
    handled = {"enrollment": [dict(RECORDS["enrollment"][0], status="contacted")]}
    out = digest.build_digest(handled, NOW, SINCE)
    assert out["counts"]["outstanding"] == 0
    assert "Follow-up tracking is not switched on yet" not in out["text"]


def test_html_is_escaped():
    rows = {"inquiry": [{"id": "x", "parent_name": "<script>alert(1)</script>", "created_at": RECENT, "status": "new"}]}
    out = digest.build_digest(rows, NOW, SINCE)
    assert "<script>" not in out["html"]

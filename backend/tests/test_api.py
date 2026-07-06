"""Backend API tests for Tiny Explorers landing site.

Covers:
- Service status & health
- Newsletter subscribe + duplicate handling + list
- Enrollment submit + validation + list
- Inquiry submit + list
- Admissions submit + list
- Admin GET endpoints require ADMIN_API_KEY

Requires a running server (see .github/workflows/ci.yml) with
ADMIN_API_KEY set to the same value as the ADMIN_API_KEY env var below,
so admin-gated GET requests can authenticate.
"""
import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "")


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "X-Admin-Key": ADMIN_API_KEY})
    return s


# ----- Service status -----
class TestServiceStatus:
    def test_root(self, client):
        r = client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("service") == "Tiny Explorers API"
        assert data.get("status") == "ok"

    def test_health(self, client):
        r = client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "healthy"
        assert "time" in data


# ----- Newsletter -----
class TestNewsletter:
    def test_subscribe_valid(self, client, admin_client):
        email = f"TEST_news_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{BASE_URL}/api/newsletter", json={"email": email})
        assert r.status_code == 201
        data = r.json()
        assert data["success"] is True
        assert "id" in data
        # Verify list excludes _id
        lst = admin_client.get(f"{BASE_URL}/api/newsletter")
        assert lst.status_code == 200
        rows = lst.json()
        assert isinstance(rows, list)
        emails = [row.get("email") for row in rows]
        assert email in emails
        for row in rows:
            assert "_id" not in row

    def test_subscribe_duplicate(self, client):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        r1 = client.post(f"{BASE_URL}/api/newsletter", json={"email": email})
        assert r1.status_code == 201
        r2 = client.post(f"{BASE_URL}/api/newsletter", json={"email": email})
        # endpoint returns success but flagged
        assert r2.status_code in (200, 201)
        data = r2.json()
        assert data.get("already_subscribed") is True

    def test_subscribe_invalid_email(self, client):
        r = client.post(f"{BASE_URL}/api/newsletter", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_list_requires_admin_key(self, client):
        r = client.get(f"{BASE_URL}/api/newsletter")
        assert r.status_code == 401


# ----- Enrollment -----
class TestEnrollment:
    def _payload(self, **overrides):
        base = {
            "parent_name": "TEST Parent",
            "email": f"TEST_enr_{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+1 (441) 555-0100",
            "child_age": "2 years",
            "program": "Toddler Program (18–36 mo)",
            "start_date": "September 2026",
            "message": "Looking forward to learning more.",
        }
        base.update(overrides)
        return base

    def test_submit_full(self, client, admin_client):
        payload = self._payload()
        r = client.post(f"{BASE_URL}/api/enrollment", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data["success"] is True
        assert "id" in data

        # Verify list excludes _id and contains email
        lst = admin_client.get(f"{BASE_URL}/api/enrollment")
        assert lst.status_code == 200
        rows = lst.json()
        assert isinstance(rows, list)
        for row in rows:
            assert "_id" not in row
        emails = [row.get("email") for row in rows]
        assert payload["email"] in emails

    def test_submit_missing_required(self, client):
        # missing parent_name
        payload = self._payload()
        payload.pop("parent_name")
        r = client.post(f"{BASE_URL}/api/enrollment", json=payload)
        assert r.status_code == 422

    def test_submit_invalid_email(self, client):
        payload = self._payload(email="bad-email")
        r = client.post(f"{BASE_URL}/api/enrollment", json=payload)
        assert r.status_code == 422

    def test_submit_missing_child_age(self, client):
        payload = self._payload()
        payload.pop("child_age")
        r = client.post(f"{BASE_URL}/api/enrollment", json=payload)
        assert r.status_code == 422

    def test_submit_missing_program(self, client):
        payload = self._payload()
        payload.pop("program")
        r = client.post(f"{BASE_URL}/api/enrollment", json=payload)
        assert r.status_code == 422


# ----- Inquiry -----
class TestInquiry:
    def _payload(self, **overrides):
        base = {
            "parent_name": "TEST Parent",
            "email": f"TEST_inq_{uuid.uuid4().hex[:8]}@example.com",
            "child_age": "3 years",
            "contact_method": "Email",
            "message": "Curious about the toddler program.",
        }
        base.update(overrides)
        return base

    def test_submit_full(self, client, admin_client):
        payload = self._payload()
        r = client.post(f"{BASE_URL}/api/inquiry", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data["success"] is True
        assert "id" in data

        lst = admin_client.get(f"{BASE_URL}/api/inquiry")
        assert lst.status_code == 200
        rows = lst.json()
        for row in rows:
            assert "_id" not in row
        emails = [row.get("email") for row in rows]
        assert payload["email"] in emails

    def test_submit_missing_required(self, client):
        payload = self._payload()
        payload.pop("parent_name")
        r = client.post(f"{BASE_URL}/api/inquiry", json=payload)
        assert r.status_code == 422

    def test_submit_invalid_email(self, client):
        payload = self._payload(email="bad-email")
        r = client.post(f"{BASE_URL}/api/inquiry", json=payload)
        assert r.status_code == 422

    def test_list_requires_admin_key(self, client):
        r = client.get(f"{BASE_URL}/api/inquiry")
        assert r.status_code == 401


# ----- Admissions -----
class TestAdmissions:
    def _payload(self, **overrides):
        base = {
            "parent_name": "TEST Parent",
            "email": f"TEST_adm_{uuid.uuid4().hex[:8]}@example.com",
            "connect": "Email works best.",
            "child_name": "TEST Child",
            "child_age": "2 years, 4 months",
            "start_timing": "Soon",
            "child_focus": "A calm, predictable day.",
            "program": "Toddler Program (18–36 mo)",
            "interest": "I'd love a welcoming tour first.",
        }
        base.update(overrides)
        return base

    def test_submit_full(self, client, admin_client):
        payload = self._payload()
        r = client.post(f"{BASE_URL}/api/admissions", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data["success"] is True
        assert "id" in data

        lst = admin_client.get(f"{BASE_URL}/api/admissions")
        assert lst.status_code == 200
        rows = lst.json()
        for row in rows:
            assert "_id" not in row
        emails = [row.get("email") for row in rows]
        assert payload["email"] in emails

    def test_submit_missing_required(self, client):
        payload = self._payload()
        payload.pop("parent_name")
        r = client.post(f"{BASE_URL}/api/admissions", json=payload)
        assert r.status_code == 422

    def test_submit_invalid_email(self, client):
        payload = self._payload(email="bad-email")
        r = client.post(f"{BASE_URL}/api/admissions", json=payload)
        assert r.status_code == 422

    def test_submit_missing_program(self, client):
        payload = self._payload()
        payload.pop("program")
        r = client.post(f"{BASE_URL}/api/admissions", json=payload)
        assert r.status_code == 422

    def test_list_requires_admin_key(self, client):
        r = client.get(f"{BASE_URL}/api/admissions")
        assert r.status_code == 401

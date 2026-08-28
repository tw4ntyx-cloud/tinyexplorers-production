"""Regression tests: transactional emails must never reference invalid
domains/placeholders, and must use the configured WEBSITE_URL/ADMIN_EMAIL.

Covers Enrollment, Admissions/Inquiry (generic), and Newsletter templates.
Newsletter behavior itself (dedup, rate limiting, Google Workspace sync) is
untouched — these tests only inspect the rendered email content.
"""
import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import email_service  # noqa: E402

BROKEN_LINK_MARKERS = ["admin.tinyexplorers.bm", "View in admin dashboard"]
TEST_WEBSITE_URL = "https://staging.example.test/preview"


def _captured_html(send_call, **kwargs):
    """Call an EmailService method with RESEND_API_KEY set + Resend mocked,
    and return the html body that would have been sent."""
    fake_send = MagicMock(return_value={"id": "test"})
    with patch.object(email_service, "RESEND_API_KEY", "dummy-key-for-test"), patch.object(
        email_service, "WEBSITE_URL", TEST_WEBSITE_URL
    ), patch.object(email_service.resend.Emails, "send", fake_send):
        send_call(**kwargs)
    assert fake_send.called, "Resend.Emails.send was not called"
    return fake_send.call_args.args[0]["html"]


class TestEnrollmentConfirmationEmail:
    def test_uses_configured_website_url_and_canonical_email(self):
        html = _captured_html(
            email_service.EmailService.send_enrollment_confirmation,
            parent_email="parent@example.com",
            parent_name="Jamie",
            inquiry_id="abc-123",
            program="Preschool",
        )
        assert TEST_WEBSITE_URL in html
        assert "hello@tinyexplorersbda.com" in html
        assert f"{TEST_WEBSITE_URL}/philosophy" in html
        assert f"{TEST_WEBSITE_URL}/#gallery" in html
        assert f"{TEST_WEBSITE_URL}/wellness" in html

    def test_contains_no_invalid_bm_domain_or_placeholder_phone(self):
        html = _captured_html(
            email_service.EmailService.send_enrollment_confirmation,
            parent_email="parent@example.com",
            parent_name="Jamie",
            inquiry_id="abc-123",
            program="Preschool",
        )
        lowered = html.lower()
        assert "tinyexplorers.bm" not in lowered
        assert "555-0100" not in html
        assert "5550100" not in html


class TestEnrollmentAdminNotificationEmail:
    def test_no_broken_admin_dashboard_link(self):
        html = _captured_html(
            email_service.EmailService.send_enrollment_admin_notification,
            parent_name="Jamie",
            parent_email="parent@example.com",
            phone="",
            child_age="3",
            program="Preschool",
            inquiry_id="abc-123",
            submitted_at="2026-08-28 12:00 UTC",
        )
        for marker in BROKEN_LINK_MARKERS:
            assert marker not in html
        assert "tinyexplorers.bm" not in html.lower()


class TestGenericConfirmationEmail:
    def test_uses_canonical_email_and_no_invalid_domain(self):
        html = _captured_html(
            email_service.EmailService.send_generic_confirmation,
            parent_email="parent@example.com",
            parent_name="Robin",
            reference_id="ref-1",
            context_label="inquiry",
        )
        assert "hello@tinyexplorersbda.com" in html
        assert "tinyexplorers.bm" not in html.lower()
        assert "555-0100" not in html


class TestGenericAdminNotificationEmail:
    def test_no_invalid_domain_or_broken_links(self):
        html = _captured_html(
            email_service.EmailService.send_generic_admin_notification,
            subject_line="New General Inquiry: Robin",
            heading="New General Inquiry",
            fields={"Parent Name": "Robin", "Email": "parent@example.com"},
            reference_id="ref-1",
        )
        assert "tinyexplorers.bm" not in html.lower()
        for marker in BROKEN_LINK_MARKERS:
            assert marker not in html


class TestNewsletterWelcomeEmail:
    def test_uses_configured_website_url_no_invalid_domain(self):
        html = _captured_html(email_service.EmailService.send_newsletter_welcome, email="subscriber@example.com")
        assert TEST_WEBSITE_URL in html
        assert "tinyexplorers.bm" not in html.lower()

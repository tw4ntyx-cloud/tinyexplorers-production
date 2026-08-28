"""Unit tests for backend.server._is_placeholder_mongo_url.

Ensures only genuinely empty/templated MONGO_URL values are treated as
placeholders, and that legitimate Atlas connection strings are never
rejected merely because they contain common words or normal hostnames.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("MONGO_URL", "")
os.environ.setdefault("ADMIN_API_KEY", "test-admin-key")

from server import _is_placeholder_mongo_url  # noqa: E402


class TestPlaceholderDetection:
    def test_empty_url_is_placeholder(self):
        assert _is_placeholder_mongo_url("") is True

    def test_blank_whitespace_url_is_placeholder(self):
        assert _is_placeholder_mongo_url("   ") is True

    def test_literal_template_url_is_placeholder(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://user:pass@cluster.mongodb.net"
        ) is True

    def test_truncated_example_url_is_placeholder(self):
        assert _is_placeholder_mongo_url("mongodb+srv://...") is True

    def test_angle_bracket_template_url_is_placeholder(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/db"
        ) is True

    def test_atlas_dashboard_template_with_db_password_placeholder_is_placeholder(self):
        # Atlas's own "connect" dialog shows this literal text until the user
        # replaces it with the real password — must still be rejected.
        assert _is_placeholder_mongo_url(
            "mongodb+srv://<db_username>:<db_password>@tiny-explorers-newslett.f4i5ynh.mongodb.net/"
            "?appName=tiny-explorers-newsletter"
        ) is True

    def test_atlas_dashboard_template_with_only_password_left_unfilled_is_placeholder(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://tinyExplorersUser:<db_password>@tiny-explorers-newslett.f4i5ynh.mongodb.net/"
            "?appName=tiny-explorers-newsletter"
        ) is True


class TestLegitimateUrlsAreNotPlaceholders:
    def test_legitimate_atlas_srv_url_is_valid(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://appuser:S3cur3Pass!@cluster0.ab12c.mongodb.net/"
            "tiny_explorers?retryWrites=true&w=majority"
        ) is False

    def test_password_containing_word_password_is_valid(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://admin:MyPassword123@cluster0.xyz9a.mongodb.net/db"
        ) is False

    def test_username_containing_word_username_is_valid(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://theusername42:S3cret@cluster0.qwe12.mongodb.net/db"
        ) is False

    def test_real_production_atlas_hostname_format_is_valid(self):
        # Same hostname/appName shape as the actual production connection
        # string, with the <db_username>/<db_password> placeholders replaced.
        assert _is_placeholder_mongo_url(
            "mongodb+srv://tinyExplorersUser:N8k2Qz7Lm3Vx9Rt5@tiny-explorers-newslett.f4i5ynh.mongodb.net/"
            "?appName=tiny-explorers-newsletter"
        ) is False

    def test_legitimate_mongodb_net_hostname_is_valid(self):
        assert _is_placeholder_mongo_url(
            "mongodb+srv://svcacct:Xk9!mPq2@prod-cluster.mongodb.net/db"
        ) is False

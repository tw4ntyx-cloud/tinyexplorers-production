"""Server-side Google Workspace Admin SDK integration for newsletter membership.

This module is the ONLY place that talks to Google Workspace. It is never
imported by frontend code and never exposes credentials or raw Google API
errors to callers outside this process.

Configuration (all via environment variables — see docs/google-workspace-newsletter.md):

- GOOGLE_SERVICE_ACCOUNT_JSON   Full JSON key for a service account with
                                domain-wide delegation, as a single-line string.
- GOOGLE_WORKSPACE_ADMIN_EMAIL  A real Workspace super-admin/admin user the
                                service account impersonates (domain-wide
                                delegation requires acting as a real admin).
- GOOGLE_NEWSLETTER_GROUP_EMAIL The target group, e.g.
                                newsletter@tinyexplorersbda.com

If any of these are unset, `is_configured()` returns False and
`add_subscriber_to_group()` returns "not_configured" without making any
network call or raising — callers must treat that as "try again later",
never as a hard failure.
"""

import asyncio
import json
import logging
import os
from typing import Literal

logger = logging.getLogger(__name__)

# Minimum scope needed to manage group membership — nothing broader
# (no user provisioning, no read access to unrelated directory data).
SCOPES = ["https://www.googleapis.com/auth/admin.directory.group.member"]

GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
GOOGLE_WORKSPACE_ADMIN_EMAIL = os.environ.get("GOOGLE_WORKSPACE_ADMIN_EMAIL", "").strip()
GOOGLE_NEWSLETTER_GROUP_EMAIL = os.environ.get("GOOGLE_NEWSLETTER_GROUP_EMAIL", "").strip()

MembershipResult = Literal["added", "already_member", "failed", "not_configured"]


def is_configured() -> bool:
    """True only if all three required Google Workspace env vars are set."""
    return bool(
        GOOGLE_SERVICE_ACCOUNT_JSON
        and GOOGLE_WORKSPACE_ADMIN_EMAIL
        and GOOGLE_NEWSLETTER_GROUP_EMAIL
    )


def _build_service():
    # Imported lazily so the backend can start up fine even if the optional
    # google-api-python-client / google-auth packages aren't installed and
    # Google Workspace integration simply isn't configured/used.
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    delegated_credentials = credentials.with_subject(GOOGLE_WORKSPACE_ADMIN_EMAIL)
    return build("admin", "directory_v1", credentials=delegated_credentials, cache_discovery=False)


def _insert_member_sync(email: str) -> None:
    service = _build_service()
    service.members().insert(
        groupKey=GOOGLE_NEWSLETTER_GROUP_EMAIL,
        body={"email": email, "role": "MEMBER"},
    ).execute()


def _delete_member_sync(email: str) -> None:
    service = _build_service()
    service.members().delete(groupKey=GOOGLE_NEWSLETTER_GROUP_EMAIL, memberKey=email).execute()


async def add_subscriber_to_group(email: str) -> MembershipResult:
    """Attempt to add `email` as a MEMBER of the newsletter Google Group.

    Never raises — always returns one of the MembershipResult values so
    callers can safely update subscriber status without leaking Google API
    internals to the end user.
    """
    if not is_configured():
        return "not_configured"

    try:
        await asyncio.to_thread(_insert_member_sync, email)
        return "added"
    except Exception as exc:  # noqa: BLE001 - deliberately broad, never re-raised
        status_code = getattr(getattr(exc, "resp", None), "status", None)
        if status_code == 409:
            # Google returns 409 Conflict when the address is already a member.
            return "already_member"
        logger.error(
            "Google Workspace group membership request failed (status=%s): %s",
            status_code,
            type(exc).__name__,
        )
        return "failed"


RemovalResult = Literal["removed", "not_member", "failed", "not_configured"]


async def remove_subscriber_from_group(email: str) -> RemovalResult:
    """Attempt to remove `email` from the newsletter Google Group.

    Used by the (currently admin-only) unsubscribe workflow — see
    docs/google-workspace-newsletter.md for the recommended secure,
    self-service unsubscribe flow this is designed to support later.
    """
    if not is_configured():
        return "not_configured"

    try:
        await asyncio.to_thread(_delete_member_sync, email)
        return "removed"
    except Exception as exc:  # noqa: BLE001 - deliberately broad, never re-raised
        status_code = getattr(getattr(exc, "resp", None), "status", None)
        if status_code == 404:
            # Already not a member — treat as a successful end state.
            return "not_member"
        logger.error(
            "Google Workspace group removal request failed (status=%s): %s",
            status_code,
            type(exc).__name__,
        )
        return "failed"


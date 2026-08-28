"""Server-side Google Workspace Admin SDK integration for newsletter membership.

This module is the ONLY place that talks to Google Workspace. It is never
imported by frontend code and never exposes credentials or raw Google API
errors to callers outside this process.

Two authentication modes are supported (see docs/google-workspace-newsletter.md
for full setup instructions):

1. KEYLESS (recommended for production). No downloaded service-account key
   is ever created or stored. The runtime's Application Default Credentials
   (ADC) — e.g. a Google Cloud Run / GCE / GKE service running as a service
   account, or `gcloud auth application-default login` locally — are used to
   sign a domain-wide-delegation JWT via the IAM Credentials API, which is
   then exchanged for a short-lived Workspace access token. The private key
   material never leaves Google's infrastructure and this process never
   sees it. This is the only mode available when your Google Cloud
   organization enforces `iam.managed.disableServiceAccountKeyCreation` (do
   NOT disable that policy — it's a legitimate security control).
   Requires: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_WORKSPACE_ADMIN_EMAIL,
   GOOGLE_NEWSLETTER_GROUP_EMAIL. The runtime identity must hold
   `roles/iam.serviceAccountTokenCreator` on GOOGLE_SERVICE_ACCOUNT_EMAIL
   (which may be itself, for self-impersonation).

2. SERVICE_ACCOUNT_JSON (legacy / local development only). A downloaded
   service-account JSON key with domain-wide delegation, provided as a
   single-line string via GOOGLE_SERVICE_ACCOUNT_JSON. Kept only for local
   development or organizations that haven't restricted key creation — do
   not rely on this in production if your org policy blocks key creation.
   If both this and GOOGLE_SERVICE_ACCOUNT_EMAIL are set, this legacy mode
   takes precedence (useful for local testing without touching ADC).

If neither mode is fully configured, `is_configured()` returns False and
`add_subscriber_to_group()` returns "not_configured" without making any
network call or raising — callers must treat that as "try again later",
never as a hard failure.
"""

import asyncio
import json
import logging
import os
import time
from typing import Literal

logger = logging.getLogger(__name__)

# Minimum scope needed to manage group membership — nothing broader
# (no user provisioning, no read access to unrelated directory data).
SCOPES = ["https://www.googleapis.com/auth/admin.directory.group.member"]

# Scope needed only to call the IAM Credentials API for keyless JWT signing —
# distinct from, and never used as, a Workspace/Directory API scope.
_IAM_SIGNING_SCOPES = ["https://www.googleapis.com/auth/iam"]

GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
GOOGLE_SERVICE_ACCOUNT_EMAIL = os.environ.get("GOOGLE_SERVICE_ACCOUNT_EMAIL", "").strip()
GOOGLE_WORKSPACE_ADMIN_EMAIL = os.environ.get("GOOGLE_WORKSPACE_ADMIN_EMAIL", "").strip()
GOOGLE_NEWSLETTER_GROUP_EMAIL = os.environ.get("GOOGLE_NEWSLETTER_GROUP_EMAIL", "").strip()

MembershipResult = Literal["added", "already_member", "failed", "not_configured"]
AuthMode = Literal["service_account_key", "keyless", "not_configured"]


def configured_auth_mode() -> AuthMode:
    """Which auth mode is active, based purely on which env vars are set.

    Never confirms the credentials actually work — only that enough
    configuration is present to attempt one of the two auth modes.
    """
    if not (GOOGLE_WORKSPACE_ADMIN_EMAIL and GOOGLE_NEWSLETTER_GROUP_EMAIL):
        return "not_configured"
    if GOOGLE_SERVICE_ACCOUNT_JSON:
        return "service_account_key"
    if GOOGLE_SERVICE_ACCOUNT_EMAIL:
        return "keyless"
    return "not_configured"


def is_configured() -> bool:
    """True if enough env vars are set to attempt either auth mode."""
    return configured_auth_mode() != "not_configured"


def _credentials_from_json_key():
    """Legacy path: sign the domain-wide-delegation JWT locally using a
    downloaded service-account private key. Requires GOOGLE_SERVICE_ACCOUNT_JSON.
    """
    from google.oauth2 import service_account

    info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)
    credentials = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    return credentials.with_subject(GOOGLE_WORKSPACE_ADMIN_EMAIL)


def _credentials_keyless():
    """Keyless path: no private key ever exists on this process or disk.

    Uses this runtime's Application Default Credentials (e.g. a Cloud Run /
    GCE / GKE attached service account, or local `gcloud auth
    application-default login`) to sign a domain-wide-delegation JWT via the
    IAM Credentials API (`google.auth.iam.Signer`, backed by `signBlob`),
    then exchanges that JWT for a short-lived Workspace access token at
    Google's OAuth2 token endpoint. The runtime identity needs
    `roles/iam.serviceAccountTokenCreator` on GOOGLE_SERVICE_ACCOUNT_EMAIL.
    """
    import google.auth
    import google.auth.iam
    import google.auth.jwt
    import google.auth.transport.requests
    import requests
    from google.oauth2.credentials import Credentials as OAuthTokenCredentials

    adc_credentials, _ = google.auth.default(scopes=_IAM_SIGNING_SCOPES)
    signer = google.auth.iam.Signer(
        google.auth.transport.requests.Request(), adc_credentials, GOOGLE_SERVICE_ACCOUNT_EMAIL
    )

    now = int(time.time())
    assertion = google.auth.jwt.encode(
        signer,
        {
            "iss": GOOGLE_SERVICE_ACCOUNT_EMAIL,
            "sub": GOOGLE_WORKSPACE_ADMIN_EMAIL,
            "scope": " ".join(SCOPES),
            "aud": "https://oauth2.googleapis.com/token",
            "iat": now,
            "exp": now + 3600,
        },
    )

    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion,
        },
        timeout=10,
    )
    token_response.raise_for_status()
    access_token = token_response.json()["access_token"]
    return OAuthTokenCredentials(token=access_token)


def _build_service():
    # Imported lazily so the backend can start up fine even if the optional
    # google-api-python-client / google-auth packages aren't installed and
    # Google Workspace integration simply isn't configured/used.
    from googleapiclient.discovery import build

    if GOOGLE_SERVICE_ACCOUNT_JSON:
        credentials = _credentials_from_json_key()
    else:
        credentials = _credentials_keyless()
    return build("admin", "directory_v1", credentials=credentials, cache_discovery=False)


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


"""Slow email delivery must not block unrelated requests or hang submissions.

The Resend SDK is synchronous with no HTTP timeout. These tests replace a send
with a blocking sleep and check that (1) other requests are served while it
runs, and (2) the submission response is bounded by EMAIL_SEND_TIMEOUT_SECONDS.
"""
import asyncio
import os
import sys
import time
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault("ADMIN_API_KEY", "unit-test-admin-key")
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("MONGO_URL", "")

import httpx
import pytest

import email_service
import server  # noqa: E402

SLOW_SECONDS = 1.0


def _slow_send(*args, **kwargs):
    time.sleep(SLOW_SECONDS)


@pytest.fixture(autouse=True)
def _isolated_collections():
    server.db = server.MockDatabase()
    server.limiter.reset()
    yield


async def _timed(coro):
    start = time.perf_counter()
    response = await coro
    return response, time.perf_counter() - start


def test_slow_email_does_not_block_other_requests():
    async def scenario():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            start = time.perf_counter()
            signup = asyncio.create_task(
                _timed(client.post("/api/newsletter", json={"email": "slow@example.com"}))
            )
            await asyncio.sleep(0.1)  # let the signup reach the email send
            health = await client.get("/api/health")
            # Measured from the shared start: if the email blocked the event
            # loop, this coroutine could not even resume until it finished.
            health_elapsed = time.perf_counter() - start
            signup_response, signup_elapsed = await signup
            return health, health_elapsed, signup_response, signup_elapsed

    with patch.object(email_service.EmailService, "send_newsletter_welcome", side_effect=_slow_send):
        health, health_elapsed, signup, signup_elapsed = asyncio.run(scenario())

    assert health.status_code == 200
    assert signup.status_code == 201
    assert signup_elapsed >= SLOW_SECONDS * 0.9  # the email really was slow...
    assert health_elapsed < SLOW_SECONDS / 2  # ...but health was not stuck behind it


def test_email_wait_is_bounded_by_timeout():
    async def scenario():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await _timed(client.post("/api/newsletter", json={"email": "timeout@example.com"}))

    with patch.object(email_service, "EMAIL_SEND_TIMEOUT_SECONDS", 0.2), patch.object(
        email_service.EmailService, "send_newsletter_welcome", side_effect=_slow_send
    ):
        response, elapsed = asyncio.run(scenario())

    assert response.status_code == 201
    assert elapsed < SLOW_SECONDS * 0.8


def test_email_errors_are_contained():
    async def scenario():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post("/api/newsletter", json={"email": "boom@example.com"})

    with patch.object(
        email_service.EmailService, "send_newsletter_welcome", side_effect=RuntimeError("unexpected")
    ):
        response = asyncio.run(scenario())

    assert response.status_code == 201


def test_mask_email_hides_local_part():
    assert email_service._mask_email("parent@example.com") == "p***@example.com"
    assert email_service._mask_email("not-an-email") == "***"

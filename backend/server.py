import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import secrets

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pymongo.errors import PyMongoError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.cors import CORSMiddleware

import google_workspace
from email_service import (
    send_enrollment_admin_notification,
    send_enrollment_confirmation,
    send_generic_admin_notification,
    send_generic_confirmation,
    send_newsletter_welcome,
)

ROOT_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").strip()
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
MONGO_URL = os.environ.get("MONGO_URL", "").strip()
DB_NAME = os.environ.get("DB_NAME", "tiny_explorers").strip()
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip()
CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
CORS_ALLOW_CREDENTIALS = os.environ.get("CORS_ALLOW_CREDENTIALS", "false").strip().lower() in (
    "1",
    "true",
    "yes",
)

CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]
if not CORS_ORIGINS:
    CORS_ORIGINS = ["http://localhost:3000"]

if CORS_ORIGINS == ["*"] and CORS_ALLOW_CREDENTIALS:
    logger.warning(
        "CORS_ALLOW_CREDENTIALS is enabled while allow_origins is set to wildcard '*'. "
        "Disabling credentials support for safety."
    )
    CORS_ALLOW_CREDENTIALS = False


def _matches(document: Dict[str, Any], query: Optional[Dict[str, Any]] = None) -> bool:
    if not query:
        return True
    for key, value in query.items():
        if document.get(key) != value:
            return False
    return True


class InMemoryCursor:
    def __init__(self, items: List[Dict[str, Any]], query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        self._items = items
        self._query = query or {}
        self._projection = projection or {}
        self._sort_key: Optional[str] = None
        self._sort_reverse = False

    def sort(self, key: str, direction: int = 1) -> "InMemoryCursor":
        self._sort_key = key
        self._sort_reverse = direction < 0
        return self

    async def to_list(self, length: int) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        for item in self._items:
            if _matches(item, self._query):
                row = dict(item)
                if self._projection.get("_id") == 0 and "_id" in row:
                    row.pop("_id", None)
                results.append(row)
                if len(results) >= length:
                    break

        if self._sort_key:
            results.sort(key=lambda row: row.get(self._sort_key), reverse=self._sort_reverse)

        return results


class InMemoryCollection:
    def __init__(self) -> None:
        self._documents: List[Dict[str, Any]] = []

    async def find_one(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for document in self._documents:
            if _matches(document, query):
                result = dict(document)
                if projection and projection.get("_id") == 0:
                    result.pop("_id", None)
                return result
        return None

    async def insert_one(self, document: Dict[str, Any]) -> Any:
        doc = dict(document)
        _id = str(uuid.uuid4())
        doc["_id"] = _id
        self._documents.append(doc)

        class InsertOneResult:
            def __init__(self, inserted_id: str) -> None:
                self.inserted_id = inserted_id

        return InsertOneResult(inserted_id=_id)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Any:
        matched = 0
        for document in self._documents:
            if _matches(document, query):
                matched = 1
                document.update(update.get("$set", {}))
                break

        class UpdateResult:
            def __init__(self, matched_count: int) -> None:
                self.matched_count = matched_count
                self.modified_count = matched_count

        return UpdateResult(matched_count=matched)

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> InMemoryCursor:
        return InMemoryCursor(list(self._documents), query=query, projection=projection)


class MockDatabase:
    def __init__(self) -> None:
        self.newsletter = InMemoryCollection()
        self.enrollment = InMemoryCollection()
        self.inquiry = InMemoryCollection()
        self.admissions = InMemoryCollection()


class DatabaseUnavailableError(RuntimeError):
    """Raised when MongoDB is required (production) but unreachable."""


class _UnavailableCollection:
    """Every operation fails loudly instead of silently "succeeding" in memory."""

    async def find_one(self, *args: Any, **kwargs: Any) -> Any:
        raise DatabaseUnavailableError("MongoDB is not available")

    async def insert_one(self, *args: Any, **kwargs: Any) -> Any:
        raise DatabaseUnavailableError("MongoDB is not available")

    async def update_one(self, *args: Any, **kwargs: Any) -> Any:
        raise DatabaseUnavailableError("MongoDB is not available")

    def find(self, *args: Any, **kwargs: Any) -> Any:
        raise DatabaseUnavailableError("MongoDB is not available")


class UnavailableDatabase:
    """Sentinel used in production when MongoDB is configured but unreachable.

    Unlike MockDatabase, every collection access raises so requests fail
    loudly (503) instead of appearing to succeed without real persistence.
    """

    def __init__(self) -> None:
        self.newsletter = _UnavailableCollection()
        self.enrollment = _UnavailableCollection()
        self.inquiry = _UnavailableCollection()
        self.admissions = _UnavailableCollection()


def _is_placeholder_mongo_url(url: str) -> bool:
    """Detect literal template/example MONGO_URL values only.

    Must NOT reject legitimate credentials/hostnames that merely contain
    words like "username"/"password", or normal *.mongodb.net Atlas hosts —
    only exact placeholder patterns copied from docs/.env.example.
    """
    stripped = url.strip()
    if not stripped:
        return True
    if "<" in stripped or ">" in stripped or "..." in stripped:
        return True
    lowered = stripped.lower()
    if "//user:pass@" in lowered or "//username:password@" in lowered:
        return True
    if "://cluster.mongodb.net" in lowered or "@cluster.mongodb.net" in lowered:
        return True
    if "://example.com" in lowered or "@example.com" in lowered:
        return True
    return False


app = FastAPI(title="Tiny Explorers API")
api_router = APIRouter(prefix="/api")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

client: Optional[AsyncIOMotorClient] = None
db: Any = MockDatabase()
# One of: "not_configured" (dev fallback), "connected", "unavailable" (configured but unreachable).
mongo_status: str = "not_configured"


@app.exception_handler(DatabaseUnavailableError)
async def handle_database_unavailable(request: Request, exc: DatabaseUnavailableError) -> JSONResponse:
    logger.error("Database unavailable while handling %s %s", request.method, request.url.path)
    return JSONResponse(status_code=503, content={"detail": "Service temporarily unavailable. Please try again shortly."})


@app.exception_handler(PyMongoError)
async def handle_pymongo_error(request: Request, exc: PyMongoError) -> JSONResponse:
    # Log the exception type/message only — pymongo error strings do not include
    # credentials, and MONGO_URL itself is never interpolated here.
    logger.error(
        "MongoDB operation failed for %s %s (%s): %s",
        request.method,
        request.url.path,
        type(exc).__name__,
        exc,
    )
    return JSONResponse(status_code=503, content={"detail": "Service temporarily unavailable. Please try again shortly."})


@app.on_event("startup")
async def startup_db() -> None:
    global client, db, mongo_status

    logger.setLevel(LOG_LEVEL)
    logger.info("Starting Tiny Explorers API in %s mode", ENVIRONMENT)
    logger.info("Configured CORS origins: %s", CORS_ORIGINS)

    if _is_placeholder_mongo_url(MONGO_URL):
        if ENVIRONMENT == "production":
            raise RuntimeError(
                "MONGO_URL is not configured (placeholder detected) while ENVIRONMENT=production. "
                "Refusing to start with non-persistent in-memory storage in production — "
                "set a real MONGO_URL or explicitly set ENVIRONMENT=development to allow the fallback."
            )
        logger.warning(
            "MONGO_URL is not configured for MongoDB access. "
            "The backend will run in local fallback mode without persistent storage."
        )
        db = MockDatabase()
        mongo_status = "not_configured"
        return

    try:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")
        db = client[DB_NAME]
        mongo_status = "connected"
        logger.info("Connected to MongoDB database %s", DB_NAME)
    except PyMongoError as exc:
        # Never interpolate MONGO_URL itself here — only the exception, whose
        # message never includes credentials.
        logger.error(
            "MongoDB connectivity check failed (%s): %s. "
            "This is commonly caused by Atlas Network Access/IP allowlist, DNS, "
            "or credential/auth configuration outside this application.",
            type(exc).__name__,
            exc,
        )
        client = None
        mongo_status = "unavailable"
        if ENVIRONMENT == "production":
            # Never silently serve requests as if persistence worked — every
            # collection access will raise instead of appearing to succeed.
            db = UnavailableDatabase()
        else:
            logger.warning("Continuing with in-memory fallback storage (non-production).")
            db = MockDatabase()


# ---------- Models ----------
class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterUnsubscribe(BaseModel):
    email: EmailStr


class NewsletterEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EnrollmentCreate(BaseModel):
    parent_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    child_age: str = Field(min_length=1, max_length=40)
    program: str = Field(min_length=1, max_length=80)
    start_date: Optional[str] = Field(default=None, max_length=40)
    message: Optional[str] = Field(default=None, max_length=2000)


class EnrollmentEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    email: EmailStr
    phone: Optional[str] = None
    child_age: str
    program: str
    start_date: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryCreate(BaseModel):
    parent_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    child_age: str = Field(min_length=1, max_length=40)
    contact_method: Optional[str] = Field(default=None, max_length=60)
    message: Optional[str] = Field(default=None, max_length=2000)


class InquiryEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    email: EmailStr
    child_age: str
    contact_method: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdmissionsCreate(BaseModel):
    parent_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    connect: Optional[str] = Field(default=None, max_length=200)
    child_name: Optional[str] = Field(default=None, max_length=120)
    child_age: Optional[str] = Field(default=None, max_length=40)
    start_timing: Optional[str] = Field(default=None, max_length=200)
    child_focus: Optional[str] = Field(default=None, max_length=2000)
    program: str = Field(min_length=1, max_length=80)
    interest: Optional[str] = Field(default=None, max_length=200)


class AdmissionsEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    email: EmailStr
    connect: Optional[str] = None
    child_name: Optional[str] = None
    child_age: Optional[str] = None
    start_timing: Optional[str] = None
    child_focus: Optional[str] = None
    program: str
    interest: Optional[str] = None
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Auth ----------
async def require_admin(x_admin_key: Optional[str] = Header(default=None)) -> None:
    """Gate admin-only GET endpoints behind a shared secret.

    Fails closed: if ADMIN_API_KEY isn't configured, access is denied rather
    than silently left open (family PII must never be publicly readable).
    """
    if not ADMIN_API_KEY:
        raise HTTPException(status_code=503, detail="Admin access is not configured")
    if not x_admin_key or not secrets.compare_digest(x_admin_key, ADMIN_API_KEY):
        raise HTTPException(status_code=401, detail="Invalid or missing admin key")


# ---------- Routes ----------
@api_router.get("/")
async def root() -> Dict[str, str]:
    return {"service": "Tiny Explorers API", "status": "ok"}


@api_router.get("/health")
async def health() -> Dict[str, str]:
    return {
        "status": "healthy",
        "time": datetime.now(timezone.utc).isoformat(),
        "database": mongo_status,
    }


@api_router.post("/newsletter", status_code=201)
@limiter.limit("10/minute")
async def subscribe_newsletter(request: Request, payload: NewsletterCreate) -> Dict[str, Any]:
    # Normalize so "Foo@Example.com " and "foo@example.com" are treated as the same subscriber.
    normalized_email = payload.email.strip().lower()

    existing = await db.newsletter.find_one({"email": normalized_email}, {"_id": 0})
    if existing:
        return {
            "success": True,
            "message": "You're already on our list. See you soon!",
            "already_subscribed": True,
        }

    entry = NewsletterEntry(email=normalized_email)

    # Try to add the subscriber to the Google Group right away. If Google
    # Workspace isn't configured (no credentials yet) or the attempt fails,
    # the record is preserved as "pending" for later retry via the admin
    # sync endpoint — it is never discarded. See docs/google-workspace-newsletter.md.
    membership_result = await google_workspace.add_subscriber_to_group(normalized_email)
    if membership_result in ("added", "already_member"):
        entry.status = "subscribed"

    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    result = await db.newsletter.insert_one(doc)
    if not getattr(result, "inserted_id", None):
        raise HTTPException(status_code=500, detail="Could not save subscription")

    await send_newsletter_welcome(normalized_email)

    return {"success": True, "message": "Thanks for subscribing!", "id": entry.id}


@api_router.get("/newsletter", response_model=List[NewsletterEntry], dependencies=[Depends(require_admin)])
async def list_newsletter() -> List[NewsletterEntry]:
    rows = await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for row in rows:
        for field in ("created_at", "updated_at"):
            if isinstance(row.get(field), str):
                row[field] = datetime.fromisoformat(row[field])
            elif field not in row:
                row[field] = row.get("created_at")
        row.setdefault("status", "pending")
    return rows


@api_router.post("/admin/newsletter/sync", dependencies=[Depends(require_admin)])
async def sync_pending_newsletter_subscribers() -> Dict[str, Any]:
    """Retry Google Group membership for subscribers still marked "pending".

    Admin-only (same shared-secret gate as the other admin GET endpoints).
    Safe to call repeatedly or from a future scheduled job — it only ever
    touches records whose status is "pending" and never removes a record.
    """
    pending = await db.newsletter.find({"status": "pending"}, {"_id": 0}).to_list(1000)

    subscribed = 0
    still_pending = 0
    not_configured = False

    for row in pending:
        result = await google_workspace.add_subscriber_to_group(row["email"])
        if result in ("added", "already_member"):
            await db.newsletter.update_one(
                {"id": row["id"]},
                {"$set": {"status": "subscribed", "updated_at": datetime.now(timezone.utc).isoformat()}},
            )
            subscribed += 1
        else:
            if result == "not_configured":
                not_configured = True
            still_pending += 1

    return {
        "success": True,
        "checked": len(pending),
        "subscribed": subscribed,
        "still_pending": still_pending,
        "google_workspace_configured": not not_configured,
        "google_workspace_auth_mode": google_workspace.configured_auth_mode(),
    }


@api_router.post("/admin/newsletter/unsubscribe", dependencies=[Depends(require_admin)])
async def unsubscribe_newsletter_subscriber(payload: NewsletterUnsubscribe) -> Dict[str, Any]:
    """Mark a subscriber unsubscribed and best-effort remove them from the Google Group.

    Admin-only for now: there is no public unsubscribe endpoint yet. See
    docs/google-workspace-newsletter.md for the recommended secure,
    token-based self-service unsubscribe flow to build before exposing this
    publicly. This endpoint exists so staff have a safe interim way to honor
    unsubscribe requests (e.g. received by email or phone).
    """
    normalized_email = payload.email.strip().lower()
    existing = await db.newsletter.find_one({"email": normalized_email}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="No matching subscriber found")

    await google_workspace.remove_subscriber_from_group(normalized_email)

    await db.newsletter.update_one(
        {"email": normalized_email},
        {"$set": {"status": "unsubscribed", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )

    return {"success": True, "status": "unsubscribed"}


@api_router.post("/enrollment", status_code=201)
@limiter.limit("5/minute")
async def submit_enrollment(request: Request, payload: EnrollmentCreate) -> Dict[str, Any]:
    entry = EnrollmentEntry(**payload.model_dump())
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    result = await db.enrollment.insert_one(doc)
    if not getattr(result, "inserted_id", None):
        raise HTTPException(status_code=500, detail="Could not save inquiry")

    await send_enrollment_confirmation(
        parent_email=payload.email,
        parent_name=payload.parent_name,
        inquiry_id=entry.id,
        program=payload.program,
    )

    await send_enrollment_admin_notification(
        parent_name=payload.parent_name,
        parent_email=payload.email,
        phone=payload.phone or "Not provided",
        child_age=payload.child_age,
        program=payload.program,
        inquiry_id=entry.id,
    )

    return {
        "success": True,
        "message": "Inquiry received. Our enrollment team will reach out within one business day.",
        "id": entry.id,
    }


@api_router.get("/enrollment", response_model=List[EnrollmentEntry], dependencies=[Depends(require_admin)])
async def list_enrollment() -> List[EnrollmentEntry]:
    rows = await db.enrollment.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for row in rows:
        if isinstance(row.get("created_at"), str):
            row["created_at"] = datetime.fromisoformat(row["created_at"])
    return rows


@api_router.post("/inquiry", status_code=201)
@limiter.limit("5/minute")
async def submit_inquiry(request: Request, payload: InquiryCreate) -> Dict[str, Any]:
    entry = InquiryEntry(**payload.model_dump())
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    result = await db.inquiry.insert_one(doc)
    if not getattr(result, "inserted_id", None):
        raise HTTPException(status_code=500, detail="Could not save inquiry")

    await send_generic_confirmation(
        parent_email=payload.email,
        parent_name=payload.parent_name,
        reference_id=entry.id,
        context_label="inquiry",
    )

    await send_generic_admin_notification(
        subject_line=f"New General Inquiry: {payload.parent_name}",
        heading="New General Inquiry",
        fields={
            "Parent Name": payload.parent_name,
            "Email": payload.email,
            "Child Age": payload.child_age,
            "Preferred Contact": payload.contact_method,
            "Message": payload.message,
        },
        reference_id=entry.id,
    )

    return {
        "success": True,
        "message": "Your inquiry is ready to be shared with our team.",
        "id": entry.id,
    }


@api_router.get("/inquiry", response_model=List[InquiryEntry], dependencies=[Depends(require_admin)])
async def list_inquiry() -> List[InquiryEntry]:
    rows = await db.inquiry.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for row in rows:
        if isinstance(row.get("created_at"), str):
            row["created_at"] = datetime.fromisoformat(row["created_at"])
    return rows


@api_router.post("/admissions", status_code=201)
@limiter.limit("5/minute")
async def submit_admissions(request: Request, payload: AdmissionsCreate) -> Dict[str, Any]:
    entry = AdmissionsEntry(**payload.model_dump())
    doc = entry.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    result = await db.admissions.insert_one(doc)
    if not getattr(result, "inserted_id", None):
        raise HTTPException(status_code=500, detail="Could not save admissions request")

    await send_generic_confirmation(
        parent_email=payload.email,
        parent_name=payload.parent_name,
        reference_id=entry.id,
        context_label="admissions request",
    )

    await send_generic_admin_notification(
        subject_line=f"New Admissions Request: {payload.parent_name}",
        heading="New Admissions Request",
        fields={
            "Parent Name": payload.parent_name,
            "Email": payload.email,
            "Preferred Contact": payload.connect,
            "Child Name": payload.child_name,
            "Child Age": payload.child_age,
            "Start Timing": payload.start_timing,
            "What Matters Most": payload.child_focus,
            "Program": payload.program,
            "Next Step Interest": payload.interest,
        },
        reference_id=entry.id,
    )

    return {
        "success": True,
        "message": "Your admissions request is in. Our team will reach out within one business day.",
        "id": entry.id,
    }


@api_router.get("/admissions", response_model=List[AdmissionsEntry], dependencies=[Depends(require_admin)])
async def list_admissions() -> List[AdmissionsEntry]:
    rows = await db.admissions.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for row in rows:
        if isinstance(row.get("created_at"), str):
            row["created_at"] = datetime.fromisoformat(row["created_at"])
    return rows


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    if client is not None:
        client.close()

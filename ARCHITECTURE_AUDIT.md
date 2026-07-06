# Tiny Explorers — Complete Architecture & Integration Audit
**Date**: June 1, 2026 | **Status**: Partially Functional, Major Gaps Identified

---

## Executive Summary

Tiny Explorers is a **mostly-frontend marketing site with a minimal backend**. The project contains:

- ✅ **Premium React marketing site** — fully functional with 6 routed pages
- ✅ **Working FastAPI server** — persists newsletter + enrollment data to MongoDB
- ❌ **No email integration** — data is stored but never sent to admins or users
- ❌ **Incomplete forms** — Inquiry Modal and Admissions Modal are UI-only
- ❌ **Missing features** — careers form, admin dashboard, authentication
- ⚠️ **Production blockers** — no way to access collected data, no email confirmations

**Result**: The site collects family information but has no mechanism to notify the school, confirm submissions to users, or manage inquiries. Not production-ready without email integration.

---

## Part 1: Backend Analysis

### 1. Does a Backend Exist?
**✅ YES** — FastAPI running on port 8000 with async MongoDB via Motor.

**File**: [backend/server.py](backend/server.py)

```python
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI(title="Tiny Explorers API")
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
```

### 2. Is There a Server?
**✅ YES** — FastAPI server with CORS middleware configured.

- **Health check**: `GET /api/health` → returns `{"status": "healthy", "time": "..."}`
- **Root**: `GET /api/` → returns `{"service": "Tiny Explorers API", "status": "ok"}`
- **CORS**: Configured from env var `CORS_ORIGINS` (default: `*`)

### 3. Are There API Endpoints?
**✅ YES** — Two primary endpoints implemented:

#### Newsletter Endpoint
```
POST /api/newsletter
  Body: { "email": "parent@example.com" }
  Response: { "success": true, "message": "Thanks for subscribing!", "id": "uuid" }
  
GET /api/newsletter
  Response: [{ "id": "uuid", "email": "...", "created_at": "2026-06-01T..." }, ...]
```

**Features**:
- Duplicate detection (returns `already_subscribed: true` if email exists)
- EmailStr validation via Pydantic
- Stores in MongoDB collection `newsletter`

#### Enrollment Endpoint
```
POST /api/enrollment
  Body: {
    "parent_name": "string (required)",
    "email": "email (required)",
    "phone": "string (optional)",
    "child_age": "string (required)",
    "program": "string (required)",
    "start_date": "string (optional)",
    "message": "string (optional)"
  }
  Response: { "success": true, "message": "Inquiry received...", "id": "uuid" }

GET /api/enrollment
  Response: [{ "id": "uuid", "parent_name": "...", "email": "...", ... }, ...]
```

**Features**:
- Full validation on required fields
- Stores in MongoDB collection `enrollment`
- Excludes `_id` from all responses for security

### 4. Are There Serverless Functions?
**❌ NO** — This is a traditional server architecture, not serverless.

### 5. Is There a Database?
**✅ YES** — MongoDB with two collections:

| Collection | Documents | Fields | Notes |
|-----------|-----------|--------|-------|
| `newsletter` | Email subscribers | `id`, `email`, `created_at` | Duplicate-safe; 500+ entry limit in GET |
| `enrollment` | Inquiry submissions | `id`, `parent_name`, `email`, `phone`, `child_age`, `program`, `start_date`, `message`, `status`, `created_at` | All inquiries marked `status: "new"` |

**Connection**:
- URL from env: `MONGO_URL`
- Database name from env: `DB_NAME`
- Async driver: `motor.motor_asyncio`

### 6. Is There Authentication?
**❌ NO** — Zero authentication.

- No JWT, no API keys, no session management
- **Security risk**: Anyone can GET `/api/enrollment` and see all submitted family data
- **No admin protection**: Could delete/modify database directly

### 7. Is There File Storage?
**❌ NO** — No file upload endpoints, no S3 integration, no CDN.

---

## Part 2: Forms Audit

### Form Summary Table

| Form Name | Location | Stores Data? | Sends Email? | API Endpoint | Production Ready? |
|-----------|----------|--------------|--------------|--------------|-------------------|
| Newsletter | [Footer.jsx](frontend/src/components/Footer.jsx#L47-L55) | ✅ MongoDB | ❌ NO | `/api/newsletter` | ✅ YES |
| Enrollment Modal | [EnrollmentModal.jsx](frontend/src/components/EnrollmentModal.jsx) | ✅ MongoDB | ❌ NO | `/api/enrollment` | ⚠️ PARTIAL |
| Inquiry Modal | [InquiryModal.jsx](frontend/src/components/InquiryModal.jsx) | ❌ NO | ❌ NO | NONE (TODO) | ❌ NO |
| Admissions Modal | [AdmissionsModal.jsx](frontend/src/components/AdmissionsModal.jsx) | ❌ NO | ❌ NO | NONE | ❌ NO |
| Careers Form | [content.js nav reference](frontend/src/data/content.js#L399) | ❌ NO | ❌ NO | NONE | ❌ NO |

---

### Form 1: Newsletter Form

**Location**: [frontend/src/components/Footer.jsx#L47-L55](frontend/src/components/Footer.jsx#L47-L55)

**Fields Collected**:
- `email` (required, validated)

**Submission Handler**:
```javascript
const { data } = await api.post("/newsletter", { email });
toast.success(data.message || "Subscribed!");
```

**API Endpoint Used**: `POST /api/newsletter`

**Email Integration**: ❌ NONE

**Database Integration**: ✅ YES — Stores in `newsletter` collection

**File Upload Support**: ❌ NO

**Data Persisted**: ✅ YES — Forever in MongoDB

**Production Ready**: ✅ **YES**

**Notes**:
- Validates email format client-side and server-side
- Prevents duplicates
- User receives success toast confirmation
- No confirmation email sent to user

---

### Form 2: Enrollment Modal

**Location**: [frontend/src/components/EnrollmentModal.jsx](frontend/src/components/EnrollmentModal.jsx)

**Fields Collected**:
```
parent_name*        (required)
email*              (required)
phone               (optional)
child_age*          (required)
program             (defaults to first program)
start_date          (optional)
message             (optional)
```

**Submission Handler**:
```javascript
const { data } = await api.post("/enrollment", form);
toast.success(data.message || "Inquiry submitted!");
setSuccess(true);  // Shows success modal
```

**API Endpoint Used**: `POST /api/enrollment`

**Email Integration**: ❌ NONE — Data sent to backend but no email to admin or parent

**Database Integration**: ✅ YES — Stored in `enrollment` collection

**File Upload Support**: ❌ NO

**Data Persisted**: ✅ YES — Forever in MongoDB

**Production Ready**: ⚠️ **PARTIAL**
- Form works and stores data
- ❌ BUT: No way to access submitted data without direct MongoDB access
- ❌ BUT: No confirmation email sent to parent
- ❌ BUT: No notification sent to school staff
- ⚠️ SECURITY: All inquiries publicly viewable via GET endpoint

**Entry Points** (5 places to open this form):
1. Navbar "Enroll" button
2. Hero CTA
3. Programs section "Enroll Now" buttons
4. CTA Section button
5. Footer "Start enrollment inquiry" button

---

### Form 3: Inquiry Modal

**Location**: [frontend/src/components/InquiryModal.jsx](frontend/src/components/InquiryModal.jsx)

**Fields Collected**:
```
parent_name*       (required)
email*             (required)
child_age*         (required)
message            (optional)
contact_method     (optional, choices: Email / Phone / Text / Open to suggestion)
```

**Submission Handler**:
```javascript
const submitInquiry = async (payload) => {
  // Future implementation: send this payload to a backend email/provider endpoint.
  // Replace with `await api.post("/inquiry", payload)` when the service is ready.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { message: "Your inquiry is ready to be shared with our team." };
};
```

**API Endpoint Used**: ❌ **NONE — NOT IMPLEMENTED**

**Email Integration**: ❌ NO

**Database Integration**: ❌ NO — Data not persisted anywhere

**File Upload Support**: ❌ NO

**Data Persisted**: ❌ **NO** — Form data is discarded after success message

**Production Ready**: ❌ **NO**

**Status**: **UI MOCK ONLY** — Shows success screen but does nothing with data

**Entry Points**:
1. Admissions page "Start an inquiry" button

---

### Form 4: Admissions Modal

**Location**: [frontend/src/components/AdmissionsModal.jsx](frontend/src/components/AdmissionsModal.jsx)

**Fields Collected** (4-step stepper):

**Step 1 — Parent Info**:
```
parent_name       (text)
email             (email)
connect           (text - preferred contact method)
```

**Step 2 — Child Info**:
```
child_name        (text)
child_age         (text)
start_timing      (text)
child_focus       (textarea - what matters most)
```

**Step 3 — Program Interest**:
```
program           (choice from 4 programs)
```

**Step 4 — Next Step**:
```
interest          (choice: tour vs. inquiry)
```

**Submission Handler**: ❌ **NONE — NO SUBMIT BUTTON IN CODE**

The modal has 4 steps with a progress bar but **no final submit button** and **no API call**.

**API Endpoint Used**: ❌ NONE

**Email Integration**: ❌ NO

**Database Integration**: ❌ NO

**File Upload Support**: ❌ NO

**Data Persisted**: ❌ **NO** — Form data is lost when modal closes

**Production Ready**: ❌ **NO**

**Status**: **UI PROTOTYPE ONLY** — Multi-step form with no backend integration

**Entry Points**:
1. Hero CTA "Start an inquiry"
2. CtaSection CTA

---

### Form 5: Careers Form

**Location**: Navigation reference in [frontend/src/data/content.js#L399](frontend/src/data/content.js#L399)

```javascript
{ label: "Careers", to: "/parents#careers" }
```

**Implementation Status**: ❌ **NOT IMPLEMENTED**

- Navigation link exists but points to `/parents#careers`
- No careers page exists
- No careers form exists
- Clicking "Careers" navigates to `/parents` page and attempts to scroll to `#careers` anchor (which doesn't exist)

**Data Persisted**: ❌ NO

**Production Ready**: ❌ NO

---

## Part 3: Email System Audit

### Email Service Integration Status

| Service | Connected? | API Key Found? | In Use? | Notes |
|---------|-----------|----------------|--------|-------|
| **Brevo** | ❌ NO | ❌ NO | ❌ NO | Not found in any file |
| **Mailchimp** | ❌ NO | ❌ NO | ❌ NO | Not found in any file |
| **EmailJS** | ❌ NO | ❌ NO | ❌ NO | Not found in any file |
| **Resend** | ❌ NO | ❌ NO | ❌ NO | Mentioned in PRD as P2 task but not implemented |
| **SendGrid** | ❌ NO | ❌ NO | ❌ NO | Not found in any file |
| **SMTP** | ❌ NO | ❌ NO | ❌ NO | Not configured |

### Current Email Status
**❌ ZERO EMAIL INTEGRATION**

- No email service connected
- No SMTP server configured
- No email templates
- No automated sends
- No transactional emails

### What Should Be Integrated (Per PRD)

From [memory/PRD.md](memory/PRD.md#L42):
> **P2**: Email notifications on new enrollment inquiry (Resend/SendGrid).
> Optionally: hook Resend for enrollment confirmation emails.

**Missing implementations**:
1. ❌ Admin notification when new enrollment submitted
2. ❌ Parent confirmation email after enrollment submission
3. ❌ Newsletter welcome email
4. ❌ Newsletter reminder emails

### Environment Variables for Email
**Backend .env** (required but not found):
```
# Not present:
RESEND_API_KEY=
SENDGRID_API_KEY=
BREVO_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
ADMIN_EMAIL=
```

**Frontend .env** (not needed for backend email):
```
# Currently exists:
REACT_APP_BACKEND_URL=
```

---

## Part 4: Routing Audit

### All Routes

| Route | Page Component | Status | Accessible | Notes |
|-------|----------------|--------|-----------|-------|
| `/` | [Home.jsx](frontend/src/pages/Home.jsx) | ✅ WORKING | ✅ YES | Marketing homepage with all sections |
| `/philosophy` | [Philosophy.jsx](frontend/src/pages/Philosophy.jsx) | ✅ WORKING | ✅ YES | Our Philosophy page |
| `/wellness` | [Wellness.jsx](frontend/src/pages/Wellness.jsx) | ✅ WORKING | ✅ YES | Wellness & Care page |
| `/adventures` | [Adventures.jsx](frontend/src/pages/Adventures.jsx) | ✅ WORKING | ✅ YES | Adventures & Field Trips page |
| `/parents` | [Parents.jsx](frontend/src/pages/Parents.jsx) | ✅ WORKING | ✅ YES | Parent Information page |
| `/admissions` | [Admissions.jsx](frontend/src/pages/Admissions.jsx) | ✅ WORKING | ✅ YES | Admissions & Enrollment page |
| `/careers` | NOT IMPLEMENTED | ❌ 404 | ❌ NO | Reference exists in nav but no page |
| `/parents#careers` | Hash anchor | ❌ BROKEN | ⚠️ PARTIALLY | Nav link points here but anchor doesn't exist on `/parents` |

### Route Navigation Quality

**✅ Working**:
- All primary routes load correctly
- Hash anchors work (e.g., `/#programs`, `/admissions#process`)
- Back/forward browser navigation works
- Direct URL access works
- Mobile menu navigation works
- Footer links work with React Router

**⚠️ Issues**:
1. `/parents#careers` — Link exists but anchor not implemented
2. No 404 page — Broken routes just show blank page
3. No error boundaries — Any component error crashes entire page

### URL Refresh Behavior
✅ **Direct URL refresh works** — All routes maintain state correctly when refreshed

### Broken Routes / Missing Pages
1. `/careers` — Referenced in navigation but page doesn't exist
2. `/parents#careers` — Anchor referenced but section not on page

---

## Part 5: Production Readiness Audit

### Critical Issues (Blocking Production)

| Issue | Severity | Description | Fix Required |
|-------|----------|-------------|--------------|
| **No Email Integration** | 🔴 CRITICAL | Data collected but never sent to admin or user | Integrate Resend or SendGrid |
| **No Admin Access** | 🔴 CRITICAL | No way to view submitted inquiries (except direct DB) | Build admin dashboard with auth |
| **Broken Inquiry Modal** | 🔴 CRITICAL | Form UI-only, data discarded | Add API endpoint & backend handler |
| **Broken Admissions Modal** | 🔴 CRITICAL | 4-step form has no submit button | Add submit logic & API integration |
| **No Authentication** | 🔴 CRITICAL | Anyone can view all family data via `/api/enrollment` | Add JWT or session auth |
| **Missing Careers Page** | 🔴 CRITICAL | Nav link broken, no implementation | Create careers page or remove link |

### Major Issues (Needs Implementation)

| Issue | Priority | Status |
|-------|----------|--------|
| Email confirmations to parents | HIGH | ❌ TODO |
| Email notifications to admin | HIGH | ❌ TODO |
| Admin dashboard for inquiries | HIGH | ❌ TODO |
| Authentication for admin endpoints | HIGH | ❌ TODO |
| Careers form implementation | MEDIUM | ❌ TODO |
| Error boundaries & 404 page | MEDIUM | ❌ TODO |
| API rate limiting | MEDIUM | ❌ TODO |
| Data validation on server | MEDIUM | ✅ DONE |

### Missing Environment Variables

**Frontend** (frontend/.env):
```bash
# Current:
REACT_APP_BACKEND_URL=http://localhost:8000  # ✅ Set

# Missing:
REACT_APP_ENV=production               # ❌ Not set
```

**Backend** (backend/.env):
```bash
# Current:
MONGO_URL=mongodb://...         # ✅ Required, must be set
DB_NAME=tiny_explorers          # ✅ Required, must be set
CORS_ORIGINS=*                  # ✅ Optional, defaults to *

# Missing / Not implemented:
ADMIN_EMAIL=admissions@tinyexplorers.bm    # ❌ For notifications
RESEND_API_KEY=re_...                      # ❌ For email service
NOTIFICATION_ENABLED=true                 # ❌ Feature flag
ADMIN_DASHBOARD_URL=https://...            # ❌ If separate deployment
```

### Security Concerns

| Concern | Risk | Mitigation |
|---------|------|-----------|
| **GET /api/enrollment public** | All family data exposed | Add auth, implement role-based access |
| **No input sanitization** | XSS/injection possible | Validate all inputs server-side |
| **No HTTPS enforced** | Man-in-the-middle attacks | Enforce HTTPS in production |
| **No rate limiting** | DDoS vulnerability | Add rate limiting middleware |
| **CORS allows all** | CSRF attacks | Restrict CORS origins in production |
| **No request logging** | Can't audit access | Add logging to all endpoints |

### Deployment Blockers

1. **Backend not in deployment-ready state**
   - No Docker/containerization
   - No production startup script
   - No health checks beyond `/api/health`
   - No graceful shutdown

2. **Frontend build succeeds but**
   - No environment-specific builds
   - No analytics/tracking setup
   - No 404 error page
   - No error boundary fallback

3. **No CI/CD pipeline** — No automated tests run on commits

---

## Part 6: Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION SETUP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐              ┌────────────────────┐   │
│  │   User's Browser     │              │  Vercel (Frontend) │   │
│  │  (React 19 App)      │◄────────────►│   React Router     │   │
│  │  - 6 routes          │   HTTPS      │   TailwindCSS      │   │
│  │  - 5 forms           │              │   Deployed Build   │   │
│  └──────────────────────┘              └────────────────────┘   │
│           ▲                                        │               │
│           │                                        │               │
│           │ (Optional)                             │               │
│           └────────────────────────────────────────┘               │
│                                                                   │
│  Form Submissions via JavaScript:                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Newsletter:   POST /api/newsletter                        │ │
│  │  Enrollment:   POST /api/enrollment                        │ │
│  │  Inquiry:      ❌ NOT WIRED (discarded)                   │ │
│  │  Admissions:   ❌ NO SUBMIT BUTTON                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│           ▲                                                        │
│           │ HTTPS/CORS                                            │
│           │                                                        │
│  ┌────────┴─────────────────────────┐                            │
│  │  Backend: FastAPI (Render.com)   │                            │
│  │  ├─ /api/                        │                            │
│  │  ├─ /api/health                  │                            │
│  │  ├─ /api/newsletter   (POST/GET) │                            │
│  │  └─ /api/enrollment   (POST/GET) │                            │
│  │                                  │                            │
│  │  ❌ No auth                      │                            │
│  │  ❌ No email service             │                            │
│  │  ❌ No admin endpoints           │                            │
│  └────────────────────────┬─────────┘                            │
│                          │                                        │
│                    (Motor async)                                 │
│                          │                                        │
│  ┌────────────────────────▼─────────────────────┐               │
│  │  MongoDB (Atlas or self-hosted)              │               │
│  │  ├─ newsletter collection (emails only)      │               │
│  │  │   Data: { id, email, created_at, _id }    │               │
│  │  │   Purpose: Just storing emails            │               │
│  │  │                                            │               │
│  │  └─ enrollment collection (inquiries)        │               │
│  │      Data: { id, parent_name, email,        │               │
│  │             phone, child_age, program,       │               │
│  │             start_date, message, status,    │               │
│  │             created_at, _id }                │               │
│  │      Purpose: Store inquiries                │               │
│  │      ⚠️  Data never accessed or emailed      │               │
│  └────────────────────────────────────────────┘               │
│                                                                   │
│  ❌ MISSING:                                                     │
│     - Email service (Resend, SendGrid, Brevo)                   │
│     - Admin dashboard                                            │
│     - Authentication/Authorization                              │
│     - Notification system                                        │
│     - File storage (S3)                                         │
│     - Log aggregation                                           │
│     - Error tracking (Sentry)                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 7: What Is Frontend-Only (Not Functional)

| Component | Type | Status |
|-----------|------|--------|
| Navbar | UI | ✅ Renders, navigation works |
| Hero Section | Marketing | ✅ Renders, CTAs trigger modals |
| Features Cards | Marketing | ✅ Renders |
| Environment Section | Marketing | ✅ Renders |
| Wellness Section | Marketing | ✅ Renders, CTA works |
| Programs Section | Marketing | ✅ Renders, CTAs work |
| Testimonial | Marketing | ✅ Renders |
| CTA Section | Marketing | ✅ Renders, CTA works |
| Gallery | Marketing | ✅ Renders, keyboard accessible |
| Footer | Marketing | ✅ Renders, newsletter form works |
| Philosophy Page | Page | ✅ Renders |
| Wellness Page | Page | ✅ Renders |
| Adventures Page | Page | ✅ Renders |
| Parents Page | Page | ✅ Renders |
| Admissions Page | Page | ✅ Renders |
| **Inquiry Modal** | **Form** | ❌ **UI only, no backend** |
| **Admissions Modal** | **Form** | ❌ **UI only, no submit** |
| 404 Page | Error UI | ❌ **Not implemented** |
| Error Boundary | Error UI | ❌ **Not implemented** |

---

## Part 8: What Is Actually Functional

### Backend Endpoints (2 of 5 planned)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/` | GET | ✅ WORKING | Health check, returns `{"service": "...", "status": "ok"}` |
| `/api/health` | GET | ✅ WORKING | Returns timestamp, used for monitoring |
| `/api/newsletter` | POST | ✅ WORKING | Creates newsletter subscription, stores in DB, prevents duplicates |
| `/api/newsletter` | GET | ✅ WORKING | Lists all newsletter subscribers (⚠️ public, no auth) |
| `/api/enrollment` | POST | ✅ WORKING | Creates enrollment inquiry, stores in DB, validates all fields |
| `/api/enrollment` | GET | ✅ WORKING | Lists all inquiries (⚠️ public, no auth) |

### Frontend Forms (2 of 5 implemented)

**Newsletter Form** (Footer):
- ✅ Collects email
- ✅ Validates format
- ✅ Sends to backend
- ✅ Stores in MongoDB
- ❌ No confirmation email

**Enrollment Modal**:
- ✅ Collects 7 fields
- ✅ Validates required fields
- ✅ Sends to backend
- ✅ Stores in MongoDB
- ✅ Shows success modal
- ❌ No admin notification
- ❌ No confirmation email
- ⚠️ Security: All inquiries publicly readable

### Page Rendering (6 of 6 implemented)

All pages render correctly with proper routing:
1. ✅ Home (/)
2. ✅ Philosophy (/philosophy)
3. ✅ Wellness (/wellness)
4. ✅ Adventures (/adventures)
5. ✅ Parents (/parents)
6. ✅ Admissions (/admissions)

---

## Part 9: What Still Needs Implementation

### Critical Path (Blocking Production)

```
PRIORITY 1: Email Service Integration
├─ Choose provider (Resend recommended for simplicity)
├─ Add API key to backend/.env
├─ Create email templates
├─ Implement send on enrollment
└─ Add parent confirmation + admin notification

PRIORITY 2: Complete Missing Forms
├─ Inquiry Modal: Wire to new /api/inquiry endpoint
├─ Admissions Modal: Add submit button + logic
└─ Careers Form: Create form + page

PRIORITY 3: Authentication & Admin Dashboard
├─ Add JWT auth to backend
├─ Create admin login page
├─ Build admin dashboard to view inquiries
└─ Add admin email/SMS integrations

PRIORITY 4: Security Hardening
├─ Protect /api/enrollment GET (requires auth)
├─ Add rate limiting to all endpoints
├─ Validate/sanitize all inputs
└─ Add HTTPS enforcement
```

### Detailed Implementation Checklist

**Email Integration (Est: 4 hours)**
- [ ] Install `resend` or `sendgrid` Python SDK
- [ ] Create `email_service.py` module
- [ ] Add email template files
- [ ] Modify `/api/enrollment` to send email on submit
- [ ] Add admin email notification
- [ ] Test email delivery

**Forms & API (Est: 6 hours)**
- [ ] Add `/api/inquiry` endpoint to backend
- [ ] Wire InquiryModal to `/api/inquiry`
- [ ] Add `/api/inquiry` GET endpoint (admin only)
- [ ] Add submit button to AdmissionsModal
- [ ] Create careers form page
- [ ] Add `/api/careers` endpoint

**Authentication (Est: 8 hours)**
- [ ] Install `python-jose`, `passlib`, `python-multipart`
- [ ] Create JWT auth module
- [ ] Protect all admin endpoints
- [ ] Add login endpoint
- [ ] Create password hashing
- [ ] Add token refresh logic

**Admin Dashboard (Est: 12 hours)**
- [ ] Create React admin app (or separate Next.js app)
- [ ] Build login page
- [ ] Create inquiry list page
- [ ] Add search/filter
- [ ] Add inquiry detail view
- [ ] Add export to CSV
- [ ] Add status management (new/contacted/enrolled)

**Deployment Setup (Est: 6 hours)**
- [ ] Dockerize backend
- [ ] Add production env config
- [ ] Set up GitHub Actions CI/CD
- [ ] Configure monitoring/logging
- [ ] Add Sentry error tracking
- [ ] Set up health check monitoring

---

## Part 10: Recommended Production Setup for Tiny Explorers

### Recommended Architecture

```
FRONTEND (Vercel)
├─ React 19 site (what you have)
├─ Environment: REACT_APP_BACKEND_URL
└─ Auto-deploy from git main branch

BACKEND (Render.com or Railway)
├─ FastAPI server
├─ Python 3.11+
├─ MongoDB Atlas (managed)
├─ Email: Resend (simplest integration)
├─ Environment:
│  ├─ MONGO_URL
│  ├─ DB_NAME
│  ├─ RESEND_API_KEY
│  ├─ ADMIN_EMAIL
│  └─ JWT_SECRET_KEY
└─ Auto-deploy from git on push

ADMIN DASHBOARD (Vercel or same as frontend)
├─ React/Next.js admin interface
├─ Login with JWT from backend
├─ View/manage inquiries
├─ Email history
└─ Reports

DATABASE (MongoDB Atlas - Free Tier OK initially)
├─ Collections:
│  ├─ newsletter (growth)
│  ├─ enrollment (operational)
│  ├─ inquiry (new - for general inquiries)
│  ├─ users (admin accounts)
│  └─ email_log (audit trail)
└─ Backups enabled

EMAIL (Resend)
├─ Send transactional emails
├─ Template: enrollment_confirmation
├─ Template: admin_notification
├─ DKIM/SPF configured
└─ Cost: ~$20/month for reasonable volume
```

### Step-by-Step Deployment (Production-Ready)

**Phase 1: Email Integration (Week 1)**
1. Sign up for Resend.com ($20/month)
2. Add RESEND_API_KEY to backend/.env
3. Create email templates
4. Implement email sending in `/api/enrollment`
5. Test with real email

**Phase 2: Missing Forms (Week 2)**
1. Add `/api/inquiry` endpoint
2. Wire InquiryModal to endpoint
3. Add submit to AdmissionsModal
4. Create careers form + page
5. Test all forms

**Phase 3: Authentication (Week 2-3)**
1. Add JWT to backend
2. Protect admin endpoints
3. Create admin login page
4. Deploy admin dashboard

**Phase 4: Security (Week 3)**
1. Add rate limiting
2. Enable HTTPS
3. Restrict CORS
4. Sanitize inputs
5. Security audit

### Environment Variables (Complete Set)

**Frontend** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=https://api.tinyexplorers.bm
REACT_APP_ENV=production
```

**Backend** (`backend/.env`):
```env
# Required
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net
DB_NAME=tiny_explorers

# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
ADMIN_EMAIL=admissions@tinyexplorers.bm

# Auth
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server
CORS_ORIGINS=https://tinyexplorers.bm,https://admin.tinyexplorers.bm
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### Hosting Recommendations

| Component | Service | Cost | Reason |
|-----------|---------|------|--------|
| Frontend | Vercel | $0 (free tier) | Dead simple, auto-deploys from git |
| Backend | Render.com | $7/month | Simple, Python-friendly, auto-deploys |
| Database | MongoDB Atlas | $0 (free tier) | Managed, reliable, generous free tier |
| Email | Resend | $20/month | Easiest integration, good pricing |
| **Total** | | **~$27/month** | Production-ready stack |

### Testing Before Production

```bash
# Backend tests (included)
cd backend
python -m pytest tests/test_api.py -v

# Frontend build
cd frontend
npm run build

# Test against production backend
export REACT_APP_BACKEND_URL=https://production-api.url
npm test
```

### Monitoring & Alerts

**Recommended additions**:
1. **Sentry** (error tracking) — $25/month
2. **DataDog** (logs) — $15/month
3. **Uptime monitoring** — Render has built-in
4. **Email delivery tracking** — Resend has built-in

---

## Part 11: Security Recommendations

### Immediate (Do Before Production)

1. **Protect GET endpoints**
   ```python
   @app.get("/api/enrollment")
   async def list_enrollment(current_user = Depends(verify_token)):
       # Only authenticated admins can see this
   ```

2. **Add rate limiting**
   ```python
   from slowapi import Limiter
   limiter.limit("5/minute")(submit_enrollment)
   ```

3. **Validate input server-side**
   ```python
   # Already done with Pydantic ✅
   parent_name: str = Field(min_length=1, max_length=120)
   email: EmailStr  # ✅ Validates email format
   ```

4. **HTTPS only**
   - Vercel: Auto HTTPS ✅
   - Render: Auto HTTPS ✅
   - Add HSTS header in backend

5. **CORS restrictions**
   ```python
   allow_origins=[
       "https://tinyexplorers.bm",
       "https://admin.tinyexplorers.bm"
   ]
   ```

### Short-term (Next Sprint)

6. **Add authentication**
   - JWT tokens for admin endpoints
   - Password hashing with bcrypt
   - Refresh token rotation

7. **Input sanitization**
   - HTML escape in templates
   - XSS protection
   - CSRF tokens for forms

8. **Logging & auditing**
   - Log all API access
   - Store IP addresses
   - Track admin actions

9. **Data retention policy**
   - Delete old inquiry data (>1 year)
   - Archive newsletter subscribers
   - Comply with GDPR if applicable

10. **Backup strategy**
    - MongoDB automatic backups
    - Daily export to cloud storage
    - Test restores monthly

---

## Summary & Next Steps

### Current State
- ✅ Frontend: Fully functional marketing site
- ✅ Backend: Working data collection to MongoDB
- ✅ Two forms working (Newsletter, Enrollment)
- ❌ Email: Not implemented
- ❌ Admin dashboard: Not implemented
- ❌ Authentication: Not implemented

### Production Blockers
1. ❌ Email integration missing
2. ❌ No way for admins to access inquiries
3. ❌ Inquiry/Admissions forms not wired
4. ❌ Careers page broken
5. ❌ Security concerns (public API)

### Recommended Priority

**Week 1**: Email + Inquiry form ← **START HERE**
**Week 2**: Admissions + Auth setup
**Week 3**: Admin dashboard + Security
**Week 4**: Testing + Deployment

### Estimated Total Effort
- **Backend dev**: 20-24 hours
- **Frontend dev**: 10-12 hours
- **Testing**: 8-10 hours
- **Deployment**: 4-6 hours
- **Total**: ~50 hours = 1.25 weeks with 2 developers

### Next Action
1. Choose email provider (recommend: Resend.com)
2. Set up backend `.env` with email credentials
3. Implement email sending in `/api/enrollment` endpoint
4. Test email delivery
5. Wire remaining forms to backend

---

**Report generated**: June 1, 2026
**Auditor**: GitHub Copilot
**Status**: Ready for implementation planning

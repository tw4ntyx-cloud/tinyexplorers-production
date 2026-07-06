# Tiny Explorers — Implementation Roadmap
**Date**: June 1, 2026 | **Status**: Ready for execution

---

## Priority Matrix

```
IMPACT    │ High               │ Critical           │ Critical
          │ (Med effort)       │ (Med effort)       │ (High impact)
          │                    │                    │
EFFORT    │                    │ Medium (4-8h)      │ High (8-12h)
          │                    │                    │
          ├────────────────────┼────────────────────┤
          │ Medium             │ High               │ Critical
          │ (Low effort)       │ (High impact)      │ (Med effort)
          │                    │                    │
          │ Med (2-4h)         │ High (12-16h)      │ Med (4-8h)
          │                    │                    │
          ├────────────────────┼────────────────────┤
LOW/MED   │ NICE-TO-HAVE       │ MEDIUM             │ HIGH
IMPACT    │ (Low effort)       │ (Medium effort)    │ (High effort)
```

---

## 🔴 CRITICAL (Must Fix Before Launch)

### 1. **Email Service Integration** 
**Status**: ❌ Not implemented  
**Impact on launch**: 🔴 BLOCKING  
**Effort**: 4-6 hours  
**Risk**: LOW (well-established libraries)  
**Dependencies**: None

**Why critical**: Without email, the school never receives inquiries, and users have no confirmation. The entire business process breaks.

**Files to modify**:
- `backend/requirements.txt` — add `resend` package
- `backend/server.py` — add email service module
- `backend/.env` — add `RESEND_API_KEY` and `ADMIN_EMAIL`
- New: `backend/email_service.py` — email templates and sending logic
- Modify: `backend/server.py` `/api/enrollment` endpoint — call email service

**Implementation approach**:
```
Step 1: Sign up for Resend.com (or SendGrid)
Step 2: Add API key to backend/.env
Step 3: Create email_service.py module with:
  - Parent confirmation template
  - Admin notification template
  - Send functions
Step 4: Modify /api/enrollment POST to:
  - Send parent confirmation email
  - Send admin notification email
Step 5: Add newsletter welcome email to /api/newsletter POST
Step 6: Test with real emails
```

**Risk factors**:
- ✅ LOW — Resend is simple and reliable
- ✅ Email library issues are rare

**Success criteria**:
- [ ] Parent receives confirmation email after enrollment
- [ ] Admin receives inquiry notification email
- [ ] Newsletter subscriber receives welcome email
- [ ] Emails contain all relevant details
- [ ] No crashes on email send failure

---

### 2. **Protect API Endpoints (Security)**
**Status**: ❌ No authentication  
**Impact on launch**: 🔴 BLOCKING  
**Effort**: 6-8 hours  
**Risk**: MEDIUM (auth complexity)  
**Dependencies**: Email integration (admin email needed)

**Why critical**: Currently anyone can view all family data and delete records. Major GDPR/privacy violation.

**Files to modify**:
- `backend/requirements.txt` — add `python-jose`, `passlib`, `python-multipart`, `python-dotenv`
- New: `backend/auth.py` — JWT token generation and verification
- Modify: `backend/server.py`:
  - Add `/api/auth/login` endpoint
  - Protect GET `/api/enrollment` with auth
  - Protect GET `/api/newsletter` with auth
  - Add CORS restrictions
- Modify: `backend/.env` — add `JWT_SECRET_KEY`, `ADMIN_PASSWORD_HASH`
- New: `backend/models.py` — User model and schemas

**Implementation approach**:
```
Step 1: Add auth module to backend
Step 2: Create login endpoint
Step 3: Implement JWT token generation
Step 4: Add Depends(verify_token) to protected routes
Step 5: Restrict CORS origins in production
Step 6: Test with curl/Postman
```

**Risk factors**:
- ⚠️ MEDIUM — JWT implementation can be error-prone
- ⚠️ Token expiration timing critical
- ✅ Use established libraries (python-jose)

**Success criteria**:
- [ ] GET `/api/enrollment` returns 401 without token
- [ ] POST `/api/enrollment` still works (public form submission)
- [ ] Admin can login with credentials
- [ ] Tokens expire after 24 hours
- [ ] Token refresh works

---

### 3. **Wire Inquiry Modal to Backend**
**Status**: ❌ Data discarded  
**Impact on launch**: 🔴 BLOCKING  
**Effort**: 3-4 hours  
**Risk**: LOW

**Why critical**: Inquiry form collects data but throws it away. Second major customer touchpoint after enrollment.

**Files to modify**:
- New: `backend/server.py` — add `/api/inquiry` endpoint (POST/GET)
- New: `backend/models.py` — add InquiryCreate and InquiryEntry Pydantic models
- Modify: `backend/server.py` — add inquiry collection to MongoDB
- Modify: `frontend/src/components/InquiryModal.jsx`:
  - Replace mock `submitInquiry()` with real API call
  - Add error handling
  - Update success message with order ID
- Modify: `backend/.env` — MongoDB collections config

**Implementation approach**:
```
Step 1: Add Inquiry models to backend (parent_name, email, child_age, message, contact_method)
Step 2: Create /api/inquiry POST endpoint
Step 3: Create /api/inquiry GET endpoint (auth protected)
Step 4: Update InquiryModal to call api.post("/inquiry", form)
Step 5: Add inquiry email integration (admin notification + parent confirmation)
Step 6: Test form submission
```

**Risk factors**:
- ✅ LOW — Similar to enrollment endpoint
- ✅ Clear data structure

**Success criteria**:
- [ ] InquiryModal submits data to backend
- [ ] Data stored in MongoDB `inquiry` collection
- [ ] Parent receives confirmation email
- [ ] Admin receives notification email
- [ ] Success modal shows order ID

---

### 4. **Complete Admissions Modal**
**Status**: ❌ No submit button  
**Impact on launch**: 🔴 BLOCKING  
**Effort**: 5-6 hours  
**Risk**: MEDIUM (complex form)

**Why critical**: Multi-step form is 90% built but has no submit logic. Major conversion point.

**Files to modify**:
- New: `backend/server.py` — add `/api/admissions` endpoint (POST/GET)
- New: `backend/models.py` — add AdmissionsCreate and AdmissionsEntry models
- Modify: `frontend/src/components/AdmissionsModal.jsx`:
  - Add submit button to step 4
  - Add submit handler
  - Call api.post("/admissions", form)
  - Add loading state
  - Add error handling
  - Update success message
- Modify: `backend/.env` — add admissions collection config

**Implementation approach**:
```
Step 1: Create AdmissionsEntry model with all 8 fields
Step 2: Add /api/admissions POST endpoint (similar to enrollment)
Step 3: Add /api/admissions GET endpoint (auth protected)
Step 4: Update AdmissionsModal:
  - Add "Submit" button to step 4
  - Create onSubmit handler
  - Call api.post("/admissions", allFormData)
  - Show loading spinner
  - Show success modal with order ID
Step 5: Add email integration (same templates as inquiry)
Step 6: Test complete flow
```

**Risk factors**:
- ⚠️ MEDIUM — Complex multi-step state management
- ⚠️ Need to validate all 8 fields
- ✅ Similar to enrollment modal structure

**Success criteria**:
- [ ] Step 4 has visible submit button
- [ ] Form submits all 8 fields to backend
- [ ] Data validated on server
- [ ] Success modal appears
- [ ] Parent + admin emails sent
- [ ] Data stored in MongoDB

---

## 🟠 HIGH PRIORITY (Next 2 Days)

### 5. **Basic Admin Dashboard**
**Status**: ❌ Not built  
**Impact on launch**: 🟠 HIGH  
**Effort**: 12-16 hours  
**Risk**: MEDIUM

**Why high priority**: Without this, admins can't actually use the collected data. Essential for operations.

**Files to create**:
- New: `frontend/src/pages/AdminDashboard.jsx` or separate React app
- New: `frontend/src/pages/AdminLogin.jsx`
- New: `frontend/src/components/InquiryList.jsx`
- New: `frontend/src/components/InquiryDetail.jsx`
- Modify: `frontend/src/App.js` — add `/admin` route (protected)
- Modify: `backend/server.py` — add `/api/admin/login` endpoint

**Implementation approach**:
```
Option A: React component in existing app (2 hours)
  - Add /admin route to App.js
  - Create AdminLogin page
  - Create AdminDashboard with inquiry table
  - Add JWT token to localStorage
  - Fetch inquiries from /api/enrollment

Option B: Separate Next.js admin app (8 hours)
  - Create separate admin app
  - Full dashboard with filters, search
  - More professional but more work
  - Recommended for production

Recommend: Option A for MVP (faster), migrate to Option B later
```

**Risk factors**:
- ⚠️ MEDIUM — Auth state management across routes
- ✅ React hooks handle this well

**Success criteria**:
- [ ] Admin login page works
- [ ] JWT token persists across page refresh
- [ ] Dashboard loads inquiry list from API
- [ ] Can view inquiry details
- [ ] Can filter/search inquiries
- [ ] Logout works

---

### 6. **Fix/Implement Careers Page**
**Status**: ❌ Missing  
**Impact on launch**: 🟠 HIGH  
**Effort**: 4-5 hours  
**Risk**: LOW

**Why high priority**: Navigation link is broken, looks unprofessional. Either fix or remove.

**Files to modify/create**:
- New: `frontend/src/pages/Careers.jsx` — careers page component
- New: `frontend/src/components/CareersForm.jsx` — application form
- New: `backend/server.py` — add `/api/careers` endpoint (POST/GET)
- New: `backend/models.py` — add CareerApplication models
- Modify: `frontend/src/App.js` — add `/careers` route
- Modify: `frontend/src/data/content.js` — update Careers link to `/careers`
- Modify: `backend/.env` — add HR email for notifications

**Implementation approach**:
```
Step 1: Create Careers.jsx page with:
  - Hero section about working at Tiny Explorers
  - Current open positions (from content.js)
  - Application form in modal

Step 2: Create CareersForm component:
  - Fields: name, email, phone, position, resume (file upload)
  - Submit to /api/careers

Step 3: Add /api/careers POST endpoint:
  - Accept file upload
  - Store in S3 or local storage
  - Save application to MongoDB

Step 4: Add email to HR email address
Step 5: Update navigation to point to /careers
Step 6: Test complete flow
```

**Risk factors**:
- ⚠️ FILE UPLOADS — Need S3 or file storage
  - MVP: Store in `/backend/uploads` folder
  - Production: Use AWS S3 or similar
- ✅ Otherwise straightforward

**Success criteria**:
- [ ] `/careers` route works
- [ ] Career positions display
- [ ] Application form submits
- [ ] Resume file uploads
- [ ] HR receives email with attachment link
- [ ] Candidate receives confirmation

---

## 🟡 MEDIUM PRIORITY (This Week)

### 7. **Newsletter Welcome Email**
**Status**: ⚠️ Partially done (no email)  
**Impact on launch**: 🟡 MEDIUM  
**Effort**: 1 hour  
**Risk**: LOW

**Just add email to existing `/api/newsletter` POST endpoint**

```python
# In backend/server.py /api/newsletter
send_email(
    to=payload.email,
    subject="Welcome to Tiny Explorers",
    template="newsletter_welcome",
    data={"email": payload.email}
)
```

---

### 8. **Rate Limiting & Security Hardening**
**Status**: ❌ Not implemented  
**Impact on launch**: 🟡 MEDIUM  
**Effort**: 3-4 hours  
**Risk**: LOW

**Files to modify**:
- Modify: `backend/requirements.txt` — add `slowapi`
- Modify: `backend/server.py` — add rate limiting middleware

**Implementation approach**:
```
Step 1: Add slowapi to requirements
Step 2: Configure rate limits:
  - POST /api/enrollment: 5/minute
  - POST /api/newsletter: 10/minute
  - POST /api/inquiry: 5/minute
  - GET endpoints: 100/hour
Step 3: Add HTTPS enforcement
Step 4: Add HSTS header
Step 5: Test with ab or wrk load testing
```

---

### 9. **Add 404 Error Boundary**
**Status**: ❌ Not implemented  
**Impact on launch**: 🟡 MEDIUM  
**Effort**: 1-2 hours  
**Risk**: LOW

**Files to create**:
- New: `frontend/src/pages/NotFound.jsx`
- New: `frontend/src/components/ErrorBoundary.jsx`
- Modify: `frontend/src/App.js` — add ErrorBoundary + 404 route

```javascript
<Route path="*" element={<NotFound />} />
```

---

## 🟢 NICE-TO-HAVE (After Launch)

### 10. **Inquiry Status Management**
- Add `status` field (new/contacted/enrolled/rejected)
- Admin dashboard to update status
- Email templates for each status change

### 11. **Export to CSV**
- Export inquiries to CSV for reports
- Date range filtering

### 12. **Multi-language Support**
- Add Portuguese language option
- i18n setup with react-i18next

### 13. **Advanced Analytics**
- Dashboard with conversion metrics
- Inquiry source tracking
- Enrollment funnel analysis

### 14. **Automated Reminders**
- Email reminders to non-responsive families
- Admin notifications for old inquiries

### 15. **SMS Integration**
- Send SMS confirmations
- SMS reminders

---

## Implementation Timeline

```
WEEK 1 (CRITICAL PATH)
├─ Day 1 (4h)   ✅ Email integration (Resend setup + templates)
├─ Day 1 (2h)   ✅ Wire Inquiry Modal to /api/inquiry endpoint
├─ Day 2 (4h)   ✅ Protect API endpoints (JWT auth setup)
├─ Day 2 (2h)   ✅ Add /api/inquiry email notifications
├─ Day 3 (4h)   ✅ Complete Admissions Modal (add submit + backend)
├─ Day 3 (2h)   ✅ Fix Careers page routing
└─ Day 4 (4h)   ✅ Basic Admin Dashboard (MVP)

WEEK 2 (HIGH + MEDIUM)
├─ Day 1 (4h)   ✅ Implement Careers form + file upload
├─ Day 1 (2h)   ✅ Rate limiting + security hardening
├─ Day 2 (3h)   ✅ Error boundaries + 404 page
├─ Day 2 (2h)   ✅ Newsletter welcome emails
└─ Day 3-5      ✅ Testing + bug fixes

TOTAL: ~35 hours = 1 developer week (8.75 days)
       or 2 developers week 1 = launch ready
```

---

## Risk Assessment

| Task | Technical Risk | Timeline Risk | Dependency Risk |
|------|----------------|---------------|-----------------|
| Email Integration | LOW | LOW | None |
| API Protection | MEDIUM | MEDIUM | None |
| Inquiry Modal | LOW | LOW | Email |
| Admissions Modal | MEDIUM | MEDIUM | Email |
| Admin Dashboard | MEDIUM | HIGH | Auth |
| Careers Page | MEDIUM | MEDIUM | File storage |
| Newsletter Email | LOW | LOW | Email |
| Rate Limiting | LOW | LOW | None |
| 404 Page | LOW | LOW | None |

---

## Starting Point: CRITICAL #1 - Email Integration

**Ready to implement**. Beginning now with backend email service setup.

See: [Email Integration Implementation](#email-integration-implementation-detailed)

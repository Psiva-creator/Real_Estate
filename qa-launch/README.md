# 🔍 Member 6: QA Lead & Launch Specialist

> **Mission:** The final line of defense before real sellers upload confidential ownership documents and real buyers place inquiries on high-value land and flat deals. Ensure absolute stability, data integrity, and flawless user journeys.

---

## 🚨 Defect Severity Definitions

- **🔴 Blocker:** Prevents core transaction — form submission failure, upload crash, site down, corrupted database write, or exposed seller phone number. *Must be resolved immediately.*
- **🟠 Major:** Significant feature defect with an awkward workaround (e.g., search filter bug, map coordinate displacement, missing WhatsApp alert). *Must be resolved before Day 7 launch.*
- **🟡 Minor:** Cosmetic, layout, or minor visual blemish (e.g., small text truncation, spacing inconsistency, minor Telugu font clash). *Can be addressed in post-launch hotfix.*

---

## 📅 Day-by-Day Roadmap

- [ ] **Day 1 — Test Strategy & Traceability:**
  - Write test case matrix for the 4 core flows: Seller Onboarding, Document Gate, Buyer Discovery, and Lead Pipeline.
  - Set up bug tracker repository (`bug-tracker/bug-log.md`).
- [ ] **Day 2–3 — Seller Flow & Document Gate Testing:**
  - Test multi-step seller form validation (required fields, phone verification).
  - Verify file upload constraints for all 13 document types (PDF, JPG, PNG, file size limits).
  - Test property lifecycle state machine: `DRAFT` → `UNDER_REVIEW` → `VERIFIED` → `LIVE`.
- [ ] **Day 3–4 — Incremental Regression & Early Bug Logging:**
  - Log issues directly to Backend and Frontend workspaces.
  - Retest resolved tickets promptly.
- [ ] **Day 4–5 — End-to-End System Testing:**
  - Execute full end-to-end journey:
    1. Seller registers land and uploads documents.
    2. Internal admin logs in, verifies documents, and moves status to `LIVE`.
    3. Buyer searches using ORR distance filter and views verified property.
    4. Buyer requests site visit → WhatsApp alert fires to buyer and assigned agent.
- [ ] **Day 5 — Mobile, Network & Telugu Cross-Device Testing:**
  - Test on real mobile devices (iOS Safari, Android Chrome).
  - Test on simulated 3G network conditions.
  - Inspect Telugu rendering across various browser viewports.
- [ ] **Day 6 — UAT & Pre-Launch Hardening:**
  - Facilitate User Acceptance Testing (UAT) with 1–2 real sellers/buyers lined up by Product Lead (`uat/uat-script.md`).
  - Run comprehensive Pre-Launch Go-Live Checklist (`checklists/pre-launch-checklist.md`).
  - Review remaining open bugs with Product Lead for the Go/No-Go call.
- [ ] **Day 7 — 🚀 Launch Day Smoke Test:**
  - Execute live production smoke test upon deployment.
  - Monitor error logs (Sentry/logs) and confirm initial enquiries are properly routed.

---

## 📂 QA & Launch Folder Structure

```text
qa-launch/
├── test-plans/
│   └── e2e-test-matrix.md       # Comprehensive test cases for all 4 flows
├── bug-tracker/
│   └── bug-log.md               # Active defect tracking log
├── uat/
│   └── uat-script.md            # Step-by-step UAT script for real users
└── checklists/
    └── pre-launch-checklist.md  # 50-point go-live verification checklist
```

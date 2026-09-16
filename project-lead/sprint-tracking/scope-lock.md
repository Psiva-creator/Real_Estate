# 🔒 MVP Scope Lock & Sprint Boundaries

> **Owner:** Member 1: Product & Project Lead (Siva Krishna)  
> **Status:** LOCKED & ACTIVE  
> **Sprint Duration:** 7-Day Fast-Track MVP Sprint  
> **Focus:** Telangana (Hyderabad Metro & Growth Corridors)

---

## 🎯 Primary MVP Objective
Build and launch a trusted, bilingual (English & Telangana Telugu) mediation & brokerage platform that connects Land and Flat sellers with verified buyers through an uncompromising **13-Document Legal Verification Gate**.

---

## ✅ IN-SCOPE (MVP Deliverables)

### 1. Public Portal & Discovery
- **Bilingual Interface:** Instant seamless switching between English (`en`) and natural Telangana Telugu (`te`).
- **Property Discovery:** Search and filtering by:
  - Property Type: Agricultural Land, Commercial Land, Residential Plots, High-Rise Flats.
  - Location: District (Rangareddy, Sangareddy, Medchal-Malkajgiri, Hyderabad), Mandal, and Village.
  - Proximity to Outer Ring Road (ORR) in Kilometers.
  - Service Tiers: Tier 1 (Central Cyberabad), Tier 2 (Growth Orbit), Tier 3 (Regional Expansion).
- **Property Detail Page:**
  - High-resolution gallery & site plans.
  - Clear breakdown of land specs (acres, survey numbers, soil type, road width) and flat specs (sqft, bedrooms, floor, possession status).
  - The **13-Document Verification Trust Badge & Checklist Status**.
  - Direct WhatsApp & Site Visit booking enquiry modals.

### 2. Seller Intake & Document Gate
- **Multi-Step Seller Listing Form:**
  - Step 1: Basic Information & Listing Type.
  - Step 2: Precise Geo-Location, Survey Numbers, and Mandal/Village.
  - Step 3: Specifications (Acres / Sqft, Road Width, Zoning).
  - Step 4: Pricing & Brokerage Agreement terms.
  - Step 5: **13-Document Checklist Uploader** (Sale Deed, 30-Year EC, Pahani, Form 1-B, Dharani Passbook, HMDA/DTCP layout approval, etc.).

### 3. Back-Office & Role-Based Dashboard
- **Role Portals:** Admin, Agent, and Seller views.
- **Document Verification Reviewer:** Team back-office interface to review uploaded seller documents, mark them as `PENDING`, `VERIFIED`, or `REJECTED` with audit timestamps and reviewer IDs.
- **Deal & Enquiry Pipeline:** Lead scoring, assignment to senior advisors, and status transitions (`NEW`, `CONTACTED`, `VISIT_SCHEDULED`, `NEGOTIATION`, `CLOSED`).

### 4. Data & Legal Foundation
- **5 to 10 Verified Real/Realistic Listings:** Seeded with accurate Hyderabad coordinates, real survey numbers, and complete 13-doc verification trees.
- **Legal Safeguards:** Brokerage Mediation Disclaimers, Terms of Service, and Privacy Policy compliant with Telangana real estate practices.

---

## ❌ OUT-OF-SCOPE (Deferred to Post-Launch v2.0)

| Feature | Deferred Reason | Target Release |
| :--- | :--- | :--- |
| **In-App Payment Gateway** | High compliance overhead for token advances; escrow/token money handled offline via signed brokerage agreements for MVP. | Sprint 2 (v1.2) |
| **Direct Dharani API Sync** | Government portal API requires commercial entity approvals and high latency; replaced by manual document upload & verification. | v2.0 |
| **3D Virtual Property Tours** | High asset generation time; replaced by high-res photo gallery and site plan schematics. | Sprint 3 |
| **Automated SMS Gateway (DLR)** | Avoid telco DLT registration delay during sprint week; mock notification dispatcher + direct WhatsApp click-to-chat active. | Sprint 2 |
| **Native Mobile Apps (iOS/Android)**| Responsive PWA & mobile-first Next.js web application covers 98% of mobile traffic. | Q4 Roadmap |

---

## 🚦 Sprint Quality Gates

1. **Gate 1 (Day 2):** Database schema and shared TypeScript definitions locked without changes.
2. **Gate 2 (Day 4):** All 13 document types supported in backend API and frontend uploader.
3. **Gate 3 (Day 5):** Content Manager sign-off on 100% natural Telangana Telugu phrasing.
4. **Gate 4 (Day 6):** End-to-end UAT walkthrough with real test sellers and buyers; zero High/Critical defects.
5. **Gate 5 (Day 7):** Final Project Lead Go/No-Go Launch Decision.

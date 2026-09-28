# 🔒 MVP Scope Lock & Sprint Boundaries

> **Owner:** Member 1: Product & Project Lead (Siva Krishna)  
> **Status:** ACTIVE — AMENDMENT #1 INCORPORATED  
> **Sprint Duration:** 7-Day Fast-Track MVP Sprint  
> **Focus:** Telangana (Hyderabad Metro & High-Growth Corridors)

---

## 🎯 Primary Objective
Build and launch a premium, trusted, bilingual (English & Telangana Telugu) mediation & brokerage platform connecting Plot/Land, Villa, and Flat sellers with verified buyers through an uncompromising **13-Document Legal Verification Gate** and **interactive GIS map discovery**.

---

## ✅ IN-SCOPE (Core Deliverables)

### 1. Property Categories & Showcases
* 🏡 **Plots / Lands:**
  - Total acres, sq. yards, survey numbers, soil type (Red/Black/Mixed), development status (Raw/Fenced/Venture Ready), road approach width (ft), borewell water & electricity availability.
  - Price per acre, price per sq. yard, total price.
  - **Interactive Plot Boundary Polygon:** Drawing, vertex editing, area calculation, and boundary map visualization.
* 🏠 **Villas (Scope Amendment #1):**
  - Plot area (sq. yards), built-up area (sq. ft), bedrooms, bathrooms.
  - Floor configuration (G+1, G+2 Triplex), private garden, covered parking slots.
  - Gated community amenities, possession status, furnishing status.
  - Villa-specific legal verification gate (Sale Deed, 30-Yr EC, Link Docs, Sanctioned Building Plan / HMDA layout, Tax Receipt, Sale Agreement).
* 🏢 **Residential Flats / Apartments:**
  - Built-up sqft, bedrooms, bathrooms, floor / total floors, amenities, possession status.

### 2. Public Portal & Map Discovery
* **Bilingual Interface:** Seamless switching between English (`en`) and natural Telangana Telugu (`te`).
* **Property Discovery & Search:**
  - Split-view (interactive map + curated property list).
  - Filtering by property type (`LAND`, `VILLA`, `FLAT`), service tier, district, mandal, village, price, acreage/sqft, and ORR distance.
  - **Buyer Saved Properties / Favorites:** Bookmark properties to review later with persistent storage and navigation counter.
* **Property Detail Page:**
  - High-res photo gallery and site plan viewer.
  - Detailed architectural and revenue specifications.
  - The **13-Document Verification Trust Badge & Checklist Status**.
  - Interactive Leaflet GIS map with 158km ORR loop, key exits, and plot boundary polygon overlay.
  - Dedicated Deal Desk contact (`+91-9876543210`) with direct WhatsApp & Site Visit booking inquiry modals.

### 3. Seller Intake & Map Demarcation
* **Multi-Step Seller Listing Form:**
  - Step 1: Listing Category (`LAND`, `VILLA`, `FLAT`) & Basic Information.
  - Step 2: Precise Geo-Location, Mandal/Village, and **Interactive Map Polygon Boundary Tool** (for plots/lands).
  - Step 3: Detailed Specifications (Acreage/Sqft, Survey Numbers, Road Width, Floors, Amenities).
  - Step 4: Pricing & Brokerage Mediation mandate terms.
  - Step 5: **13-Document Checklist Uploader** (Sale Deed, 30-Year EC, Pahani, Form 1-B, Dharani Passbook, HMDA/DTCP approval, etc.).

### 4. Back-Office & Role-Based Dashboard
* **Role Portals:** Admin, Agent, and Seller views.
* **13-Document Verification Reviewer:** Team back-office interface to inspect uploaded deeds, verify against revenue records, and approve or reject with audit timestamps and reviewer ID.
* **Deal & Enquiry Pipeline:** Dynamic lead scoring (0–100), automatic advisor assignment, status pipeline (`NEW` -> `ASSIGNED` -> `CONTACTED` -> `SITE_VISIT_SCHEDULED` -> `IN_NEGOTIATION` -> `DEAL_CLOSED`), and automated WhatsApp alerts.

### 5. Data & Legal Foundation
* **7 to 10 Verified Real/Realistic Hyderabad Listings:** Seeded with accurate GPS coordinates, real survey numbers, and complete 13-doc verification trees across Kokapet, Kollur, Mokila, Shamshabad, Tellapur, and Gachibowli.
* **Legal Safeguards:** Brokerage Mediation Disclaimers, Terms of Service, and Privacy Policy compliant with Telangana real estate practices.

---

## ❌ OUT-OF-SCOPE (Deferred to Post-Launch v2.0)

| Feature | Deferred Reason | Target Release |
| :--- | :--- | :--- |
| **In-App Payment Gateway** | High compliance overhead for token money; escrow/token money handled offline via signed brokerage agreements for MVP. | Sprint 2 (v1.2) |
| **Direct Dharani API Sync** | Government portal API requires commercial entity approvals and high latency; replaced by manual document upload & verification. | v2.0 |
| **3D Virtual Property Tours** | High asset generation time; replaced by high-res photo gallery and site plan schematics. | Sprint 3 |
| **Automated SMS Gateway (DLR)** | Avoid telco DLT registration delay during sprint week; mock notification dispatcher + direct WhatsApp click-to-chat active. | Sprint 2 |
| **Native Mobile Apps (iOS/Android)**| Responsive PWA & mobile-first Next.js web application covers 98% of mobile traffic. | Q4 Roadmap |

---

## 🚦 Sprint Quality Gates

1. **Gate 1 (Day 1-2):** Monorepo workspaces, database schema, and shared TypeScript definitions locked without errors. *(Completed)*
2. **Gate 2 (Day 3-4):** All 13 document types and `VILLA` property type supported across backend API, database, and frontend uploader.
3. **Gate 3 (Day 5):** Content Manager sign-off on 100% natural Telangana Telugu phrasing (including Villa and map boundary copy).
4. **Gate 4 (Day 6):** End-to-end UAT walkthrough with real test sellers and buyers; zero High/Critical defects.
5. **Gate 5 (Day 7):** Final Project Lead Go/No-Go Launch Decision.

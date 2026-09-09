# Architecture — Complete System Design


### 1. Business Model

**Mediator/brokerage platform** — not a peer-to-peer marketplace:
* Sellers submit land/flat listings → team verifies documents → listing goes live
* Buyers browse verified listings → enquire → team handles the deal end-to-end
* No direct seller-buyer contact shown publicly — all communication routes through the team
* Revenue: commission per closed deal

---


### 2. System Overview

```
SELLERS ──▶ BACKEND (API + DB) ◀── BUYERS
                  │
           TEAM DASHBOARD
     (verify listings, route leads)
```
**Frontend (Public site):** Bilingual (English/Telugu) — Next.js/React. Seller onboarding, buyer search, property detail, enquiry forms.
**Backend (API + logic):** Node.js/FastAPI + PostgreSQL. Property CRUD, document verification workflow, enquiry routing.
**Team Dashboard (Internal):** Review/verify listings, manage enquiries, track deal pipeline.
**Integrations:** Google Maps API (location, distance calc) · Twilio/Wati (WhatsApp/SMS alerts) · AWS S3/Firebase (document + photo storage)

---


### 3. Database Schema

**PROPERTIES**
* id, seller_id (FK), type (Land/Flat), status
* Location: village, mandal, district, lat/lng, distance_from_orr, zone
* Land: total_acres, survey_numbers, soil_type, development_level
* Flat: sqft, bedrooms, bathrooms, floor, amenities, possession_status
* Infrastructure: bt_road_size, highway_distance, water/electricity/drainage
* Pricing: price_per_acre, total_price, outrate, half_development_value
* Documents (13 fields, each status: pending/uploaded/verified) — see section 4
* Photos: main_image, gallery[], site_plan_image
**OWNERS/SELLERS**
* id, name, phone, email, whatsapp, aadhar_number, properties_count, deals_completed, rating
**ENQUIRIES**
* id, property_id (FK), buyer_name, phone, whatsapp, enquiry_type (Call/Visit/Question), status, assigned_to, follow_up_date, lead_score
**Status workflow:** Draft → Under Review → Verified → Live → Sold/Off-Market

---


### 4. Required Documents (Verification Gate)

Every property must clear these before going Live:
1. Sale Deed
1. EC (Encumbrance Certificate)
1. Link Documents
1. Pahani
1. Form 1-B
1. FMB
1. Pattadar Passbook
1. HMDA/DTCP Approval
1. Mutation
1. Tax Receipt
1. Master Plan
1. GPA (if applicable)
1. Sale Agreement

---


### 5. Service Areas (HMDA Metropolitan Development Plan)

* **Tier 1:** Hyderabad core, Secunderabad, Kukatpally, Serilingampalli, Qutbullapur
* **Tier 2:** ORR corridor (5–10km band) — growth zones
* **Tier 3:** Warangal, Karimnagar, Nizamabad + surrounding mandals

---


### 6. Key User Flows

**Seller flow:** Submit form → Upload docs → Team reviews → Verified → Live → Manage enquiries
**Buyer flow:** Search/filter → View property → Enquire (call/visit/question) → Team follows up → Site visit → Deal
**Team flow:** Receive listing → Verify docs → Publish → Receive enquiry → Assign → Track deal → Close

---


### 7. Tech Stack Summary

| Layer | Choice |
| --- | --- |
| Frontend | Next.js / React |
| Backend | Node.js or FastAPI |
| Database | PostgreSQL |
| Storage | AWS S3 / Firebase |
| Maps | Google Maps API |
| Messaging | Twilio / Wati (WhatsApp/SMS) |
| Hosting | Vercel (frontend) + Railway/Render (backend) |

---


### 8. 1-Week Timeline

**Days 1–3:** Core build — DB, APIs, seller form, buyer search, base content
**Days 4–6:** Integrations, mobile polish, testing, UAT
**Day 7:** 🚀 Launch

---

**Any architecture change must be posted here first, then flagged to affected role pages.**
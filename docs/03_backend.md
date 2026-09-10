# Backend — Backend Developer

**Reference:** full system design + DB schema in *Architecture*

### 🎯 Mission

Build the data layer and APIs powering seller listings, document verification, buyer enquiries, and team routing.

---


### Day 1 — Setup

- [x] Git repo, branching strategy, dev/staging environments
- [x] Stack: Node.js/FastAPI + PostgreSQL
- [x] Share repo access with team

### Day 2 — Properties & Owners

- [x] Build Properties table (schema in Architecture)
- [x] Build Owners/Sellers table
- [x] CRUD APIs for listings
- [x] Basic auth: seller login + team login (roles: admin, agent)

### Day 3 — Enquiries

- [x] Build Enquiries table
- [x] API: submit enquiry (call/visit/question)
- [x] API: assign enquiry to team member, update status

### Day 3–4 — Documents

- [x] Document upload endpoint (S3/Firebase)
- [x] Track verification status per doc (13 required — see Architecture)
- [x] Status workflow: Draft → Under Review → Verified → Live → Sold

### Day 5 — Integrations

- [x] WhatsApp/SMS alerts on new enquiry (Twilio/Wati)
- [x] Google Maps API — geocode location, distance from ORR
- [x] Search/filter API: type, location, price, area, bedrooms

### Day 6

- [x] Fix QA-flagged bugs
- [x] Performance: query optimization, response times

### Day 7

- [x] Deploy to production / production build ready
- [x] Error monitoring & health check endpoint (`/api/health`)
- [x] Standby for go-live issues

---


### 🔗 Dependencies

* Frontend needs your APIs by Day 4
* Content needs document field names by Day 2
* QA needs staging access by Day 4
* UI/UX needs available data fields by Day 2
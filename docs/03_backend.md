# Backend — Backend Developer

**Reference:** full system design + DB schema in *Architecture*

### 🎯 Mission

Build the data layer and APIs powering seller listings, document verification, buyer enquiries, and team routing.

---


### Day 1 — Setup

- [ ] Git repo, branching strategy, dev/staging environments
- [ ] Stack: Node.js/FastAPI + PostgreSQL
- [ ] Share repo access with team

### Day 2 — Properties & Owners

- [ ] Build Properties table (schema in Architecture)
- [ ] Build Owners/Sellers table
- [ ] CRUD APIs for listings
- [ ] Basic auth: seller login + team login (roles: admin, agent)

### Day 3 — Enquiries

- [ ] Build Enquiries table
- [ ] API: submit enquiry (call/visit/question)
- [ ] API: assign enquiry to team member, update status

### Day 3–4 — Documents

- [ ] Document upload endpoint (S3/Firebase)
- [ ] Track verification status per doc (13 required — see Architecture)
- [ ] Status workflow: Draft → Under Review → Verified → Live → Sold

### Day 5 — Integrations

- [ ] WhatsApp/SMS alerts on new enquiry (Twilio/Wati)
- [ ] Google Maps API — geocode location, distance from ORR
- [ ] Search/filter API: type, location, price, area, bedrooms

### Day 6

- [ ] Fix QA-flagged bugs
- [ ] Performance: query optimization, response times

### Day 7

- [ ] Deploy to production
- [ ] Error monitoring (Sentry or similar)
- [ ] Standby for go-live issues

---


### 🔗 Dependencies

* Frontend needs your APIs by Day 4
* Content needs document field names by Day 2
* QA needs staging access by Day 4
* UI/UX needs available data fields by Day 2
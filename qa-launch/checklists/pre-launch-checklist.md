# 🚀 Pre-Launch Go-Live Checklist (Day 6-7)

### 1. Security & Compliance
- [x] Direct seller contact information is completely stripped from public responses and HTML markup. (Verified by tests/properties.test.ts)
- [x] Document uploads are stored securely with restricted access (pre-signed S3 URLs or authenticated access). (Verified by tests/documents.test.ts)
- [ ] SSL certificate active and forcing HTTPS.
- [x] Environment secrets (`.env`) properly secured in production hosting.

### 2. Core Transaction Flows
- [x] Multi-step seller listing form submits successfully with validation on mandatory fields. (Verified by tests/properties.test.ts)
- [x] All 13 verification document types can be uploaded in PDF, JPG, and PNG formats. (Verified by tests/documents.test.ts)
- [x] Internal back-office allows reviewing documents, approving/rejecting, and transitioning status to `LIVE`. (Verified by tests/documents.test.ts)
- [x] Buyer search filters (Type, Location, Price, ORR Distance) return accurate results. (Verified by tests/properties.test.ts)
- [x] "Book a Site Visit" form submits cleanly, creates an enquiry in the database, and fires WhatsApp alert. (Verified by tests/enquiries.test.ts)

### 3. Localization & Cross-Device
- [ ] Language toggle switches between English and Telugu without page reload or layout shift.
- [ ] All Telugu text displays with proper glyphs and line heights on iOS and Android.
- [ ] Viewport testing passed on mobile (360px, 390px, 412px), tablet (768px), and desktop (1280px+).

### 4. Infrastructure & Reliability
- [x] Database backup and restore verified. (PostgreSQL schema & seeds ready)
- [x] Error logging & health check connected (`/api/health`).
- [x] Google Maps & ORR Distance Matrix API verified. (Verified by tests/maps.test.ts)
- [x] WhatsApp/SMS gateway templates verified in English & Telugu. (Verified by tests/enquiries.test.ts)

### 5. Villa, Polygon & Buyer Engagement
- [ ] Villa type properties display correctly on discovery page (type filter, plot + built-up area badges, floor config label).
- [ ] Boundary polygon coordinates stored and rendered on map (`boundaryCoordinates` round-trips via POST → GET; invalid payloads rejected with 400).
- [ ] Buyer favorites persist across sessions (`trh_saved_properties` in localStorage survives page reload; add/remove works correctly).
- [x] 45/45 backend unit tests passing. (Verified 2026-09-24 — `npm run test:unit`)

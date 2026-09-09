# 🚀 Pre-Launch Go-Live Checklist (Day 6-7)

### 1. Security & Compliance
- [ ] Direct seller contact information is completely stripped from public responses and HTML markup.
- [ ] Document uploads are stored securely with restricted access (pre-signed S3 URLs or authenticated access).
- [ ] SSL certificate active and forcing HTTPS.
- [ ] Environment secrets (`.env`) properly secured in production hosting.

### 2. Core Transaction Flows
- [ ] Multi-step seller listing form submits successfully with validation on mandatory fields.
- [ ] All 13 verification document types can be uploaded in PDF, JPG, and PNG formats.
- [ ] Internal back-office allows reviewing documents, approving/rejecting, and transitioning status to `LIVE`.
- [ ] Buyer search filters (Type, Location, Price, ORR Distance) return accurate results.
- [ ] "Book a Site Visit" form submits cleanly, creates an enquiry in the database, and fires WhatsApp alert.

### 3. Localization & Cross-Device
- [ ] Language toggle switches between English and Telugu without page reload or layout shift.
- [ ] All Telugu text displays with proper glyphs and line heights on iOS and Android.
- [ ] Viewport testing passed on mobile (360px, 390px, 412px), tablet (768px), and desktop (1280px+).

### 4. Infrastructure & Reliability
- [ ] Database backup and restore verified.
- [ ] Error logging (Sentry) connected and alerting.
- [ ] Google Maps API quota and billing confirmed.
- [ ] WhatsApp/SMS gateway (Twilio/Wati) account funded with verified templates.

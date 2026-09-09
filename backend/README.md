# 💻 Member 2: Backend Developer

> **Mission:** Build the data layer, authentication, business logic, and APIs powering seller listings, 13-document verification status transitions, buyer enquiries, and team notification routing.

---

## 🛠️ Architecture & Tech Stack

- **Runtime:** Node.js (Express/FastAPI)
- **Database:** PostgreSQL (Schema located at `src/db/schema/schema.sql`)
- **Storage:** AWS S3 or Firebase Cloud Storage for secure document and property media uploads
- **Messaging:** Twilio / Wati API for WhatsApp & SMS alerts
- **Location:** Google Maps Geocoding & Distance Matrix API (ORR corridor distance)

---

## 📅 Day-by-Day Roadmap

- [ ] **Day 1 — Setup:**
  - Initialize Git repo, environment variables (`.env`), and PostgreSQL database.
  - Apply migrations from `src/db/schema/schema.sql`.
- [ ] **Day 2 — Properties & Owners API:**
  - Build `owners` and `properties` tables and repositories.
  - Implement CRUD APIs: `POST /api/properties`, `GET /api/properties`, `GET /api/properties/:id`.
  - Authentication middleware: Seller auth & Team auth (roles: `ADMIN`, `AGENT`).
- [ ] **Day 3 — Enquiries API:**
  - Build `enquiries` table and pipeline logic.
  - Endpoints: `POST /api/enquiries` (Call / Visit / Question), `PATCH /api/enquiries/:id/assign`, `PATCH /api/enquiries/:id/status`.
- [ ] **Day 3–4 — Document Upload & Verification Gate:**
  - S3 pre-signed upload URL endpoint: `POST /api/properties/:id/documents/upload-url`.
  - Track verification status for all 13 documents.
  - Implement property state machine: `DRAFT` → `UNDER_REVIEW` → `VERIFIED` → `LIVE` → `SOLD`.
- [ ] **Day 5 — Third-Party Integrations:**
  - WhatsApp/SMS alert dispatch (Twilio/Wati) on new enquiry or listing approval.
  - Google Maps API integration to calculate distance from ORR.
  - Advanced search and filter endpoint: `GET /api/properties/search` (by type, location, price, acreage, bedrooms).
- [ ] **Day 6 — Performance & Bug Fixes:**
  - Resolve QA-flagged issues.
  - Index tuning and query optimization.
- [ ] **Day 7 — 🚀 Go-Live:**
  - Deploy to Railway / Render / AWS.
  - Configure error tracking (Sentry).
  - Stand by for launch traffic and lead notifications.

---

## 📂 Backend Structure

```text
backend/
├── src/
│   ├── config/              # DB pool, S3 client, Twilio client, env vars
│   ├── db/
│   │   ├── schema/          # PostgreSQL DDL (schema.sql)
│   │   ├── migrations/      # Versioned migrations
│   │   └── seeds/           # Sourced Hyderabad listings seed data
│   ├── modules/
│   │   ├── properties/      # Property service & controller
│   │   ├── owners/          # Seller profile & KYC service
│   │   ├── enquiries/       # Lead pipeline & scoring service
│   │   ├── documents/       # 13-doc verification workflow
│   │   └── maps/            # Geocoding & ORR distance calculator
│   ├── services/
│   │   ├── notification/    # WhatsApp/SMS dispatch (Twilio/Wati)
│   │   └── storage/         # AWS S3 / Firebase file handler
│   ├── middleware/          # Auth, RBAC, input validation
│   └── types/               # Backend specific DTOs & models
├── package.json
└── tsconfig.json
```

# Telangana Real-Estate Brokerage Platform — Project Context

> **Persistent Source of Truth & Architecture Guide**  
> *Last Updated: September 2026*  
> *Repository: `/home/siva/Documents/REAL_ESTATE`*

---

## 1. Project Overview

The **Telangana Real-Estate Brokerage Platform** is a production-grade, bilingual (English & Telangana Telugu) real-estate mediation and brokerage platform. It connects Land and Flat sellers with verified buyers across Telangana, with a primary focus on the **Hyderabad Metropolitan Region** and its high-growth Outer Ring Road (ORR) corridors.

### Business Model & Mediation Core
* **Not an unvetted peer-to-peer marketplace:** Direct seller-buyer contact details are strictly prohibited from public presentation.
* **Mediation Desk:** All public listings display the platform's Dedicated Deal Desk contact (`+91-9876543210`), and buyer enquiries route through assigned senior advisors.
* **13-Document Verification Gate:** No listing can transition to `VERIFIED` or `LIVE` status without passing mandatory statutory and revenue legal document checks (including Sale Deed, 30-Year EC, Link Documents, Pahani, Form 1-B, Dharani Passbook, HMDA/DTCP layout approval, and Mutation proceedings).
* **Revenue Model:** Commission and brokerage per successfully closed title transaction.

---

## 2. Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.2.24 (App Router) | React 18.3.1, TypeScript 5.7.2, Server & Client Components |
| **Styling & Design System** | Tailwind CSS 3.4.17 + Lucide Icons | Bespoke warm luxury palette (Charcoal, Antique Gold, Bone White, Emerald) |
| **GIS & Interactive Maps** | Leaflet 1.9.4 | High-performance canvas rendering, Google Satellite Hybrid tiles, Esri Aerial tiles |
| **Internationalization (i18n)**| Custom bilingual routing segment | `/[locale]/...` (`en` = English, `te` = Telugu), zero external heavy i18n deps |
| **Backend Framework** | Node.js (v20+) + Express 4.21.2 | TypeScript 5.7.3, `tsx` runtime, RESTful modular architecture |
| **Database** | PostgreSQL 16 (Raw SQL + `pg` 8.13.3) | Parameterized queries, connection pooling, SSL support, in-memory mock fallback |
| **Authentication & RBAC** | JWT (`jsonwebtoken` 9.0.2) + `bcryptjs` | Bearer token authorization, role-based middleware (`ADMIN`, `AGENT`, `SELLER`) |
| **File & Document Storage** | Dual Adapter (`storage.service.ts`) | Local filesystem storage (`/uploads`) + AWS S3 pre-signed adapter |
| **Notifications & Messaging** | Dual Dispatcher (`whatsapp.service.ts`) | Mock logger + Twilio / WATI WhatsApp & SMS gateways with bilingual templates |
| **API Documentation** | Swagger UI (`swagger-ui-express` 5.0.1) | OpenAPI 3.0 specification available at `/api/docs` |
| **DevOps & Containers** | Docker, Docker Compose, Render, Vercel | Production configuration in `docker-compose.yml` & `render.yaml` |

---

## 3. Architecture

### System Topology
```text
                     ┌────────────────────────────────────────┐
                     │          Next.js 14 Frontend           │
                     │  (Vercel: English & Telugu Public UI)  │
                     └───────────────────┬────────────────────┘
                                         │
                   REST Calls (JSON)     │  Direct Auth Bearer Tokens
                                         ▼
                     ┌────────────────────────────────────────┐
                     │       Express.js TypeScript API        │
                     │       (Render / Docker Container)      │
                     └───────┬────────────────────────┬───────┘
                             │                        │
       Parameterized Queries │                        │ Multer / Storage
                             ▼                        ▼
       ┌───────────────────────────────┐    ┌───────────────────────────┐
       │   PostgreSQL 16 Database      │    │  Local / AWS S3 Storage   │
       │   (Supabase / Docker PG)      │    │  (13 Verification Deeds)  │
       └───────────────────────────────┘    └───────────────────────────┘
```

### Monorepo Layout
```text
REAL_ESTATE/
├── frontend/             # Next.js 14 App Router client & public/internal portals
├── backend/              # Express + TypeScript REST API and database migrations
├── shared/               # Cross-cutting TypeScript constants and interfaces
│   ├── constants/        # Enums, document meta definitions, service tiers
│   └── shared-types/     # Shared DTOs (Property, Owner, Enquiry, Document)
├── content-bilingual/    # Master UI strings, legal agreements, WhatsApp templates
├── ui-ux/                # Design tokens (tokens.json), wireframes, specifications
├── project-lead/         # Sourced properties, scope lock, daily standup logs
├── qa-launch/            # Pre-launch checklists, UAT test plans, defect tracking
├── docs/                 # Initial system design and module specifications
└── scripts/              # Git synchronization automation (git-sync.sh)
```

---

## 4. Authentication & RBAC

### User Roles
1. **`ADMIN` (Lead Director Siva Krishna):**
   - Full platform privileges.
   - 13-Document legal verification audit, approving/rejecting uploaded deeds.
   - Override property status transitions (`UNDER_REVIEW` -> `VERIFIED` -> `LIVE`).
   - Executive metrics dashboard & user management.
2. **`AGENT` (Senior Land & Flat Advisors):**
   - Access to internal property inventory with unmasked seller details (`/api/admin/properties/:id`).
   - Enquiries deal desk: lead scoring, assignment, status pipeline, and site visit scheduling.
3. **`SELLER` (Registered Property Owners):**
   - Submit multi-step listings and upload 13 verification documents.
   - Dedicated seller dashboard (`/dashboard/seller`) tracking status and document clearance.
   - Ownership enforcement: Sellers can only modify/delete listings linked to their `sellerId`.
4. **`BUYER` (Public Visitors):**
   - Browse and search live properties.
   - Filter by location, price, type, ORR distance, and statutory clearances.
   - Submit site visit requests, callback requests, and questions via modal.

### Security Enforcements
* **Passphrases:** Hashed using `bcrypt` (10 rounds).
* **JWT Tokens:** Issued for 7 days (`config.jwtExpiresIn = '7d'`).
* **Route Protection:** Handled via `requireAuth` and `requireRole(['ADMIN', 'AGENT'])`.
* **Confidentiality Gate:** `sanitizePropertyForPublic()` strictly strips `sellerId`, seller contact numbers, email, and Aadhaar numbers from all public API endpoints (`/api/properties`, `/api/properties/search`, `/api/properties/:id`).

---

## 5. Database Schema

Schema defined in `backend/src/db/schema/schema.sql`:

### Enumerations
* `property_type_enum`: `'LAND'`, `'FLAT'`
* `property_status_enum`: `'DRAFT'`, `'UNDER_REVIEW'`, `'VERIFIED'`, `'LIVE'`, `'SOLD'`, `'OFF_MARKET'`
* `doc_type_enum`: `'SALE_DEED'`, `'EC'`, `'LINK_DOCUMENTS'`, `'PAHANI'`, `'FORM_1B'`, `'FMB'`, `'PATTADAR_PASSBOOK'`, `'HMDA_DTCP_APPROVAL'`, `'MUTATION'`, `'TAX_RECEIPT'`, `'MASTER_PLAN'`, `'GPA'`, `'SALE_AGREEMENT'`
* `doc_status_enum`: `'PENDING'`, `'UPLOADED'`, `'VERIFIED'`, `'REJECTED'`
* `enquiry_type_enum`: `'CALL'`, `'SITE_VISIT'`, `'QUESTION'`
* `enquiry_status_enum`: `'NEW'`, `'ASSIGNED'`, `'CONTACTED'`, `'SITE_VISIT_SCHEDULED'`, `'IN_NEGOTIATION'`, `'DEAL_CLOSED'`, `'DROPPED'`
* `user_role_enum`: `'ADMIN'`, `'AGENT'`, `'SELLER'`

### Tables & Relationships
1. **`users`**: Platform accounts for staff, agents, and registered sellers (`id`, `name`, `email`, `phone`, `whatsapp`, `role`, `password_hash`, `is_active`).
2. **`owners`**: Profile entity for property sellers (`id`, `user_id` FK, `name`, `phone`, `whatsapp`, `email`, `aadhar_number`, `properties_count`, `deals_completed`, `rating`).
3. **`properties`**: Real estate listings (`id`, `seller_id` FK -> owners, `type`, `status`, `title_en`, `title_te`, `description_en`, `description_te`, `village`, `mandal`, `district`, `latitude`, `longitude`, `distance_from_orr_km`, `zone`, `tier`, `total_acres`, `survey_numbers`, `soil_type`, `development_level`, `road_width_ft`, `water_available`, `electricity_available`, `sqft`, `bedrooms`, `bathrooms`, `floor`, `total_floors`, `amenities`, `possession_status`, `price_per_acre`, `price_per_sqft`, `total_price`, `outrate`, `half_development_value`, `is_negotiable`, `main_image`, `gallery_images`, `site_plan_image`, `is_featured`, `views_count`).
4. **`property_documents`**: 13 verification records per listing (`id`, `property_id` FK -> properties, `document_type`, `file_url`, `status`, `verified_by` FK -> users, `verified_at`, `rejection_reason`). Unique constraint on `(property_id, document_type)`.
5. **`enquiries`**: Lead pipeline (`id`, `property_id` FK -> properties, `buyer_name`, `phone`, `whatsapp`, `enquiry_type`, `status`, `assigned_to` FK -> users, `follow_up_date`, `lead_score`, `notes`).

---

## 6. API Structure

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | System health and timestamp |
| **GET** | `/api/docs` | Public | Swagger interactive documentation UI |
| **POST** | `/api/auth/register` | Public | Register seller account |
| **POST** | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| **GET** | `/api/auth/me` | Bearer Token | Retrieve current session user |
| **GET** | `/api/properties` | Public | List all LIVE properties (sanitized) |
| **GET** | `/api/properties/search` | Public | Search properties with filters |
| **GET** | `/api/properties/:id` | Public | Public property detail (sanitized) |
| **POST** | `/api/properties` | Optional Token | Create new listing draft (seller onboarding) |
| **PATCH**| `/api/properties/:id/status`| Admin / Agent | Transition listing state machine |
| **PATCH**| `/api/properties/:id` | Admin / Agent / Owner | Update listing details |
| **DELETE**|`/api/properties/:id` | Admin / Agent / Owner | Delete listing and related data |
| **POST** | `/api/properties/:id/documents/upload` | Seller / Admin | Upload legal document (Multer) |
| **GET** | `/api/properties/:id/documents` | Bearer Token | List all 13 documents for property |
| **GET** | `/api/properties/:id/documents/go-live-check` | Bearer Token | Validate if all mandatory docs are verified |
| **PATCH**| `/api/properties/:id/documents/:docType/verify`| Admin Only | Mark document VERIFIED or REJECTED |
| **POST** | `/api/enquiries` | Public | Submit buyer enquiry (calculates score & dispatches alerts) |
| **GET** | `/api/enquiries` | Admin / Agent | List deal pipeline leads |
| **PATCH**| `/api/enquiries/:id/assign` | Admin / Agent | Assign lead to agent |
| **PATCH**| `/api/enquiries/:id/status` | Admin / Agent | Move lead through deal pipeline |
| **PATCH**| `/api/enquiries/:id/schedule-visit` | Admin / Agent | Schedule site visit and notify buyer |
| **GET** | `/api/owners/me` | Seller Only | Get authenticated seller's private portfolio |
| **GET** | `/api/maps/distance` | Public | Calculate ORR distance and HMDA tier |
| **GET** | `/api/admin/dashboard` | Admin / Agent | Summary telemetry for command center |
| **GET** | `/api/admin/properties` | Admin / Agent | Internal property inventory (all statuses) |
| **GET** | `/api/admin/properties/:id` | Admin / Agent | Unmasked detail (includes seller contact) |

---

## 7. Property System

### State Machine Lifecycle
```text
[ DRAFT ] ────────► [ UNDER_REVIEW ] ────────► [ VERIFIED ] ────────► [ LIVE ]
    │                      │                         │                   │
    ▼                      ▼                         ▼                   ▼
[ OFF_MARKET ]       [ OFF_MARKET ]            [ OFF_MARKET ]        [ SOLD ]
```
* **Gate Rule:** The backend throws an error if an admin or agent attempts to move a property to `VERIFIED` or `LIVE` when any mandatory document for that property type is still `PENDING`, `NOT_UPLOADED`, or `REJECTED`.

### Mandatory Verification Documents
* **For LAND:** Sale Deed, 30-Year EC, Link Documents, Pahani / Adangal, Form 1-B, FMB (Field Measurement Book), Pattadar Passbook (Dharani), HMDA/DTCP Approval, Mutation Proceedings, Tax Receipt, Master Plan Zoning, Sale Agreement.
* **For FLAT:** Sale Deed, 30-Year EC, Link Documents, HMDA/DTCP Sanctioned Plan, Municipal Tax Receipt, Sale Agreement.
* **GPA (General Power of Attorney):** Optional gate checked only when listing through an authorized representative.

---

## 8. Maps & GIS

* **Frontend Engine:** `LeafletPropertyMap.tsx` using `leaflet` with GPU canvas acceleration (`preferCanvas: true`).
* **Tile Layers Supported:**
  1. *Satellite Hybrid:* `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}` (Photographic imagery + road labels, zero API key required).
  2. *Esri World Imagery:* Pure satellite aerial view.
  3. *OpenStreetMap:* Street and topology layer.
* **Telangana Spatial Features:**
  - Complete 158km Outer Ring Road (ORR) polyline loop (`ORR_LOOP_COORDINATES`).
  - 10 key ORR exit markers (Kokapet Exit 1, Kollur Exit 2, Patancheru Exit 3, Dundigal Exit 5, Medchal Exit 6, Shamirpet Exit 7, Ghatkesar Exit 9, Pedda Amberpet Exit 11, Shamshabad Airport Exit 16, Adibatla Exit 19).
  - Single property view renders a circular survey highlight demarcation.
* **Backend Geocoding & ORR Matrix:**
  - `maps.service.ts` calculates exact Haversine distance from 11 ORR nodes.
  - Automatically determines HMDA Service Tier (Tier 1 = Core, Tier 2 = ORR 5-10km band, Tier 3 = Regional growth mandals).

---

## 9. Villa Showcase

### Current Status
* The schema currently classifies properties into `LAND` and `FLAT`.
* Villa listings are presently represented either as Land (e.g., Gated Villa Plots) or as Flats with multi-floor attributes.

### Target Architecture (Roadmap)
* Introduce `VILLA` as a first-class `PropertyType`:
  - `built_up_sqft` and `plot_sqyards`
  - `floors_count` (e.g. G+1, G+2)
  - `private_garden`, `parking_slots`
  - Villa-specific amenities (private pool, terrace gazebo, solar installation)
  - Dedicated villa card display and filter in discovery.

---

## 10. Plot/Land Showcase

### Current Status
* Complete land specification support:
  - `total_acres` and `sq_yards`
  - Array of survey numbers (`survey_numbers`)
  - Soil classification (`RED`, `BLACK`, `MIXED`)
  - Development level (`RAW`, `FENCED`, `PARTIALLY_DEVELOPED`, `VENTURE_READY`)
  - Approach road width (`road_width_ft`)
  - Borewell water and 33KV electricity availability flags.
  - Proximity to ORR junction and HMDA zoning category (`R1 Residential`, `Commercial`, `Logistics`).

### Planned Plot Boundary Polygon System
* Interactive polygon boundary drawer on Leaflet map.
* Allow sellers and surveyors to drop and adjust polygon vertices.
* Store boundary coordinates in database (GeoJSON or coordinate array).
* Real-time area calculation based on polygon boundary.

---

## 11. Search & Filtering

* **Query Parameters:** `type`, `tier`, `district`, `mandal`, `village`, `zone`, `minPrice`, `maxPrice`, `minAcres`, `maxAcres`, `minBedrooms`, `maxBedrooms`, `maxDistanceOrr`, `sortBy`, `page`, `limit`.
* **Frontend Implementation:** `PropertyDiscovery.tsx` maintains active filter state synchronized with browser URL parameters, allowing shareable search results.
* **Dual-Mode Data Source:** Tries live backend search first; if backend is unreachable, filters client-side `MOCK_PROPERTIES` instantly without breaking the UI.

---

## 12. Frontend Architecture

### Route Structure
```text
frontend/src/app/
├── [locale]/
│   ├── page.tsx                  # Home (Hero, Trust, Architecture, Process, Featured)
│   ├── properties/
│   │   ├── page.tsx              # Discovery (Split-view list & interactive map)
│   │   └── [id]/page.tsx         # Detail (Gallery, 13-doc scorecard, specs, map, enquiry)
│   ├── list-property/page.tsx    # Multi-step seller intake form & doc uploader
│   ├── login/page.tsx            # Unified login with demo quick-switches
│   ├── terms/page.tsx            # Legal brokerage & mediation terms
│   ├── about/page.tsx            # Leadership & brokerage profile
│   └── trh-internal-desk/        # Staff quick-entry portal
└── dashboard/
    ├── page.tsx                  # Executive Command Center (metrics & urgent queue)
    ├── properties/
    │   ├── page.tsx              # Property inventory
    │   └── [id]/page.tsx         # Internal property review & private seller details
    ├── verification/page.tsx     # 13-Doc verification queue & side-by-side audit
    ├── enquiries/page.tsx        # Deal desk & lead pipeline
    └── seller/page.tsx           # Seller self-service portal
```

### Design System & Theme
* **Palette:**
  - Charcoal Surface: `#191512`
  - Antique Gold / Sandalwood: `#8C653E`
  - Warm Bone White: `#FAF8F5`
  - Verified Green: `#059669`
  - Stone Border: `#E8E2D9`
* **Typography:** Elegant serif headings for premium architectural feel, clean sans-serif for numerical data and specs. Native Telugu font rendering support (`Noto Sans Telugu`).

---

## 13. Backend Architecture

### Directory Map
```text
backend/src/
├── config/             # Environment, CORS configuration, API keys
├── db/
│   ├── database.ts     # Dual-mode Database class (PostgreSQL + InMemoryStore)
│   ├── schema/         # PostgreSQL schema.sql
│   ├── migrations/     # Versioned migration runners
│   └── seeds/          # Seed runner with 6 Hyderabad properties & 78 documents
├── middleware/
│   ├── auth.ts         # JWT verification, bcrypt hashing, requireRole
│   └── security.ts     # Seller confidentiality sanitizer (MANDATORY_DOCS)
├── modules/
│   ├── auth/           # Login, registration, profile retrieval
│   ├── properties/     # Property CRUD, status transition, search
│   ├── documents/      # File upload handler, 13-doc audit verification
│   ├── enquiries/      # Lead capture, dynamic scoring, agent dispatch
│   ├── owners/         # Seller KYC & portfolio
│   ├── maps/           # ORR distance calculation & tier detection
│   └── admin/          # Command center telemetry & internal detail
├── services/
│   ├── storage/        # File persistence (local uploads / AWS S3)
│   └── notification/   # WhatsApp & SMS dispatchers
├── types/              # TypeScript types for all models and requests
├── app.ts              # Express application setup, routes, swagger, error handlers
└── server.ts           # HTTP server listener
```

---

## 14. Current Features (100% Implemented)

* [x] Express + TypeScript modular backend with complete API endpoints.
* [x] PostgreSQL database schema with indexes and dual-mode in-memory test fallback.
* [x] Comprehensive database seed script (6 realistic Hyderabad listings across Tiers 1-3, 3 owners, 3 staff, 78 documents).
* [x] Strict seller contact masking on all public endpoints.
* [x] 13-Document statutory verification state machine preventing unverified listings from going live.
* [x] Next.js 14 frontend with 39 compiled routes (0 build errors).
* [x] Seamless bilingual interface (`en` and natural Telangana `te`).
* [x] Multi-step seller intake form with real-time field validation.
* [x] Interactive Leaflet GIS map with 158km ORR loop, exit markers, and satellite hybrid layers.
* [x] Lead scoring engine (0-100) with automatic advisor assignment and WhatsApp notification dispatch.
* [x] Executive Command Center dashboard with real-time KPIs and urgent verification queue.
* [x] 13-Document Verification Reviewer with approval/rejection audit logging.
* [x] Deal desk / enquiries pipeline with status transitions and site visit scheduling.
* [x] Seller self-service portal for tracking submission progress.

---

## 15. Incomplete Features & Enhancements

* [ ] **Villa as First-Class Property Type:** Add `VILLA` to `property_type_enum`, database schema, forms, and cards with plot area and built-up area.
* [ ] **Plot Boundary Polygon Drawing:** Interactive polygon drawing and editing tools on the Leaflet map for land/plot properties, storing vertices and calculating approximate plot area.
* [ ] **Buyer Saved / Favorite Properties:** LocalStorage or database-backed bookmarking for buyers.
* [ ] **Registered Buyer User Accounts:** Add `BUYER` role to `user_role_enum` so buyers can track saved properties and past enquiries.
* [ ] **AWS S3 Production Storage:** Connect active S3 bucket credentials for cloud deed storage in production.

---

## 16. Known Issues & Resolution Status

1. **Root `package.json` Workspaces:**
   - *Status:* **RESOLVED** (Updated `workspaces` to `["frontend", "backend"]`).
2. **CORS Unit Test DB Initialization:**
   - *Status:* **RESOLVED** (Added `beforeEach(async () => { await initTestDb(); })` to `backend/tests/cors.test.ts`; 100% unit tests pass: 42/42).
3. **Scope Extension & Sourcing Intake:**
   - *Status:* **DISPATCHED** (Scope Amendment #1 formalized in `project-lead/sprint-tracking/scope-lock.md`, sample villa `PROP-007` sourced, work orders generated in `project-lead/sprint-tracking/sprint-work-orders.md`).

---

## 17. Environment Variables

### Backend (`backend/.env`)
```bash
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
API_PREFIX=/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/telangana_realty
DB_SSL=false
JWT_SECRET=telangana-realty-jwt-secret-key-2026-production
JWT_EXPIRES_IN=7d
STORAGE_DRIVER=local
UPLOAD_DIR=/home/siva/Documents/REAL_ESTATE/backend/uploads
NOTIFICATION_PROVIDER=mock
ADMIN_ALERT_PHONE=+919876543210
ADMIN_ALERT_WHATSAPP=+919876543210
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## 18. Development Commands

### Backend Commands
```bash
cd backend
npm install            # Install dependencies
npm run dev            # Start backend in watch mode (tsx watch src/server.ts)
npm run test:unit      # Run unit test suite (42 tests)
npm run seed           # Seed database with Hyderabad properties and 78 deeds
npm run typecheck      # TypeScript compilation check
```

### Frontend Commands
```bash
cd frontend
npm install            # Install dependencies
npm run dev            # Start Next.js dev server on http://localhost:3000
npm run build          # Production build (validates all routes and types)
npm run start          # Start production Next.js server
npm run lint           # ESLint verification
```

### Docker Compose
```bash
docker compose up -d postgres   # Spin up local PostgreSQL 16 container on port 5432
docker compose up -d            # Run full stack in Docker
```

---

## 19. Deployment

* **Backend:** Configured for Render via `render.yaml` (Region: Singapore, Runtime: Node.js 20, Health check: `/api/health`, connected to Supabase PostgreSQL).
* **Frontend:** Deployed to Vercel at `https://frontend-six-psi-ecroth2n1r.vercel.app`.
* **CORS Security:** Backend dynamically matches production Vercel deployment URLs and preview URLs via regex pattern.

---

## 20. Important Decisions & Design Log

1. **Strict Brokerage Mediation:** Direct contact with property owners is prevented to protect brokerage commissions and verify title authenticity.
2. **PostgreSQL Dual Mode:** The backend data layer seamlessly switches between PostgreSQL connection pooling and an in-memory store, enabling fast, isolated unit testing without requiring a live database service.
3. **Resilient Frontend Offline Fallback:** If the backend API is starting up or temporarily offline, all frontend pages and forms gracefully fall back to local mock data and localStorage, ensuring zero downtime for client demos.
4. **Zero-API-Key Satellite Maps:** Leaflet hybrid layers provide smooth satellite and terrain rendering without requiring Google Maps paid billing accounts.

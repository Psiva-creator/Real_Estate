# 📋 Sprint Work Orders & Cross-Functional Delegation Board

> **Author:** Member 1: Product & Project Lead (Siva Krishna)  
> **Status:** APPROVED & DISPATCHED  
> **Sprint Milestone:** Scope Amendment #1 (Villas, Map Polygons, Buyer Bookmarks)

---

## 🎯 Executive Sprint Goal
Equip the platform with first-class **Villa Showcase** capabilities and **Interactive GIS Plot Boundary Polygons**, maintaining 100% test passing rates and uncompromising 13-document statutory legal verification.

---

## 💻 Work Orders for Member 2: Backend Developer

### [TICKET-BE-101] Villa Data Model & DB Schema Migration
* **Priority:** Blocker
* **Objective:** Expand the PostgreSQL schema and TypeScript definitions to support `VILLA`.
* **Deliverables:**
  1. Update `property_type_enum` in `backend/src/db/schema/schema.sql` to include `'VILLA'`.
  2. Add `VillaDetails` interface and update `Property` / `PublicProperty` in `shared/constants/src/index.ts`, `shared/shared-types/src/index.ts`, and `backend/src/types/index.ts`.
  3. Update `backend/src/modules/properties/properties.service.ts` to validate required villa fields (`plotSqYards`, `builtUpSqft`, `bedrooms`, `bathrooms`, `floorsCount`).
  4. Define villa mandatory documents in `backend/src/middleware/security.ts` (`MANDATORY_DOCS['VILLA']`).
* **Acceptance Criteria:** `npm run typecheck` passes with zero errors; API accepts `type: 'VILLA'`.

---

### [TICKET-BE-102] Boundary Polygon Coordinates Storage
* **Priority:** High
* **Objective:** Enable persistence of boundary polygon coordinate arrays.
* **Deliverables:**
  1. Add `boundary_coordinates JSONB` column to the `properties` table in `schema.sql` and `database.ts`.
  2. Update row mappers in `database.ts` to convert `boundary_coordinates` to/from camelCase.
  3. Ensure `sanitizePropertyForPublic` preserves public boundary coordinates for discovery map rendering.
* **Acceptance Criteria:** `POST /api/properties` accepts `boundaryCoordinates: [[lat, lng], ...]` and returns them in public responses.

---

### [TICKET-BE-103] Seed Sourced Luxury Villa (`PROP-007`)
* **Priority:** Medium
* **Objective:** Add sourced Mokila Villa to database seeds.
* **Deliverables:**
  1. Update `backend/src/db/seeds/seed.ts` to upsert Dr. K. Sitarama Raju (Owner) and `PROP-007` (4 BHK Mokila Villa, ₹4.85 Cr).
  2. Seed 13 verified documents for `PROP-007`.
* **Acceptance Criteria:** `npm run seed` creates 7 properties (5 Live, 1 Under Review, 1 Draft) and 91 documents without errors.

---

## 🎨 Work Orders for Member 3: Frontend Developer

### [TICKET-FE-101] Villa Showcase & Multi-Step Intake Integration
* **Priority:** High
* **Objective:** Allow sellers to list villas and showcase villas with dedicated luxury layouts.
* **Deliverables:**
  1. Add `'VILLA'` option to Step 1 in `frontend/src/components/seller/MultiStepForm.tsx`.
  2. Add Villa-specific Step 3 fields: Plot Area (Sq. Yards), Built-up Area (Sq. Ft), Floors (G+1, G+2 Triplex), Private Garden, Covered Parking slots.
  3. Update `frontend/src/components/properties/PropertyCard.tsx` and `PropertySpecs.tsx` to render Villa badges (`Built-up vs Plot Area`, `G+2 Triplex`, `Private Garden`).
  4. Add Villa filter tab in `frontend/src/components/properties/PropertyDiscovery.tsx`.
  5. Update `frontend/src/lib/mockData.ts` and `frontend/src/lib/api.ts` DTOs.
* **Acceptance Criteria:** Seller can submit a Villa listing; Villa cards render properly on mobile and desktop.

---

### [TICKET-FE-102] Interactive Plot Boundary Polygon System on Leaflet Map
* **Priority:** High
* **Objective:** Implement interactive polygon drawing and visualization on Leaflet.
* **Deliverables:**
  1. Extend `frontend/src/components/properties/LeafletPropertyMap.tsx` with a polygon drawing mode:
     - Click on map to place polygon vertices.
     - Drag vertices to adjust boundaries.
     - Button to "Clear / Redraw" boundary.
     - Live calculation of approximate plot area in square yards / acres.
  2. Embed the boundary drawer into Step 2 of `MultiStepForm.tsx` for Land/Plot properties.
  3. Render the demarcated polygon on `PropertyLocationMap.tsx` and public detail pages.
* **Acceptance Criteria:** Boundary polygon can be drawn, edited, submitted, and rendered visually on the map.

---

### [TICKET-FE-103] Buyer Favorites & Saved Properties
* **Priority:** Medium
* **Objective:** Enable buyers to bookmark properties.
* **Deliverables:**
  1. Add favorite heart toggle button on `PropertyCard.tsx` and `PropertyDetailPage`.
  2. Persist saved property IDs in `localStorage` (`trh_saved_properties`).
  3. Add a "Saved" badge counter in the Navbar linking to a filtered saved properties view.
* **Acceptance Criteria:** Favoriting a property persists across page reloads.

---

## 🖌️ Work Orders for Member 4: UI/UX Designer

### [TICKET-UX-101] Villa Showcase Visual Architecture
* **Priority:** High
* **Deliverables:**
  1. Component specification for Villa Property Cards (emphasis on architectural elevation, plot area vs built-up area dual badge).
  2. Detail page specification highlighting floor configuration (G+2), private garden, and clubhouse amenities.

---

### [TICKET-UX-102] Interactive Polygon Tool Interface Guidelines
* **Priority:** High
* **Deliverables:**
  1. State definitions for polygon drawing: Initial / Drawing / Closed / Editing Vertices.
  2. Styling for vertex handles (amber border, translucent green fill `#10B981` at 25% opacity).
  3. Clear / Redraw toolbar design.

---

## ✍️ Work Orders for Member 5: Content & Bilingual Specialist

### [TICKET-CNT-101] English & Telugu Villa Localization
* **Priority:** High
* **Deliverables:**
  1. Add translations in `content-bilingual/locales/{en, te}/common.json` and `frontend/public/locales/`:
     - Villa (`విల్లా / లగ్జరీ ఇల్లు`)
     - Plot Area (`ప్లాట్ విస్తీర్ణం`)
     - Built-up Area (`నిర్మిత విస్తీర్ణం`)
     - Floors (`అంతస్తులు - G+1 / G+2 ట్రిప్లెక్స్`)
     - Private Garden (`సొంత తోట / లాన్`)
     - Covered Parking (`కవర్డ్ కార్ పార్కింగ్`)

---

### [TICKET-CNT-102] Plot Boundary Map Copy & Tooltips
* **Priority:** Medium
* **Deliverables:**
  1. Instructional copy for polygon drawing:
     - EN: *"Click on map corners to outline the plot boundary. Drag points to adjust."*
     - TE: *"భూమి సరిహద్దులను గుర్తించడానికి మ్యాప్ మూలలపై క్లిక్ చేయండి. పాయింట్లను సర్దుబాటు చేయవచ్చు."*

---

## 🔍 Work Orders for Member 6: QA Lead & Launch Specialist

### [TICKET-QA-101] Test Suite Integrity & Regression Testing
* **Priority:** Blocker
* **Deliverables:**
  1. Verify 100% backend test pass (`npm run test:unit`) after monorepo fixes.
  2. Author test plan for Villa onboarding and boundary polygon coordinate validation in `qa-launch/test-plans/`.
  3. Validate Telugu text expansion on mobile devices (360px–390px viewports).

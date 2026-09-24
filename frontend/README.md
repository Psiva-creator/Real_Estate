# 🎨 Member 3: Frontend Developer

> **Mission:** Build the responsive, bilingual (English + Telugu), mobile-first web application. Transform UI/UX designs into high-performance Next.js code and seamlessly connect with Backend APIs and offline fallback data.

---

## 🛠️ Stack & Principles

- **Framework:** Next.js 14 (App Router) / React 18 / TypeScript
- **Styling:** Tailwind CSS (configured with Telangana soil & tech design tokens)
- **Internationalization (i18n):** Bilingual dynamic routing (`/[locale]/...`), supporting English (`en`) and Telugu (`te`)
- **Maps & Boundaries:** Leaflet / OpenStreetMap via `LeafletPropertyMap.tsx` with interactive polygon boundary drawing, vertex dragging, and geodesic area calculation (`polygonArea.ts`)
- **Property Types:** Full schema and UI support for **LAND**, **FLAT**, and **VILLA**
- **Discovery & Navigation:** Live search with category filters, ORR distance filtering, and dedicated **For Sale** / **Sold** tabs
- **Saved & Favorites:** Client-side property bookmarking (`lib/favorites.ts`) with real-time badge counters across cards and navbar
- **Document Verification:** 13-document checklist uploader for sellers and internal review portal for admins
- **Mobile First:** Strict viewport optimization for 360px+ screens (tested via Lighthouse audit)
- **Build & Resilience:** Next.js SSG/SSR with robust offline fallback mock data (`lib/mockData.ts`)

---

## 📅 Day-by-Day Roadmap & Implementation Status

- [x] **Day 1 — Framework & Skeleton:**
  - Initialize Next.js 14 project with Tailwind CSS and folder layout.
  - Implement Navbar, Footer, and Language Switcher (`en` / `te`).
  - Build Homepage skeleton (Hero section with quick filters, Value Proposition, Featured Properties, Trust Badges).
- [x] **Day 2 — Seller Onboarding & Document Upload:**
  - Build multi-step "List Your Property" form (`MultiStepForm.tsx`) supporting LAND, FLAT, and VILLA listings.
  - Build Document Checklist Uploader (`DocumentChecklistUploader.tsx`) with visual upload states for the 13 required verification documents.
- [x] **Day 3 — Buyer Search & Property Discovery:**
  - Build Property Search and Filter interface (`PropertyDiscovery.tsx`) supporting Category (Land/Flat/Villa), Mandal, Price, ORR Distance, and Status (For Sale / Sold).
  - Implement Property Card component (`PropertyCard.tsx`) with favorite toggles, price formatting, and verified badges.
  - Implement split view: responsive list and interactive map view (`LeafletPropertyMap.tsx`).
- [x] **Day 4 — Property Detail & API Integration:**
  - Build Property Detail page (`/[locale]/properties/[id]`) with high-res photo gallery (`PropertyGallery.tsx`), verified 13-doc badges, specs grid, and advisory info.
  - Build Enquiry Modal (`EnquiryModal.tsx`) supporting "Book a Site Visit", "Request Callback", and "Ask Question".
  - Connect forms and pages to Backend APIs via `lib/api.ts` with transparent mock fallbacks (`mockData.ts`) when backend is unreachable.
- [x] **Day 5 — Edge States, Polygon Boundaries & Map Integration:**
  - Handle loading skeletons, error boundaries (`error.tsx`), and empty search result states.
  - Integrate Leaflet map with custom marker clustering, ORR proximity radius circles, and interactive polygon boundary drawing with automated acre/sq.yard computation.
- [x] **Day 6 — Mobile Polish, Favorites & Team Dashboard:**
  - Complete mobile responsiveness pass across iOS & Android screen widths (360px+).
  - Implement persistent Saved/Favorites management (`lib/favorites.ts`).
  - Build Team Back-Office Dashboard (`/dashboard`) including document verification reviewer (`DocumentVerificationReviewer.tsx`) and lead enquiry pipeline.
- [x] **Day 7 — 🚀 Launch Readiness & QA Hardening:**
  - Verify and resolve QA-flagged edge cases and hydration warnings.
  - Run Lighthouse performance, accessibility, and SEO audit (`lighthouse-report.json`).
  - Verified production build (`npm run build`) generating 53 static/dynamic routes with zero errors.

---

## 📂 Frontend Structure

```text
frontend/
├── public/
│   ├── locales/
│   │   ├── en/common.json               # English dictionary (UI copy)
│   │   └── te/common.json               # Telugu dictionary (authentic Telangana terminology)
│   └── images/                          # Trust badges, logos, property placeholders
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── page.tsx                 # Homepage (Hero, Featured, Process, Trust story)
    │   │   ├── properties/
    │   │   │   ├── page.tsx             # Search, Filters & Map split view (For Sale / Sold)
    │   │   │   └── [id]/page.tsx        # Property detail (Gallery, Specs, 13-Doc verification)
    │   │   ├── list-property/page.tsx   # Multi-step seller onboarding & 13-doc uploader
    │   │   ├── about/page.tsx           # Trust narrative & brokerage mediation story
    │   │   ├── terms/page.tsx           # Brokerage mediation disclaimers
    │   │   ├── privacy/page.tsx         # Privacy policy
    │   │   ├── login/page.tsx           # Seller & team authentication
    │   │   ├── portal/page.tsx          # Portal hub redirect
    │   │   └── trh-internal-desk/page.tsx # Internal brokerage desk
    │   └── dashboard/                   # Internal team back-office
    │       ├── page.tsx                 # Admin overview & metrics
    │       ├── properties/              # Property listing management & reviewer
    │       │   ├── page.tsx             # Listing table & status controls
    │       │   └── [id]/page.tsx        # Single property back-office review
    │       ├── enquiries/page.tsx       # Lead pipeline & agent assignment
    │       ├── verification/page.tsx    # 13-document verification approval queue
    │       └── seller/page.tsx          # Seller dashboard view
    ├── components/
    │   ├── common/                      # Navbar, Footer, LanguageToggle, TrustBadge
    │   ├── properties/                  # PropertyCard, PropertyDiscovery, LeafletPropertyMap, Gallery, Specs
    │   ├── seller/                      # MultiStepForm, DocumentChecklistUploader
    │   ├── enquiry/                     # EnquiryModal, SiteVisitBooking
    │   ├── dashboard/                   # DocumentVerificationReviewer, LeadTable
    │   └── home/                        # HeroSection, FeaturedSection, ProcessSection, TrustSection
    ├── lib/
    │   ├── api.ts                       # Backend API client with offline fallback
    │   ├── mockData.ts                  # Seed properties (Kokapet, Kollur, Villas, etc.)
    │   ├── favorites.ts                 # LocalStorage favorites state & events
    │   ├── polygonArea.ts               # Geodesic Shoelace polygon area calculation
    │   ├── telanganaMapData.ts          # Telangana districts, mandals & ORR coordinates
    │   └── formatters.ts                # INR currency (Lakhs/Crores) & Acreage formatters
    └── styles/
        └── globals.css                  # Tailwind styles and map vertex styling
```

---

## 🚀 Verification & Commands

```bash
# Type check TypeScript files
frontend/node_modules/.bin/tsc -p frontend/tsconfig.json --noEmit

# Run Next.js linter
npm --prefix frontend run lint

# Build production bundle (SSG / SSR)
npm --prefix frontend run build
```

*Build Status: 53 static routes generated successfully. Zero compilation errors.*

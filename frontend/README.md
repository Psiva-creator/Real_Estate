# 🎨 Member 3: Frontend Developer

> **Mission:** Build the responsive, bilingual (English + Telugu), mobile-first web application. Transform UI/UX Figma designs into high-performance Next.js code and seamlessly connect with Backend APIs.

---

## 🛠️ Stack & Principles

- **Framework:** Next.js 14+ (App Router) / React
- **Styling:** Tailwind CSS (matching UI/UX design tokens)
- **Internationalization (i18n):** Bilingual dynamic routing (`/[locale]/...`), supporting English (`en`) and Telugu (`te`)
- **Maps:** Google Maps JS API / React Google Maps
- **Mobile First:** Strict viewport optimization for 360px+ screens (essential for field site visits and mobile buyers)

---

## 📅 Day-by-Day Roadmap

- [ ] **Day 1 — Framework & Skeleton:**
  - Initialize Next.js project with Tailwind CSS and folder layout.
  - Implement Navbar, Footer, and Language Switcher (EN / TE).
  - Build Homepage skeleton (Hero section, Value Proposition, Featured Properties, Trust Badges).
- [ ] **Day 2 — Seller Onboarding & Document Upload:**
  - Build multi-step "List Your Property" form (Property info, Pricing, Location).
  - Build Document Checklist Uploader with visual upload states for the 13 required documents.
- [ ] **Day 3 — Buyer Search & Property Discovery:**
  - Build Property Search and Filter interface (Category, Mandal, Price, ORR Distance, Acreage).
  - Implement Property Card component and split view (List + Interactive Map).
- [ ] **Day 4 — Property Detail & API Integration:**
  - Build Property Detail page (Photo gallery, Verified 13-doc badges, Map view, Agent advisory info).
  - Build Enquiry Modal ("Book a Site Visit", "Request Callback", "Ask Question").
  - Connect forms and pages to Backend APIs (using mock data prior to Day 4).
- [ ] **Day 5 — Edge States & Map Integration:**
  - Handle loading skeletons, error toasts, and empty search results.
  - Embed Google Maps with custom markers on search and detail pages.
- [ ] **Day 6 — Mobile Polish & Team Dashboard:**
  - Complete mobile responsiveness pass across iOS & Android screen widths.
  - Build lightweight Team Back-Office Dashboard (View enquiries, assign agents, verify document checklist).
- [ ] **Day 7 — 🚀 Launch & QA Hardening:**
  - Fix any bugs reported by QA Lead.
  - Run Lighthouse audit (Target 90+ on Performance, Accessibility, and SEO).

---

## 📂 Frontend Structure

```text
frontend/
├── public/
│   ├── locales/
│   │   ├── en/common.json   # English dictionary
│   │   └── te/common.json   # Telugu dictionary
│   └── images/              # Trust badges, logos, property placeholders
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── page.tsx               # Homepage
    │   │   ├── properties/
    │   │   │   ├── page.tsx           # Search & Map split view
    │   │   │   └── [id]/page.tsx      # Property detail
    │   │   ├── list-property/page.tsx # Multi-step seller onboarding
    │   │   ├── about/page.tsx         # Trust story
    │   │   ├── terms/page.tsx         # Disclaimers
    │   │   └── privacy/page.tsx       # Privacy policy
    │   └── dashboard/                 # Internal team back-office
    │       ├── properties/page.tsx    # 13-doc verification reviewer
    │       └── enquiries/page.tsx     # Lead pipeline manager
    ├── components/
    │   ├── common/                    # Navbar, Footer, LanguageToggle, TrustBadge
    │   ├── properties/                # PropertyCard, SearchFilters, MapView
    │   ├── seller/                    # MultiStepForm, DocumentChecklistUploader
    │   ├── enquiry/                   # EnquiryModal, SiteVisitBooking
    │   └── dashboard/                 # VerificationReviewer, LeadTable
    ├── hooks/                         # Custom React hooks (useProperties, useEnquiry)
    ├── lib/                           # API client, formatting utils (INR, Acres)
    └── styles/                        # Tailwind globals
```

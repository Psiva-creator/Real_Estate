# 🏙️ Telangana Real-Estate Brokerage Platform

> **Business Model:** Mediator / Brokerage platform connecting Land & Flat sellers with buyers across Telangana (Hyderabad metro focus).
> **Sprint:** 1-Week MVP Sprint.
> **Team Structure:** Organized into dedicated workspaces for all 6 team specialists + shared resources and system documentation.

---

## 👥 6-Member Team Folder Structure

```text
REAL_ESTATE/
│
├── 👔 project-lead/               # Member 1: Product & Project Lead
│   ├── README.md                 # Daily roadmap, mission, scope boundaries & go/no-go call
│   ├── sourcing/                 # Sourcing guide & templates for 5-10 real properties
│   │   ├── property-intake-template.md
│   │   └── sample-properties/    # Collected real seller data & document copies
│   ├── sprint-tracking/          # Daily standup logs & MVP scope lock
│   └── contacts/                 # Confidential seller, broker & buyer CRM
│
├── 💻 backend/                    # Member 2: Backend Developer
│   ├── README.md                 # Setup guide, API endpoints & daily tasks
│   └── src/
│       ├── config/               # DB connection, S3, Twilio/Wati, env config
│       ├── db/
│       │   ├── schema/schema.sql # PostgreSQL schema (Properties, 13 Docs, Owners, Enquiries)
│       │   ├── migrations/       # Versioned database migrations
│       │   └── seeds/            # Initial 5-10 real Hyderabad property seeds
│       ├── modules/
│       │   ├── properties/       # Property CRUD & status state machine
│       │   ├── owners/           # Seller profiles & KYC
│       │   ├── enquiries/        # Buyer enquiry routing & lead scoring
│       │   ├── documents/        # 13-doc upload & verification gate
│       │   └── maps/             # Google Maps geocoding & ORR distance calc
│       ├── services/
│       │   ├── notification/     # WhatsApp / SMS alert dispatch (Twilio/Wati)
│       │   ├── storage/          # S3 / Firebase file storage adapter
│       │   └── maps/             # Distance matrix service
│       └── middleware/           # Auth (Admin, Agent, Seller), schema validation
│
├── 🎨 frontend/                   # Member 3: Frontend Developer
│   ├── README.md                 # Next.js setup, component map & integration guide
│   ├── public/
│   │   ├── locales/{en, te}/     # Bilingual UI strings (English & Telugu)
│   │   └── images/               # Media, badges, property placeholders
│   └── src/
│       ├── app/
│       │   ├── [locale]/         # Bilingual public routes
│       │   │   ├── page.tsx               # Homepage (Hero, Value Prop, Featured, Trust Badges)
│       │   │   ├── properties/[id]/       # Property Detail (Gallery, 13-Doc Verification, CTAs)
│       │   │   ├── list-property/         # Seller Multi-Step Form & 13 Document Checklist Uploader
│       │   │   ├── about/                 # Trust Narrative & Brokerage Team Profile
│       │   │   ├── terms/                 # Brokerage Mediation Disclaimers & Terms
│       │   │   └── privacy/               # Privacy Policy
│       │   └── dashboard/                 # Internal Team & Agent Back-Office
│       │       ├── properties/            # Document Verification Reviewer & Status Transitions
│       │       └── enquiries/             # Lead Assignment, Scoring & Deal Pipeline
│       ├── components/
│       │   ├── common/                    # Navbar, Footer, LanguageToggle, TrustBadge
│       │   ├── properties/                # PropertyCard, SearchFilters, MapView, Gallery
│       │   ├── seller/                    # MultiStepForm, DocumentChecklistUploader
│       │   ├── enquiry/                   # EnquiryModal, SiteVisitBooking
│       │   └── dashboard/                 # DocumentVerificationReviewer, LeadTable
│       ├── hooks/
│       ├── lib/
│       └── styles/
│
├── 🖌️ ui-ux/                      # Member 4: UI/UX Designer
│   ├── README.md                 # Design principles, typography & daily schedule
│   ├── design-system/
│   │   └── tokens.json           # Color palette, font scale, spacing, border radii
│   ├── wireframes/               # Layout blueprints (Homepage, Seller Form, Split Search, Back-Office)
│   └── specs/
│       └── screen-specifications.md # Component handoff specs & Telugu text accommodation rules
│
├── ✍️ content-bilingual/          # Member 5: Content Manager & Bilingual Specialist
│   ├── README.md                 # Tone guide, glossary & daily deliverables
│   ├── locales/
│   │   ├── en/common.json        # English UI master copy
│   │   └── te/common.json        # Natural Telangana Telugu localization
│   ├── templates/
│   │   ├── notifications/
│   │   │   └── whatsapp.json     # WhatsApp/SMS notification message templates
│   │   └── listings/             # Standardized property listing description templates
│   ├── trust-content/            # Testimonials, About Us story, 13-document verification explainer
│   └── legal/                    # Brokerage Terms of Service & Privacy Policy
│
├── 🔍 qa-launch/                  # Member 6: QA Lead & Launch Specialist
│   ├── README.md                 # Testing strategy, severity matrix & daily schedule
│   ├── test-plans/               # Test cases for Seller Form, Document Gate, Search, Leads
│   ├── bug-tracker/              # Defect tracking and resolution log
│   ├── uat/
│   │   └── uat-script.md         # Day 6 UAT walkthrough script for real sellers/buyers
│   └── checklists/
│       └── pre-launch-checklist.md # 50-point go-live verification checklist
│
├── 📦 shared/                     # Shared cross-cutting code
│   ├── shared-types/src/index.ts # TypeScript interfaces (Property, Enquiry, 13 Docs, Owner)
│   └── constants/src/index.ts    # 13 Document types, HMDA service tiers (1,2,3), Status enums
│
└── 📚 docs/                       # Original System Specifications from Notion Hub
    ├── 00_project_hub.md         # Master project hub & 1-week critical path
    ├── 01_architecture.md        # Full system architecture, DB schema & HMDA tiers
    ├── 02_lead.md                # Lead briefing
    ├── 03_backend.md             # Backend briefing
    ├── 04_frontend.md            # Frontend briefing
    ├── 05_ui_ux.md               # UI/UX briefing
    ├── 06_content_bilingual.md   # Content briefing
    └── 07_qa_launch.md           # QA briefing
```

---

## 🛡️ The 13 Document Verification Gates

Before any property transitions from `UNDER_REVIEW` to `VERIFIED` and `LIVE`:
1. **Sale Deed** — Registered deed proving current title
2. **Encumbrance Certificate (EC)** — 30-year non-encumbrance record
3. **Link Documents** — Complete historical chain of title deeds
4. **Pahani** — Telangana revenue cultivation & ownership record
5. **Form 1-B** — ROR khata certificate
6. **FMB** — Field Measurement Book survey sketch
7. **Pattadar Passbook** — Dharani portal digital passbook
8. **HMDA / DTCP Approval** — Approved layout sanctioned plan
9. **Mutation** — Revenue authority mutation proceeding
10. **Tax Receipt** — Latest municipal (GHMC) / gram panchayat tax receipt
11. **Master Plan** — Zoning confirmation (Residential / Commercial / R1)
12. **GPA** — Registered General Power of Attorney (if applicable)
13. **Sale Agreement** — Brokerage representation contract

---

## 🗺️ HMDA Service Tiers
- **Tier 1:** Hyderabad Core, Secunderabad, Kukatpally, Serilingampalli, Qutbullapur
- **Tier 2:** ORR Corridor (5–10km band) — Kokapet, Narsingi, Kollur, Mokila, Shamshabad, Adibatla, Ghatkesar, Medchal
- **Tier 3:** Warangal, Karimnagar, Nizamabad + connected growth mandals

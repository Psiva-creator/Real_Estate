# 🖌️ Member 4: UI/UX Designer

> **Mission:** Design a trust-first, mobile-optimized experience for a brokerage mediator (not an unverified marketplace). Deliver designs ahead of Frontend build so engineering is never blocked.

---

## 💎 Core Design Principles

1. **Trust Over Flash:** Clean, authoritative, legal-backed aesthetic. Prominent use of green "13-Point Verified" shields and official revenue seals.
2. **Mobile-First:** Ensure all tap targets are ≥ 48px, forms are thumb-friendly, and tables gracefully collapse on mobile.
3. **Primary Conversion CTA:** **"Book a Site Visit"** must always be the most prominent visual element across cards, headers, and detail screens.
4. **Bilingual Layout Flexibility:** Telugu copy typically requires 15–25% more horizontal width than English. Design flexible containers, badges, and buttons that do not truncate Telugu text.
5. **No Clutter:** Eliminate unnecessary marketplace noise. Highlight the essential: Location, Price, Acreage/Sqft, ORR Distance, and Verification Status.

---

## 📅 Day-by-Day Roadmap

- [ ] **Day 1 — Foundations & Homepage:**
  - Establish color palette, typography (supporting Latin & Telugu fonts like Noto Sans Telugu), and spacing tokens (`design-system/tokens.json`).
  - Wireframe Homepage: Hero section, value proposition, featured verified properties, trust stats, navigation.
  - Hand off Homepage design to Frontend.
- [ ] **Day 2 — Seller Onboarding & Document Upload UI:**
  - Design multi-step form for sellers listing Land or Flats.
  - Design checklist-style Document Uploader for the 13 required verification documents with visual status indicators (`Pending`, `Uploaded`, `Verified`, `Action Needed`).
  - Hand off to Frontend.
- [ ] **Day 3 — Buyer Search & Discovery:**
  - Design search bar with fast filters (Type, Location, Price, ORR Distance).
  - Design property card component with clear title badges and site visit CTA.
  - Design split view: List + interactive map view.
  - Hand off to Frontend.
- [ ] **Day 4 — Property Detail & Enquiry Flow:**
  - Design comprehensive Property Detail layout (Photo gallery, Verified Document Checklist tab, ORR distance card, Land/Flat specifications).
  - Design high-converting Enquiry Modal ("Book Site Visit", "Request Callback", "Ask Legal Question").
  - Design trust elements: "About Our Mediation Process" and client testimonials.
- [ ] **Day 5 — Team Back-Office Dashboard:**
  - Design internal admin screen for document review and verification approval/rejection.
  - Design lead pipeline table for assigning incoming enquiries to field agents.
- [ ] **Day 6 — Mobile QA & Telugu Typography Polish:**
  - Inspect built pages on mobile viewport sizes (375px, 390px, 412px).
  - Verify Telugu character rendering and line heights.
  - Log visual bugs with Frontend.
- [ ] **Day 7 — 🚀 Final Sign-off:**
  - Last-minute UI fixes and launch sign-off.

---

## 📂 UI/UX Folder Structure

```text
ui-ux/
├── design-system/
│   └── tokens.json             # Color palette, font sizes, shadow, border radii
├── wireframes/                 # Visual layouts and flow diagrams
└── specs/
    ├── screen-specifications.md# Detailed layout and component specs for Frontend
    └── telugu-typography.md    # Font rendering and length rules for Telugu copy
```

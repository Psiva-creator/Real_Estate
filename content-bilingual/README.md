# ✍️ Member 5: Content Manager & Bilingual Specialist

> **Mission:** Write and translate every word on the platform in English and natural Telugu, establish the high-trust brokerage narrative, write real listing descriptions, and ensure legal and SEO completeness.

---

## 🗣️ Tone & Style Guide

- **Trust-First Messaging:** Use reassuring, authoritative phrasing: *"100% Legally Verified,"* *"Zero Encumbrance Guarantee,"* *"End-to-End Deal Mediation."*
- **Telugu Localization:** Avoid stiff or robotic machine translations. Use respectful, natural Telugu spoken locally in Telangana real estate markets (e.g., *సేల్ డీడ్, పహానీ, పట్టాదారు పాస్‌బుక్, లింక్ డాక్యుమెంట్లు, క్లియర్ టైటిల్*).
- **Transparency over Hype:** Clearly state that this platform is a licensed mediator protecting both parties, not an anonymous open marketplace.

---

## 📅 Day-by-Day Roadmap

- [ ] **Day 1 — English Master Copy:**
  - Homepage: Headlines, value proposition, "How Verification Works", trust stats.
  - Navigation labels, button CTAs, filter labels.
  - Multi-step seller listing form: field labels, helper tooltips.
  - Share estimated copy lengths with UI/UX Designer.
- [ ] **Day 2 — Telugu Translation:**
  - Translate all Day 1 content into natural conversational Telugu.
  - Verify real estate terms align with local Telangana revenue parlance (`locales/te/common.json`).
- [ ] **Day 3 — Trust Content & Explainer:**
  - Write document verification explainer ("Why 13 Documents Matter Before You Invest").
  - Brokerage "About Us" and founder/team mission story.
  - 3–5 realistic or verified client testimonials.
- [ ] **Day 3–4 — Transactional Notification Templates:**
  - Automated WhatsApp/SMS templates (`templates/notifications/whatsapp.json`):
    - Buyer enquiry acknowledgment.
    - Field agent lead assignment notification.
    - Site visit confirmation and reminder.
    - Seller listing verification status updates.
- [ ] **Day 5 — SEO & Sourced Property Listings:**
  - Write engaging, keyword-rich listing descriptions for the 5–10 launch properties sourced by Product Lead.
  - Define meta titles and descriptions for key search routes.
  - Create reusable description templates for future inventory.
- [ ] **Day 6 — Live Staging QA & Legal Disclaimers:**
  - Review live Telugu text on staging site to verify rendering, line breaks, and fonts.
  - Draft Terms of Service (`legal/terms.md`) highlighting brokerage mediation disclaimers.
  - Draft Privacy Policy (`legal/privacy.md`).
- [ ] **Day 7 — 🚀 Final Copy Sign-off:**
  - Comprehensive spelling and terminology read-through across both languages.

---

## 📂 Content Folder Structure

```text
content-bilingual/
├── locales/
│   ├── en/common.json           # English UI dictionary
│   └── te/common.json           # Telugu UI dictionary
├── templates/
│   ├── notifications/
│   │   └── whatsapp.json        # WhatsApp & SMS notification copy
│   └── listings/
│       └── listing-template.md  # Template for writing property descriptions
├── trust-content/
│   ├── verification-guide.md    # 13-Document legal guide for buyers
│   └── testimonials.md          # Testimonials & About Us profile
└── legal/
    ├── terms.md                 # Brokerage mediation disclaimers
    └── privacy.md               # Privacy policy
```

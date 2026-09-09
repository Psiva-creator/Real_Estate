# QA & Launch — QA Lead

**Reference:** full system design in *Architecture*

### 🎯 Mission

Make sure everything works before real sellers upload real documents and real buyers submit real enquiries. Last line of defense before go-live.

---


### Day 1 — Test Plan

- [ ] Write test cases: seller onboarding, document upload, buyer search, enquiry submission
- [ ] Set up bug tracking (Trello/Notion/GitHub Issues)
- [ ] Define severity levels (blocker/major/minor)

### Day 2–3 — Seller Flow Testing

- [ ] Test seller form as Backend + Frontend build it
- [ ] Verify all 13 document types upload correctly
- [ ] Check status transitions: Draft → Under Review → Verified → Live

### Day 3–4 — Early Bug Logging

- [ ] Log bugs to Backend/Frontend as features come online
- [ ] Re-test fixes promptly to keep pace

### Day 4–5 — End-to-End Testing

- [ ] Full flow: seller lists → team verifies → live → buyer searches → enquires → alert fires
- [ ] Test all filters (type, location, price, area, bedrooms)
- [ ] Test enquiry routing to correct team member

### Day 5 — Mobile & Device Testing

- [ ] Android + iOS, various screen sizes
- [ ] Slow network conditions
- [ ] Telugu text rendering on mobile

### Day 6 — UAT & Pre-Launch

- [ ] Test with real sellers/buyers lined up by Lead (staging site)
- [ ] Collect feedback, log issues, prioritize fixes with team
- [ ] SSL active, domain pointed correctly
- [ ] Error monitoring live (Sentry or similar)
- [ ] Backup/rollback plan confirmed with Backend
- [ ] WhatsApp/SMS alerts tested end-to-end

### Day 7 — Launch Day

- [ ] Final smoke test on production
- [ ] Monitor closely for first few hours
- [ ] Confirm first real enquiries route correctly
- [ ] Standby for urgent fixes

---


### 🐛 Severity Guide

**Blocker** — can't submit form / site down / data loss risk → fix immediately
**Major** — feature broken, workaround exists → fix before launch
**Minor** — cosmetic/UX issue → fix post-launch

---


### 🔗 Dependencies

* Backend staging environment ready by Day 4
* Frontend pages testable incrementally
* Content's Telugu copy live by Day 6 for language testing
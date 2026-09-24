# Villa Onboarding Test Plan — TICKET-QA-101

**Platform:** Telangana Realty Hub (TRH)  
**Author:** QA Lead  
**Date:** 2026-09-24  
**Status:** Active  

---

## Overview

This test plan covers the end-to-end onboarding and discovery lifecycle for **Villa** property type, including seller submission, buyer discovery, boundary polygon coordinates, buyer favorites persistence, and Telugu text rendering on mobile viewports.

---

## 1. Villa Property Submission (Seller Flow)

### TC-VILLA-001 — Seller can select 'Villa' as property type in multi-step form

| Field | Value |
|---|---|
| **Precondition** | Seller is authenticated; multi-step listing form is open at Step 1 |
| **Steps** | 1. Navigate to `/seller/list-property` <br> 2. On the "Property Type" step, click the **Villa** option |
| **Expected Result** | `Villa` tile is highlighted/selected; form advances to villa-specific fields; `propertyType` value in form state equals `"VILLA"` |
| **Priority** | P0 |

---

### TC-VILLA-002 — Villa-specific fields are validated on submission

| Field | Value |
|---|---|
| **Precondition** | Property type set to `VILLA`; seller on field-entry step |
| **Fields Under Test** | `plotSqYards`, `builtUpSqft`, `bedrooms`, `bathrooms`, `floors` |
| **Steps** | 1. Enter valid values for all villa-specific fields <br> 2. Submit the step |
| **Expected Result** | All five fields pass validation; no inline errors shown; form state captures each value with correct type (numeric) |
| **Boundary Values** | `plotSqYards` ≥ 1, `builtUpSqft` ≥ 1, `bedrooms` 1–20, `bathrooms` 1–20, `floors` 1–10 |
| **Priority** | P0 |

---

### TC-VILLA-003 — Form rejects submission if required villa fields are missing

| Field | Value |
|---|---|
| **Precondition** | Property type set to `VILLA`; seller on field-entry step with all villa fields blank |
| **Steps** | 1. Leave `plotSqYards`, `builtUpSqft`, `bedrooms`, `bathrooms`, `floors` empty <br> 2. Click **Next / Submit** |
| **Expected Result** | Inline validation errors appear for each missing field; form does **not** advance; no API call is made |
| **Priority** | P0 |

---

### TC-VILLA-004 — Successful villa submission creates property with status DRAFT

| Field | Value |
|---|---|
| **Precondition** | Seller authenticated; all required fields (including villa-specific) filled correctly |
| **Steps** | 1. Complete all form steps <br> 2. Click **Submit Listing** |
| **Expected Result** | `POST /api/properties` returns `201` with `{ status: "DRAFT", propertyType: "VILLA" }`; property appears in seller dashboard with "Under Review" badge |
| **Priority** | P0 |

---

## 2. Villa Display (Buyer Discovery)

### TC-VILLA-005 — Villa type filter returns only VILLA type properties

| Field | Value |
|---|---|
| **Precondition** | Discovery page loaded; mixed property types exist in DB |
| **Steps** | 1. On `/properties` discovery page, open the Type filter <br> 2. Select **Villa** <br> 3. Apply filter |
| **Expected Result** | All returned property cards have `propertyType === "VILLA"`; no Flat, Plot, or Commercial cards are visible; URL reflects `?type=VILLA` |
| **API Assertion** | `GET /api/properties/search?type=VILLA` → all results have `"propertyType": "VILLA"` |
| **Priority** | P1 |

---

### TC-VILLA-006 — Villa property card shows both plot area and built-up area badges

| Field | Value |
|---|---|
| **Precondition** | At least one LIVE Villa property exists with both `plotSqYards` and `builtUpSqft` populated |
| **Steps** | 1. Navigate to discovery page with Villa filter <br> 2. Inspect a villa property card |
| **Expected Result** | Card displays two distinct area badges: **Plot Area** (in sq. yards) and **Built-up Area** (in sq. ft); neither badge is absent or shows `null`/`undefined` |
| **Priority** | P1 |

---

### TC-VILLA-007 — Villa detail page shows floor configuration and amenities

| Field | Value |
|---|---|
| **Precondition** | Villa property with `floors: 3` and amenities list exists and is LIVE |
| **Steps** | 1. Click on a villa property card <br> 2. On the detail page `/properties/:id`, locate the floor and amenities sections |
| **Expected Result** | Floor configuration displayed as **G+2 Triplex** (or equivalent label for `floors` value); amenities list rendered completely without truncation |
| **Priority** | P1 |

---

## 3. Boundary Polygon Coordinates

### TC-POLY-001 — POST /api/properties accepts boundaryCoordinates as array of [lat, lng] pairs

| Field | Value |
|---|---|
| **Method** | `POST /api/properties` |
| **Auth** | Seller JWT |
| **Payload Snippet** | `{ ..., "boundaryCoordinates": [[17.385, 78.486], [17.390, 78.491], [17.388, 78.495]] }` |
| **Expected Result** | HTTP `201`; response body includes `boundaryCoordinates` array matching the submitted values; stored correctly in DB |
| **Priority** | P0 |

---

### TC-POLY-002 — GET /api/properties/:id returns boundaryCoordinates in public response

| Field | Value |
|---|---|
| **Method** | `GET /api/properties/:id` |
| **Auth** | None (public endpoint) |
| **Steps** | 1. Create a property with valid `boundaryCoordinates` <br> 2. Fetch it via public GET endpoint |
| **Expected Result** | Response JSON includes `"boundaryCoordinates": [[lat, lng], ...]`; array is non-empty; values match what was submitted |
| **Priority** | P1 |

---

### TC-POLY-003 — Invalid boundaryCoordinates are rejected with 400

| Field | Value |
|---|---|
| **Method** | `POST /api/properties` |
| **Auth** | Seller JWT |
| **Test Cases** | (a) `boundaryCoordinates: "not-an-array"` <br> (b) `boundaryCoordinates: [[17.385]]` (missing lng) <br> (c) `boundaryCoordinates: [["a", "b"]]` (non-numeric) <br> (d) `boundaryCoordinates: []` (empty array) |
| **Expected Result** | All cases return HTTP `400` with a descriptive validation error; no property is persisted |
| **Priority** | P0 |

---

## 4. Buyer Favorites

### TC-FAV-001 — Clicking heart icon adds property ID to localStorage

| Field | Value |
|---|---|
| **Precondition** | Buyer on discovery page; `trh_saved_properties` key absent or empty in localStorage |
| **Steps** | 1. Locate a property card <br> 2. Click the heart/bookmark icon |
| **Expected Result** | `localStorage.getItem("trh_saved_properties")` returns a JSON array containing the property's ID; heart icon transitions to filled/active state |
| **Priority** | P1 |

---

### TC-FAV-002 — Favorited properties persist across page reload

| Field | Value |
|---|---|
| **Precondition** | At least one property ID is saved in `trh_saved_properties` localStorage |
| **Steps** | 1. Reload the page (F5 / hard reload) <br> 2. Navigate to the Saved Properties / Favorites view |
| **Expected Result** | Previously favorited property still appears; heart icon still shows active/filled state; `trh_saved_properties` in localStorage unchanged |
| **Priority** | P1 |

---

### TC-FAV-003 — Removing a favorite removes the ID from localStorage

| Field | Value |
|---|---|
| **Precondition** | At least one property ID in `trh_saved_properties` |
| **Steps** | 1. Click the filled heart icon on a favorited property card <br> 2. Inspect localStorage |
| **Expected Result** | Property ID is removed from `trh_saved_properties` array; heart icon reverts to unfilled state; other saved IDs remain unchanged |
| **Priority** | P1 |

---

## 5. Telugu Text Expansion — Mobile Viewport

### Viewport Test Matrix

| Viewport | Width | Device Reference |
|---|---|---|
| V-360 | 360 px | Samsung Galaxy A-series |
| V-390 | 390 px | iPhone 14 / Pixel 7 |
| V-412 | 412 px | Samsung Galaxy S-series |

---

### TC-TEL-001 — Villa Telugu labels do not overflow cards at 360px

| Field | Value |
|---|---|
| **Viewport** | 360 px width |
| **Steps** | 1. Open discovery page at 360 px in Chrome DevTools emulation <br> 2. Apply Villa filter <br> 3. Inspect each villa card |
| **Expected Result** | No Telugu label overflows card boundary; no horizontal scroll bar appears; `overflow: hidden` does not clip visible content |
| **Priority** | P1 |

---

### TC-TEL-002 — Villa Telugu labels do not overflow cards at 390px and 412px

| Field | Value |
|---|---|
| **Viewport** | 390 px and 412 px widths |
| **Steps** | Repeat TC-TEL-001 steps at 390 px, then 412 px |
| **Expected Result** | Same as TC-TEL-001; no overflow or layout shift at either breakpoint |
| **Priority** | P1 |

---

### TC-TEL-003 — 'నిర్మిత విస్తీర్ణం' renders on a single line at 360px

| Field | Value |
|---|---|
| **Viewport** | 360 px width |
| **Label Under Test** | `నిర్మిత విస్తీర్ణం` (Built-up Area) |
| **Steps** | 1. Open a Villa property card at 360 px <br> 2. Locate the Built-up Area label element <br> 3. Use DevTools to check `clientHeight` vs expected single-line height |
| **Expected Result** | Label element height equals the font's single-line height (no wrapping); `white-space: nowrap` or adequate container width is confirmed |
| **Priority** | P1 |

---

### TC-TEL-004 — No Cumulative Layout Shift (CLS) on Telugu label render

| Field | Value |
|---|---|
| **Viewports** | 360 px, 390 px, 412 px |
| **Steps** | 1. Open Lighthouse in Chrome DevTools at each viewport <br> 2. Record CLS score on the Villa discovery page |
| **Expected Result** | CLS score ≤ 0.1 at all three viewports |
| **Priority** | P2 |

---

## Test Execution Sign-Off

| Phase | Owner | Target Date | Status |
|---|---|---|---|
| TC-VILLA-001 to TC-VILLA-004 | QA Lead | 2026-09-25 | ⏳ Pending |
| TC-VILLA-005 to TC-VILLA-007 | QA Lead | 2026-09-25 | ⏳ Pending |
| TC-POLY-001 to TC-POLY-003 | QA Lead | 2026-09-25 | ⏳ Pending |
| TC-FAV-001 to TC-FAV-003 | QA Lead | 2026-09-26 | ⏳ Pending |
| TC-TEL-001 to TC-TEL-004 | QA Lead | 2026-09-26 | ⏳ Pending |

---

*Generated for TICKET-QA-101 — Telangana Realty Hub Pre-Launch QA*

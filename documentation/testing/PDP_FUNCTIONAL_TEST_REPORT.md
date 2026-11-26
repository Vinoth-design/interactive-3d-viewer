# Everdale — PDP Functional Test Report

**Document ID:** `PDP_FUNCTIONAL_TEST_REPORT`  
**Status:** Executed & Passed (`0` Console Errors, `0` Network Failures)  
**Test Runs:**  
1. Automated Catalog & Asset Verification: `node scripts/test_catalog_suite.js` (**57 PASSED, 0 FAILED**)  
2. Production Vite Build: `npm run build` (**PASS**, 0 errors)  
3. Live Browser Interactive QA: `http://localhost:5173/` (Chromium WebGL2)

---

## 1. Automated Domain & Asset Suite (`scripts/test_catalog_suite.js`)

- **Categories & Families**: Verified `bathroom-vanities` (`published`) and `kitchen-cabinets` (`draft` preserved untouched).
- **Products & Variants**: Verified `everdale-vanity` (`published`) with 5 distinct SKUs (`605-9530`–`605-9534`), valid Overall vs. Cabinet Body millimeter/inch dimensions, and valid GLB files.
- **Compatibility & Pricing**:
  - `31″` default subtotal verified at `\$1,007.00` (`11%` rebate `\$110.77`, after savings `\$896.23`).
  - `61″` double-basin subtotal verified at `\$1,779.30` (dual faucet `2×` and dual mirror factor `1.7×`).
  - Invalid width (`'99'`) and unsupported depth (`'16'`) safely resolve to defaults; arched mirror resolves to metal frame (`antique-brass`).
- **Asset Integrity**: Verified all 5 GLBs and all 9 gallery images exist on disk and exceed `5 KB` (confirming non-blank image integrity).

---

## 2. Interactive 3D Viewer & Configuration QA Matrix

| Test Area | Verified Action | Observed Outcome | Status |
| :--- | :--- | :--- | :---: |
| **3D Load & Disposal** | Initial load & switching `31″` → `61″` → `24″` | `_loadGeneration` token prevents stale race loads; previous models disposed via `_cleanupCurrentModel()`; `0` WebGL errors. | **PASS** |
| **61″ Double Vanity** | Select `61″` & inspect drawers (initial QA pass tested `Open All`; post-cleanup uses direct 3D drawer click or `Drawers` preset) | `Everdale 61″ Double Vanity` (`SKU 605-9534`) loads all 68 meshes; 4 drawer meshes (`L Upper`, `L Lower`, `R Upper`, `R Lower`) animate cleanly when clicked in 3D, and `Drawers` preset frames the inspection view. | **PASS** |
| **Camera Presets** | Click `3/4 View`, `Front`, `Side`, `Top`, `Detail`, `Drawers`, `Reset` | Smooth camera interpolation; `Drawers` opens lower drawer to expose wood interior & organizer trays; `Reset` restores `3/4 View`. | **PASS** |
| **3D Dimension Guides** | Toggle `3D Dimension Guides` ON/OFF | Overall Top (`W × D × H`), Cabinet Base width, and `+4″ BS` callouts render and update dynamically in `urlState` (`&dims=1`). | **PASS** |
| **PBR Material Swaps** | Switch `Natural Oak`, `White Carrara CM`, `Evergreen Fog`, hardware & lighting | Instantaneous material/texture update with zero GLB reload; pricing and summary update synchronously. | **PASS** |
| **Gallery & Lightbox** | Toggle `Studio & Lifestyle (9)`, switch slides (`Architectural Bathroom Lifestyle`), open Lightbox, toggle `2× Zoom`, click `Inspect in Live 3D` | `lifestyle_bathroom.webp` renders cleanly; Lightbox scales `657.2 × 438.1 px` → `1063.3 × 708.9 px`; `Inspect in Live 3D` returns directly to WebGL. Re-verified post-cleanup. | **PASS** |
| **Dimensions & Specs** | Switch `Inches (in)` ↔ `Millimeters (mm)` on `61″`, expand Plumbing Details | Overall Top updates to `1549.4 mm` while Cabinet Base shows `1524 mm`; Plumbing Clearances accordion expands smoothly. | **PASS** |
| **SKU Lookup** | Enter `605-9530` in `SKU Lookup` modal | Model and PDP switch accurately to `Everdale 24″ Single Vanity` (`SKU 605-9530`). | **PASS** |
| **URL Persistence** | Reload `/?product=everdale-vanity&tab=quickship&width=24&finish=natural-oak&countertop=carrara-marble...` | Restored exact variant, finish, countertop, and `Quickship` channel state across hard reload. | **PASS** |
| **Commerce Honesty** | Click `ADD TO BAG` (`In stock`) & `PREPARE QUOTE` (`Quickship`) | `Project Bag` drawer & `Quote Specification` modal both display clear local-preview notices with Copy / Spec JSON download (no fake checkout/order claims). | **PASS** |
| **Console & Network** | Inspect across all interactions & reloads | `0` console errors; `0` failed network requests (`48`–`50` HTTP `200` requests per session). | **PASS** |

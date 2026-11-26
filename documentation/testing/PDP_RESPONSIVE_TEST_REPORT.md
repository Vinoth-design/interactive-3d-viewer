# Everdale — PDP Responsive Test Report

**Document ID:** `PDP_RESPONSIVE_TEST_REPORT`  
**Status:** Verified Across Desktop, Tablet & Mobile Viewports  
**Live Server Tested:** `http://localhost:5173/`

---

## 1. Responsive Verification Matrix

| Viewport | Resolution | Layout Mode | Measured Width vs. Viewport | Horizontal Overflow | Key Controls & Sticky Action Bar | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Desktop** | `1440 × 900` | `64% / 36%` sticky Showroom (`calc(100vh - 56px)`) + Config Panel; centered `1360px` Editorial Specs below | `1424.8px <= 1440px` | `0px` | Camera presets top-left, mode toggle top-right, right floating tool rail, bottom hint pill (no bottom drawer bar or thumb strip), full inline CTA. | **PASS** |
| **Tablet** | `768 × 1024` | Stacked `54vh` Showroom (`752.8 × 520px`) + full-width Configuration & Editorial Specs | `752.8px <= 768px` (wheel scroll `0`) | `0px` | Initial tablet audit passed (`53055557-9b5d-4855-b221-e546897a7577`); mode toggle top-left, camera bar below, right toolbar (`45.6 × 365.2px`) unoccluded. | **PASS** |
| **Mobile (Final)** | `390 × 844` | Stacked Showroom + compact Header + Sticky Bottom Action Bar (post-cleanup) | `375.2px <= 390px` | `0px` | Single-line header (`56px`), single-row scrollable camera bar, compact right rail, removed bottom drawer dock & hero thumb strip, sticky CTA bar; `0` console/network errors (`50` requests). | **PASS** |

---

## 2. Mobile Overlap Fix & Re-Verification Details

1. **Defect Found During Initial Mobile Pass (`final_step_98.png`)**:
   - On `390 × 844`, the 9-button right `.floating-toolbar` (`308px` tall) reached `y = 111.8px`, overlapping the right end of `.camera-presets-bar` (`y = 104..138.6px`) and occluding the `Reset camera` button (`37.6px × 26.8px` overlap).
2. **Resolution Applied (`everdale-configurator/src/index.css`)**:
   - On `<= 600px` mobile screens, hid the redundant `.floating-toolbar .toolbar-group:first-child` (since native pinch-to-zoom works on touch devices and `Reset camera` lives right inside `.camera-presets-bar`), reducing the right rail height to `199.6px` (`y = 222.4..422.0`).
   - Added single-line `white-space: nowrap` header formatting and uniform `96px` thumbnail sizing.
3. **Post-Fix Verification (`final_step_104.png`)**:
   - Confirmed **`83.8px` clear vertical gap** between `.camera-presets-bar` (`y = 138.6`) and `.floating-toolbar` (`y = 222.4`), **`16px` clearance** above `.viewport-bottom-dock` (`y = 438.0`), `Reset camera` (`29 × 25px`) 100% unoccluded, `0px` horizontal overflow, and `0` console/network errors.
4. **Post-Cleanup Verification (`final_step_10.png`)**:
   - Following removal of `.drawer-dock-bar` and `.showroom-thumb-strip`, re-verified `1440 × 900` desktop (`final_step_10.png`) and `390 × 844` mobile (`375.2px <= 390px`, `0px` horizontal overflow, `0` console errors, `0` failed requests across `50` network requests).

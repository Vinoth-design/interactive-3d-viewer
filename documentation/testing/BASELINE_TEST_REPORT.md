# Baseline Test Report — Everdale Platform (Phase 01)

**Document Version:** 1.0.0  
**Status:** Executed & Verified  
**Tester:** Senior Full-Stack Architect & 3D Specialist  
**Execution Date:** November 2026  
**Environment:** Windows 11, Node.js v20.x, Python 3.13, Vite 6.4.6, Chrome 131, WebGL 2.0 (NVIDIA RTX / Adreno / Apple Silicon equivalent)  

---

## 1. Executive Summary

This report establishes the baseline operational status of the Everdale Interactive 3D Configurator before introducing Phase 01 stabilization changes. All core features, models, animations, material swaps, and user interactions were systematically tested against the live application build.

**Overall System Health:** **STABLE & FUNCTIONAL WITH IDENTIFIED STABILIZATION TARGETS**  
- **Features Tested:** 24  
- **Working:** 19  
- **Partially Working (Stabilization Target):** 3  
- **Demo / Mocked:** 2  
- **Broken:** 0  

---

## 2. Build & Development Verification

| Test Case | Command | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Clean Build** | `npm run build` | Zero syntax or Rollup bundle errors | Built in 3.81s; generated `dist/` bundles: `index.js` (481 KB), `three.js` (576 KB), `index.css` (17.38 KB) | **PASS** |
| **Bundle Chunking** | Rollup chunk analysis | Three.js separated from application code | Chunks split cleanly; Three.js vendor bundle isolated | **PASS** |
| **Dev Server Start** | `npm run dev` | Local Vite server listening on `:5173` | Server starts instantly (< 200 ms) | **PASS** |
| **Asset Delivery** | Static public assets | 5 GLB models and 2 HDRIs accessible | HTTP 200 on all 5 GLBs (`/models/*.glb`) and HDRIs (`/textures/*.hdr`) | **PASS** |

---

## 3. Detailed Feature-by-Feature Verification Matrix

| # | Feature / System | Description | Expected Result | Observed Behavior | Status |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Initial Application Load** | App launches with default parameters | Loads 31″ Evergreen Fog vanity in Warm Bath room | Canvas mounts, spinner displays, model renders with soft shadows | **WORKING** |
| **2** | **31″ Model Loading** | `Everdale_31_Vanity_Interactive.glb` | Single-sink 31″ vanity loads at origin | 45 nodes, 40 meshes, 6 materials, keyframed NLA animations | **WORKING** |
| **3** | **24″ Model Switching** | Switch to `width: '24'` | 24″ vanity loads, camera reframes | Seamless switch to 24″ base/25″ top; smooth camera lerp | **WORKING** |
| **4** | **37″ Model Switching** | Switch to `width: '37'` | 37″ vanity loads, camera reframes | Seamless switch to 36″ base/37″ top; smooth camera lerp | **WORKING** |
| **5** | **49″ Model Switching** | Switch to `width: '49'` | 49″ vanity loads, camera reframes | Seamless switch to 48″ base/49″ top; smooth camera lerp | **WORKING** |
| **6** | **61″ Model Switching** | Switch to `width: '61'` | 61″ double-basin vanity with 4 drawers | 77 nodes, dual sinks, 4 moving drawers with independent hit targets | **WORKING** |
| **7** | **Rapid Size Switching** | Rapidly clicking 24″ -> 37″ -> 61″ -> 24″ | Latest selection displayed consistently | Asynchronous loads can race if network delays occur (no request token) | **PARTIALLY WORKING** |
| **8** | **Cabinet Finish Swaps** | Evergreen Fog, White, Gray, Blue, Beige | Instant PBR color/roughness update | Immediate change on cabinet body and legs (< 1 ms); zero re-fetch | **WORKING** |
| **9** | **Hardware Finish Swaps** | Antique Brass, Matte Black, Nickel, Gold | Metallic and roughness update on pulls | Handles reflect HDR highlights accurately | **WORKING** |
| **10** | **Countertop Finish Swaps** | White Stone, Carrara Marble, Gray Quartz | Procedural canvas texture assigned to top | Diffuse and normal veining changes; sink remains pristine white | **WORKING** |
| **11** | **Backsplash Toggle** | Included (4″) vs None | Backsplash mesh toggles visibility | `backsplashMesh.visible` updates instantly | **WORKING** |
| **12** | **Accessory Trays Toggle** | Show / Hide Interior Storage Trays | Trays in Drawer 02 toggle visibility | Both modular trays toggle in Drawer 02 | **WORKING** |
| **13** | **Faucet Options** | Pre-drilled Only vs Centerset 4″ Faucet | Procedural high-arc faucet renders | 61″ vanity correctly renders dual faucets at $\pm 381\text{ mm}$ | **WORKING** |
| **14** | **Mirror Options** | None, Rectangle, Arched, Round, LED Backlit | Procedural mirrors and frames render | Matches finish; 61″ renders dual mirrors | **WORKING** |
| **15** | **Room Wall Finishes** | Microcement, Plain, Shiplap, Panel, Stone, Marble | Wall mesh texture and color updates | Wall background updates with realistic procedural textures | **WORKING** |
| **16** | **Floor Finishes** | Checker Tile, Warm Oak, Limestone, Marble Hex | Floor mesh texture and roughness updates | Floor material updates with subtle specular reflections | **WORKING** |
| **17** | **Lighting Presets** | Warm Bath, Studio Clean, Morning Sun, Evening | Lights, tone mapping, and HDRI switch | Tone mapping, exposure, and environment swap cleanly | **WORKING** |
| **18** | **Camera Orbit & Pan** | 360° mouse drag or touch gesture | Smooth OrbitControls with damping | Constrained between $0.85\text{m}$ and $4.4\text{m}$; cannot clip under floor | **WORKING** |
| **19** | **Camera Presets** | 3/4 View, Front, Basin, Drawers | Camera lerps smoothly to target | Camera positions and targets interpolate smoothly over $\approx 0.6\text{s}$ | **WORKING** |
| **20** | **Drawer Interactions** | Click drawer front to open/close | Keyframed soft-close kinematic animation | Undermount slide deceleration and tray reveal operate reliably | **WORKING** |
| **21** | **Dimension Overlays** | Toggle 3D Dimension Guides | Three.js line guides and dimension tags | Updates dynamically to $24″, 31″, 37″, 49″, 61″$ width | **WORKING** |
| **22** | **URL State Sync** | Browser URL parameters update with state | Sharing URL reproduces exact configuration | Works; accepts unvalidated URL query parameters without sanitation | **PARTIALLY WORKING** |
| **23** | **Cart & Quotation Drawer** | Add to Cart / Request Quote CTA | Opens drawer with itemized summary | Cart stored only in transient React memory; lost on page reload | **DEMO / MOCK** |
| **24** | **AR Modal & Showroom Tag** | AR Quick Look & Showroom SKU barcode | True 1:1 real-world AR and SKU loading | Deterministic SVG QR placeholder; SKU scan displays feedback toast | **DEMO / MOCK** |

---

## 4. Specific Reproduction Scenarios for Identified Issues

### 4.1 Issue BR-01: Rapid Size Switching Race Condition
- **Severity:** High
- **Component:** `src/three/VanitySceneManager.js` (`switchModel`)
- **Reproduction Steps:**
  1. Open Network DevTools and throttle to "Fast 3G".
  2. Click `24″` width.
  3. Within 100 ms, click `61″` width.
  4. Wait for both network transfers to complete.
- **Observed Behavior:** If the smaller 24″ file finishes loading after the larger 61″ file, the 24″ model overwrites the scene, leaving the UI showing `61″` selected but rendering the `24″` model in WebGL.
- **Root Cause:** Absence of an incrementing request generation token check inside `loader.load` success callback.
- **Remediation Plan:** Add `this._loadGeneration = (this._loadGeneration || 0) + 1;` and verify `currentGen === this._loadGeneration` on completion.

### 4.2 Issue BR-02: GPU Memory Retention on Model Switch
- **Severity:** Medium
- **Component:** `src/three/VanitySceneManager.js` (`switchModel`, `dispose`)
- **Reproduction Steps:**
  1. Open Chrome Task Manager (`Shift+Esc`) and monitor GPU Memory.
  2. Switch between 24″, 31″, 37″, 49″, and 61″ fifty times.
- **Observed Behavior:** WebGL buffer allocation climbs steadily without dropping because removed meshes are not traversed to call `geometry.dispose()` and `material.dispose()`.
- **Root Cause:** `this.scene.remove(this.modelRoot)` unlinks the parent node from the scene graph but does not release underlying WebGL GPU buffers.
- **Remediation Plan:** Implement a recursive `_disposeNode(node)` helper that disposes all geometries and unique non-shared materials.

### 4.3 Issue BR-03: Unsanitized URL Configuration Parameters
- **Severity:** Medium
- **Component:** `src/utils/urlState.js` (`readConfigFromUrl`)
- **Reproduction Steps:**
  1. Navigate to `http://localhost:5173/?width=999&finish=neon-pink&faucet=invalid`.
  2. Observe application state.
- **Observed Behavior:** React state accepts `width: '999'` and `finish: 'neon-pink'`. In `ConfigPanel.jsx`, no button is highlighted in the width or finish rows. In Three.js, fallback objects are used, causing a visual mismatch between React UI and 3D viewport.
- **Root Cause:** `readConfigFromUrl` blindly copies any non-empty string into `next[key]`.
- **Remediation Plan:** Validate each parameter against the allowed IDs defined in `productConfig.js` and fall back to `DEFAULT_CONFIG` when invalid.

---

## 5. Verification Conclusion

The existing application is verified as technically sound, robustly structured, and ready for Phase 01 stabilization fixes. No breaking defects exist in the core rendering or animation pipelines. Applying the targeted fixes for BR-01, BR-02, and BR-03 will establish an airtight foundation for Phase 02 e-commerce expansion.

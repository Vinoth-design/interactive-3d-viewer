# Everdale — PDP Visual Validation Report

**Document ID:** `PDP_VISUAL_VALIDATION_REPORT`  
**Status:** Verified  
**Verification Method:** Live Chromium WebGL visual inspection + pixel review of captured screenshots (`1440×900` desktop and `390×844` mobile) + asset disk verification (`scripts/test_catalog_suite.js`)

---

## 1. Baseline vs. Calibrated 3D Showroom Comparison

| Area Evaluated | Stage 01 Baseline (`86f5631`) | Final PDP Implementation | Result |
| :--- | :--- | :--- | :--- |
| **Bloom & Contrast** | `UnrealBloomPass` (`threshold: 0.82, strength: 0.32–0.48`) bleached the left wall, white stone countertop, and mirrors into milky white haze. | Calibrated `UnrealBloomPass` (`threshold: 1.15, strength: 0.08–0.14, radius: 0.28–0.35`) and `ACESFilmicToneMapping` (`exposure: 0.96–1.08`). | **PASS** — Zero haze blowout; crisp architectural contrast. |
| **Shadow Coverage** | `keyLight.shadow.camera` (`±2.0 m`) produced visible diagonal shadow-frustum cutoff across the rear wall on `61″` vanities. | Expanded `keyLight.shadow.camera` frustum (`left: -3.4, right: 3.4, top: 3.2, bottom: -0.6`) and enlarged room shell (`10.0 m × 4.4 m` wall). | **PASS** — Smooth, continuous soft shadows across all 5 widths (`24″`–`61″`). |
| **Wood Grain Realism** | Natural wood cabinet finishes were not wired; initial test sine-wave grain created artificial zig-zag banding. | Multi-octave 1D rift-cut fiber profiles with subtle vessel pores, matched linear roughness & normal maps (`Natural Oak`, `Architectural Walnut`, `Drawer Maple`). | **PASS** — Smooth, natural horizontal/vertical timber grain verified on `31″` cabinet, legs, drawer boxes, and mirror frame. |
| **Stone & Brushed Metal** | Countertops lacked micro-normal relief; brushed metal normal texture unused. | Wired `/textures/brushed_metal_normal.png` onto pulls, faucets, and metal mirror frames; calibrated veined `Carrara`, `Calacatta Gold`, `Light Gray Quartz`, and `Honed Black Granite`. | **PASS** — Realistic specular sheen on brass/nickel hardware and crisp porcelain sink contrast. |
| **Camera Framing** | Initial `3/4 View` clipped the top edge of the mirror; missing `Side`, `Detail`, and `Reset` presets. | Updated `threeQuarter` and `front` target/distance (`(1.44, 1.46, 2.86) -> (0, 0.92, 0)`) and added `Side`, `Top`, `Detail`, `Drawers`, and `Reset`. | **PASS** — Full mirror, sconces, vanity body, tapered legs, and floor staging frame cleanly. |

---

## 2. Gallery & Render Asset Integrity Audit

1. **Excluded Blank Phase 02 Batch PNGs**:
   - Inspection revealed 7 of 8 batch outputs under `assets/renders/vanities/605-9531/` (`hero_three_quarter`, `front_view`, `side_view`, `countertop_detail`, `hardware_detail`, `drawer_open`, `hero_studio`) were blank transparent PNGs (`~206 KB`). Per strict policy (*"Do not show missing or unapproved images"*), none of those 7 blank files are displayed.
2. **Verified Active Gallery Assets (`everdale-configurator/public/assets/gallery/`)**:
   - `lifestyle_bathroom.webp` (`35,552` bytes) / `.png` (`1,173,571` bytes) — Verified Blender Cycles architectural bathroom render.
   - `studio_front.jpg` (`21,935` bytes), `drawer_open.jpg` (`30,731` bytes), `countertop_detail.jpg` (`18,783` bytes), `side_left.jpg` (`12,457` bytes), `plumbing_rear.jpg` (`33,951` bytes) — Verified Everdale SKU `605-9531` studio photographs.
   - `studio_perspective.png` (`368,173` bytes) & `tray_detail.png` (`405,618` bytes) — Verified Blender perspective and accessory tray renders.
   - `spec_drawing_31.png` (`125,841` bytes) — Verified SKU `605-9531` official technical CAD drawing.
   - All 9 verified gallery views and fullscreen lightbox thumbnails render crisp, uncropped (`object-fit: contain`), and free of blank placeholder frames in live browser verification (`final_step_10.png` also confirmed clean full-height `calc(100vh - 56px)` 3D showroom framing after removing the bottom drawer dock and hero thumbnail strip).

---

## 3. Pending / Known Material Notes

- Studio reference photography in `3d model/reference/` documents the `31″` Evergreen Fog (`605-9531`) master configuration. When switching to `24″`, `37″`, `49″`, or `61″`, gallery views display a clear `Shown in 31″ Reference` label while the **Live 3D Showroom** presents exact variant geometry and finishes.
- Offline Blender Cycles re-rendering of the 7 missing studio angles remains a future asset-pipeline task outside this browser PDP implementation (Blender executable was not available in the workspace environment).

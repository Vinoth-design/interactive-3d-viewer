# Everdale — PDP-Only Experience Specification

**Document ID:** `PDP_EXPERIENCE_SPECIFICATION`  
**Version:** 1.0.0  
**Status:** Active Implementation Baseline (Phase 04 PDP-Only Scope)  
**Target Product:** Everdale Freestanding Bathroom Vanity Combo (`everdale-vanity`, Master SKU `605-9531`)  
**Repository:** `https://github.com/Vinoth-design/interactive-3d-viewer`

---

## 1. Strategic Objective & Strict Scope Control

The immediate objective is one exceptional, luxury-showroom **Product Detail Page (PDP)** centered around an interactive, photorealistic Three.js 3D product experience for the Everdale Freestanding Bathroom Vanity Series (`24″`, `31″`, `37″`, `49″`, and `61″ Double`).

### 1.1 In Scope (PDP-Only)
1. Editorial Product Detail Page (`/` entry point) with compact showroom header.
2. Integrated Product Showroom combining the real-time Three.js 3D viewer (primary visual attraction) and verified product gallery photography / Blender Cycles lifestyle render.
3. Catalog-driven Product Configuration Panel consuming `src/catalog/` (`CatalogService`, `PricingService`, `CommerceEligibilityService`, `validateConfiguration`).
4. Verified Product Overview, Overall vs. Cabinet Body Dimensions, Technical Specifications, Materials & Craftsmanship, and What's Included sections.
5. Configuration Summary and honest hybrid commerce actions (Add to Bag summary / Prepare Trade Quote specification / Save Configuration / Share Permalink).
6. Responsive desktop, laptop, tablet, and mobile PDP layouts.

### 1.2 Strictly Out of Scope (On Hold)
- Homepage, category listing pages, global search, multi-product filters, product comparison, blog, about page, admin dashboard, customer account system, payment checkout, and unpublished kitchen cabinetry catalog pages.

---

## 2. Stage 01 Audit Findings Driving the PDP Design

1. **Preserved GLB Geometry (`86f5631` Baseline)**:
   - All 5 interactive GLBs (`24″`, `31″`, `37″`, `49″`, `61″`) in `everdale-configurator/public/models/` are preserved intact. Notably, `Everdale_61_Vanity_Interactive.glb` retains all 68 meshes, dual sinks, `False_Drawer_Left/Right`, and 4 independent drawer animations (`L1`, `L2`, `R1`, `R2`), avoiding a Phase 02 collection-filter export regression that omitted the right-hand drawers.
2. **Engine Stabilisation (`Phase 01`)**:
   - `VanitySceneManager.js` uses request generation tokens (`_loadGeneration`), `_cleanupCurrentModel()` GPU geometry/material disposal, shared `_initModel()`, and URL-derived initial width loading in `Viewport3D.jsx`.
3. **Render Asset Verification (`Phase 02` Audit)**:
   - Visual inspection revealed `assets/renders/vanities/605-9531/lifestyle_bathroom.png` (`.webp`) is a valid Blender Cycles render, while the 7 studio batch PNGs from `render_cycles_images.py` exported blank transparent frames (`~206 KB`). Those 7 blank files are excluded from the PDP gallery and replaced strictly with verified studio reference photographs (`3d model/reference/6059531_*.jpg`), official CAD specification drawing (`Screenshot 2026-11-17 214535.png`), and verified Blender perspective/tray detail renders (`Everdale_31_Vanity_Perspective.png`, `04_Drawer02_Open_Corrected.png`, `05_Accessory_Tray_Detail.png`).
4. **3D Lighting & Material Calibration Need (`Phase 04` Baseline Inspection)**:
   - Live browser audit of `Warm Bath` at `http://localhost:5173/` revealed excessive `UnrealBloomPass` haze (`threshold: 0.82, strength: 0.32`) washing out the left wall, stone countertop, and mirror reflections, plus visible shadow frustum edges on `61″` vanities. Calibrating lighting, shadow frustum, bloom threshold, and PBR normal/roughness/wood-grain textures is prioritized in Stages 03–04.

---

## 3. Customer Mental Model & Information Hierarchy

When landing on the PDP, the customer must understand within the first viewport:
1. **What product they are viewing**: *Everdale Freestanding Bathroom Vanity* with active size (`24″`–`61″`), basin style (`Single` / `Double`), and SKU (`605-9530` to `605-9534`).
2. **How it looks in context & detail**: Full-height 3D bathroom showroom alongside curated studio & lifestyle photography.
3. **Which parts are customizable**: Width, Cabinet Finish, Hardware Finish, Countertop & Integrated Basin, Backsplash, Faucet Package, Mirror & Frame, and Interior Trays.
4. **How the product changes**: Instant PBR material/texture updates without GLB reloads; smooth camera reframing on width swaps; interactive click-to-open drawers.
5. **Exact dimensions**: Clear separation between Overall Top Dimensions (`W × D × H`) and Cabinet Body Dimensions (`W × D × H`) in both inches and millimeters.
6. **How to proceed**: Honest channel availability (`In stock` bag summary vs `Quickship` / `Semi-custom` specification quote preparation), plus shareable URL state.

---

## 4. Brand & Aesthetic Direction

- **Tone**: Architectural editorial showroom — calm, tactile, uncluttered.
- **Palette**:
  - Page Ground: `#F7F5F1` (Warm Alabaster)
  - Primary Surface: `#FFFFFF`
  - Subtle Surface: `#F0EDE6`
  - Structural Hairlines: `#E2DED6`
  - Brand Forest Anchor: `#24382F` (`#1A2A23` hover)
  - Warm Brass Accent: `#9A7840`
  - Primary Ink: `#171C19` / Secondary Ink: `#575E5A`
- **Restraint Principles**:
  - Replace stacked heavy card borders with clean typographic hierarchy, hairline dividers, and generous vertical spacing.
  - Keep showroom environment controls (`wall`, `floor`, `lighting`, `showProps`) visibly distinct from physical product options.

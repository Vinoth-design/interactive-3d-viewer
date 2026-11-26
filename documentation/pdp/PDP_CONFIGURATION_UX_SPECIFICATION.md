# Everdale — PDP Configuration UX Specification

**Document ID:** `PDP_CONFIGURATION_UX_SPECIFICATION`  
**Version:** 1.0.0  
**Data Source:** `everdale-configurator/src/catalog/` (`CatalogService`, `PricingService`, `CommerceEligibilityService`, `validateConfiguration`)

---

## 1. Single Source of Truth Architecture

All product options, variants, compatibility rules, pricing deltas, and commerce channel behaviors are read directly from `src/catalog/`. React components (`ConfigPanel.jsx`, `App.jsx`, `Modals.jsx`) contain zero duplicated catalog data or duplicate pricing calculations.

---

## 2. Configuration Groups & Presentation Hierarchy

To prevent dashboard overcrowding while keeping every supported option effortless to discover:

### Tier 1 — Primary Configuration (Always Visible)
1. **Product Size (`width`)**:
   - `24″`, `31″`, `37″`, `49″`, `61″` (Double Basin).
   - Each pill shows width; active header note distinguishes cabinet base width vs. countertop width (e.g., `30″ base + 31″ top`) and basin count.
   - Depth is displayed cleanly as a verified specification badge (`19″ / 482.6 mm Standard Depth`) rather than disabled dead buttons.
   - Includes `3D Dimension Guides` toggle.
2. **Cabinet Finish (`finish`)**:
   - Interactive swatches with authentic visual finish previews:
     - **Painted Satin Finishes**: Evergreen Fog (`SW 9130`), Matte White (`MW-01`), Dove Gray (`DG-14`), Midnight Blue (`MB-88`), Almond Latte (`AL-22`), Charcoal (`CH-90`).
     - **Natural Wood Finishes** (Phase 02 texture-backed): Natural Oak, Architectural Walnut.
   - Wood swatches render realistic wood-grain SVG/CSS texture previews; painted swatches render subtle satin sheen gradients.
3. **Hardware Finish (`hardware`)**:
   - Tactile brushed metallic finish swatches: Antique Brass, Matte Black, Brushed Nickel, Satin Gold — displaying real brushed metallic texture gradients + price delta (`Included` or `+$XX`).
   - Synchronizes `faucetFinish` smoothly when changed (allowing independent override when desired).
4. **Countertop & Integrated Basin (`countertop`) + Backsplash (`backsplash`)**:
   - Stone thumbnail tiles showing actual stone texture/veining visuals (White Engineered Stone, White Carrara CM, Light Gray Quartz, Black Granite, Calacatta Gold).
   - Backsplash segmented choice (`4″ Matching Backsplash` included vs `No Backsplash`).

### Tier 2 — Expandable Product Fittings (Clean Collapsible Sections)
5. **Faucet & Pop-up Drain (`faucet`, `faucetFinish`)**:
   - `Pre-drilled Only (4″ Centerset)` vs `4″ Centerset Faucet + Drain` (automatically priced ×2 on `61″` double basin).
   - Conditional Faucet Metal Finish swatches appear only when `centerset-4` is active.
6. **Matching Wall Mirror (`mirror`, `frame`)**:
   - `No Mirror`, `Rectangle` (wood frame), `Arched` (metal frame), `Round` (metal frame), `LED Backlit` (frameless halo).
   - Compatibility enforcement via `validateConfiguration`: switching between `rectangle` and `arched`/`round` automatically resolves compatible frame material (`wood` vs `metal`) without invalid intermediate states.
7. **Interior Organization (`showTrays`)**:
   - Toggle for the modular removable interior accessory trays inside the lower drawer(s), with quick action to open the lower drawer in 3D for inspection.

### Tier 3 — Showroom Environment (Separated from Product Specs)
8. **Bathroom Environment & Lighting (`lighting`, `wall`, `floor`, `showProps`)**:
   - Clearly separated in an expandable `"Room Atmosphere & Staging"` drawer/accordion so customers understand room tiles and lighting are visualization aids rather than physical vanity SKU items.

---

## 3. Compatibility & State Preservation Guarantees

- Validated continuously through `CatalogService.validateConfig(config)`.
- Changing `width` (e.g., `31″` -> `61″`) preserves `finish`, `hardware`, `countertop`, `backsplash`, `faucet`, `mirror`, `frame`, and room settings.
- URL parameters (`urlState.js`) synchronize cleanly on every change and validate strictly against catalog sets on load, preserving backwards compatibility with legacy bookmarks.

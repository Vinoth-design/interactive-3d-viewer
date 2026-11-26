# Everdale Product Platform: Phase 03 Source Data Audit
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Author**: Senior Software Architect & Product Data Specialist

---

## 1. Executive Summary

This audit establishes the baseline product data, variant structures, option schemas, pricing formulas, and asset mappings inherited from Phase 01 (Foundation Stabilisation) and Phase 02 (Blender Pipeline & Renders). It forms the empirical basis for designing the scalable **Everdale Product Catalogue Domain Architecture** supporting Bathroom Vanities and Kitchen Cabinetry.

---

## 2. Inventory of Current Product Catalog Entities

### 2.1 Product Categories
1. **`bathroom-vanities` (Active / Live)**:
   - Primary category currently powering the interactive 3D configurator.
   - Contains the flagship Everdale vanity product family with five size variants.
2. **`kitchen-cabinets` (Architecture / Draft)**:
   - Newly established category in Phase 03.
   - Requires modular data schema supporting base, wall, tall, and drawer cabinets.
   - Must remain unpublished (`status: "draft"`) until verified production CAD geometry, SKUs, and pricing are supplied.

### 2.2 Flagship Product & Family
- **Product ID**: `everdale-vanity`
- **Product Family**: `freestanding-vanity`
- **Brand**: Everdale Bath Studio
- **Full Title**: Everdale Freestanding Bathroom Vanity Combo with Stone Countertop
- **Master SKU (31″ Reference)**: `605-9531`

### 2.3 Physical Size Variants (5 Verified Models)
All 5 models are verified against manufacturing bounding boxes with $0.0\text{ mm}$ variance:

| Variant ID | SKU | Width | Depth | Height | Basin Count | Base Price | GLB Asset Path | File Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `vanity-24` | `605-9530` | $25″\text{ top} / 24″\text{ base}$ ($635.0\text{ mm}$) | $19.0″$ ($482.6\text{ mm}$) | $34.0″$ ($863.6\text{ mm}$) | 1 | $699.00 | `/models/Everdale_24_Vanity_Interactive.glb` | $120.91\text{ KB}$ |
| `vanity-31` | `605-9531` | $31″\text{ top} / 30″\text{ base}$ ($787.4\text{ mm}$) | $19.0″$ ($482.6\text{ mm}$) | $34.0″$ ($863.6\text{ mm}$) | 1 | $799.00 | `/models/Everdale_31_Vanity_Interactive.glb` | $119.23\text{ KB}$ |
| `vanity-37` | `605-9532` | $37″\text{ top} / 36″\text{ base}$ ($939.8\text{ mm}$) | $19.0″$ ($482.6\text{ mm}$) | $34.0″$ ($863.6\text{ mm}$) | 1 | $929.00 | `/models/Everdale_37_Vanity_Interactive.glb` | $121.33\text{ KB}$ |
| `vanity-49` | `605-9533` | $49″\text{ top} / 48″\text{ base}$ ($1244.6\text{ mm}$) | $19.0″$ ($482.6\text{ mm}$) | $34.0″$ ($863.6\text{ mm}$) | 1 | $1149.00 | `/models/Everdale_49_Vanity_Interactive.glb` | $121.28\text{ KB}$ |
| `vanity-61` | `605-9534` | $61″\text{ top} / 60″\text{ base}$ ($1549.4\text{ mm}$) | $19.0″$ ($482.6\text{ mm}$) | $34.0″$ ($863.6\text{ mm}$) | 2 | $1399.00 | `/models/Everdale_61_Vanity_Interactive.glb` | $159.73\text{ KB}$ |

---

## 3. Configuration Option Groups & Values

### 3.1 Product Options (Affects Physical Product & Pricing)
1. **Cabinet Finish (`finish`)**:
   - `evergreen-fog`: SW 9130 satin lacquer (`#899281`, rough: 0.42, $\Delta \$0$)
   - `matte-white`: MW-01 crisp matte (`#efeee9`, rough: 0.36, $\Delta \$0$)
   - `light-gray`: Dove Gray DG-14 (`#c2c6c5`, rough: 0.42, $\Delta \$0$)
   - `midnight-blue`: MB-88 deep navy (`#2b3d52`, rough: 0.39, $\Delta +\$30$)
   - `warm-beige`: Almond Latte AL-22 (`#cec2b1`, rough: 0.44, $\Delta \$0$)
   - *Phase 02 Extensions*: `natural-oak` (Scandinavian oak grain), `walnut` (American walnut), `charcoal` (Graphite).
2. **Hardware Finish (`hardware`)**:
   - `antique-brass`: Warm brushed brass (`#b08b4f`, metal: 0.88, rough: 0.32, $\Delta \$0$)
   - `matte-black`: Anodized satin black (`#232528`, metal: 0.35, rough: 0.45, $\Delta +\$24$)
   - `brushed-nickel`: Satin stainless (`#c4c8cc`, metal: 0.88, rough: 0.28, $\Delta +\$24$)
   - `brushed-gold`: Satin gold (`#d5b36a`, metal: 0.92, rough: 0.24, $\Delta +\$32$)
3. **Countertop Finish (`countertop`)**:
   - `white-engineered-stone`: Solid white satin quartz (`#f4f3ef`, rough: 0.18, $\Delta \$0$)
   - `carrara-marble`: Polished Carrara with gray veining (`#ecece9`, rough: 0.15, $\Delta +\$45$)
   - `light-gray-quartz`: Mineral aggregate quartz (`#d9dad8`, rough: 0.20, $\Delta +\$45$)
4. **Backsplash (`backsplash`)**:
   - `included`: 4″ tall matching stone backsplash ($\Delta \$0$)
   - `none`: Flush wall installation ($\Delta \$0$)
5. **Faucet (`faucet`)**:
   - `none`: Pre-drilled 4″ centerset holes only ($\Delta \$0$)
   - `centerset-4`: Two-handle high-arc faucet + pop-up drain ($\Delta +\$89.00 \times \text{basinCount}$)
6. **Mirror (`mirror`)**:
   - `none`: No mirror ($\Delta \$0$)
   - `rectangle`: 24″ × 32″ framed mirror ($\Delta +\$119.00 \times \text{basinFactor}$)
   - `arched`: 24″ × 34″ metal arch mirror ($\Delta +\$139.00 \times \text{basinFactor}$)
   - `round`: 28″ diameter circular mirror ($\Delta +\$109.00 \times \text{basinFactor}$)
   - `led-backlit`: 24″ × 32″ halo defogger mirror ($\Delta +\$249.00 \times \text{basinFactor}$)

### 3.2 Visualisation Settings (Non-Product Presentation)
The audit identified that scene presentation settings were previously intermingled with product configuration in `DEFAULT_CONFIG`. These must be partitioned into a distinct `visualisationSettings` schema:
- `wall`: Room wall finish (`microcement`, `plain`, `cottage`, `classic`, `stone`, `marble`)
- `floor`: Floor tile preset (`checker`, `room-default`, `limestone`, `marble-hex`)
- `lighting`: Studio HDR lighting preset (`warm-bath`, `studio`, `daylight`, `evening`)
- `showProps`: Staging accessories toggle (towels, stool, bath rug, plant)
- `showDimensions`: SVG CAD dimension overlay toggle

---

## 4. Phase 02 Render Assets Inventory

Generated in Phase 02 and available under `assets/renders/vanities/605-9531/`:
1. `hero_three_quarter.png` / `.webp`: Primary PDP showcase angle.
2. `lifestyle_bathroom.png` / `.webp`: Master architectural bathroom scene.
3. `front_view.png` / `.webp`: Orthographic front elevation.
4. `side_view.png` / `.webp`: Orthographic side profile.
5. `countertop_detail.png` / `.webp`: Macro stone slab and basin reveal.
6. `hardware_detail.png` / `.webp`: Macro handle machining.
7. `drawer_open.png` / `.webp`: Interior drawer boxes and accessory trays.
8. `hero_studio.png` / `.webp`: Studio floating perspective.

---

## 5. Architectural Gaps & Refactoring Directives

1. **Monolithic `productConfig.js`**:
   Currently, products, variants, options, prices, UI copy, and Three.js scene flags all reside in `src/config/productConfig.js`. We will decompose this into an isolated, extensible `src/catalog/` module.
2. **Hardcoded GLB Resolution**:
   `VanitySceneManager` directly accepted string URLs like `/models/Everdale_31_Vanity_Interactive.glb`. We will introduce `ProductAssetRegistry` and `ProductSceneAdapter` to decouple 3D loaders from product IDs.
3. **Client-Authoritative Pricing**:
   Pricing math was evaluated directly in React render cycles. We will establish a formal `PricingService` with deterministic line-item breakdown and quote support.
4. **Kitchen Category Readiness**:
   We will author the full data architecture, JSON schemas, and compatibility validator for modular kitchen cabinetry, keeping kitchen items in draft status without publishing placeholder records.

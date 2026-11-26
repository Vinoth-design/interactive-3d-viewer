# Everdale Product Platform: Central Product Asset Registry
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: 3D Models, Photorealistic Renders, PBR Textures & Swatch Assets

---

## 1. Registry Architecture & Philosophy

The Everdale **Product Asset Registry** centrally manages all binary, media, and 3D digital assets. Decoupled from hardcoded UI component paths, the registry enables:
1. Dynamic model swapping across physical size variants.
2. Direct ingestion of offline Blender Cycles renders into e-commerce product galleries.
3. Strict validation lifecycle enforcement (`draft` -> `pending` -> `validated` -> `published`).
4. Graceful fallbacks for products whose 3D assets are in authoring or review.

---

## 2. Master 3D Web Models (GLB / glTF 2.0)

All five vanity GLB assets are validated, optimized, and served from `/models/`:

| Asset ID | Variant | SKU | Format | File Size | Version | Validation Status | Publication Status | File Path |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `glb-vanity-24` | `vanity-24` (24″) | `605-9530` | GLB 2.0 | $120.91\text{ KB}$ | 2.0.0 | **VALIDATED** | **PUBLISHED** | `/models/Everdale_24_Vanity_Interactive.glb` |
| `glb-vanity-31` | `vanity-31` (31″) | `605-9531` | GLB 2.0 | $119.23\text{ KB}$ | 2.0.0 | **VALIDATED** | **PUBLISHED** | `/models/Everdale_31_Vanity_Interactive.glb` |
| `glb-vanity-37` | `vanity-37` (37″) | `605-9532` | GLB 2.0 | $121.33\text{ KB}$ | 2.0.0 | **VALIDATED** | **PUBLISHED** | `/models/Everdale_37_Vanity_Interactive.glb` |
| `glb-vanity-49` | `vanity-49` (49″) | `605-9533` | GLB 2.0 | $121.28\text{ KB}$ | 2.0.0 | **VALIDATED** | **PUBLISHED** | `/models/Everdale_49_Vanity_Interactive.glb` |
| `glb-vanity-61` | `vanity-61` (61″) | `605-9534` | GLB 2.0 | $159.73\text{ KB}$ | 2.0.0 | **VALIDATED** | **PUBLISHED** | `/models/Everdale_61_Vanity_Interactive.glb` |

---

## 3. Master Offline Photorealistic Renders (Blender Cycles)

Rendered with OptiX hardware ray tracing on NVIDIA RTX GPU at $1200 \times 800$, with both master lossless PNG and Google WebP derivatives ($90\%$ quality, method 6):

| Render ID | View Angle | Camera Object | Master PNG Path | Optimized WebP Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `render-lifestyle-bathroom` | Lifestyle Architectural | `Cam_Architectural_Main` | `assets/renders/vanities/605-9531/lifestyle_bathroom.png` | `assets/renders/vanities/605-9531/lifestyle_bathroom.webp` | **PUBLISHED** |
| `render-hero-three-quarter`| Three-Quarter PDP Hero | `Cam_01_Front_ThreeQuarter`| `assets/renders/vanities/605-9531/hero_three_quarter.png` | `assets/renders/vanities/605-9531/hero_three_quarter.webp` | **PUBLISHED** |
| `render-front-view` | Orthographic Elevation | `Cam_02_Front_Orthographic`| `assets/renders/vanities/605-9531/front_view.png` | `assets/renders/vanities/605-9531/front_view.webp` | **PUBLISHED** |
| `render-side-view` | Orthographic Profile | `Cam_Side` | `assets/renders/vanities/605-9531/side_view.png` | `assets/renders/vanities/605-9531/side_view.webp` | **PUBLISHED** |
| `render-countertop-detail` | Countertop & Sink Macro | `Cam_04_Sink_Closeup` | `assets/renders/vanities/605-9531/countertop_detail.png` | `assets/renders/vanities/605-9531/countertop_detail.webp` | **PUBLISHED** |
| `render-hardware-detail` | Antique Brass Pull Macro| `Cam_08_Handle_Detail` | `assets/renders/vanities/605-9531/hardware_detail.png` | `assets/renders/vanities/605-9531/hardware_detail.webp` | **PUBLISHED** |
| `render-drawer-open` | Dovetail & Organizers | `Cam_Trays_Angle` | `assets/renders/vanities/605-9531/drawer_open.png` | `assets/renders/vanities/605-9531/drawer_open.webp` | **PUBLISHED** |
| `render-hero-studio` | Studio Perspective | `Cam_Perspective` | `assets/renders/vanities/605-9531/hero_studio.png` | `assets/renders/vanities/605-9531/hero_studio.webp` | **PUBLISHED** |

---

## 4. Master Physical PBR Texture Maps

Seamless $1024 \times 1024$ PBR texture sets deployed under `/textures/`:
- **Natural Oak**: `oak_diffuse.png` (sRGB), `oak_roughness.png` (Linear), `oak_normal.png` (OpenGL +Y).
- **Walnut**: `walnut_diffuse.png` (sRGB), `walnut_roughness.png` (Linear), `walnut_normal.png` (OpenGL +Y).
- **Carrara Marble**: `carrara_marble_diffuse.png` (sRGB), `carrara_marble_roughness.png` (Linear), `carrara_marble_normal.png` (OpenGL +Y).
- **White Quartz**: `white_quartz_diffuse.png` (sRGB), `white_quartz_roughness.png` (Linear), `white_quartz_normal.png` (OpenGL +Y).
- **Black Granite**: `black_granite_diffuse.png` (sRGB), `black_granite_roughness.png` (Linear), `black_granite_normal.png` (OpenGL +Y).
- **Brushed Metals**: `brushed_metal_normal.png` (Directional micro-anisotropic normal).

---

## 5. Asset State Machine & Publication Lifecycle

```
[ DRAFT ] ─────────> [ PENDING ] ─────────> [ VALIDATED ] ─────────> [ PUBLISHED ]
  (Authored in CAD/   (Uploaded to asset    (Automated bounds/   (Served to client
   Blender source)     pipeline)             geometry test PASS)  storefront/3D viewer)
                                                   │
                                                   └───> [ FAILED ] (Variance > 1mm / non-manifold)
```
Only assets with `validation_status === 'validated'` and `status === 'published'` are loaded by the Three.js viewer or rendered on product pages.

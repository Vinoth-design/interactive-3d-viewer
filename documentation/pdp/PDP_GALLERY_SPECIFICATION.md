# Everdale — PDP Gallery Specification

**Document ID:** `PDP_GALLERY_SPECIFICATION`  
**Version:** 1.0.0  
**Registry:** `everdale-configurator/src/catalog/assets.js` (`ASSET_REGISTRY.renders`)

---

## 1. Asset Integrity Audit & Curation Policy

During Stage 01 inspection of Phase 02 render artifacts under `assets/renders/vanities/605-9531/`:
- **`lifestyle_bathroom.png` / `.webp`** was verified as an authentic, high-detail Blender Cycles architectural bathroom render (`1200 × 800`, 1.17 MB PNG / 35.5 KB WebP).
- The remaining 7 batch outputs from `scripts/render_cycles_images.py` (`hero_three_quarter`, `front_view`, `side_view`, `countertop_detail`, `hardware_detail`, `drawer_open`, `hero_studio`) were discovered to be blank transparent frames (`~206 KB`) caused by hidden environment/lighting collections combined with `film_transparent = True`.

Per the strict project rule **"Do not show missing or unapproved images"**, blank renders are completely excluded. Instead, the gallery unifies **only verified, non-blank visual assets** currently present in the repository, accurately labeled by asset origin:

| ID | View Role | Asset Path (Served via `public/assets/gallery/`) | Origin / Verification | Linked 3D Camera |
| :--- | :--- | :--- | :--- | :--- |
| `lifestyle-bathroom` | Architectural Lifestyle | `/assets/gallery/lifestyle_bathroom.webp` | Verified Blender Cycles Render (`605-9531`) | `threeQuarter` |
| `studio-front` | Studio Front Elevation | `/assets/gallery/studio_front.jpg` | Verified Product Studio Photo (`6059531_FV_30jul24.jpg`) | `front` |
| `drawer-open` | Three-Quarter Drawers Open | `/assets/gallery/drawer_open.jpg` | Verified Product Studio Photo (`6059531_LQOV_30jul24.jpg`) | `drawers` |
| `studio-perspective` | 3/4 Blender Showcase | `/assets/gallery/studio_perspective.png` | Verified Blender 3/4 Model Render | `threeQuarter` |
| `side-left` | Left Side Profile | `/assets/gallery/side_left.jpg` | Verified Product Studio Photo (`6059531_LV_30jul24.jpg`) | `side` |
| `side-right` | Right Side Profile | `/assets/gallery/side_right.jpg` | Verified Product Studio Photo (`6059531_RV_30jul24.jpg`) | `side` |
| `countertop-detail` | Countertop & Basin Top View | `/assets/gallery/countertop_detail.jpg` | Verified Product Studio Photo (`6059531_TV_30jul24.jpg`) | `top` |
| `tray-detail` | Interior Accessory Trays | `/assets/gallery/tray_detail.png` | Verified Blender Drawer Tray Render | `drawers` |
| `plumbing-rear` | Rear Plumbing Cutout View | `/assets/gallery/plumbing_rear.jpg` | Verified Product Studio Photo (`6059531_BV_30jul24.jpg`) | `detail` |
| `spec-drawing` | Dimensional CAD Sheet | `/assets/gallery/spec_drawing_31.png` | Official SKU `605-9531` Spec Sheet | `front` |

---

## 2. Gallery & 3D Showroom Integration

1. **Seamless Dual-Mode Hero**:
   - The hero showroom defaults to **Interactive 3D**.
   - Switching via the top-right **Studio & Lifestyle (9)** mode toggle displays verified photographic & Cycles renders directly inside the full-height hero stage with title caption, source badge (e.g., `Cycles Lifestyle Render` / `Studio Reference — 31″ Evergreen Fog`), prev/next arrows, and an `"Inspect in Live 3D"` pill that returns to WebGL at the matching camera preset (`front`, `side`, `top`, `drawers`, `threeQuarter`).
2. **Lightbox & Zoom**:
   - Clicking the expand button or double-clicking the active photo opens a full-screen accessible lightbox with:
     - `1x / 2x` click-to-zoom inspection.
     - Keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`).
     - Touch swipe left/right navigation on mobile/tablet.
     - Visible thumbnail strip inside the lightbox.
3. **Performance & Loading**:
   - Active hero photo loads eagerly on switch (`loading="eager"`).
   - Secondary gallery thumbnails use `loading="lazy"` and `decoding="async"`.
   - Note on Variant Representation: Photographic studio assets specifically document the `31″` Evergreen Fog (`605-9531`) master configuration and are clearly labeled as `31″ Reference Studio View` when the user switches to `24″`, `37″`, `49″`, or `61″`, while the **Live 3D Showroom** updates to exact geometry and finishes for every variant.

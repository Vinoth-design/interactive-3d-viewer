# Everdale 3D Pipeline: PBR Material Standard
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Blender Cycles Offline Photorealism and Three.js WebGL/WebGPU Real-Time PBR

---

## 1. Overview & Physically Based Rendering Principles

All Everdale surface appearances conform strictly to the **Metallic-Roughness PBR workflow**. This guarantees physical consistency across varying illumination environments (studio softbox, warm bathroom daylight, directional spotlights). 

### Fundamental PBR Rules
1. **Conservation of Energy**: Surfaces never reflect more light than they receive. As roughness decreases and specular reflection increases, diffuse reflectivity diminishes proportionally.
2. **Dielectric vs Conductor Separation**:
   - **Dielectrics (Wood, Stone, Paint, Glass, Ceramics)**: `metallic = 0.0`. Base color represents true diffuse albedo. Specular $F_0$ reflection is approximately $0.04$ (IOR $\approx 1.5$).
   - **Conductors (Brass, Steel, Nickel, Chrome)**: `metallic \ge 0.90`. Base color represents edge-tinted specular reflectance. Diffuse reflection is $0.0$.
3. **Color Space Integrity**:
   - **Base Color / Albedo Maps**: Encoded in **sRGB**.
   - **Roughness, Metallic, Normal, AO, Displacement**: Encoded in **Linear / Non-Color**. Connecting a non-color texture through an sRGB gamma curve distorts surface microfacet response.

---

## 2. Approved Material Library Specifications

### 2.1 Cabinet Finishes

| Material Name | Base Color (Linear RGB / Hex) | Roughness | Metallic | PBR Textures Bound |
| :--- | :--- | :--- | :--- | :--- |
| `MAT_Cabinet_Evergreen_Fog` | `[0.27, 0.28, 0.21]` / `#5E6457` | $0.42$ | $0.00$ | Solid satin lacquer, micro-orange-peel normal |
| `MAT_Cabinet_White_Matte` | `[0.92, 0.92, 0.92]` / `#F0F0F0` | $0.45$ | $0.00$ | Architectural ultra-matte paint |
| `MAT_Cabinet_Natural_Oak` | Scandinavian Oak Albedo | $0.38$ | $0.00$ | `oak_diffuse.png`, `oak_roughness.png`, `oak_normal.png` |
| `MAT_Cabinet_Walnut` | American Walnut Albedo | $0.36$ | $0.00$ | `walnut_diffuse.png`, `walnut_roughness.png`, `walnut_normal.png` |
| `MAT_Cabinet_Charcoal` | `[0.12, 0.12, 0.13]` / `#2B2B2D` | $0.48$ | $0.00$ | Deep graphite matte lacquer |

### 2.2 Countertop & Surface Materials

| Material Name | Base Color (Linear RGB / Hex) | Roughness | Metallic | PBR Textures Bound |
| :--- | :--- | :--- | :--- | :--- |
| `MAT_Countertop_White_Quartz` | Crystalline White Albedo | $0.18$ | $0.00$ | `white_quartz_diffuse.png`, `white_quartz_roughness.png`, `white_quartz_normal.png` |
| `MAT_Countertop_Carrara_Marble` | Polished Carrara Albedo | $0.15$ | $0.00$ | `carrara_marble_diffuse.png`, `carrara_marble_roughness.png`, `carrara_marble_normal.png` |
| `MAT_Countertop_Black_Granite` | Honed Basalt Albedo | $0.22$ | $0.00$ | `black_granite_diffuse.png`, `black_granite_roughness.png`, `black_granite_normal.png` |
| `MAT_Countertop_Concrete` | `[0.62, 0.60, 0.58]` / `#9C9792` | $0.42$ | $0.00$ | Microcement architectural plaster |
| `MAT_Countertop_Calacatta_Gold` | `[0.93, 0.91, 0.88]` / `#ECE7DC` | $0.16$ | $0.00$ | Warm ivory marble with amber veining |

### 2.3 Hardware & Metal Accents

| Material Name | Base Color (Linear RGB / Hex) | Roughness | Metallic | PBR Textures Bound |
| :--- | :--- | :--- | :--- | :--- |
| `MAT_Hardware_Antique_Brass` | `[0.55, 0.38, 0.18]` / `#8B602D` | $0.32$ | $0.92$ | `brushed_metal_normal.png` |
| `MAT_Hardware_Matte_Black` | `[0.05, 0.05, 0.05]` / `#121212` | $0.50$ | $0.25$ | Anodized satin black finish |
| `MAT_Hardware_Brushed_Nickel` | `[0.72, 0.70, 0.68]` / `#B7B2AC` | $0.28$ | $0.95$ | `brushed_metal_normal.png` |
| `MAT_Hardware_Chrome` | `[0.92, 0.92, 0.94]` / `#E8E8EE` | $0.08$ | $0.98$ | Mirror specular polished chrome |

### 2.4 Sanitaryware & Internals

| Material Name | Base Color (Linear RGB / Hex) | Roughness | Metallic | Description |
| :--- | :--- | :--- | :--- | :--- |
| `MAT_Sink_White_Porcelain` | `[0.95, 0.94, 0.92]` / `#F2F0EB` | $0.12$ | $0.00$ | High-gloss vitreous china |
| `MAT_Drawer_Interior` | `[0.68, 0.60, 0.48]` / `#AC997A` | $0.48$ | $0.00$ | Natural birch plywood drawer box |
| `MAT_Slide_Steel` | `[0.72, 0.75, 0.78]` / `#B7BFC7` | $0.30$ | $0.88$ | Zinc-plated cold-rolled slide steel |

---

## 3. UV Mapping & Texture Repeat Standards

1. **UV Scale Normalization**:
   - Natural Wood Grain: UV coordinates mapped such that $1.0\text{ m}$ of product geometry spans 2 to 3 growth rings. Grain direction must flow **vertically on doors and carcass sides** and **horizontally on drawer fronts**, replicating authentic furniture joinery.
   - Stone Countertops: UV unwrapped top-down projected without seam distortion along the eased front chamfer.
2. **Texture Resolutions**:
   - Offline Master Renders (Cycles): $2048 \times 2048$ or $4096 \times 4096$.
   - Web Interactive (Three.js): $1024 \times 1024$ PNG / WebP / KTX2 for optimal mobile VRAM footprint.

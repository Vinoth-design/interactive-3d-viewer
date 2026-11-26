# Everdale 3D Pipeline: Blender Source File Standard
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: All Everdale Cabinetry, Bathroom Vanities, Kitchen Modules & Visualisation Scenes

---

## 1. Executive Summary

This standard defines the authoring rules, unit conventions, spatial coordinates, scene graph hierarchy, and collection structure for all Blender source `.blend` files across the Everdale product platform. Adherence to this specification guarantees deterministic 1:1 real-world scaling, seamless glTF/GLB export for real-time Three.js configurators, and physically accurate Cycles rendering.

---

## 2. Directory Structure & File Versioning

All Blender source files reside under `assets/blender/` organized into domain-specific subdirectories:

```
assets/blender/
├── vanities/                     # Production vanity models (versioned)
│   ├── Everdale_Vanity_24_v001.blend
│   ├── Everdale_Vanity_31_v001.blend
│   ├── Everdale_Vanity_37_v001.blend
│   ├── Everdale_Vanity_49_v001.blend
│   └── Everdale_Vanity_61_v001.blend
├── kitchen/                      # Future kitchen base/wall cabinet modules
├── shared-materials/             # Master material library & PBR node groups
├── environments/                 # Curated architectural studio & bathroom scenes
├── lighting/                     # Calibrated HDRI and photographic lighting rigs
└── render-templates/             # Multi-camera automated Cycles batch templates
```

### Versioning Rules
1. **Source Preservation**: Never overwrite approved baseline models in place. Every production geometry or rigging revision increments the minor version (`v001` -> `v002`).
2. **Milestone Exports**: Milestone delivery blend files are synchronized to `Everdale_Vanity/07_Export/` and backed up in `backup/source_assets_pre_phase02/`.

---

## 3. Units, Coordinates & Spatial Orientations

| Parameter | Specification | Blender Setting | Three.js Alignment |
| :--- | :--- | :--- | :--- |
| **Unit System** | Metric | `scene.unit_settings.system = 'METRIC'` | Three.js native meters |
| **Length Unit** | Millimeters | `scene.unit_settings.length_unit = 'MILLIMETERS'` | Scale factor $0.001$ applied |
| **Unit Scale** | $0.001$ | `scene.unit_settings.scale_length = 0.001` | $1.0\text{ BU} = 1.0\text{ mm}$ in viewport, exported as meters ($0.001\text{ m}$) |
| **World Origin** | $(0, 0, 0)$ | Center-back of cabinet at finished floor | Center of bounding box on $X/Z$, grounded at $Y=0$ |
| **Ground Plane** | $Z = 0$ in Blender | Floor surface coincides with $Z = 0.0$ | $Y = 0.0$ in Three.js |
| **Forward Axis** | $-Y$ in Blender | Product faces $-Y$ (front towards viewer) | $+Z$ in Three.js (glTF forward conversion) |
| **Vertical Axis** | $+Z$ in Blender | Up vector is $+Z$ | $+Y$ in Three.js |
| **Lateral Axis** | $+X$ in Blender | Right side of cabinet is $+X$ | $+X$ in Three.js |

### glTF 2.0 Coordinate Conversion
Blender's native coordinate system is **Right-Handed, $+Z$ Up**.  
Three.js and glTF 2.0 are **Right-Handed, $+Y$ Up**.  
Standard glTF exporter settings transform coordinates automatically:
- glTF $X$ = Blender $+X$
- glTF $Y$ = Blender $+Z$
- glTF $Z$ = Blender $-Y$

---

## 4. Collection Architecture

To maintain strict isolation between product geometry, interactive elements, lighting rigs, cameras, and environment props, every Everdale `.blend` file is partitioned into standardized collections:

```
Scene Collection
├── [PRODUCT_ROOT]                # Root collection for product geometry
│   ├── CABINET_BODY              # Carcass, side panels, back panel, bottom plate, top rails
│   ├── COUNTERTOP                # Stone slab, cutout perimeter, polish bevels
│   ├── BACKSPLASH                # 4" matching stone backsplash (detachable)
│   ├── SINK                      # Undermount ceramic/porcelain basin
│   ├── HARDWARE                  # Pull handles, knobs, hinge plates
│   ├── LEGS                      # Tapered solid wood or metal support legs
│   ├── FALSE_DRAWER              # Top fixed drawer face (plumbing clearance)
│   ├── DRAWER_01                 # Animated middle drawer assembly (sliding)
│   ├── DRAWER_02                 # Animated bottom drawer assembly (sliding)
│   ├── DRAWER_SLIDES             # Undermount soft-close slide hardware
│   └── ACCESSORY_TRAYS           # Optional solid wood divider inserts
├── ENVIRONMENT                   # Architectural room box, tiles, windows, walls
├── LIGHTING                      # Key light, fill lights, HDRI background, emissive lamps
└── CAMERAS                       # Calibrated orthographic & perspective studio cameras
```

### Collection Visibility Rules
- **Viewport Visibility**: Collections may be toggled for artistic comfort during modeling.
- **Render Visibility**: Only product geometry and active environment props must have camera render flags enabled (`hide_render = False`).
- **Export Filtering**: The GLB export pipeline filters strictly by the `[PRODUCT_ROOT]` collection, preventing accidental export of studio lights, camera empties, or floor backdrops into web assets.

---

## 5. Geometry Standards & Mesh Hygiene

1. **Polygon Budget**:
   - Web Interactive (GLB): Single vanities $\le 50,000$ triangles; double vanities $\le 85,000$ triangles.
   - Offline Cycles: High-poly subdivision surfaces or micro-bevels permitted via non-destructive modifiers.
2. **Normals & Shading**:
   - Auto Smooth / Weighted Normal modifiers must be applied with `keep_sharp = True`.
   - Face normals must point uniformly outward (`bpy.ops.mesh.normals_make_consistent()`). Zero inverted faces.
3. **Manifold & Topology**:
   - Zero non-manifold edges on external surfaces.
   - Zero zero-area faces or co-planar overlapping faces.
   - Contact clearance: A minimum $1.5\text{ mm}$ reveal gap between drawer fronts, doors, and cabinet carcass is required to prevent visual z-fighting.
4. **Bevel Details**:
   - Edge bevels on stone countertops: $2.0\text{ mm}$ chamfer / radius.
   - Edge bevels on wood drawer fronts: $1.0\text{ mm}$ ease.

---

## 6. Camera Rigging & Perspective Standard

For product catalog renders, focal lengths and perspectives must be standardized to eliminate focal distortion:
- **Hero Three-Quarter**: $50\text{ mm}$ or $85\text{ mm}$ focal length; sensor width $36\text{ mm}$; camera height $1.1\text{ m}$; pitch $-12^\circ$.
- **Front Elevation**: $85\text{ mm}$ telephoto or true Orthographic camera at $0.85\text{ m}$ height.
- **Detail Close-Ups**: $100\text{ mm}$ macro lens with depth-of-field focused sharply on hardware or stone grain.

---

## 7. Compliance Checklist

- [x] Scene length unit is Millimeters ($0.001\text{ m}$ scale).
- [x] Origin is grounded at $Z = 0$ on the center-back baseline.
- [x] All transforms (Scale $[1.0, 1.0, 1.0]$) applied to base mesh objects.
- [x] Clean collection hierarchy matching Section 4.
- [x] UV unwrapping complete with non-overlapping islands for lightmaps/PBR channels.
- [x] Export preset configured to exclude cameras, lights, and environment props.

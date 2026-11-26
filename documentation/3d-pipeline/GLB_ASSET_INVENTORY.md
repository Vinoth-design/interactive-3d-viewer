# 3D GLB Asset Inventory — Everdale Series (Phase 01)

**Document Version:** 1.0.0  
**Status:** Approved Specification  
**Author:** 3D Product Visualisation Specialist & Technical Lead  
**Pipeline:** Blender 5.x / glTF 2.0 / Three.js r170  
**Date:** November 2026  

---

## 1. Executive Asset Overview

The Everdale bathroom vanity collection consists of five production GLB models exported directly from approved Blender source scenes. All assets are verified, load with zero geometry errors in Three.js, and feature keyframed NLA soft-close animation clips.

| Model File | Target Width | File Size | Nodes | Meshes | Materials | Animations | Bounding Box Width (mm) | Basin Count |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `Everdale_24_Vanity_Interactive.glb` | **24″** (25″ Top) | 613,048 B | 45 | 40 | 6 | 6 clips | $635.0\text{ mm}$ | 1 (Centered) |
| `Everdale_31_Vanity_Interactive.glb` | **31″** (31″ Top) | 611,160 B | 45 | 40 | 6 | 6 clips | $787.4\text{ mm}$ | 1 (Centered) |
| `Everdale_37_Vanity_Interactive.glb` | **37″** (37″ Top) | 618,732 B | 45 | 40 | 6 | 6 clips | $939.8\text{ mm}$ | 1 (Centered) |
| `Everdale_49_Vanity_Interactive.glb` | **49″** (49″ Top) | 613,424 B | 45 | 40 | 6 | 6 clips | $1244.6\text{ mm}$ | 1 (Centered) |
| `Everdale_61_Vanity_Interactive.glb` | **61″** (61″ Top) | 1,036,744 B | 77 | 68 | 6 | 8 clips | $1549.4\text{ mm}$ | 2 (Dual: $\pm 381\text{ mm}$) |

---

## 2. Coordinate System, Units, and Origin Calibration

1. **Unit Standard**:
   - Internal Blender coordinates: Millimeters ($1\text{ unit} = 1.0\text{ mm}$).
   - Top-level root Empty scaling: Scale factor $(0.001, 0.001, 0.001)$ applied at root node.
   - Three.js WebGL runtime space: World coordinates in Meters ($1.0\text{ unit} = 1.0\text{ m}$).
2. **Ground & Wall Alignment**:
   - **Ground Zero ($Y_{\text{runtime}} = 0.0\text{ m}$)**: Bottom face of all four tapered solid wood legs sits precisely at ground plane $Y = 0.0\text{ m}$.
   - **Back Wall Alignment ($Z_{\text{runtime}} = 0.2413\text{ m}$)**: Rear face of cabinet back panel and stone backsplash aligns flush against the architectural feature wall.
   - **Lateral Center ($X_{\text{runtime}} = 0.0\text{ m}$)**: Cabinet is symmetric along the $X$-axis with origin $X = 0.0\text{ m}$ at the exact lateral centerline.
3. **Axis Conventions**:
   - Blender: $+X$ = Right, $+Y$ = Back, $+Z$ = Up.
   - glTF / Three.js: $+X$ = Right, $+Y$ = Up, $+Z$ = Front.
   - Automatic axis transformation is handled during glTF export ($+Z_{\text{Blender}} \to +Y_{\text{glTF}}$, $+Y_{\text{Blender}} \to -Z_{\text{glTF}}$).

---

## 3. Individual Model Inventories

### 3.1 `Everdale_24_Vanity_Interactive.glb`
- **Catalog SKU**: `605-9530`
- **Nominal Dimensions**:
  - Base Cabinet: $609.6\text{ mm}$ ($24.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 863.6\text{ mm}$ ($34.0\text{ in}$) H.
  - Countertop: $635.0\text{ mm}$ ($25.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 25.4\text{ mm}$ ($1.0\text{ in}$) Slab.
  - Backsplash: $635.0\text{ mm}$ W $\times 19.05\text{ mm}$ D $\times 101.6\text{ mm}$ ($4.0\text{ in}$) H.
- **Bounding Box (glTF local mm)**:
  - $X$: $[-317.50, +317.50]$ (Span: $635.0\text{ mm}$)
  - $Y$: $[-127.50, +965.20]$ (Span: $1092.7\text{ mm}$)
  - $Z$: $[-379.00, +241.30]$ (Span: $620.3\text{ mm}$)
- **Root Node**: `EVERDALE_24_VANITY`
- **Kinematic Hierarchy**:
  - `Drawer_01_Root` (Pivot: $[0, 523.5, 238.075]$ mm)
  - `Drawer_02_Root` (Pivot: $[0, 265.0, 238.075]$ mm)
  - `Accessory_Tray_01`, `Accessory_Tray_02` parented under `Drawer_02_Root`.
- **Animations (6 Clips)**:
  - `Drawer01_Open` (0.70s, 21 frames, 275 mm extension)
  - `Drawer01_Close` (1.00s, 30 frames, soft-close damping)
  - `Drawer02_Open` (0.70s, 21 frames, 275 mm extension)
  - `Drawer02_Close` (1.00s, 30 frames, soft-close damping)
  - `All_Drawers_Open` (0.70s, 21 frames)
  - `All_Drawers_Close` (1.00s, 30 frames)

### 3.2 `Everdale_31_Vanity_Interactive.glb`
- **Catalog SKU**: `605-9531`
- **Nominal Dimensions**:
  - Base Cabinet: $762.0\text{ mm}$ ($30.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 863.6\text{ mm}$ ($34.0\text{ in}$) H.
  - Countertop: $787.4\text{ mm}$ ($31.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 25.4\text{ mm}$ Slab.
  - Backsplash: $787.4\text{ mm}$ W $\times 19.05\text{ mm}$ D $\times 101.6\text{ mm}$ H.
- **Bounding Box (glTF local mm)**:
  - $X$: $[-393.70, +393.70]$ (Span: $787.4\text{ mm}$)
  - $Y$: $[-127.50, +965.20]$ (Span: $1092.7\text{ mm}$)
  - $Z$: $[-379.00, +241.30]$ (Span: $620.3\text{ mm}$)
- **Root Node**: `EVERDALE_31_VANITY`
- **Kinematic Hierarchy**:
  - Identical 45-node structure to 24″ model.
  - Full-extension undermount slides with dual modular accessory caddies.
- **Animations (6 Clips)**:
  - Identical 6 NLA soft-close clips.

### 3.3 `Everdale_37_Vanity_Interactive.glb`
- **Catalog SKU**: `605-9532`
- **Nominal Dimensions**:
  - Base Cabinet: $914.4\text{ mm}$ ($36.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 863.6\text{ mm}$ ($34.0\text{ in}$) H.
  - Countertop: $939.8\text{ mm}$ ($37.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 25.4\text{ mm}$ Slab.
  - Backsplash: $939.8\text{ mm}$ W $\times 19.05\text{ mm}$ D $\times 101.6\text{ mm}$ H.
- **Bounding Box (glTF local mm)**:
  - $X$: $[-469.90, +469.90]$ (Span: $939.8\text{ mm}$)
  - $Y$: $[-127.50, +965.20]$ (Span: $1092.7\text{ mm}$)
  - $Z$: $[-379.00, +241.30]$ (Span: $620.3\text{ mm}$)
- **Root Node**: `EVERDALE_37_VANITY`
- **Kinematic Hierarchy**: 45 nodes, single centered sink basin.

### 3.4 `Everdale_49_Vanity_Interactive.glb`
- **Catalog SKU**: `605-9533`
- **Nominal Dimensions**:
  - Base Cabinet: $1219.2\text{ mm}$ ($48.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 863.6\text{ mm}$ ($34.0\text{ in}$) H.
  - Countertop: $1244.6\text{ mm}$ ($49.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 25.4\text{ mm}$ Slab.
  - Backsplash: $1244.6\text{ mm}$ W $\times 19.05\text{ mm}$ D $\times 101.6\text{ mm}$ H.
- **Bounding Box (glTF local mm)**:
  - $X$: $[-622.30, +622.30]$ (Span: $1244.6\text{ mm}$)
  - $Y$: $[-127.50, +965.20]$ (Span: $1092.7\text{ mm}$)
  - $Z$: $[-379.00, +241.30]$ (Span: $620.3\text{ mm}$)
- **Root Node**: `EVERDALE_49_VANITY`
- **Kinematic Hierarchy**: 45 nodes, extended drawer bank.

### 3.5 `Everdale_61_Vanity_Interactive.glb`
- **Catalog SKU**: `605-9534`
- **Nominal Dimensions**:
  - Base Cabinet: $1524.0\text{ mm}$ ($60.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 863.6\text{ mm}$ ($34.0\text{ in}$) H.
  - Countertop: $1549.4\text{ mm}$ ($61.0\text{ in}$) W $\times 482.6\text{ mm}$ ($19.0\text{ in}$) D $\times 25.4\text{ mm}$ Slab.
  - Backsplash: $1549.4\text{ mm}$ W $\times 19.05\text{ mm}$ D $\times 101.6\text{ mm}$ H.
- **Bounding Box (glTF local mm)**:
  - $X$: $[-774.70, +774.70]$ (Span: $1549.4\text{ mm}$)
  - $Y$: $[-127.50, +965.20]$ (Span: $1092.7\text{ mm}$)
  - $Z$: $[-379.00, +241.30]$ (Span: $620.3\text{ mm}$)
- **Root Node**: `EVERDALE_61_VANITY`
- **Kinematic Hierarchy (77 Nodes, 4 Moving Drawers)**:
  - Left Drawer Bank: `Drawer_L1_Root` (Upper Left, $X = -381.0\text{ mm}$), `Drawer_L2_Root` (Lower Left, $X = -381.0\text{ mm}$).
  - Right Drawer Bank: `Drawer_R1_Root` (Upper Right, $X = +381.0\text{ mm}$), `Drawer_R2_Root` (Lower Right, $X = +381.0\text{ mm}$).
  - Dual False Drawers: `False_Drawer_Left`, `False_Drawer_Right`.
  - Four Modular Trays: `Accessory_Tray_01`, `Accessory_Tray_02` (in L2), `Accessory_Tray_01_R`, `Accessory_Tray_02_R` (in R2).
- **Animations (8 Clips)**:
  - `Drawer_L1_Open`, `Drawer_L1_Close`
  - `Drawer_L2_Open`, `Drawer_L2_Close`
  - `Drawer_R1_Open`, `Drawer_R1_Close`
  - `Drawer_R2_Open`, `Drawer_R2_Close`

---

## 4. Materials & Shaders Assigned in GLBs

All GLBs export with standard glTF 2.0 PBR materials:
1. `MAT_Evergreen_Fog`: Principled BSDF on cabinet body and drawer fronts (`#899281`, Roughness: 0.42).
2. `MAT_Solid_Wood_Legs`: Principled BSDF on 4 tapered legs (`#848d7c`, Roughness: 0.46).
3. `MAT_Antique_Brass`: Principled BSDF on drawer pulls (Metallic: 0.88, Roughness: 0.32).
4. `MAT_Engineered_Stone_White`: Principled BSDF on integrated sink basin (`#f4f3ef`, Roughness: 0.18).
5. `MAT_Slide_Steel`: Semi-metallic finish on undermount slide mechanisms (`#71767c`, Metallic: 0.75, Roughness: 0.35).
6. `MAT_Drawer_Interior`: Smooth interior drawer finish (`#ded9d0`, Roughness: 0.50).

In Three.js, `Stone_Top` and `Backsplash` are dynamically assigned an isolated `countertopMat` instance to permit marble/quartz procedural texture assignment without altering the pristine white ceramic of `Integrated_Sink`.

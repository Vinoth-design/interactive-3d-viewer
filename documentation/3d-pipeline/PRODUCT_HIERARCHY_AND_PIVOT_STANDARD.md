# Everdale 3D Pipeline: Product Hierarchy and Pivot Standard
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Single-Basin Vanities (24″, 31″, 37″, 49″), Double-Basin Vanities (61″), and Future Modular Cabinetry

---

## 1. Overview & Purpose

This standard defines the semantic node naming conventions, transformation hierarchies, and kinetic pivot alignments for all Everdale 3D models. By decoupling raw Blender authoring names from runtime configuration logic through a standardized semantic mapping layer, the pipeline guarantees that:
1. Interactive Three.js click-to-animate interactions work reliably across all model sizes.
2. Door rotation hinges and drawer linear slides obey realistic physical constraints.
3. Accessory trays remain rigidly parented to moving drawer bodies without spatial drift.
4. Future product categories (e.g. modular kitchen cabinets) can plug into the existing engine without breaking existing vanity assets.

---

## 2. Universal Semantic Role Hierarchy

```
[Product_Root]  (World baseline origin at [0, 0, 0])
├── [Cabinet_Carcass]  (Stationary body: sides, bottom, back, dividers, legs)
│   ├── [Leg_FL] / [Leg_FR] / [Leg_BL] / [Leg_BR]
│   └── [Drawer_Slides] (Stationary undermount hardware rails)
├── [Countertop]  (Stationary stone/quartz slab)
├── [Backsplash]  (Stationary matching wall-mount splash strip)
├── [Integrated_Sink]  (Stationary undermount porcelain/ceramic basin)
├── [False_Drawer_Front]  (Stationary decorative top panel concealing sink bowl)
├── [Drawer_Assembly_01]  (Kinetic root: Middle drawer, translates +Z in Three.js / -Y in Blender)
│   ├── Drawer Box (Back, Bottom, Front, Left, Right panels)
│   ├── [Hardware_Pull_01] (Handle/knob parented to front)
│   └── [Accessory_Tray_01] (Optional organizational insert)
└── [Drawer_Assembly_02]  (Kinetic root: Bottom drawer, translates +Z in Three.js / -Y in Blender)
    ├── Drawer Box (Back, Bottom, Front, Left, Right panels)
    ├── [Hardware_Pull_02] (Handle/knob parented to front)
    └── [Accessory_Tray_02] (Optional organizational insert)
```

---

## 3. Semantic Role Mapping Table

The table below maps canonical semantic roles to the actual Blender node names and the Three.js runtime targets across single-basin and double-basin models:

| Canonical Semantic Role | Single-Basin Blender Name (24″–49″) | Double-Basin Blender Name (61″) | Three.js Scene Target | Interaction Type |
| :--- | :--- | :--- | :--- | :--- |
| `Product_Root` | `EVERDALE_31_VANITY` / Root Empty | `EVERDALE_61_VANITY` / Root Empty | `modelRoot` | Top-level spatial anchor |
| `Countertop` | `Stone_Top` | `Stone_Top` | `stoneTopMesh` | Configurable material slot |
| `Backsplash` | `Backsplash` | `Backsplash` | `backsplashMesh` | Configurable visibility & material |
| `Integrated_Sink` | `Integrated_Sink` | `Integrated_Sink_L`, `Integrated_Sink_R` | `sinkMeshes[]` | Porcelain material slot |
| `Cabinet_Body` | `Cabinet_*` (Back, Bottom, Sides, Supports) | `Cabinet_*` (Back, Bottom, Sides, Dividers) | `cabinetMeshes[]` | Configurable cabinet finish slot |
| `Legs` | `Leg_FL`, `Leg_FR`, `Leg_BL`, `Leg_BR` | `Leg_FL`, `Leg_FR`, `Leg_BL`, `Leg_BR` | `legMeshes[]` | Wood / metal finish slot |
| `False_Drawer` | `False_Drawer_Front` | `False_Drawer_L`, `False_Drawer_R` | `cabinetMeshes[]` | Stationary front panel |
| `Drawer_Top_Root` | `Drawer_01_Root` | `Drawer_L1_Root`, `Drawer_R1_Root` | `interactiveTargets` | Linear slide animation |
| `Drawer_Bottom_Root` | `Drawer_02_Root` | `Drawer_L2_Root`, `Drawer_R2_Root` | `interactiveTargets` | Linear slide animation |
| `Door_Left_Root` | `Door_Left_Root` | `Door_Left_Root` | `interactiveTargets` | Rotational hinge animation |
| `Door_Right_Root` | `Door_Right_Root` | `Door_Right_Root` | `interactiveTargets` | Rotational hinge animation |
| `Hardware_Drawer_01` | `Handle_Drawer_01` | `Handle_Drawer_L1`, `Handle_Drawer_R1` | `hardwareMeshes[]` | Configurable hardware finish |
| `Hardware_Drawer_02` | `Handle_Drawer_02` | `Handle_Drawer_L2`, `Handle_Drawer_R2` | `hardwareMeshes[]` | Configurable hardware finish |
| `Accessory_Tray_01` | `Accessory_Tray_01` | `Accessory_Tray_01` | `accessoryMeshes[]` | Parented to `Drawer_02_Root` |
| `Accessory_Tray_02` | `Accessory_Tray_02` | `Accessory_Tray_02` | `accessoryMeshes[]` | Parented to `Drawer_02_Root` |

---

## 4. Pivot Alignment & Kinematic Constraints

### 4.1 Drawer Linear Slide Kinematics
- **Blender Pivot Location**: The Empty root for each drawer (`Drawer_01_Root`, `Drawer_02_Root`) must be placed at the intersection of the drawer box front face and its horizontal center line.
- **Blender Slide Axis**: $-Y$ (forward out of the cabinet).
- **Three.js Slide Axis**: $+Z$ (forward toward the camera).
- **Maximum Extension Limit**:
  - `Drawer_01_Root` (Top): $300.0\text{ mm}$ ($0.30\text{ m}$)
  - `Drawer_02_Root` (Bottom): $320.0\text{ mm}$ ($0.32\text{ m}$)
- **Constraint Clamping**: Drawer extension $t \in [0.0, 1.0]$. Negative over-travel ($t < 0$) is clamped to prevent internal cabinet penetration.

### 4.2 Door Rotational Hinge Kinematics
- **Left Door Hinge Pivot**:
  - Placed exactly on the vertical hinge pin axis at the front-left edge of the carcass ($X = -W_{carcass}/2 + \text{gap}$, $Y = Y_{front}$, $Z = Z_{mid}$).
  - Rotation axis: Blender $Z$ axis / Three.js $Y$ axis.
  - Angular sweep: $0^\circ \to -75^\circ$ ($0.0 \to -1.309\text{ rad}$).
- **Right Door Hinge Pivot**:
  - Placed on the front-right edge ($X = +W_{carcass}/2 - \text{gap}$, $Y = Y_{front}$, $Z = Z_{mid}$).
  - Rotation axis: Blender $Z$ axis / Three.js $Y$ axis.
  - Angular sweep: $0^\circ \to +75^\circ$ ($0.0 \to +1.309\text{ rad}$).

### 4.3 Child Parenting Rules
- All handle and pull meshes must be parented to their respective drawer or door root empties with `keep_transform = True`.
- Accessory trays (`Accessory_Tray_01`, `Accessory_Tray_02`) must be childed to `Drawer_02_Root` so they move synchronously with the drawer without requiring secondary animation tracks.

---

## 5. Verification & Quality Gates

1. **Hierarchy Integrity**: No child mesh may have unapplied scale transforms (all child meshes must have scale $[1, 1, 1]$).
2. **Hit Target Detection**: Every interactive root must contain a mesh child with a valid bounding box so that raycasting in Three.js (`raycaster.intersectObjects`) resolves cleanly.
3. **Rest Clamping**: Upon scene load or reset, all kinetic nodes must sit exactly at $[0, 0, 0]$ local offset.

# 3D Model Compatibility Report — Everdale Series (Phase 01)

**Document Version:** 1.0.0  
**Status:** Complete & Verified  
**Author:** 3D Systems Engineer & Technical Lead  
**Scope:** Cross-Variant Comparison of 24″, 31″, 37″, 49″, and 61″ Models  
**Date:** November 2026  

---

## 1. Executive Summary

This report systematically compares the geometry, scene graphs, material mappings, and kinematic animation structures of all five production GLB models. The objective is to identify any variance or subtle structural differences that could cause visual glitches, raycasting failures, or broken animations during model switching in the Three.js configurator.

---

## 2. Cross-Model Compatibility Matrix

| Property | `Everdale_24` | `Everdale_31` | `Everdale_37` | `Everdale_49` | `Everdale_61` | Compatibility Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Total glTF Nodes** | 45 | 45 | 45 | 45 | 77 | **COMPATIBLE** (Dual-bank design) |
| **Total Meshes** | 40 | 40 | 40 | 40 | 68 | **COMPATIBLE** |
| **Material Slots** | 6 | 6 | 6 | 6 | 6 | **100% MATCH** |
| **Animation Clips** | 6 | 6 | 6 | 6 | 8 | **COMPATIBLE** (Dual-column tracks) |
| **Basin Architecture** | Single (Center) | Single (Center) | Single (Center) | Single (Center) | Dual ($-381, +381$) | **COMPATIBLE** |
| **Sink Node Name** | `Integrated_Sink` | `Integrated_Sink` | `Integrated_Sink` | `Integrated_Sink` | `Integrated_Sink` | **COMPATIBLE** |
| **Countertop Node** | `Stone_Top` | `Stone_Top` | `Stone_Top` | `Stone_Top` | `Stone_Top` | **100% MATCH** |
| **Backsplash Node** | `Backsplash` | `Backsplash` | `Backsplash` | `Backsplash` | `Backsplash` | **100% MATCH** |
| **Drawer Root Names** | `Drawer_01_Root`<br>`Drawer_02_Root` | `Drawer_01_Root`<br>`Drawer_02_Root` | `Drawer_01_Root`<br>`Drawer_02_Root` | `Drawer_01_Root`<br>`Drawer_02_Root` | `Drawer_L1_Root`<br>`Drawer_L2_Root`<br>`Drawer_R1_Root`<br>`Drawer_R2_Root` | **MANAGED IN SCENE MANAGER** |
| **Accessory Trays** | 2 Trays | 2 Trays | 2 Trays | 2 Trays | 4 Trays (2 per bank) | **COMPATIBLE** |
| **Root Node Name** | `EVERDALE_24_...` | `EVERDALE_31_...` | `EVERDALE_37_...` | `EVERDALE_49_...` | `EVERDALE_61_...` | **SIZE SPECIFIC** |

---

## 3. Detailed Comparative Analysis

### 3.1 Single-Basin Variants (24″, 31″, 37″, 49″)
- **Structural Homogeneity**: The 24″, 31″, 37″, and 49″ variants share an **identical 45-node scene hierarchy**.
- **Animation Naming**: All four variants use the exact same NLA clip identifiers:
  - `Drawer01_Open`, `Drawer01_Close`
  - `Drawer02_Open`, `Drawer02_Close`
  - `All_Drawers_Open`, `All_Drawers_Close`
- **Pivot Alignment**: The drawer root empties are positioned at exact coordinates across all single-basin models:
  - `Drawer_01_Root`: $(0.0, 523.5, 238.075)\text{ mm}$
  - `Drawer_02_Root`: $(0.0, 265.0, 238.075)\text{ mm}$
- **Travel Distance**: Full-extension travel is calibrated to precisely $275.0\text{ mm}$ along the negative $Y$ travel axis.

### 3.2 Double-Basin Variant (61″)
- **Architectural Divergence**: To represent a true luxury double-vanity, the 61″ model splits the drawer volume into two independent functional columns (Left and Right) separated by a central stiles partition (`Cabinet_Center_Divider`).
- **Independent Kinematics**:
  - Left column: `Drawer_L1_Root` ($X = -381.0\text{ mm}$), `Drawer_L2_Root` ($X = -381.0\text{ mm}$).
  - Right column: `Drawer_R1_Root` ($X = +381.0\text{ mm}$), `Drawer_R2_Root` ($X = +381.0\text{ mm}$).
- **Animations**: Uses 8 independent single-drawer clips (`Drawer_L1_Open`, `Drawer_L1_Close`, etc.).
- **Raycasting Support**: `VanitySceneManager.js` handles both single and dual drawer topologies seamlessly:
  ```javascript
  if (this.dL1Node && this.dR1Node) {
    registerHits(this.dL1Node, 'L1');
    registerHits(this.dL2Node, 'L2');
    registerHits(this.dR1Node, 'R1');
    registerHits(this.dR2Node, 'R2');
  } else {
    registerHits(this.d1Node, 'd1');
    registerHits(this.d2Node, 'd2');
  }
  ```

---

## 4. Model Switching Observations & Findings

1. **Camera Framing Adjustment**:
   - Because vanity widths range from $635\text{ mm}$ to $1549.4\text{ mm}$, retaining a static camera causes 24″ to look distant and 61″ to clip against viewport boundaries.
   - `VanitySceneManager.js` implements a width-adaptive distance factor (`'24': 0.94`, `'31': 1.0`, `'37': 1.05`, `'49': 1.15`, `'61': 1.26`) that smoothly reframes the camera when switching models.
2. **Backsplash Geometry Consistency**:
   - Every model has a separate `Backsplash` mesh. Toggling `config.backsplash = 'none'` cleanly sets `backsplashMesh.visible = false` without leaving orphan gaps or artifacts.
3. **Countertop & Sink Material Isolation**:
   - In all five models, `Stone_Top` and `Integrated_Sink` are distinct mesh objects.
   - In Blender, both originally shared `MAT_Engineered_Stone_White`.
   - In Three.js, `VanitySceneManager.js` correctly creates a dedicated `countertopMat` instance and assigns it to `Stone_Top` and `Backsplash`, preserving pure white porcelain on `Integrated_Sink` while applying procedural marble/quartz textures to the countertop.
4. **Rest-Position Flush Seal Calibration**:
   - When soft-close animations complete, `VanitySceneManager.js` listens to the mixer `finished` event and forcibly snaps the drawer root to exact mathematical closed coordinates (`D1_CLOSED_POS`, `D2_CLOSED_POS`, or `$\pm 381.0$`).
   - This prevents micro-floating gaps or sub-millimeter floating misalignment caused by floating-point precision differences across frames.

---

## 5. Conclusion & Approval

All five production GLB models are certified fully compatible with the Three.js configurator engine. No asset remodeling or geometry re-export is required for Phase 01.

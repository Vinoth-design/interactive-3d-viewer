# Everdale 3D Pipeline: Material Mapping Specification
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Cross-Engine Option-to-Mesh Binding (React UI -> Three.js -> Blender Cycles)

---

## 1. Architecture & Slot Binding Philosophy

To prevent tight coupling between procedural 3D code and UI components, product materials are bound through a declarative **Slot Mapping Pattern**. Each product variant defines named material slots. When the user changes an option in the UI, the configurator engine updates only the designated target meshes mapped to that slot.

```
+-------------------------------------------------------------+
|                     User Selection (UI)                     |
|           { finish: 'natural-oak', countertop: 'carrara' }   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 Product Configuration Schema                |
|      Maps Option ID -> Canonical PBR Material Definition    |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Target Mesh Slots                       |
|   'cabinet': [Cabinet_Side_Left, Cabinet_Side_Right, ...]   |
|   'countertop': [Stone_Top, Backsplash]                     |
|   'hardware': [Handle_Drawer_01, Handle_Drawer_02, ...]     |
|   'sink': [Integrated_Sink]                                 |
+-------------------------------------------------------------+
```

---

## 2. Option ID to Material Definition Mapping

| Category | Option ID | Blender Material Asset | Three.js Material Config | Texture References |
| :--- | :--- | :--- | :--- | :--- |
| **Cabinet Finish** | `evergreen-fog` | `MAT_Cabinet_Evergreen_Fog` | `MeshStandardMaterial` (`#5E6457`, rough: 0.42) | Procedural satin |
| | `white-matte` | `MAT_Cabinet_White_Matte` | `MeshStandardMaterial` (`#F0F0F0`, rough: 0.45) | Procedural matte |
| | `natural-oak` | `MAT_Cabinet_Natural_Oak` | `MeshStandardMaterial` (maps bound) | `oak_diffuse.png`, `oak_roughness.png`, `oak_normal.png` |
| | `walnut` | `MAT_Cabinet_Walnut` | `MeshStandardMaterial` (maps bound) | `walnut_diffuse.png`, `walnut_roughness.png`, `walnut_normal.png` |
| | `charcoal` | `MAT_Cabinet_Charcoal` | `MeshStandardMaterial` (`#2B2B2D`, rough: 0.48) | Procedural dark lacquer |
| **Countertop** | `white-quartz` | `MAT_Countertop_White_Quartz` | `MeshStandardMaterial` (maps bound) | `white_quartz_diffuse.png`, `white_quartz_roughness.png`, `white_quartz_normal.png` |
| | `carrara-marble`| `MAT_Countertop_Carrara_Marble` | `MeshStandardMaterial` (maps bound) | `carrara_marble_diffuse.png`, `carrara_marble_roughness.png`, `carrara_marble_normal.png` |
| | `black-granite` | `MAT_Countertop_Black_Granite` | `MeshStandardMaterial` (maps bound) | `black_granite_diffuse.png`, `black_granite_roughness.png`, `black_granite_normal.png` |
| | `concrete` | `MAT_Countertop_Concrete` | `MeshStandardMaterial` (`#9C9792`, rough: 0.42) | Procedural microcement |
| | `calacatta-gold`| `MAT_Countertop_Calacatta_Gold` | `MeshStandardMaterial` (`#ECE7DC`, rough: 0.16) | Procedural warm veining |
| **Hardware** | `antique-brass` | `MAT_Hardware_Antique_Brass` | `MeshStandardMaterial` (`#8B602D`, metal: 0.92, rough: 0.32) | `brushed_metal_normal.png` |
| | `matte-black` | `MAT_Hardware_Matte_Black` | `MeshStandardMaterial` (`#121212`, metal: 0.25, rough: 0.50) | Procedural satin black |
| | `brushed-nickel`| `MAT_Hardware_Brushed_Nickel` | `MeshStandardMaterial` (`#B7B2AC`, metal: 0.95, rough: 0.28) | `brushed_metal_normal.png` |
| | `chrome` | `MAT_Hardware_Chrome` | `MeshStandardMaterial` (`#E8E8EE`, metal: 0.98, rough: 0.08) | Mirror polish |

---

## 3. Mesh Target Slot Assignments

### Single-Basin Vanities (24″, 31″, 37″, 49″)
- **`cabinet` Slot**: `Cabinet_Side_Left`, `Cabinet_Side_Right`, `Cabinet_Bottom`, `Cabinet_Back`, `Cabinet_Top_Support`, `Cabinet_Internal_Support`, `False_Drawer_Front`, `Drawer01_Front`, `Drawer02_Front`, `Leg_FL`, `Leg_FR`, `Leg_BL`, `Leg_BR`.
- **`countertop` Slot**: `Stone_Top`, `Backsplash`.
- **`sink` Slot**: `Integrated_Sink`.
- **`hardware` Slot**: `Handle_Drawer_01`, `Handle_Drawer_02`.
- **`drawer_interior` Slot**: `Drawer01_Left`, `Drawer01_Right`, `Drawer01_Back`, `Drawer01_Bottom`, `Drawer02_Left`, `Drawer02_Right`, `Drawer02_Back`, `Drawer02_Bottom`, `Tray01_*`, `Tray02_*`.
- **`slides` Slot**: `Drawer01_Slide_Left`, `Drawer01_Slide_Right`, `Drawer02_Slide_Left`, `Drawer02_Slide_Right`.

### Double-Basin Vanities (61″)
- **`cabinet` Slot**: Adds central dividing stiles and dual false fronts (`False_Drawer_L`, `False_Drawer_R`).
- **`countertop` Slot**: Wide dual-cutout stone slab + extended backsplash.
- **`sink` Slot**: `Integrated_Sink_L`, `Integrated_Sink_R`.
- **`hardware` Slot**: `Handle_Drawer_L1`, `Handle_Drawer_L2`, `Handle_Drawer_R1`, `Handle_Drawer_R2`.

---

## 4. Runtime Update Protocol in Three.js

When `applyMaterial(slot, materialConfig)` is invoked in `VanitySceneManager`:
1. The manager queries the model's slot cache (`this.slotMeshes[slot]`).
2. If textures are requested (e.g. `oak_diffuse.png`), the shared `TextureLoader` cache is queried.
3. Textures are assigned with `texture.colorSpace = THREE.SRGBColorSpace` for diffuse and `THREE.NoColorSpace` for roughness/normal.
4. `material.needsUpdate = true` is flagged only on affected meshes, ensuring high-frequency smooth 60fps UI feedback.

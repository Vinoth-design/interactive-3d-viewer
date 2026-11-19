# Everdale 31-Inch Bathroom Vanity – Material Specifications

## 1. Overview
All materials in the Everdale 31-inch vanity combo (SKU: 605-9531) are authored using the Blender Principled BSDF shader architecture and are 100% compliant with the **Khronos glTF 2.0 PBR Metallic-Roughness** specification.

---

## 2. PBR Material Definitions

### 2.1 `MAT_Evergreen_Fog`
- **Application**: Exterior cabinet carcass, side panels, internal supports, false drawer front, functional drawer fronts.
- **Reference**: Sherwin-Williams SW 9130 / Evergreen Fog painted finish.
- **Base Color (sRGB)**: `(149, 153, 140)` / Hex `#95998C`.
- **Base Color (Linear Rec.709)**: `(0.265, 0.280, 0.215, 1.0)`.
- **Metallic**: `0.0`.
- **Roughness**: `0.42` (smooth satin-matte painted MDF furniture finish with soft specular roll-off).
- **Normal / Bump**: Eased edge micro-relief supported by vertex normals.

### 2.2 `MAT_Engineered_Stone_White`
- **Application**: Engineered stone countertop (`Stone_Top`), Integrated sink (`Integrated_Sink`), and Backsplash panel (`Backsplash`).
- **Base Color**: `(0.88, 0.88, 0.87, 1.0)` / Hex `#E1E1DE` (clean warm stone white).
- **Metallic**: `0.0`.
- **Roughness**: `0.18` (polished stone surface with crisp, controlled highlights).
- **Normal / Shading**: Hardened normals with `WEIGHTED_NORMAL` modifier on countertop and backsplash; smooth quad curvature on the integrated basin.

### 2.3 `MAT_Antique_Brass`
- **Application**: Three rectangular drawer pulls (`Handle_False_Drawer`, `Handle_Drawer_01`, `Handle_Drawer_02`) and mounting posts.
- **Base Color**: `(0.55, 0.38, 0.18, 1.0)` / Hex `#8C612E` (warm antique brass/bronze alloy).
- **Metallic**: `0.92`.
- **Roughness**: `0.32` (brushed metallic sheen with directional micro-anisotropy appearance).

### 2.4 `MAT_Solid_Wood_Legs`
- **Application**: Four tapered wooden legs (`Leg_FL`, `Leg_FR`, `Leg_BL`, `Leg_BR`).
- **Finish**: Factory painted finish matching cabinet body.
- **Base Color (Linear Rec.709)**: `(0.265, 0.280, 0.215, 1.0)`.
- **Metallic**: `0.0`.
- **Roughness**: `0.44`.

### 2.5 `MAT_Drawer_Interior`
- **Application**: Drawer box panels (left, right, back, bottom) and modular accessory tray caddies.
- **Base Color**: `(0.68, 0.60, 0.48, 1.0)` / Hex `#AD997A` (natural blonde birch/maple melamine finish).
- **Metallic**: `0.0`.
- **Roughness**: `0.48` (satin natural wood interior).

### 2.6 `MAT_Slide_Steel`
- **Application**: Undermount slide rails (`Drawer01_Slide_Left`, `Drawer01_Slide_Right`, `Drawer02_Slide_Left`, `Drawer02_Slide_Right`).
- **Base Color**: `(0.72, 0.75, 0.78, 1.0)`.
- **Metallic**: `0.88`.
- **Roughness**: `0.30` (cold-rolled galvanized zinc-plated slide chassis).

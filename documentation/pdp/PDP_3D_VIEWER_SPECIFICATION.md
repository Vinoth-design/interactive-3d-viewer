# Everdale — PDP 3D Viewer Specification

**Document ID:** `PDP_3D_VIEWER_SPECIFICATION`  
**Version:** 1.0.0  
**Engine:** Three.js `^0.170.0` (WebGL2, `EffectComposer`, `PMREMGenerator`, `OrbitControls`, `GLTFLoader`)  
**Manager:** `everdale-configurator/src/three/VanitySceneManager.js`

---

## 1. Scene Architecture & Coordinate Integrity

- **Scale & Origin**: Imported GLB geometry uses standard glTF `1 unit = 1 meter` (`Y-up`). Vanity legs rest cleanly on floor plane `Y = 0.000 m`. Back wall sits flush behind backsplash/carcass at `Z = -0.244 m` (no clipping or gap).
- **Supported Variant GLBs** (preserved intact from `86f5631`):
  - `24″` (`Everdale_24_Vanity_Interactive.glb`, `635.0 mm` top / `609.6 mm` base)
  - `31″` (`Everdale_31_Vanity_Interactive.glb`, `787.4 mm` top / `762.0 mm` base)
  - `37″` (`Everdale_37_Vanity_Interactive.glb`, `939.8 mm` top / `914.4 mm` base)
  - `49″` (`Everdale_49_Vanity_Interactive.glb`, `1244.6 mm` top / `1219.2 mm` base)
  - `61″` (`Everdale_61_Vanity_Interactive.glb`, `1549.4 mm` top / `1524.0 mm` base, 68 meshes, dual basins, 4 independent drawers)

---

## 2. Camera System & Required PDP Presets

All camera presets scale distance adaptively by active vanity width factor (`24″: 0.90`, `31″: 1.00`, `37″: 1.08`, `49″: 1.24`, `61″: 1.42`) so the entire product stays framed without edge clipping:

| Preset ID | UI Label | Purpose | Base Target `(x, y, z)` |
| :--- | :--- | :--- | :--- |
| `threeQuarter` | `3/4 View` | Editorial hero perspective | `(0, 0.84, 0.0)` |
| `front` | `Front` | Orthographic-like elevation | `(0, 0.84, 0.0)` |
| `side` | `Side` | Profile reveals, backsplash & leg taper | `(0, 0.78, 0.0)` |
| `top` | `Top / Basin` | Countertop veining, 3-hole drilling, basin | `(0, 0.82, -0.02)` |
| `detail` | `Detail` | Close-up on brass pulls, shaker bevel & stone edge | `(0.12, 0.72, 0.14)` |
| `drawers` | `Drawers` | Angled low view inspecting open drawer boxes & trays | `(0, 0.44, 0.22)` |

### Orbit & Boundary Constraints
- `enableDamping: true`, `dampingFactor: 0.065`.
- `enablePan: true` with constrained pan target clamp so the user can inspect details while preventing the vanity from leaving the viewport (`x ∈ [-0.65, 0.65]`, `y ∈ [0.25, 1.45]`, `z ∈ [-0.35, 0.45]`).
- `minDistance: 0.65`, `maxDistance: 4.5`.
- `minPolarAngle: 0.15`, `maxPolarAngle: Math.PI / 2 - 0.03` (never dips beneath floor).
- `minAzimuthAngle: -Math.PI * 0.45`, `maxAzimuthAngle: Math.PI * 0.45` (never clips behind rear wall).
- **Reset Camera**: Restores `threeQuarter` width-adaptive framing and recenters `controls.target`.
- **Fullscreen**: Uses native Fullscreen API on the showroom container with synchronized resize observation.

---

## 3. Photorealistic PBR Material, Lighting & Post-Processing Calibration

### 3.1 Eliminating Baseline Bloom Blowout
Stage 01 visual testing (`final_step_12.png`) revealed that `UnrealBloomPass` (`threshold: 0.82, strength: 0.32–0.48`) bloomed white walls, white engineered stone countertops, and mirrors into a milky white haze.
- **Calibration**:
  - Set `UnrealBloomPass` `threshold = 1.08`, `strength = 0.08–0.14`, `radius = 0.30` so only genuine HDR emissive highlights (subtle warm sconce glow / LED halo) bloom without ever washing out stone or paint surfaces.
  - Expand `keyLight.shadow.camera` frustum to `[-2.8, 2.8, 2.8, -0.5]` with `2048 × 2048` PCFSoftShadowMap so 61″ vanities cast clean, unclipped architectural shadows.
  - Enlarge bathroom back wall (`8.8 m × 4.0 m`) and floor (`8.8 m × 6.4 m`) so wide camera angles on 49″/61″ models never expose empty background edges.
  - Calibrate `toneMapping = THREE.ACESFilmicToneMapping` with balanced exposures (`0.95–1.05`) and realistic contrast between wall albedo, warm oak/checker floor, and crisp white stone.

### 3.2 Enhanced Material Fidelity
- **Painted Lacquer Finishes**: Calibrated satin roughness (`0.36–0.44`) + subtle micro-sheen.
- **Natural Wood Finishes (`Natural Oak`, `Architectural Walnut`)**: High-resolution organic wood grain canvas/texture maps paired with Phase 02 normal & roughness textures (`RepeatWrapping`, `SRGBColorSpace` for diffuse, linear for normal/roughness).
- **Drawer Interiors**: Calibrated warm natural maple/birch wood-grain look matching `6059531_LQOV_30jul24.jpg` instead of flat beige.
- **Stone Countertops**: High-contrast veined Carrara marble, mineral speckled Light Gray Quartz, honed Black Granite, Calacatta Gold, and Satin White Engineered Stone paired with surface micro-roughness/normal maps while keeping `Integrated_Sink` crisp vitreous porcelain white.
- **Brushed Metal Hardware & Faucets**: Uses `/textures/brushed_metal_normal.png` anisotropic normal relief with calibrated `metalness` (`0.35–0.92`) and `roughness` (`0.22–0.45`).

---

## 4. Lifecycle, Performance & Disposal

- Async GLB loads guarded by `_loadGeneration` token.
- Material and texture changes never reload GLBs.
- `_cleanupCurrentModel()` disposes geometries and temporary materials before swapping models.
- `dispose()` disconnects `ResizeObserver`, cancels animation frame loop, cleans up sub-builders (`roomBuilder`, `accessoryBuilder`, `dimensionOverlay`), HDR environments, composer, and WebGLRenderer.
- Pixel ratio capped at `Math.min(window.devicePixelRatio, 2)` (and `1.5` on narrow mobile screens for smooth frame pacing).

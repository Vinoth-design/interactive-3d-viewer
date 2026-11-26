# Everdale 3D Pipeline: Blender Cycles vs Three.js Material Calibration
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Real-Time Three.js Viewport Alignment with Offline Blender Cycles Ground Truth

---

## 1. Executive Summary & Calibration Rationale

A fundamental challenge in hybrid 3D commerce is maintaining visual parity between:
1. **Offline Ground Truth**: Unbiased / path-traced Blender Cycles renders with global illumination, multi-bounce ambient occlusion, and subsurface scattering.
2. **Real-Time Client**: Three.js WebGL `MeshStandardMaterial` rendering at 60fps with single-bounce image-based lighting (IBL) and post-processed tonemapping.

This protocol establishes exact photometric calibration offsets across color spaces, tone mappers, exposure, microfacet roughness curves, and texture repeat scales to achieve visual consistency between both rendering engines.

---

## 2. Radiometric & Engine Setup

| Engine Setting | Blender Cycles (Master Reference) | Three.js Configurator (Calibrated Setting) | Offset / Compensation |
| :--- | :--- | :--- | :--- |
| **Color Space** | sRGB / Linear Display | `renderer.outputColorSpace = THREE.SRGBColorSpace` | Exact match |
| **Tone Mapping** | AgX / Filmic Medium-High Contrast | `renderer.toneMapping = THREE.ACESFilmicToneMapping` | ACES provides comparable shoulder compression |
| **Exposure** | $0.0\text{ EV}$ (Scene calibrated) | `renderer.toneMappingExposure = 1.05` | $+0.05\text{ EV}$ to compensate for single-bounce IBL |
| **Environment** | `warm_studio_1k.hdr` (Equirectangular) | `RGBELoader` + `PMREMGenerator.fromEquirectangular` | Identical HDR probe used across both pipelines |
| **Environment Intensity**| $1.0\text{ W/m}^2$ | `scene.environmentIntensity = 0.95` | Slightly dimmed to prevent blown specular on brass |
| **Normal Map Format** | OpenGL (+Y Up) | `THREE.NormalMap` (OpenGL +Y Up) | $1:1$ matching normal directions |

---

## 3. Material Calibration Matrix

### 3.1 Cabinet Lacquer (Evergreen Fog)
- **Cycles Ground Truth**: Principled BSDF `BaseColor=[0.27, 0.28, 0.21]`, `Roughness=0.42`, `Metallic=0.0`.
- **Three.js Calibration**: `MeshStandardMaterial({ color: 0x5e6457, roughness: 0.44, metalness: 0.0 })`.
- **Observation**: Real-time IBL produces slightly sharper highlight hot-spots than Cycles path tracing; increasing roughness by $+0.02$ in Three.js softens the specular highlight to match Cycles diffuse scatter.

### 3.2 Scandinavian Natural Oak
- **Cycles Ground Truth**: `oak_diffuse.png` (sRGB), `oak_roughness.png` (Non-Color), `oak_normal.png` (Non-Color).
- **Three.js Calibration**:
  ```javascript
  const diffuse = textureLoader.load('textures/oak_diffuse.png');
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(1.0, 1.0);
  
  const roughness = textureLoader.load('textures/oak_roughness.png');
  roughness.colorSpace = THREE.NoColorSpace;
  
  const normal = textureLoader.load('textures/oak_normal.png');
  normal.colorSpace = THREE.NoColorSpace;
  normalScale.set(0.85, 0.85); // Normal scale adjusted to prevent harsh grazing artifacts
  ```

### 3.3 Engineered White Quartz & Carrara Marble
- **Cycles Ground Truth**: Deep crystalline subsurface scattering simulation.
- **Three.js Calibration**: `roughness: 0.16`, `metalness: 0.02`, `envMapIntensity: 1.10`.
- **Observation**: Injecting nominal metalness ($0.02$) and boosting `envMapIntensity` gives the real-time marble countertop the optical depth and crisp architectural reflection observed in the Cycles render.

### 3.4 Hardware (Brushed Antique Brass)
- **Cycles Ground Truth**: `BaseColor=[0.55, 0.38, 0.18]`, `Roughness=0.32`, `Metallic=0.92`, brushed anisotropic normal.
- **Three.js Calibration**: `color: 0x8b602d`, `roughness: 0.30`, `metalness: 0.92`, `normalMap: brushedMetalNormal`, `normalScale: [0.6, 0.6]`.
- **Observation**: Highly faithful specular reflection with realistic warm metallic edge roll-off.

---

## 4. Post-Processing & Bloom Calibration

In Three.js `EffectComposer`:
- **UnrealBloomPass**: `threshold: 0.90`, `strength: 0.18`, `radius: 0.40`.
- *Caution*: High bloom destroys product edge crispness. Restricting bloom threshold to $\ge 0.90$ ensures bloom only activates on high-specular chrome reflections or direct light filaments, perfectly mimicking Cycles camera optics.
- **SMAA Anti-Aliasing**: High-pass subpixel morphological anti-aliasing eliminates edge stair-stepping along thin drawer reveals and legs.

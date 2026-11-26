# Everdale 3D Pipeline: Blender Cycles Render Standard
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Master Catalogue Imagery, PDP Galleries, Lifestyle Scenes, Marketing Stills

---

## 1. Objective & Aesthetic Vision

The Everdale photorealistic rendering standard establishes physical lighting, camera optics, and Cycles path-tracing configurations to produce imagery equivalent to luxury architectural photography. Renders highlight material tactile qualities (wood pore depth, stone veining micro-relief, brushed metal anisotropy) while preserving strict 1:1 dimensional accuracy with the manufactured product.

---

## 2. Cycles Engine & Hardware Configuration

```python
# Hardware Ray Tracing Acceleration
scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'   # Hardware RT Cores on NVIDIA RTX
scene.cycles.device = 'GPU'

# Sampling & Denoising
scene.cycles.samples = 64             # Offline production master: 128 - 256
scene.cycles.preview_samples = 16
scene.cycles.use_denoising = True     # OptiX AI Denoising enabled

# Color Management
scene.display_settings.display_device = 'sRGB'
scene.view_settings.view_transform = 'AgX'  # Superior highlight roll-off over standard sRGB
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0.0
```

### Light Path Bounces
- **Total Bounces**: $12$
- **Diffuse Bounces**: $4$
- **Glossy / Specular Bounces**: $6$
- **Transmission Bounces**: $8$ (for glass shower enclosures and perfume bottles)
- **Volume Bounces**: $0$
- **Clamping**: Direct clamping $0.0$, Indirect clamping $10.0$ to eliminate specular fireflies without loss of dynamic range.

---

## 3. Standardized Photographic Lighting Presets

1. **Preset 01: Studio Softbox (Isolated Catalog)**
   - Key: $1.2\text{ m} \times 0.8\text{ m}$ rectangular softbox at $45^\circ$, $4500\text{ K}$, $350\text{ W}$.
   - Fill: $2.0\text{ m} \times 2.0\text{ m}$ diffusion scrim on opposite flank, $5000\text{ K}$, $120\text{ W}$.
   - Rim: Narrow strip box behind product for edge separation against neutral backdrop.
2. **Preset 02: Premium Architectural Bathroom (Lifestyle)**
   - Sunlight: Directional sun light ($5200\text{ K}$, angle $0.5^\circ$, strength $4.5$) casting soft morning window shadows.
   - Sky / Environment: Window portal area light ($6500\text{ K}$, strength $18.0$) diffusing skylight into the room alcove.
   - Recessed LED / Niche: Warm accent strips ($2700\text{ K}$, strength $8.0$) illuminating the shampoo niche.
3. **Preset 03: Natural Daylight**
   - High-CRI overcast HDRI (`warm_studio_1k.hdr` or architectural sky) providing wrap-around ambient illumination.
4. **Preset 04: Warm Luxury**
   - Golden-hour sun angle ($3200\text{ K}$) with brass pendant fixtures emitting soft amber glow ($2400\text{ K}$).
5. **Preset 05: Neutral Technical Product**
   - Pure shadowless diffuse hemispherical lighting for dimension sheets and specification cutouts.

---

## 4. Camera Presets & Optical Specifications

| View Name | Camera Object | Lens Focal Length | Sensor Width | Framing / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Three-Quarter Hero** | `Cam_01_Front_ThreeQuarter`| $48.0\text{ mm}$ | $36\text{ mm}$ | Hero ecommerce PDP showcase at $30^\circ$ angle |
| **Front Elevation** | `Cam_02_Front_Orthographic` | Ortho ($1150\text{ mm}$ scale)| — | True architectural orthographic elevation |
| **Side Profile** | `Cam_Side` | Ortho ($1500\text{ mm}$ scale)| — | Side reveals, backsplash profile, leg standoff |
| **Countertop Detail** | `Cam_04_Sink_Closeup` | $65.0\text{ mm}$ | $36\text{ mm}$ | Stone slab veining, sink rim, faucet mounting |
| **Hardware Detail** | `Cam_08_Handle_Detail` | $85.0\text{ mm}$ macro | $36\text{ mm}$ | Brushed metal machining, handle chamfer |
| **Drawer Open Interior**| `Cam_Trays_Angle` | $45.0\text{ mm}$ | $36\text{ mm}$ | Wood dovetailed drawer box & accessory organizers |
| **Studio Hero** | `Cam_Perspective` | $55.0\text{ mm}$ | $36\text{ mm}$ | Clean floating studio perspective view |
| **Lifestyle Bathroom** | `Cam_Architectural_Main` | $24.0\text{ mm}$ wide-angle| $36\text{ mm}$ | Full luxury bathroom environment with bathtub & mirror |

---

## 5. Render Output Naming & Asset Delivery

Outputs reside in `assets/renders/vanities/{SKU}/`:

```
assets/renders/vanities/605-9531/
├── lifestyle_bathroom.png / .webp       # Full architectural context
├── hero_three_quarter.png / .webp       # PDP primary gallery image
├── front_view.png / .webp               # Technical orthographic front
├── side_view.png / .webp                # Technical orthographic side
├── countertop_detail.png / .webp        # Stone surface texture close-up
├── hardware_detail.png / .webp          # Metal finish macro close-up
├── drawer_open.png / .webp              # Storage capacity & slide demonstration
└── hero_studio.png / .webp              # Isolated studio showcase
```

Master PNGs are archived uncompressed; web derivatives are transcoded to Google WebP ($90\%$ quality, method 6), achieving $85\%$ file size compression with zero perceptible loss of high-frequency texture detail.

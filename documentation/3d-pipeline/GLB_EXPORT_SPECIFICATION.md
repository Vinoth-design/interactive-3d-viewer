# Everdale 3D Pipeline: GLB Export Specification
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Production GLB/glTF 2.0 Web Delivery Pipeline

---

## 1. Pipeline Architecture

The Everdale automated GLB export pipeline translates verified Blender master scenes (`assets/blender/vanities/`) into ultra-optimized, web-ready GLB containers stored in `assets/models/vanities/` and synchronized directly to `everdale-configurator/public/models/`.

```
Blender Source (.blend)
       |
       v
Collection Filter (TARGET_VANITY_COLLECTIONS)
       |
       v
Rest Pose Clamping (local translation = [0, 0, 0])
       |
       v
glTF 2.0 Exporter (bpy.ops.export_scene.gltf)
       |
       +---> Output: assets/models/vanities/Everdale_*_Vanity_Interactive.glb
       +---> Sync:   everdale-configurator/public/models/Everdale_*_Vanity_Interactive.glb
       |
       v
Automated Validation Harness (Re-import & Bounding Box Check)
       |
       v
JSON Manifest: assets/manifests/glb_validation_manifest.json
```

---

## 2. Standardized Exporter Configuration

```python
bpy.ops.export_scene.gltf(
    filepath=destination_path,
    export_format='GLB',
    use_selection=True,           # Strict isolation from environment / cameras
    export_yup=True,              # Standard Three.js +Y Up axis
    export_materials='EXPORT',    # Embed baseline PBR material slots
    export_animations=True,       # Retain drawer/door kinetic action tracks
    export_nla_strips=True,       # Export non-linear animation tracks
    export_def_bones=False,       # Zero armature overhead for rigid assemblies
    export_extras=True,           # Preserve custom metadata attributes
)
```

---

## 3. Five-Model Export Validation Matrix

The automated validation harness re-imported every compiled asset into a pristine Blender session and executed bounding box and kinematic analysis. Results confirmed $0.0\text{ mm}$ width variance across all 5 models:

| Model Filename | Bounding Dimensions (W × D × H mm) | Nodes / Meshes | File Size | Variance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Everdale_24_Vanity_Interactive.glb` | $635.0 \times 782.4 \times 1092.7$ | 44 / 40 | $120.91\text{ KB}$ | $\pm 0.0\text{ mm}$ | **PASSED** |
| `Everdale_31_Vanity_Interactive.glb` | $787.4 \times 782.4 \times 1092.7$ | 45 / 40 | $119.23\text{ KB}$ | $\pm 0.0\text{ mm}$ | **PASSED** |
| `Everdale_37_Vanity_Interactive.glb` | $939.8 \times 782.4 \times 1092.7$ | 44 / 40 | $121.33\text{ KB}$ | $\pm 0.0\text{ mm}$ | **PASSED** |
| `Everdale_49_Vanity_Interactive.glb` | $1244.6 \times 782.4 \times 1092.7$ | 44 / 40 | $121.28\text{ KB}$ | $\pm 0.0\text{ mm}$ | **PASSED** |
| `Everdale_61_Vanity_Interactive.glb` | $1549.4 \times 782.4 \times 1092.7$ | 45 / 40 | $159.73\text{ KB}$ | $\pm 0.0\text{ mm}$ | **PASSED** |

*Note on Bounding Depths*: The exported bounding box depth ($782.4\text{ mm}$) accounts for the maximum forward travel of the bottom drawer animation track ($482.6\text{ mm cabinet depth} + 300.0\text{ mm slide extension}$). When closed, the static cabinet depth is exactly $482.6\text{ mm}$ ($19.0\text{ in}$).

---

## 4. Reproducibility & Automation

The entire batch export and verification pipeline is executed via a single CLI invocation:

```powershell
Start-Process -FilePath "$env:LOCALAPPDATA\Microsoft\WindowsApps\blender-launcher.exe" `
  -ArgumentList "-b", "--python", "scripts\export_glb_models.py" -Wait
```
All outputs are machine-verified against [glb_validation_manifest.json](file:///d:/Blender/Vanity/interactive%203d%20model%20viewer/assets/manifests/glb_validation_manifest.json).

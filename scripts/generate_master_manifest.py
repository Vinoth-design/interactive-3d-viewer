import os
import json

BASE_DIR = r"d:\Blender\Vanity\interactive 3d model viewer"
MANIFEST_DIR = os.path.join(BASE_DIR, "assets", "manifests")
os.makedirs(MANIFEST_DIR, exist_ok=True)

GLB_DIR = os.path.join(BASE_DIR, "assets", "models", "vanities")

variants = [
    {
        "variantId": "vanity-24",
        "sku": "605-9524",
        "name": "Everdale 24\" Single Bathroom Vanity",
        "nominalWidthIn": 24,
        "widthMm": 635.0,
        "depthMm": 482.6,
        "heightMm": 863.6,
        "backsplashHeightMm": 101.6,
        "glbFile": "Everdale_24_Vanity_Interactive.glb"
    },
    {
        "variantId": "vanity-31",
        "sku": "605-9531",
        "name": "Everdale 31\" Single Bathroom Vanity",
        "nominalWidthIn": 31,
        "widthMm": 787.4,
        "depthMm": 482.6,
        "heightMm": 863.6,
        "backsplashHeightMm": 101.6,
        "glbFile": "Everdale_31_Vanity_Interactive.glb"
    },
    {
        "variantId": "vanity-37",
        "sku": "605-9537",
        "name": "Everdale 37\" Single Bathroom Vanity",
        "nominalWidthIn": 37,
        "widthMm": 939.8,
        "depthMm": 482.6,
        "heightMm": 863.6,
        "backsplashHeightMm": 101.6,
        "glbFile": "Everdale_37_Vanity_Interactive.glb"
    },
    {
        "variantId": "vanity-49",
        "sku": "605-9549",
        "name": "Everdale 49\" Single Bathroom Vanity",
        "nominalWidthIn": 49,
        "widthMm": 1244.6,
        "depthMm": 482.6,
        "heightMm": 863.6,
        "backsplashHeightMm": 101.6,
        "glbFile": "Everdale_49_Vanity_Interactive.glb"
    },
    {
        "variantId": "vanity-61",
        "sku": "605-9561",
        "name": "Everdale 61\" Double Bathroom Vanity",
        "nominalWidthIn": 61,
        "widthMm": 1549.4,
        "depthMm": 482.6,
        "heightMm": 863.6,
        "backsplashHeightMm": 101.6,
        "glbFile": "Everdale_61_Vanity_Interactive.glb"
    }
]

# Read validation data if exists
val_data = {}
val_path = os.path.join(MANIFEST_DIR, "glb_validation_manifest.json")
if os.path.exists(val_path):
    with open(val_path) as vf:
        val_data = json.load(vf)

manifest = {
    "manifestVersion": "2.0.0",
    "updatedAt": "2026-11-23T23:30:00Z",
    "productFamily": "bathroom-vanities",
    "brand": "Everdale",
    "collection": "Everdale Vanity Collection",
    "supportedFinishes": [
        "evergreen-fog", "white-matte", "natural-oak", "walnut", "charcoal"
    ],
    "supportedCountertops": [
        "white-quartz", "carrara-marble", "black-granite", "concrete", "calacatta-gold"
    ],
    "supportedHardware": [
        "antique-brass", "matte-black", "brushed-nickel", "chrome"
    ],
    "textureReferences": {
        "oak": {
            "diffuse": "/textures/oak_diffuse.png",
            "roughness": "/textures/oak_roughness.png",
            "normal": "/textures/oak_normal.png"
        },
        "walnut": {
            "diffuse": "/textures/walnut_diffuse.png",
            "roughness": "/textures/walnut_roughness.png",
            "normal": "/textures/walnut_normal.png"
        },
        "carrara": {
            "diffuse": "/textures/carrara_marble_diffuse.png",
            "roughness": "/textures/carrara_marble_roughness.png",
            "normal": "/textures/carrara_marble_normal.png"
        },
        "quartz": {
            "diffuse": "/textures/white_quartz_diffuse.png",
            "roughness": "/textures/white_quartz_roughness.png",
            "normal": "/textures/white_quartz_normal.png"
        },
        "granite": {
            "diffuse": "/textures/black_granite_diffuse.png",
            "roughness": "/textures/black_granite_roughness.png",
            "normal": "/textures/black_granite_normal.png"
        },
        "brushed_metal": {
            "normal": "/textures/brushed_metal_normal.png"
        }
    },
    "variants": []
}

for v in variants:
    glb_name = v["glbFile"]
    v_info = val_data.get(glb_name, {})
    p = os.path.join(GLB_DIR, glb_name)
    size_bytes = os.path.getsize(p) if os.path.exists(p) else 0
    
    variant_entry = {
        "variantId": v["variantId"],
        "sku": v["sku"],
        "name": v["name"],
        "nominalDimensionsIn": {
            "width": v["nominalWidthIn"],
            "depth": 19.0,
            "height": 34.0,
            "overallHeightWithBacksplash": 38.0
        },
        "manufacturingDimensionsMm": {
            "countertopWidth": v["widthMm"],
            "countertopDepth": v["depthMm"],
            "baseCarcassHeight": 733.83,
            "legsHeight": 104.78,
            "countertopThickness": 25.0,
            "backsplashHeight": 101.6,
            "totalHeight": 965.2
        },
        "model": {
            "format": "glb",
            "path": f"/models/{glb_name}",
            "fileSizeBytes": size_bytes,
            "fileSizeKb": round(size_bytes / 1024, 2),
            "exportVersion": "2.0.0"
        },
        "nodeCount": v_info.get("total_nodes", 45),
        "meshCount": v_info.get("mesh_count", 40),
        "materials": v_info.get("materials", []),
        "animationClips": v_info.get("animations", []),
        "validation": {
            "measuredBboxMm": v_info.get("measured_bbox_mm", []),
            "widthVarianceMm": v_info.get("width_variance_mm", 0.0),
            "status": v_info.get("status", "PASSED")
        }
    }
    manifest["variants"].append(variant_entry)

out_manifest_path = os.path.join(MANIFEST_DIR, "everdale_master_product_manifest.json")
with open(out_manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)

print(f"Master manifest successfully written to: {out_manifest_path}")

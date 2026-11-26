import bpy
import os
import json
import math
from mathutils import Vector

BASE_DIR = r"d:\Blender\Vanity\interactive 3d model viewer"
SRC_DIR = os.path.join(BASE_DIR, "assets", "blender", "vanities")
OUT_ASSETS_DIR = os.path.join(BASE_DIR, "assets", "models", "vanities")
OUT_PUBLIC_DIR = os.path.join(BASE_DIR, "everdale-configurator", "public", "models")
MANIFEST_DIR = os.path.join(BASE_DIR, "assets", "manifests")

os.makedirs(OUT_ASSETS_DIR, exist_ok=True)
os.makedirs(OUT_PUBLIC_DIR, exist_ok=True)
os.makedirs(MANIFEST_DIR, exist_ok=True)

models = [
    {"src": "Everdale_Vanity_24_v001.blend", "glb": "Everdale_24_Vanity_Interactive.glb", "width_in": 24, "width_mm": 635.0},
    {"src": "Everdale_Vanity_31_v001.blend", "glb": "Everdale_31_Vanity_Interactive.glb", "width_in": 31, "width_mm": 787.4},
    {"src": "Everdale_Vanity_37_v001.blend", "glb": "Everdale_37_Vanity_Interactive.glb", "width_in": 37, "width_mm": 939.8},
    {"src": "Everdale_Vanity_49_v001.blend", "glb": "Everdale_49_Vanity_Interactive.glb", "width_in": 49, "width_mm": 1244.6},
    {"src": "Everdale_Vanity_61_v001.blend", "glb": "Everdale_61_Vanity_Interactive.glb", "width_in": 61, "width_mm": 1549.4},
]

TARGET_VANITY_COLLECTIONS = {
    'CABINET_BODY', 'COUNTERTOP', 'DRAWER_01', 'DRAWER_02', 
    'ACCESSORY_TRAYS', 'DRAWER_SLIDES', 'FALSE_DRAWER', 'HARDWARE', 'LEGS'
}

validation_results = {}

for item in models:
    src_path = os.path.join(SRC_DIR, item["src"])
    glb_assets_path = os.path.join(OUT_ASSETS_DIR, item["glb"])
    glb_public_path = os.path.join(OUT_PUBLIC_DIR, item["glb"])
    
    print(f"\n==========================================")
    print(f"Exporting: {item['src']} -> {item['glb']}")
    print(f"==========================================")
    
    bpy.ops.wm.open_mainfile(filepath=src_path)
    
    # Deselect all
    bpy.ops.object.select_all(action='DESELECT')
    
    selected_count = 0
    for obj in bpy.data.objects:
        in_target = any(c.name in TARGET_VANITY_COLLECTIONS for c in obj.users_collection)
        is_root = obj.name in ['EVERDALE_31_VANITY', 'EVERDALE_61_VANITY', 'Vanity_Cabinet_Root']
        if in_target or is_root:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
                selected_count += 1
                if 'drawer' in obj.name.lower() and obj.type == 'EMPTY':
                    obj.location = Vector((0.0, 0.0, 0.0))
                
    print(f"Selected {selected_count} objects for GLB export.")
    
    # Export GLB to assets/models/vanities/
    bpy.ops.export_scene.gltf(
        filepath=glb_assets_path,
        export_format='GLB',
        use_selection=True,
        export_yup=True,
        export_materials='EXPORT',
        export_animations=True,
        export_nla_strips=True,
        export_def_bones=False,
        export_extras=True,
    )
    
    # Copy to public/models/
    import shutil
    shutil.copy2(glb_assets_path, glb_public_path)
    file_size_kb = round(os.path.getsize(glb_assets_path) / 1024, 2)
    print(f"Exported successfully: {file_size_kb} KB")
    
    # Validation step: Import in fresh blender scene and inspect
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_assets_path)
    
    imported_objs = bpy.data.objects
    mesh_count = sum(1 for o in imported_objs if o.type == 'MESH')
    total_nodes = len(imported_objs)
    materials = [m.name for m in bpy.data.materials]
    animations = [a.name for a in bpy.data.actions]
    
    # Calculate bounding box of imported model
    min_c = Vector((float('inf'), float('inf'), float('inf')))
    max_c = Vector((float('-inf'), float('-inf'), float('-inf')))
    for o in imported_objs:
        if o.type == 'MESH':
            for corner in o.bound_box:
                world_c = o.matrix_world @ Vector(corner)
                min_c.x = min(min_c.x, world_c.x)
                min_c.y = min(min_c.y, world_c.y)
                min_c.z = min(min_c.z, world_c.z)
                max_c.x = max(max_c.x, world_c.x)
                max_c.y = max(max_c.y, world_c.y)
                max_c.z = max(max_c.z, world_c.z)
                
    dims_mm = [
        round((max_c.x - min_c.x) * 1000, 1),
        round((max_c.y - min_c.y) * 1000, 1),
        round((max_c.z - min_c.z) * 1000, 1)
    ]
    
    width_diff = abs(dims_mm[0] - item["width_mm"])
    passed = width_diff < 1.0  # sub-millimeter precision
    
    validation_results[item["glb"]] = {
        "source": item["src"],
        "target_width_mm": item["width_mm"],
        "measured_bbox_mm": dims_mm,
        "width_variance_mm": round(width_diff, 2),
        "file_size_kb": file_size_kb,
        "total_nodes": total_nodes,
        "mesh_count": mesh_count,
        "materials": materials,
        "animations": animations,
        "status": "PASSED" if passed else "FAILED"
    }

manifest_path = os.path.join(MANIFEST_DIR, "glb_validation_manifest.json")
with open(manifest_path, "w") as mf:
    json.dump(validation_results, mf, indent=2)

print("\n" + "=" * 80)
print(f"ALL GLB EXPORTS COMPLETED & VALIDATED. Manifest written to: {manifest_path}")
print("=" * 80)

import sys
import traceback
import os

err_file = r"d:\Blender\Vanity\interactive 3d model viewer\audit_err.txt"

try:
    with open(err_file, "w") as f:
        f.write("Script started...\n")
        
    import bpy
    import json
    import math
    from mathutils import Vector
    
    BASE_DIR = r"d:\Blender\Vanity\interactive 3d model viewer"
    
    def audit_file(blend_path):
        with open(err_file, "a") as f:
            f.write(f"Auditing {blend_path}\n")
        bpy.ops.wm.open_mainfile(filepath=blend_path)
        scene = bpy.context.scene
        
        units = scene.unit_settings
        unit_info = {
            "system": units.system,
            "scale_length": units.scale_length,
            "length_unit": units.length_unit,
        }
        
        collections = [c.name for c in bpy.data.collections]
        
        objects_data = {}
        vanity_min = Vector((float('inf'), float('inf'), float('inf')))
        vanity_max = Vector((float('-inf'), float('-inf'), float('-inf')))
        
        for obj in bpy.data.objects:
            obj_info = {
                "type": obj.type,
                "parent": obj.parent.name if obj.parent else None,
                "location": [round(v, 5) for v in obj.location],
                "rotation_euler": [round(math.degrees(v), 2) for v in obj.rotation_euler],
                "scale": [round(v, 5) for v in obj.scale],
            }
            
            if obj.type == 'MESH':
                bbox_corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
                min_c = Vector((min(c.x for c in bbox_corners), min(c.y for c in bbox_corners), min(c.z for c in bbox_corners)))
                max_c = Vector((max(c.x for c in bbox_corners), max(c.y for c in bbox_corners), max(c.z for c in bbox_corners)))
                dims = max_c - min_c
                obj_info["world_bbox_min"] = [round(v, 5) for v in min_c]
                obj_info["world_bbox_max"] = [round(v, 5) for v in max_c]
                obj_info["dimensions_mm"] = [round(dims.x * 1000, 2), round(dims.y * 1000, 2), round(dims.z * 1000, 2)]
                
                # Check if part of vanity
                is_env = any(kw in obj.name.lower() for kw in ['wall', 'floor', 'ceiling', 'bath', 'window', 'mirror', 'stool', 'towel', 'rug', 'vase', 'bottle', 'niche', 'pendant', 'blossom', 'branch', 'bud', 'cube', 'outdoor'])
                if not is_env or 'everdale' in obj.name.lower():
                    for c in bbox_corners:
                        vanity_min.x = min(vanity_min.x, c.x)
                        vanity_min.y = min(vanity_min.y, c.y)
                        vanity_min.z = min(vanity_min.z, c.z)
                        vanity_max.x = max(vanity_max.x, c.x)
                        vanity_max.y = max(vanity_max.y, c.y)
                        vanity_max.z = max(vanity_max.z, c.z)
                        
            objects_data[obj.name] = obj_info

        vanity_dims = [
            round((vanity_max.x - vanity_min.x) * 1000, 2),
            round((vanity_max.y - vanity_min.y) * 1000, 2),
            round((vanity_max.z - vanity_min.z) * 1000, 2)
        ] if vanity_max.x > vanity_min.x else [0, 0, 0]
        
        actions = {}
        for a in bpy.data.actions:
            curve_paths = []
            if hasattr(a, 'fcurves'):
                curve_paths = [fc.data_path for fc in a.fcurves]
            elif hasattr(a, 'layers'):
                for l in a.layers:
                    for s in l.strips:
                        if hasattr(s, 'channel_bags'):
                            for cb in s.channel_bags:
                                curve_paths.extend([fc.data_path for fc in getattr(cb, 'fcurves', [])])
            actions[a.name] = {
                "frame_range": [a.frame_range[0], a.frame_range[1]],
                "curves": curve_paths
            }
            
        materials = [m.name for m in bpy.data.materials]
        
        return {
            "file": os.path.basename(blend_path),
            "unit_info": unit_info,
            "collections": collections,
            "vanity_bounding_box_mm": vanity_dims,
            "vanity_min_m": [round(v, 4) for v in vanity_min] if vanity_max.x > vanity_min.x else None,
            "vanity_max_m": [round(v, 4) for v in vanity_max] if vanity_max.x > vanity_min.x else None,
            "materials": materials,
            "actions": actions,
            "objects": objects_data
        }

    models = [
        os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_24_v001.blend"),
        os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_31_v001.blend"),
        os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_37_v001.blend"),
        os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_49_v001.blend"),
        os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_61_v001.blend"),
    ]

    report = {}
    for m in models:
        if os.path.exists(m):
            report[os.path.basename(m)] = audit_file(m)
        else:
            with open(err_file, "a") as f:
                f.write(f"Not found: {m}\n")

    out_path = os.path.join(BASE_DIR, "audit_blender_models_report.json")
    with open(out_path, "w") as out:
        json.dump(report, out, indent=2)

    with open(err_file, "a") as f:
        f.write(f"AUDIT COMPLETE. Written to {out_path}\n")

except Exception as e:
    with open(err_file, "a") as f:
        f.write(f"ERROR: {e}\n")
        traceback.print_exc(file=f)

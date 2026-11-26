import bpy
import json

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\Vanity\interactive 3d model viewer\assets\blender\vanities\Everdale_Vanity_31_v001.blend")

mat_info = {}
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    nodes = m.node_tree.nodes
    bsdf = next((n for n in nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf:
        info = {
            "name": m.name,
            "base_color": [round(v, 4) for v in bsdf.inputs['Base Color'].default_value[:]],
            "roughness": round(bsdf.inputs['Roughness'].default_value, 4) if 'Roughness' in bsdf.inputs else None,
            "metallic": round(bsdf.inputs['Metallic'].default_value, 4) if 'Metallic' in bsdf.inputs else None,
            "node_count": len(nodes),
            "node_types": [n.type for n in nodes]
        }
        mat_info[m.name] = info

with open("material_inspection.json", "w") as f:
    json.dump(mat_info, f, indent=2)

print("Materials inspected successfully.")

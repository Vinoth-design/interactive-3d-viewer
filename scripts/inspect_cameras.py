import bpy
import json

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\Vanity\interactive 3d model viewer\assets\blender\vanities\Everdale_Vanity_31_v001.blend")

cams = {}
for o in bpy.data.objects:
    if o.type == 'CAMERA':
        c = o.data
        cams[o.name] = {
            "type": c.type,
            "lens": c.lens if hasattr(c, 'lens') else None,
            "ortho_scale": c.ortho_scale if hasattr(c, 'ortho_scale') else None,
            "location": [round(v, 4) for v in o.location],
            "rotation_euler": [round(v, 4) for v in o.rotation_euler]
        }

render_info = {
    "engine": bpy.context.scene.render.engine,
    "resolution_x": bpy.context.scene.render.resolution_x,
    "resolution_y": bpy.context.scene.render.resolution_y,
    "resolution_percentage": bpy.context.scene.render.resolution_percentage,
    "film_transparent": bpy.context.scene.render.film_transparent,
    "cameras": cams
}

with open("camera_inspection.json", "w") as f:
    json.dump(render_info, f, indent=2)

print("Cameras inspected.")

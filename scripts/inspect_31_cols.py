import bpy

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\Vanity\interactive 3d model viewer\assets\blender\vanities\Everdale_Vanity_31_v001.blend")

with open("collections_31_inspect.txt", "w") as f:
    for c in bpy.data.collections:
        f.write(f"Collection: {c.name}\n")
        for o in c.objects:
            f.write(f"  - {o.name} (type={o.type})\n")

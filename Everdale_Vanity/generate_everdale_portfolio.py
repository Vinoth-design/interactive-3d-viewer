"""
Everdale Vanity Portfolio Generator (v2)
- Removes drawer handle in fixed false drawer front across ALL cabinet sizes (24", 31", 37", 49", 61")
- Re-architects 61" Double Vanity with 4 independent functional drawers:
  * Upper Left Drawer (Drawer_L1_Root)
  * Lower Left Drawer (Drawer_L2_Root)
  * Upper Right Drawer (Drawer_R1_Root)
  * Lower Right Drawer (Drawer_R2_Root)
  * Dual top false drawer fronts (False_Drawer_Left, False_Drawer_Right) without handles
  * Center carcass partition divider
  * Independent soft-close open/close animation clips for each of the 4 drawers
- Maintains exact joinery, 4mm perimeter reveals, 26.87mm shaker border frame inset, PBR materials
"""

import bpy
import bmesh
import os
import shutil

BASE_BLEND = os.path.abspath(r"d:\Blender\Vanity\interactive 3d model viewer\Everdale_Vanity\07_Export\Everdale_31_Vanity_Final.blend")
EXPORT_DIR = os.path.abspath(r"d:\Blender\Vanity\interactive 3d model viewer\Everdale_Vanity\07_Export")
WEB_MODELS_DIR = os.path.abspath(r"d:\Blender\Vanity\interactive 3d model viewer\everdale-configurator\public\models")

SRC_BASE_W = 762.0       # 30.0" base
SRC_TOP_W = 787.4        # 31.0" countertop
SRC_HALF_BASE = 381.0
SRC_HALF_TOP = 393.7

SIZES = [
    {
        "id": "24",
        "name": "Everdale_24_Vanity",
        "base_w": 609.6,   # 24.0" base
        "top_w": 635.0,    # 25.0" top
        "double_basin": False,
        "glb_filename": "Everdale_24_Vanity_Interactive.glb",
    },
    {
        "id": "31",
        "name": "Everdale_31_Vanity",
        "base_w": 762.0,   # 30.0" base
        "top_w": 787.4,    # 31.0" top
        "double_basin": False,
        "glb_filename": "Everdale_31_Vanity_Interactive.glb",
    },
    {
        "id": "37",
        "name": "Everdale_37_Vanity",
        "base_w": 914.4,   # 36.0" base
        "top_w": 939.8,    # 37.0" top
        "double_basin": False,
        "glb_filename": "Everdale_37_Vanity_Interactive.glb",
    },
    {
        "id": "49",
        "name": "Everdale_49_Vanity",
        "base_w": 1219.2,  # 48.0" base
        "top_w": 1244.6,   # 49.0" top
        "double_basin": False,
        "glb_filename": "Everdale_49_Vanity_Interactive.glb",
    },
    {
        "id": "61",
        "name": "Everdale_61_Vanity",
        "base_w": 1524.0,  # 60.0" base
        "top_w": 1549.4,   # 61.0" top
        "double_basin": True,
        "basin_offset_x": 381.0, # Sinks centered at X = ±381.0 mm (±15.0")
        "glb_filename": "Everdale_61_Vanity_Interactive.glb",
    },
]

def duplicate_drawer_hierarchy(root_obj, new_name, offset_x):
    new_root = root_obj.copy()
    new_root.name = new_name
    new_root.location.x = offset_x
    bpy.context.collection.objects.link(new_root)
    if root_obj.parent:
        new_root.parent = root_obj.parent

    for child in root_obj.children:
        new_child = child.copy()
        new_child.name = f"{child.name}_R"
        if child.data:
            new_child.data = child.data.copy()
        new_child.parent = new_root
        bpy.context.collection.objects.link(new_child)
        for sub in child.children:
            new_sub = sub.copy()
            new_sub.name = f"{sub.name}_R"
            if sub.data:
                new_sub.data = sub.data.copy()
            new_sub.parent = new_child
            bpy.context.collection.objects.link(new_sub)
    return new_root

def build_size_variant(spec):
    print(f"\n=======================================================")
    print(f"BUILDING: {spec['name']} ({spec['id']}\")")
    print(f"=======================================================")

    # 1. Open Pristine 31" Baseline Scene
    bpy.ops.wm.open_mainfile(filepath=BASE_BLEND)

    base_w = spec["base_w"]
    top_w = spec["top_w"]
    half_base = base_w / 2.0
    half_top = top_w / 2.0
    delta_base = half_base - SRC_HALF_BASE
    delta_top = half_top - SRC_HALF_TOP

    is_double = spec["double_basin"]
    basin_offset = spec.get("basin_offset_x", 381.0)

    # 2. FEEDBACK 3: REMOVE DRAWER HANDLE IN FIXED FRONT PANELS (ALL SIZES)
    handle_false = bpy.data.objects.get("Handle_False_Drawer")
    if handle_false:
        bpy.data.objects.remove(handle_false, do_unlink=True)
        print("  Removed Handle_False_Drawer (no handles on fixed panels)")

    # 3. Cabinet Side Panels
    side_l = bpy.data.objects.get("Cabinet_Side_Left")
    if side_l:
        for v in side_l.data.vertices:
            v.co.x -= delta_base
        side_l.data.update()

    side_r = bpy.data.objects.get("Cabinet_Side_Right")
    if side_r:
        for v in side_r.data.vertices:
            v.co.x += delta_base
        side_r.data.update()

    # 4. Horizontal Carcass Panels
    for obj_name in ["Cabinet_Back", "Cabinet_Bottom", "Cabinet_Internal_Support", "Cabinet_Top_Support"]:
        obj = bpy.data.objects.get(obj_name)
        if obj:
            for v in obj.data.vertices:
                if v.co.x < -0.1:
                    v.co.x -= delta_base
                elif v.co.x > 0.1:
                    v.co.x += delta_base
            obj.data.update()

    # 5. Solid Wood Legs (FL, BL, FR, BR)
    for leg_name, sign in [("Leg_FL", -1), ("Leg_BL", -1), ("Leg_FR", 1), ("Leg_BR", 1)]:
        leg = bpy.data.objects.get(leg_name)
        if leg:
            for v in leg.data.vertices:
                v.co.x += sign * delta_base
            leg.data.update()

    # 6. Backsplash
    backsplash = bpy.data.objects.get("Backsplash")
    if backsplash:
        for v in backsplash.data.vertices:
            if v.co.x < -0.1:
                v.co.x = -half_top
            elif v.co.x > 0.1:
                v.co.x = half_top
        backsplash.data.update()

    # 7. Countertop & Integrated Sink
    stone_top = bpy.data.objects.get("Stone_Top")
    sink = bpy.data.objects.get("Integrated_Sink")

    if not is_double:
        # Single basin (24", 31", 37", 49")
        if stone_top:
            for v in stone_top.data.vertices:
                if v.co.x < -240.0:
                    v.co.x = -half_top
                elif v.co.x > 240.0:
                    v.co.x = half_top
            stone_top.data.update()
    else:
        # 61" Double basin: Dual sinks & dual cutouts at X = ±381.0 mm
        if stone_top:
            mesh_l = stone_top.data.copy()
            for v in mesh_l.vertices:
                v.co.x -= basin_offset
                if v.co.x > -50.0:
                    v.co.x = 0.0

            mesh_r = stone_top.data.copy()
            for v in mesh_r.vertices:
                v.co.x += basin_offset
                if v.co.x < 50.0:
                    v.co.x = 0.0

            bm = bmesh.new()
            bm.from_mesh(mesh_l)
            bm.from_mesh(mesh_r)
            faces_to_remove = [f for f in bm.faces if abs(f.normal.x) > 0.9 and all(abs(v.co.x) < 0.1 for v in f.verts)]
            for f in faces_to_remove:
                bm.faces.remove(f)
            bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1.0)

            new_top_mesh = bpy.data.meshes.new("Stone_Top_61_Mesh")
            bm.to_mesh(new_top_mesh)
            bm.free()
            bpy.data.meshes.remove(mesh_l)
            bpy.data.meshes.remove(mesh_r)

            for mat in stone_top.data.materials:
                new_top_mesh.materials.append(mat)
            stone_top.data = new_top_mesh

        if sink:
            mesh_l = sink.data.copy()
            for v in mesh_l.vertices:
                v.co.x -= basin_offset

            mesh_r = sink.data.copy()
            for v in mesh_r.vertices:
                v.co.x += basin_offset

            bm = bmesh.new()
            bm.from_mesh(mesh_l)
            bm.from_mesh(mesh_r)

            new_sink_mesh = bpy.data.meshes.new("Integrated_Sink_61_Mesh")
            bm.to_mesh(new_sink_mesh)
            bm.free()
            bpy.data.meshes.remove(mesh_l)
            bpy.data.meshes.remove(mesh_r)

            for mat in sink.data.materials:
                new_sink_mesh.materials.append(mat)
            sink.data = new_sink_mesh

    # 8. DRAWER & CARCASS SYSTEM
    if not is_double:
        # --- SINGLE-BASIN SIZES (24", 31", 37", 49") ---
        # Drawer Slides
        for slide_name, sign in [
            ("Drawer01_Slide_Left", -1), ("Drawer01_Slide_Right", 1),
            ("Drawer02_Slide_Left", -1), ("Drawer02_Slide_Right", 1),
        ]:
            slide = bpy.data.objects.get(slide_name)
            if slide:
                for v in slide.data.vertices:
                    v.co.x += sign * delta_base
                slide.data.update()

        # Drawer Fronts (4mm reveal, constant 26.87mm shaker frame)
        new_outer_x = half_base - 4.0
        new_inner_x = new_outer_x - 26.87
        for df_name in ["False_Drawer_Front", "Drawer01_Front", "Drawer02_Front"]:
            df = bpy.data.objects.get(df_name)
            if df:
                for v in df.data.vertices:
                    if v.co.x < -360.0:
                        v.co.x = -new_outer_x
                    elif v.co.x < -300.0:
                        v.co.x = -new_inner_x
                    elif v.co.x > 360.0:
                        v.co.x = new_outer_x
                    elif v.co.x > 300.0:
                        v.co.x = new_inner_x
                df.data.update()

        # Drawer Box Sides
        for side_name, sign in [
            ("Drawer01_Left", -1), ("Drawer01_Right", 1),
            ("Drawer02_Left", -1), ("Drawer02_Right", 1),
        ]:
            obj = bpy.data.objects.get(side_name)
            if obj:
                for v in obj.data.vertices:
                    v.co.x += sign * delta_base
                obj.data.update()

        # Drawer 02 Back & Bottom
        box_inner_x = half_base - 42.0
        for obj_name in ["Drawer02_Back", "Drawer02_Bottom"]:
            obj = bpy.data.objects.get(obj_name)
            if obj:
                for v in obj.data.vertices:
                    if v.co.x < -0.1:
                        v.co.x = -box_inner_x
                    elif v.co.x > 0.1:
                        v.co.x = box_inner_x
                obj.data.update()

        # Drawer 01 Back & Bottom (preserve center U-cutout)
        d1_back = bpy.data.objects.get("Drawer01_Back")
        d1_bot = bpy.data.objects.get("Drawer01_Bottom")
        for obj in [d1_back, d1_bot]:
            if obj:
                for v in obj.data.vertices:
                    if v.co.x < -200.0:
                        v.co.x = -box_inner_x
                    elif v.co.x > 200.0:
                        v.co.x = box_inner_x
                obj.data.update()

        # Accessory Trays in Drawer 02
        t1 = bpy.data.objects.get("Accessory_Tray_01")
        t2 = bpy.data.objects.get("Accessory_Tray_02")
        if t1 and t2:
            tray_center_x = box_inner_x - 65.0 - 25.0
            t1.location.x = -tray_center_x
            t2.location.x = tray_center_x

    else:
        # --- 61" DOUBLE VANITY: 4 INDEPENDENT DRAWERS ---
        print("  Configuring 61\" 4-Drawer Double Vanity Architecture...")

        # 8.1 Add Carcass Center Vertical Divider at X = 0 (18mm thick)
        divider_mesh = bpy.data.meshes.new("Cabinet_Center_Divider_Mesh")
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        # Scale: width=18mm, depth=460.4mm, height=733.8mm
        bmesh.ops.scale(bm, vec=(18.0, 460.4, 733.8), verts=bm.verts)
        bmesh.ops.translate(bm, vec=(0.0, 11.1, 471.7), verts=bm.verts)
        bm.to_mesh(divider_mesh)
        bm.free()

        divider_obj = bpy.data.objects.new("Cabinet_Center_Divider", divider_mesh)
        evergreen_mat = bpy.data.materials.get("MAT_Evergreen_Fog")
        if evergreen_mat:
            divider_mesh.materials.append(evergreen_mat)
        bpy.context.collection.objects.link(divider_obj)

        vanity_root_temp = bpy.data.objects.get("EVERDALE_31_VANITY")
        if vanity_root_temp:
            divider_obj.parent = vanity_root_temp

        # 8.2 Top False Drawer Fronts: Split into Left and Right (NO handles)
        fdf = bpy.data.objects.get("False_Drawer_Front")
        if fdf:
            fdf_mesh_r = fdf.data.copy()
            # Left false drawer centered at X = -381.0 mm (spans [-758, -4])
            for v in fdf.data.vertices:
                v.co.x -= basin_offset
            fdf.name = "False_Drawer_Left"

            # Right false drawer centered at X = +381.0 mm (spans [+4, +758])
            for v in fdf_mesh_r.vertices:
                v.co.x += basin_offset
            fdf_r = bpy.data.objects.new("False_Drawer_Right", fdf_mesh_r)
            if evergreen_mat:
                fdf_mesh_r.materials.append(evergreen_mat)
            bpy.context.collection.objects.link(fdf_r)
            if vanity_root_temp:
                fdf_r.parent = vanity_root_temp

        # 8.3 Duplicate Functional Drawers to create 4 Independent Drawers:
        # Left Bank:
        #   Upper: Drawer_L1_Root at X = -381.0
        #   Lower: Drawer_L2_Root at X = -381.0
        # Right Bank:
        #   Upper: Drawer_R1_Root at X = +381.0
        #   Lower: Drawer_R2_Root at X = +381.0
        d1 = bpy.data.objects.get("Drawer_01_Root")
        d2 = bpy.data.objects.get("Drawer_02_Root")

        # Duplicate d1 -> Drawer_R1_Root
        r1 = duplicate_drawer_hierarchy(d1, "Drawer_R1_Root", basin_offset)
        d1.name = "Drawer_L1_Root"
        d1.location.x = -basin_offset

        # Duplicate d2 -> Drawer_R2_Root
        r2 = duplicate_drawer_hierarchy(d2, "Drawer_R2_Root", basin_offset)
        d2.name = "Drawer_L2_Root"
        d2.location.x = -basin_offset

        # Rename tracks on the 4 drawer roots for distinct glTF animation targeting
        def setup_drawer_tracks(obj, prefix):
            if obj.animation_data:
                for t in obj.animation_data.nla_tracks:
                    if 'Open' in t.name:
                        t.name = f"{prefix}_Open"
                    elif 'Close' in t.name:
                        t.name = f"{prefix}_Close"

        setup_drawer_tracks(d1, "Drawer_L1")
        setup_drawer_tracks(d2, "Drawer_L2")
        setup_drawer_tracks(r1, "Drawer_R1")
        setup_drawer_tracks(r2, "Drawer_R2")

        # 8.4 Duplicate and position Drawer Slides for 4 drawers
        # Slide positions:
        # Outer left: -762 + 18.5 = -743.5 mm
        # Center left: -9.5 mm
        # Center right: +9.5 mm
        # Outer right: +743.5 mm
        s1_l = bpy.data.objects.get("Drawer01_Slide_Left")
        s1_r = bpy.data.objects.get("Drawer01_Slide_Right")
        s2_l = bpy.data.objects.get("Drawer02_Slide_Left")
        s2_r = bpy.data.objects.get("Drawer02_Slide_Right")

        # Move left bank slides
        if s1_l:
            for v in s1_l.data.vertices:
                v.co.x -= delta_base
            s1_l.data.update()
        if s1_r:
            for v in s1_r.data.vertices:
                v.co.x = -9.5 + (v.co.x - 362.5)
            s1_r.data.update()

        if s2_l:
            for v in s2_l.data.vertices:
                v.co.x -= delta_base
            s2_l.data.update()
        if s2_r:
            for v in s2_r.data.vertices:
                v.co.x = -9.5 + (v.co.x - 362.5)
            s2_r.data.update()

        # Duplicate slides for right bank
        for s_obj, name_r in [
            (s1_l, "Drawer01_Slide_Right_Outer"),
            (s1_r, "Drawer01_Slide_Right_Inner"),
            (s2_l, "Drawer02_Slide_Right_Outer"),
            (s2_r, "Drawer02_Slide_Right_Inner"),
        ]:
            if s_obj:
                new_s = s_obj.copy()
                new_s.name = name_r
                new_s.data = s_obj.data.copy()
                for v in new_s.data.vertices:
                    v.co.x = -v.co.x # Mirror to right side
                bpy.context.collection.objects.link(new_s)
                if vanity_root_temp:
                    new_s.parent = vanity_root_temp

    # 9. Update Root Object Name
    root = bpy.data.objects.get("EVERDALE_31_VANITY")
    new_root_name = f"EVERDALE_{spec['id']}_VANITY"
    if root:
        root.name = new_root_name

    # 10. Verify Dimensions
    print("Verifying Dimensions:")
    print(f"  Base Cabinet Width: {base_w} mm ({base_w/25.4:.1f}\")")
    print(f"  Countertop Width:   {top_w} mm ({top_w/25.4:.1f}\")")
    if stone_top:
        st_coords = [v.co for v in stone_top.data.vertices]
        print(f"  Stone_Top X range:  [{min(c.x for c in st_coords):.1f}, {max(c.x for c in st_coords):.1f}]")
    if sink:
        sk_coords = [v.co for v in sink.data.vertices]
        print(f"  Sink X range:       [{min(c.x for c in sk_coords):.1f}, {max(c.x for c in sk_coords):.1f}]")

    # 11. Save Variant .blend File
    blend_out = os.path.join(EXPORT_DIR, f"{spec['name']}_Final.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_out)
    print(f"Saved checkpoint: {blend_out}")

    # 12. Select All Vanity Objects for Clean GLB Export
    bpy.ops.object.select_all(action='DESELECT')
    export_count = 0
    vanity_root = bpy.data.objects.get(new_root_name)
    if vanity_root:
        vanity_root.select_set(True)
        bpy.context.view_layer.objects.active = vanity_root

    for obj in bpy.data.objects:
        if obj.type in {'CAMERA', 'LIGHT'}:
            continue
        obj.select_set(True)
        export_count += 1

    print(f"Selected {export_count} vanity objects for GLB export (Active: {bpy.context.view_layer.objects.active.name})")

    # 13. Export Production GLB with NLA Soft-Close Tracks
    win = bpy.context.window_manager.windows[0]
    area_3d = None
    region_3d = None
    for area in win.screen.areas:
        if area.type == 'VIEW_3D':
            area_3d = area
            for region in area.regions:
                if region.type == 'WINDOW':
                    region_3d = region
                    break
            break

    glb_out = os.path.join(EXPORT_DIR, spec["glb_filename"])
    with bpy.context.temp_override(window=win, screen=win.screen, area=area_3d, region=region_3d):
        bpy.ops.export_scene.gltf(
            filepath=glb_out,
            export_format='GLB',
            use_selection=True,
            export_apply=True,
            export_animations=True,
            export_animation_mode='NLA_TRACKS',
            export_materials='EXPORT',
            export_normals=True,
            export_texcoords=True,
            export_yup=True,
        )
    glb_size = os.path.getsize(glb_out)
    print(f"Production GLB exported: {glb_out} ({glb_size:,} bytes)")

    # 14. Deploy to Web Configurator public/models
    web_target = os.path.join(WEB_MODELS_DIR, spec["glb_filename"])
    shutil.copy2(glb_out, web_target)
    print(f"Deployed to Web Configurator: {web_target} ({os.path.getsize(web_target):,} bytes)")

def main():
    print("Starting Everdale Vanity Portfolio Multi-Size Generator (v2)...")
    for spec in SIZES:
        build_size_variant(spec)
    print("\n=======================================================")
    print("ALL EVERDALE SIZES SUCCESSFULLY GENERATED AND DEPLOYED!")
    print("=======================================================")

if __name__ == "__main__":
    main()

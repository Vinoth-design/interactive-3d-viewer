import sys
import traceback
import os

log_file = r"d:\Blender\Vanity\interactive 3d model viewer\render_log.txt"

def log(msg):
    with open(log_file, "a") as f:
        f.write(msg + "\n")
    print(msg)

with open(log_file, "w") as f:
    f.write("Starting Cycles render script...\n")

try:
    import bpy

    BASE_DIR = r"d:\Blender\Vanity\interactive 3d model viewer"
    BLEND_FILE = os.path.join(BASE_DIR, "assets", "blender", "vanities", "Everdale_Vanity_31_v001.blend")
    OUT_DIR = os.path.join(BASE_DIR, "assets", "renders", "vanities", "605-9531")
    os.makedirs(OUT_DIR, exist_ok=True)

    log(f"Opening {BLEND_FILE}...")
    bpy.ops.wm.open_mainfile(filepath=BLEND_FILE)
    scene = bpy.context.scene

    scene.render.engine = 'CYCLES'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'OPTIX'
        for d in prefs.devices:
            d.use = True
        scene.cycles.device = 'GPU'
        log("Enabled OPTIX GPU rendering on RTX 3050.")
    except Exception as e:
        log(f"GPU config fallback: {e}")
        scene.cycles.device = 'CPU'

    # Set practical sample rate for fast high quality delivery
    scene.cycles.samples = 64
    scene.cycles.preview_samples = 16
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 800
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

    render_jobs = [
        {"name": "lifestyle_bathroom", "cam": "Cam_Architectural_Main", "show_env": True, "drawers_open": False},
        {"name": "hero_three_quarter", "cam": "Cam_01_Front_ThreeQuarter", "show_env": False, "drawers_open": False},
        {"name": "front_view", "cam": "Cam_02_Front_Orthographic", "show_env": False, "drawers_open": False},
        {"name": "side_view", "cam": "Cam_Side", "show_env": False, "drawers_open": False},
        {"name": "countertop_detail", "cam": "Cam_04_Sink_Closeup", "show_env": False, "drawers_open": False},
        {"name": "hardware_detail", "cam": "Cam_08_Handle_Detail", "show_env": False, "drawers_open": False},
        {"name": "drawer_open", "cam": "Cam_Trays_Angle", "show_env": False, "drawers_open": True},
        {"name": "hero_studio", "cam": "Cam_Perspective", "show_env": False, "drawers_open": False}
    ]

    env_collections = ['BATHROOM_ARCHITECTURE', 'BATHROOM_PROPS']

    for job in render_jobs:
        cam_name = job["cam"]
        out_png = os.path.join(OUT_DIR, f"{job['name']}.png")
        
        log(f"Rendering {job['name']} (cam={cam_name})...")
        cam_obj = bpy.data.objects.get(cam_name)
        if not cam_obj:
            log(f"Camera {cam_name} not found! Skipping.")
            continue
        scene.camera = cam_obj
        
        for col_name in env_collections:
            c = bpy.data.collections.get(col_name)
            if c:
                c.hide_render = not job["show_env"]
                
        scene.render.film_transparent = not job["show_env"]
            
        d01 = bpy.data.objects.get("Drawer_01_Root")
        d02 = bpy.data.objects.get("Drawer_02_Root")
        if job["drawers_open"]:
            if d01: d01.location.y = -300.0
            if d02: d02.location.y = -320.0
        else:
            if d01: d01.location.y = 0.0
            if d02: d02.location.y = 0.0
            
        scene.render.filepath = out_png
        bpy.ops.render.render(write_still=True)
        log(f"Rendered: {out_png}")

    log("ALL RENDERS COMPLETED SUCCESSFULLY.")

except Exception as e:
    log(f"FATAL ERROR: {e}")
    with open(log_file, "a") as f:
        traceback.print_exc(file=f)

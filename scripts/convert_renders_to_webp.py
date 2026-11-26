import os
from PIL import Image

RENDER_DIR = r"d:\Blender\Vanity\interactive 3d model viewer\assets\renders\vanities\605-9531"

if os.path.exists(RENDER_DIR):
    for f in os.listdir(RENDER_DIR):
        if f.endswith(".png"):
            png_path = os.path.join(RENDER_DIR, f)
            webp_path = os.path.join(RENDER_DIR, f.replace(".png", ".webp"))
            try:
                img = Image.open(png_path)
                img.save(webp_path, "WEBP", quality=90, method=6)
                kb_orig = os.path.getsize(png_path) // 1024
                kb_webp = os.path.getsize(webp_path) // 1024
                print(f"Converted {f} ({kb_orig} KB -> {kb_webp} KB WebP)")
            except Exception as e:
                print(f"Failed {f}: {e}")

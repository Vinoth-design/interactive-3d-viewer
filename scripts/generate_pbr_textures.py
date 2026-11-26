import os
import math
import numpy as np
from PIL import Image, ImageFilter

OUT_DIR = r"d:\Blender\Vanity\interactive 3d model viewer\assets\textures"
os.makedirs(OUT_DIR, exist_ok=True)

def save_img(arr, filename):
    p = os.path.join(OUT_DIR, filename)
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    img.save(p, optimize=True)
    print(f"Generated {filename} ({arr.shape[1]}x{arr.shape[0]})")

def gaussian_blur(arr, radius):
    norm = ((arr - arr.min()) / (arr.max() - arr.min() + 1e-6) * 255.0).astype(np.uint8)
    img = Image.fromarray(norm, mode='L')
    blurred = img.filter(ImageFilter.GaussianBlur(radius=radius))
    return np.array(blurred).astype(np.float32) / 255.0

def height_to_normal(height, strength=2.5):
    h = height.astype(np.float32) / 255.0
    dx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5 * strength
    dy = (np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)) * 0.5 * strength
    dz = np.ones_like(dx)
    
    length = np.sqrt(dx*dx + dy*dy + dz*dz)
    nx = (dx / length) * 0.5 + 0.5
    ny = (-dy / length) * 0.5 + 0.5
    nz = (dz / length) * 0.5 + 0.5
    
    normal = np.stack([nx * 255, ny * 255, nz * 255], axis=-1)
    return normal

print("Generating PBR texture sets...")

SIZE = 1024
np.random.seed(42)

# ==========================================
# 1. SCANDINAVIAN NATURAL OAK
# ==========================================
y, x = np.mgrid[0:SIZE, 0:SIZE]
grain = np.sin(x * 0.05 + np.sin(y * 0.008) * 15.0) * 0.5 + 0.5
noise = np.random.normal(0, 1, (SIZE, SIZE))
fiber = np.sin(x * 0.3 + np.sin(y * 0.02) * 5.0) * 0.1
wood_pattern = grain * 0.7 + fiber * 0.2 + (noise * 0.05)
wood_pattern = np.clip(wood_pattern, 0, 1)

oak_r = 175 + wood_pattern * 35 - 15
oak_g = 142 + wood_pattern * 30 - 15
oak_b = 105 + wood_pattern * 25 - 15
oak_diffuse = np.stack([oak_r, oak_g, oak_b], axis=-1)
save_img(oak_diffuse, "oak_diffuse.png")

oak_roughness = 90 + (1.0 - wood_pattern) * 45
save_img(oak_roughness, "oak_roughness.png")

oak_normal = height_to_normal(wood_pattern * 255, strength=2.0)
save_img(oak_normal, "oak_normal.png")

# ==========================================
# 2. ARCHITECTURAL WALNUT
# ==========================================
walnut_grain = np.sin(x * 0.035 + np.sin(y * 0.005) * 22.0) * 0.5 + 0.5
walnut_pattern = walnut_grain * 0.75 + fiber * 0.15 + (noise * 0.05)
walnut_pattern = np.clip(walnut_pattern, 0, 1)

walnut_r = 75 + walnut_pattern * 25 - 15
walnut_g = 52 + walnut_pattern * 20 - 15
walnut_b = 38 + walnut_pattern * 15 - 10
walnut_diffuse = np.stack([walnut_r, walnut_g, walnut_b], axis=-1)
save_img(walnut_diffuse, "walnut_diffuse.png")

walnut_roughness = 85 + (1.0 - walnut_pattern) * 40
save_img(walnut_roughness, "walnut_roughness.png")

walnut_normal = height_to_normal(walnut_pattern * 255, strength=1.8)
save_img(walnut_normal, "walnut_normal.png")

# ==========================================
# 3. CARRARA MARBLE
# ==========================================
v_noise = np.random.normal(0, 1, (SIZE, SIZE))
v_smooth = gaussian_blur(v_noise, radius=18)
v_fine = gaussian_blur(v_noise, radius=6)
vein_turb = np.sin(x * 0.012 + y * 0.008 + v_smooth * 8.0 + v_fine * 2.0)
veins = np.exp(-((vein_turb - 0.2) ** 2) / 0.03)

m_base_r = 240 - veins * 65
m_base_g = 240 - veins * 62
m_base_b = 238 - veins * 55
marble_diffuse = np.stack([m_base_r, m_base_g, m_base_b], axis=-1)
save_img(marble_diffuse, "carrara_marble_diffuse.png")

marble_roughness = 35 + veins * 25
save_img(marble_roughness, "carrara_marble_roughness.png")

marble_normal = height_to_normal(veins * 180, strength=0.8)
save_img(marble_normal, "carrara_marble_normal.png")

# ==========================================
# 4. ENGINEERED WHITE QUARTZ
# ==========================================
q_noise = np.random.uniform(0, 1, (SIZE, SIZE))
q_specks = (q_noise > 0.96).astype(np.float32) * 0.8 + (q_noise < 0.03).astype(np.float32) * 0.5
q_soft = gaussian_blur(q_specks, radius=1)

q_r = 228 + q_soft * 18 - (q_noise < 0.01) * 35
q_g = 228 + q_soft * 18 - (q_noise < 0.01) * 35
q_b = 226 + q_soft * 18 - (q_noise < 0.01) * 30
quartz_diffuse = np.stack([q_r, q_g, q_b], axis=-1)
save_img(quartz_diffuse, "white_quartz_diffuse.png")

quartz_roughness = 45 + q_soft * 15
save_img(quartz_roughness, "white_quartz_roughness.png")

quartz_normal = height_to_normal(q_soft * 200, strength=1.2)
save_img(quartz_normal, "white_quartz_normal.png")

# ==========================================
# 5. HONED BLACK GRANITE
# ==========================================
g_noise = np.random.normal(0, 1, (SIZE, SIZE))
g_micro = gaussian_blur(g_noise, radius=2)
g_macro = gaussian_blur(g_noise, radius=12)

granite_val = 26 + (g_macro * 8) + (g_micro * 10)
granite_diffuse = np.stack([granite_val, granite_val + 1, granite_val + 2], axis=-1)
save_img(granite_diffuse, "black_granite_diffuse.png")

granite_roughness = 55 + (g_micro * 20)
save_img(granite_roughness, "black_granite_roughness.png")

granite_normal = height_to_normal(g_micro * 180, strength=1.5)
save_img(granite_normal, "black_granite_normal.png")

# ==========================================
# 6. BRUSHED METAL NORMAL
# ==========================================
brush_noise = np.random.normal(0, 1, (SIZE, 1))
brush_lines = np.repeat(brush_noise, SIZE, axis=1)
brush_smooth = gaussian_blur(brush_lines, radius=1)
metal_normal = height_to_normal(brush_smooth * 120, strength=3.0)
save_img(metal_normal, "brushed_metal_normal.png")

print("ALL PBR TEXTURES GENERATED SUCCESSFULLY.")

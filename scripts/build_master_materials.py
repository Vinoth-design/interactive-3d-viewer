import bpy
import os

BASE_DIR = r"d:\Blender\Vanity\interactive 3d model viewer"
TEX_DIR = os.path.join(BASE_DIR, "assets", "textures")
OUT_BLEND = os.path.join(BASE_DIR, "assets", "blender", "shared-materials", "Everdale_Master_Materials.blend")

# Clear existing data
bpy.ops.wm.read_factory_settings(use_empty=True)

def create_pbr_material(name, base_color=None, roughness=0.5, metallic=0.0,
                        diffuse_tex=None, roughness_tex=None, normal_tex=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (400, 0)
    
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    if base_color:
        bsdf.inputs['Base Color'].default_value = (base_color[0], base_color[1], base_color[2], 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    
    # Texture nodes
    x_offset = -400
    if diffuse_tex and os.path.exists(os.path.join(TEX_DIR, diffuse_tex)):
        tex_node = nodes.new(type='ShaderNodeTexImage')
        tex_node.location = (x_offset, 200)
        img = bpy.data.images.load(os.path.join(TEX_DIR, diffuse_tex))
        tex_node.image = img
        links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])
        
    if roughness_tex and os.path.exists(os.path.join(TEX_DIR, roughness_tex)):
        r_node = nodes.new(type='ShaderNodeTexImage')
        r_node.location = (x_offset, -100)
        img = bpy.data.images.load(os.path.join(TEX_DIR, roughness_tex))
        img.colorspace_settings.name = 'Non-Color'
        r_node.image = img
        links.new(r_node.outputs['Color'], bsdf.inputs['Roughness'])
        
    if normal_tex and os.path.exists(os.path.join(TEX_DIR, normal_tex)):
        n_node = nodes.new(type='ShaderNodeTexImage')
        n_node.location = (x_offset, -400)
        norm_map = nodes.new(type='ShaderNodeNormalMap')
        norm_map.location = (-150, -400)
        img = bpy.data.images.load(os.path.join(TEX_DIR, normal_tex))
        img.colorspace_settings.name = 'Non-Color'
        n_node.image = img
        links.new(n_node.outputs['Color'], norm_map.inputs['Color'])
        links.new(norm_map.outputs['Normal'], bsdf.inputs['Normal'])
        
    return mat

print("Creating Master Materials...")

# Cabinets
create_pbr_material("MAT_Cabinet_Evergreen_Fog", base_color=[0.27, 0.28, 0.21], roughness=0.42, metallic=0.0)
create_pbr_material("MAT_Cabinet_White_Matte", base_color=[0.92, 0.92, 0.92], roughness=0.45, metallic=0.0)
create_pbr_material("MAT_Cabinet_Natural_Oak", diffuse_tex="oak_diffuse.png", roughness_tex="oak_roughness.png", normal_tex="oak_normal.png")
create_pbr_material("MAT_Cabinet_Walnut", diffuse_tex="walnut_diffuse.png", roughness_tex="walnut_roughness.png", normal_tex="walnut_normal.png")
create_pbr_material("MAT_Cabinet_Charcoal", base_color=[0.12, 0.12, 0.13], roughness=0.48, metallic=0.0)

# Countertops
create_pbr_material("MAT_Countertop_White_Quartz", diffuse_tex="white_quartz_diffuse.png", roughness_tex="white_quartz_roughness.png", normal_tex="white_quartz_normal.png")
create_pbr_material("MAT_Countertop_Carrara_Marble", diffuse_tex="carrara_marble_diffuse.png", roughness_tex="carrara_marble_roughness.png", normal_tex="carrara_marble_normal.png")
create_pbr_material("MAT_Countertop_Black_Granite", diffuse_tex="black_granite_diffuse.png", roughness_tex="black_granite_roughness.png", normal_tex="black_granite_normal.png")
create_pbr_material("MAT_Countertop_Concrete", base_color=[0.62, 0.60, 0.58], roughness=0.42, metallic=0.0)
create_pbr_material("MAT_Countertop_Calacatta_Gold", base_color=[0.93, 0.91, 0.88], roughness=0.16, metallic=0.0)

# Hardware
create_pbr_material("MAT_Hardware_Antique_Brass", base_color=[0.55, 0.38, 0.18], roughness=0.32, metallic=0.92, normal_tex="brushed_metal_normal.png")
create_pbr_material("MAT_Hardware_Matte_Black", base_color=[0.05, 0.05, 0.05], roughness=0.50, metallic=0.25)
create_pbr_material("MAT_Hardware_Brushed_Nickel", base_color=[0.72, 0.70, 0.68], roughness=0.28, metallic=0.95, normal_tex="brushed_metal_normal.png")
create_pbr_material("MAT_Hardware_Chrome", base_color=[0.92, 0.92, 0.94], roughness=0.08, metallic=0.98)

# Sink & Internals
create_pbr_material("MAT_Sink_White_Porcelain", base_color=[0.95, 0.94, 0.92], roughness=0.12, metallic=0.0)
create_pbr_material("MAT_Drawer_Interior", base_color=[0.68, 0.60, 0.48], roughness=0.48, metallic=0.0)
create_pbr_material("MAT_Slide_Steel", base_color=[0.72, 0.75, 0.78], roughness=0.30, metallic=0.88)

# Save blend file
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
print(f"Master materials library saved to: {OUT_BLEND}")
with open("materials_built.txt", "w") as f:
    f.write(f"Created {len(bpy.data.materials)} materials in {OUT_BLEND}\n")
    for m in bpy.data.materials:
        f.write(f"  {m.name}\n")

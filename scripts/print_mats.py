import json
with open("material_inspection.json") as f:
    d = json.load(f)
for k, v in d.items():
    print(f"{k:<30} BaseColor={[round(x, 2) for x in v['base_color'][:3]]} Roughness={v['roughness']} Metallic={v['metallic']}")

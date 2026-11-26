import json

with open("audit_blender_models_report.json") as f:
    data = json.load(f)

print("=" * 80)
print("AUDIT SUMMARY OF ALL 5 BLENDER MODELS")
print("=" * 80)

for name, d in data.items():
    print(f"\nModel: {name}")
    print(f"  Units: {d['unit_info']}")
    print(f"  Vanity Bounding Box (W x D x H mm): {d['vanity_bounding_box_mm']}")
    print(f"  Collections ({len(d['collections'])}): {d['collections']}")
    print(f"  Total Objects: {len(d['objects'])}")
    print(f"  Materials ({len(d['materials'])}): {d['materials']}")
    print(f"  Actions: {list(d['actions'].keys())}")
    
    objs = d['objects']
    print("  Key Component Dimensions (W x D x H mm):")
    for comp in ['Stone_Top', 'Backsplash', 'Integrated_Sink', 'Cabinet_Bottom', 'Cabinet_Side_Left', 
                 'Drawer01_Front', 'Drawer02_Front', 'Door_Left', 'Door_Right', 'Leg_FL']:
        if comp in objs and 'dimensions_mm' in objs[comp]:
            print(f"    {comp:<20}: {objs[comp]['dimensions_mm']}")
        elif comp in objs:
            print(f"    {comp:<20}: (non-mesh or no dims, type={objs[comp]['type']})")

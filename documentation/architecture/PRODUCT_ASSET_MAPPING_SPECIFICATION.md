# Everdale Architecture: Product Asset Mapping Specification
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Configurator Asset Registry, Multi-Category Schema (Vanities & Kitchen Modules)

---

## 1. Architectural Vision

This specification defines the contract between the e-commerce catalog data layer and the 3D rendering engines (Three.js and offline Blender Cycles). Rather than embedding hardcoded mesh names, material slots, or animation rules inside `VanitySceneManager.js`, all 3D asset bindings are registered in a declarative, machine-readable asset manifest.

This architecture enables:
1. Seamless addition of new vanity sizes without code changes.
2. Direct onboarding of **Kitchen Base & Wall Cabinets** in Phase 03 through category-specific scene adapters (`ProductSceneAdapter`).
3. Automated offline render farm batch ingestion.

---

## 2. Universal Product Asset Schema (JSON)

```json
{
  "$schema": "https://everdale.com/schemas/v2/product-asset-manifest.json",
  "productId": "everdale-vanity",
  "productFamily": "bathroom-vanities",
  "adapterType": "VanitySceneAdapter",
  "variants": [
    {
      "variantId": "vanity-24",
      "sku": "605-9524",
      "name": "Everdale 24\" Single Vanity",
      "nominalDimensions": { "widthIn": 24, "heightIn": 34, "depthIn": 19 },
      "model": {
        "format": "glb",
        "path": "/models/Everdale_24_Vanity_Interactive.glb",
        "fileSizeBytes": 123812,
        "hash": "sha256-a1b2c3d4..."
      },
      "slots": {
        "cabinet": {
          "type": "finish",
          "targetMeshes": [
            "Cabinet_Side_Left", "Cabinet_Side_Right", "Cabinet_Bottom",
            "Cabinet_Back", "Cabinet_Top_Support", "Cabinet_Internal_Support",
            "False_Drawer_Front", "Drawer01_Front", "Drawer02_Front",
            "Leg_FL", "Leg_FR", "Leg_BL", "Leg_BR"
          ]
        },
        "countertop": {
          "type": "stone",
          "targetMeshes": ["Stone_Top", "Backsplash"]
        },
        "sink": {
          "type": "ceramic",
          "targetMeshes": ["Integrated_Sink"]
        },
        "hardware": {
          "type": "metal",
          "targetMeshes": ["Handle_Drawer_01", "Handle_Drawer_02"]
        },
        "drawer_interior": {
          "type": "wood",
          "targetMeshes": [
            "Drawer01_Left", "Drawer01_Right", "Drawer01_Back", "Drawer01_Bottom",
            "Drawer02_Left", "Drawer02_Right", "Drawer02_Back", "Drawer02_Bottom",
            "Tray01_Bottom", "Tray01_Left", "Tray01_Right", "Tray01_Front", "Tray01_Back",
            "Tray02_Bottom", "Tray02_Left", "Tray02_Right", "Tray02_Front", "Tray02_Back"
          ]
        }
      },
      "interactions": {
        "drawers": [
          {
            "id": "top_drawer",
            "rootNode": "Drawer_01_Root",
            "openAction": "Drawer01_Open",
            "closeAction": "Drawer01_Close",
            "travelMeters": 0.30
          },
          {
            "id": "bottom_drawer",
            "rootNode": "Drawer_02_Root",
            "openAction": "Drawer02_Open",
            "closeAction": "Drawer02_Close",
            "travelMeters": 0.32
          }
        ],
        "doors": []
      }
    }
  ]
}
```

---

## 3. Extension to Kitchen Cabinetry

Future kitchen modules (e.g. `everdale-kitchen-base-36` or `everdale-kitchen-pantry-tall`) define their own independent mesh bindings and kinetic interactions:

```json
{
  "productId": "everdale-kitchen-base",
  "productFamily": "kitchen-cabinetry",
  "adapterType": "KitchenSceneAdapter",
  "variants": [
    {
      "variantId": "base-36-double-door",
      "sku": "KB-36-2D2D",
      "model": {
        "format": "glb",
        "path": "/models/kitchen/Everdale_Base_36_Interactive.glb"
      },
      "slots": {
        "carcass": { "targetMeshes": ["Base_Carcass_36", "Toe_Kick_36"] },
        "fronts": { "targetMeshes": ["Door_Left_Front", "Door_Right_Front", "Drawer_Top_Front"] },
        "hardware": { "targetMeshes": ["Hardware_Pull_L", "Hardware_Pull_R", "Hardware_Pull_Drawer"] }
      },
      "interactions": {
        "drawers": [
          { "rootNode": "Kitchen_Drawer_Top_Root", "travelMeters": 0.45 }
        ],
        "doors": [
          { "rootNode": "Kitchen_Door_Left_Root", "hingeAxis": "Y", "sweepDegrees": -90 },
          { "rootNode": "Kitchen_Door_Right_Root", "hingeAxis": "Y", "sweepDegrees": 90 }
        ]
      }
    }
  ]
}
```

---

## 4. Implementation in Three.js Engine

The scene manager delegates mesh traversal and interaction setup to the adapter registered for the active product family:

```javascript
class ProductSceneAdapter {
  constructor(manifest) {
    this.manifest = manifest;
  }
  
  bindModel(sceneRoot) {
    const slotCache = {};
    for (const [slotKey, slotDef] of Object.entries(this.manifest.slots)) {
      slotCache[slotKey] = [];
      sceneRoot.traverse((node) => {
        if (slotDef.targetMeshes.includes(node.name)) {
          slotCache[slotKey].push(node);
        }
      });
    }
    return slotCache;
  }
}
```
This decouples the configurator core from any single furniture category.

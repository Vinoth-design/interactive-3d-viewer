# Model Hierarchy & Semantic Node Specification (Phase 01)

**Document Version:** 1.0.0  
**Status:** Approved Standard  
**Author:** Senior 3D Graphics Engineer & Technical Lead  
**Scope:** Everdale Vanities, Future Kitchen Cabinets, and Multi-Category Product Lines  
**Date:** November 2026  

---

## 1. Purpose & Semantic Architecture

In interactive 3D commerce, CAD/Blender authors often use product-specific or internal naming conventions (e.g. `Drawer_01_Root`, `Drawer_L1_Root`, `Stone_Top`, `Integrated_Sink`). If frontend 3D managers hardcode these names directly into application logic, introducing new categories like **kitchen base cabinets**, **pantries**, or **linen towers** requires sprawling conditional logic.

This specification establishes an abstract **Semantic Role Mapping Architecture**. 
- The 3D engine interacts only with standard semantic roles (e.g. `drawers`, `countertop`, `hardware`, `sink`).
- Each product model provides a declarative **Semantic Role Map** translating abstract roles into specific glTF node names.

---

## 2. Standard Semantic Object Roles

| Semantic Role | Required / Optional | Description | Typical Functional Interactions |
| :--- | :---: | :--- | :--- |
| `root` | **Required** | The top-level scene graph container | Overall positioning, rotation, scaling |
| `cabinet_body` | **Required** | Outer carcass (sides, back, bottom, supports) | Paint finish, wood stain, laminate application |
| `cabinet_fronts` | **Required** | Moving drawer faces and false drawer panels | Paint finish application, bevel highlights |
| `legs` | Optional | Support legs or plinth toe-kick | Wood/metal stain application, grounding |
| `countertop` | Optional | Surface slab (stone, quartz, butcher block) | Texture swapping (marble, quartz), roughness |
| `backsplash` | Optional | Vertical rear water barrier | Toggle visibility (`included` vs `none`) |
| `sink` | Optional | Basin or undermount sink bowl | Material isolation (ceramic white), cutouts |
| `faucet` | Optional | Water fixture spout, handles, pop-up trim | Procedural fixture placement, finish pairing |
| `hardware` | Optional | Cabinet pulls, knobs, edge pulls | Metalness/roughness updates, position mapping |
| `drawers` | Optional | Array of moving drawer roots | Kinematic animation trigger, raycast hit detection |
| `doors` | Optional | Array of hinged door roots | Hinge rotation kinematics (kitchen cabinets) |
| `accessories` | Optional | Removable trays, cutlery dividers, spice racks | Visibility toggle, positioning |

---

## 3. Product Mapping Implementations

### 3.1 Single-Basin Bathroom Vanities (24″, 31″, 37″, 49″)
```json
{
  "productId": "everdale-vanity-single",
  "root": "EVERDALE_{width}_VANITY",
  "roles": {
    "cabinet_body": [
      "Cabinet_Side_Left",
      "Cabinet_Side_Right",
      "Cabinet_Back",
      "Cabinet_Bottom",
      "Cabinet_Top_Support",
      "Cabinet_Internal_Support"
    ],
    "cabinet_fronts": [
      "False_Drawer_Front",
      "Drawer01_Front",
      "Drawer02_Front"
    ],
    "legs": ["Leg_FL", "Leg_FR", "Leg_BL", "Leg_BR"],
    "countertop": ["Stone_Top"],
    "backsplash": ["Backsplash"],
    "sink": ["Integrated_Sink"],
    "hardware": ["Handle_Drawer_01", "Handle_Drawer_02"],
    "drawers": [
      {
        "id": "d1",
        "label": "Upper Drawer",
        "rootNode": "Drawer_01_Root",
        "openAction": "Drawer01_Open",
        "closeAction": "Drawer01_Close",
        "restPosition": [0, 523.5, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer01_Front", "Handle_Drawer_01"]
      },
      {
        "id": "d2",
        "label": "Lower Drawer (with Trays)",
        "rootNode": "Drawer_02_Root",
        "openAction": "Drawer02_Open",
        "closeAction": "Drawer02_Close",
        "restPosition": [0, 265.0, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer02_Front", "Handle_Drawer_02"]
      }
    ],
    "accessories": [
      { "id": "tray1", "node": "Accessory_Tray_01" },
      { "id": "tray2", "node": "Accessory_Tray_02" }
    ]
  }
}
```

### 3.2 Double-Basin Bathroom Vanity (61″)
```json
{
  "productId": "everdale-vanity-61-double",
  "root": "EVERDALE_61_VANITY",
  "roles": {
    "cabinet_body": [
      "Cabinet_Side_Left",
      "Cabinet_Side_Right",
      "Cabinet_Center_Divider",
      "Cabinet_Back",
      "Cabinet_Bottom",
      "Cabinet_Top_Support",
      "Cabinet_Internal_Support"
    ],
    "cabinet_fronts": [
      "False_Drawer_Left",
      "False_Drawer_Right",
      "Drawer01_Front",
      "Drawer01_Front_R",
      "Drawer02_Front",
      "Drawer02_Front_R"
    ],
    "legs": ["Leg_FL", "Leg_FR", "Leg_BL", "Leg_BR"],
    "countertop": ["Stone_Top"],
    "backsplash": ["Backsplash"],
    "sink": ["Integrated_Sink", "Integrated_Sink_Right"],
    "hardware": [
      "Handle_Drawer_01",
      "Handle_Drawer_01_R",
      "Handle_Drawer_02",
      "Handle_Drawer_02_R"
    ],
    "drawers": [
      {
        "id": "L1",
        "label": "Upper Left Drawer",
        "rootNode": "Drawer_L1_Root",
        "openAction": "Drawer_L1_Open",
        "closeAction": "Drawer_L1_Close",
        "restPosition": [-381.0, 523.5, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer01_Front", "Handle_Drawer_01"]
      },
      {
        "id": "L2",
        "label": "Lower Left Drawer",
        "rootNode": "Drawer_L2_Root",
        "openAction": "Drawer_L2_Open",
        "closeAction": "Drawer_L2_Close",
        "restPosition": [-381.0, 265.0, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer02_Front", "Handle_Drawer_02"]
      },
      {
        "id": "R1",
        "label": "Upper Right Drawer",
        "rootNode": "Drawer_R1_Root",
        "openAction": "Drawer_R1_Open",
        "closeAction": "Drawer_R1_Close",
        "restPosition": [381.0, 523.5, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer01_Front_R", "Handle_Drawer_01_R"]
      },
      {
        "id": "R2",
        "label": "Lower Right Drawer",
        "rootNode": "Drawer_R2_Root",
        "openAction": "Drawer_R2_Open",
        "closeAction": "Drawer_R2_Close",
        "restPosition": [381.0, 265.0, 238.075],
        "travelMm": 275.0,
        "hitMeshes": ["Drawer02_Front_R", "Handle_Drawer_02_R"]
      }
    ],
    "accessories": [
      { "id": "tray1_L", "node": "Accessory_Tray_01" },
      { "id": "tray2_L", "node": "Accessory_Tray_02" },
      { "id": "tray1_R", "node": "Accessory_Tray_01_R" },
      { "id": "tray2_R", "node": "Accessory_Tray_02_R" }
    ]
  }
}
```

### 3.3 Future Kitchen Base Cabinet Specification (Conceptual Target)
```json
{
  "productId": "everdale-kitchen-base-36",
  "root": "KITCHEN_BASE_36",
  "roles": {
    "cabinet_body": ["Box_Left", "Box_Right", "Box_Back", "Box_Floor", "Toe_Kick"],
    "cabinet_fronts": ["Door_Left_Front", "Door_Right_Front", "Drawer_Top_Front"],
    "countertop": ["Granite_Slab_36"],
    "hardware": ["Pulls_Upper", "Knobs_Lower"],
    "doors": [
      {
        "id": "door_L",
        "label": "Left Cabinet Door",
        "rootNode": "Hinge_L_Root",
        "axis": "Y",
        "openAngleRad": -1.83,
        "hitMeshes": ["Door_Left_Front"]
      },
      {
        "id": "door_R",
        "label": "Right Cabinet Door",
        "rootNode": "Hinge_R_Root",
        "axis": "Y",
        "openAngleRad": 1.83,
        "hitMeshes": ["Door_Right_Front"]
      }
    ],
    "drawers": [
      {
        "id": "drawer_top",
        "label": "Top Cutlery Drawer",
        "rootNode": "Drawer_Top_Root",
        "travelMm": 350.0
      }
    ]
  }
}
```

---

## 4. Architectural Rules for 3D Asset Creators

To guarantee full compatibility with the Everdale 3D platform, all future Blender and glTF assets must adhere to these four golden rules:

1. **Root Origin Standard**:
   - The root Empty must reside at world coordinates $(0, 0, 0)$ with zero rotation.
   - Ground level is $Z = 0$ in Blender ($Y = 0$ in Three.js).
2. **Kinematic Root Isolation**:
   - Every moving component (drawer, door, pull-out tray) must be childed to a designated logical Empty whose pivot represents the kinematic origin.
   - Stationary components (slides, carcass rails, dividers) must NEVER be childed to moving roots.
3. **PBR Material Slots**:
   - Meshes that take different materials must use distinct material slots.
   - Countertop and integrated sink must be separate meshes or separate primitive material slots so the countertop can receive marble/quartz veining without tinting the ceramic sink basin.
4. ** glTF Export Scale**:
   - Mesh coordinates should be modeled in true scale (meters or millimeters with standard scale transform).
   - All transforms on mesh objects must be applied (`Ctrl+A` -> Apply All Transforms) prior to NLA keyframing.

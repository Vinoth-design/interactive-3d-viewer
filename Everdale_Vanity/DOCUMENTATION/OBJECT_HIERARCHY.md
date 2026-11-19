# Everdale 31-Inch Bathroom Vanity – Object Hierarchy

## 1. Scene Graph Architecture
The scene graph is organized beneath a single root node (`EVERDALE_31_VANITY`), with functional modular groupings enabling independent selection, transformation, and animation.

```text
EVERDALE_31_VANITY (Root Empty at Origin [0, 0, 0])
├── Backsplash
├── Cabinet_Back
├── Cabinet_Bottom
├── Cabinet_Internal_Support
├── Cabinet_Side_Left
├── Cabinet_Side_Right
├── Cabinet_Top_Support
├── False_Drawer_Front
│   └── Handle_False_Drawer
├── Drawer01_Slide_Left
├── Drawer01_Slide_Right
├── Drawer02_Slide_Left
├── Drawer02_Slide_Right
├── Drawer_01_Root (Pivot: [0, -0.238075, 0.5235])
│   ├── Drawer01_Front
│   ├── Drawer01_Back
│   ├── Drawer01_Bottom
│   ├── Drawer01_Left
│   ├── Drawer01_Right
│   └── Handle_Drawer_01
├── Drawer_02_Root (Pivot: [0, -0.238075, 0.2650])
│   ├── Drawer02_Front
│   ├── Drawer02_Back
│   ├── Drawer02_Bottom
│   ├── Drawer02_Left
│   ├── Drawer02_Right
│   ├── Handle_Drawer_02
│   ├── Accessory_Tray_01
│   │   ├── Tray01_Bottom
│   │   ├── Tray01_Back
│   │   ├── Tray01_Front
│   │   ├── Tray01_Left
│   │   └── Tray01_Right
│   └── Accessory_Tray_02
│       ├── Tray02_Bottom
│       ├── Tray02_Back
│       ├── Tray02_Front
│       ├── Tray02_Left
│       └── Tray02_Right
├── Integrated_Sink
├── Stone_Top
├── Leg_BL
├── Leg_BR
├── Leg_FL
└── Leg_FR
```

## 2. Node Accounting
- **Total glTF Nodes**: 46
- **Mesh Primitives**: 41
- **Logical Group Empties**: 5 (`EVERDALE_31_VANITY`, `Drawer_01_Root`, `Drawer_02_Root`, `Accessory_Tray_01`, `Accessory_Tray_02`)
- **Parent-Child Integrity**: All moving drawer components, handles, and accessories inherit motion strictly from their respective roots. Stationary slides and carcass panels remain isolated from drawer travel.

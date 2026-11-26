# Everdale Product Platform: Technical Specification Standard
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Dimension Standardisation, Engineering Tolerances, Multi-Unit Presentation

---

## 1. Unit & Dimensional Governance

To prevent costly manufacturing discrepancies and ensure precision across CAD, 3D engines, and customer specification sheets:
1. **Internal Canonical Storage**: All dimensions are stored internally in **millimeters ($1.0\text{ mm}$ precision)** as floating-point values.
2. **Imperial Display Conversion**: Converted to inches ($1.0\text{ in} = 25.4\text{ mm}$) with common architectural fractional representations ($1/2″, 1/4″, 1/8″, 1/16″$) or 1-decimal rounding.
3. **Explicit Units**: Every numeric measurement field in API payloads and database records must include an explicit unit attribute (e.g. `unit: "mm"`).

---

## 2. Measurement Categories & Definitions

| Category | Definition | Authority Source |
| :--- | :--- | :--- |
| **Manufacturing Dimensions** | Exact CAD dimensions of fabricated parts (carcass, doors, stone slab). | Factory CAD / Shop Drawings |
| **Model Bounding Box** | Maximum spatial bounds of the 3D model, including extended drawer slides. | Three.js / Blender Box3 |
| **Nominal Display Dimensions** | Trade sizing used in marketing titles (e.g., "31-inch vanity"). | Product Catalog Merchandising |
| **Installation Clearances** | Minimum rough-in clearances for plumbing valves, waste lines, and reveals. | Technical Installation Manual |

---

## 3. Bathroom Vanity Specification Schema

```json
{
  "category": "bathroom-vanities",
  "dimensions": {
    "overall": {
      "widthMm": 787.4,
      "depthMm": 482.6,
      "heightMm": 863.6,
      "widthIn": 31.0,
      "depthIn": 19.0,
      "heightIn": 34.0
    },
    "countertop": {
      "thicknessMm": 25.0,
      "overhangLeftMm": 12.7,
      "overhangRightMm": 12.7,
      "overhangFrontMm": 22.225,
      "backsplashHeightMm": 101.6,
      "backsplashThicknessMm": 19.05
    },
    "cabinetBody": {
      "widthMm": 762.0,
      "depthMm": 460.38,
      "heightMm": 733.83,
      "legHeightMm": 104.78
    },
    "plumbingClearance": {
      "rearCutoutWidthMm": 450.0,
      "rearCutoutHeightMm": 320.0,
      "drainCenterFromFloorMm": 480.0
    }
  },
  "tolerances": {
    "woodExpansionMm": 1.5,
    "stoneFabricationMm": 1.0
  }
}
```

---

## 4. Kitchen Cabinetry Specification Schema (Modular Future-Ready)

```json
{
  "category": "kitchen-cabinets",
  "dimensions": {
    "module": {
      "nominalWidthIn": 36.0,
      "widthMm": 914.4,
      "depthMm": 609.6,
      "heightMm": 876.3
    },
    "toeKick": {
      "heightMm": 114.3,
      "recessMm": 63.5
    },
    "doors": {
      "count": 2,
      "thicknessMm": 19.05,
      "revealGapMm": 2.0
    },
    "drawers": {
      "slideType": "undermount-softclose",
      "weightCapacityKg": 40.0
    }
  }
}
```

/**
 * Everdale Product Platform — Modular Kitchen Cabinetry Data Architecture
 * 
 * IMPORTANT ARCHITECTURAL NOTICE:
 * This schema defines the structural data contracts for future modular kitchen cabinetry.
 * All records here are strictly structural templates marked with status: 'draft'.
 * No fabricated production SKUs, pricing, or unapproved CAD geometry are published to the live storefront.
 */

export const KITCHEN_STANDARDS = {
  units: 'mm',
  depths: {
    baseStandardMm: 609.6,   // 24.0 inches
    wallStandardMm: 304.8,   // 12.0 inches
    wallDeepMm: 381.0,       // 15.0 inches (over-refrigerator)
    tallStandardMm: 609.6,   // 24.0 inches
  },
  heights: {
    baseCarcassMm: 762.0,    // 30.0 inches carcass
    toeKickMm: 114.3,        // 4.5 inches pedestal
    baseFinishedMm: 876.3,   // 34.5 inches without stone top (36" finished with 1.5" slab)
    wallHeightsMm: [762.0, 914.4, 1066.8], // 30", 36", 42" heights
    tallHeightsMm: [2133.6, 2286.0, 2438.4], // 84", 90", 96" heights
  },
  modularWidthsInches: [12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42],
};

export const KITCHEN_CABINET_TYPES = [
  { id: 'base-standard', name: 'Standard Base Cabinet', familyId: 'kitchen-base-cabinet' },
  { id: 'base-sink', name: 'Sink Base Cabinet', familyId: 'kitchen-base-cabinet' },
  { id: 'base-drawers', name: 'Drawer Bank Base Cabinet', familyId: 'kitchen-base-cabinet' },
  { id: 'base-corner', name: 'Corner Lazy Susan Base Cabinet', familyId: 'kitchen-corner-cabinet' },
  { id: 'wall-standard', name: 'Upper Wall Cabinet', familyId: 'kitchen-wall-cabinet' },
  { id: 'wall-corner', name: 'Upper Diagonal Corner Cabinet', familyId: 'kitchen-wall-cabinet' },
  { id: 'tall-pantry', name: 'Full-Height Pantry Cabinet', familyId: 'kitchen-tall-cabinet' },
  { id: 'tall-oven', name: 'Double Wall Oven Housing Cabinet', familyId: 'kitchen-tall-cabinet' },
];

export const KITCHEN_DOOR_STYLES = [
  { id: 'shaker', name: 'Classic Shaker (2.5″ Stile & Rail)', status: 'draft' },
  { id: 'slab', name: 'Contemporary European Flat Slab', status: 'draft' },
  { id: 'slim-shaker', name: 'Micro-Shaker (1/2″ Edge Bevel)', status: 'draft' },
];

export const KITCHEN_SAMPLE_SCHEMA = {
  $schema: 'https://everdale.com/schemas/v2/kitchen-cabinet-module.json',
  moduleId: 'KB-36-SAMPLE',
  familyId: 'kitchen-base-cabinet',
  categoryId: 'kitchen-cabinets',
  status: 'draft',
  nominalDimensions: {
    widthIn: 36.0,
    heightIn: 34.5,
    depthIn: 24.0,
  },
  manufacturingDimensionsMm: {
    widthMm: 914.4,
    heightMm: 876.3,
    depthMm: 609.6,
    toeKickHeightMm: 114.3,
    toeKickRecessMm: 63.5,
  },
  doorStyle: 'shaker',
  carcassConstruction: '3/4-inch frameless furniture grade plywood with birch interior',
  hardwareSlideType: 'Blum Tandembox full-extension soft-close undermount',
};

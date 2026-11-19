/**
 * Everdale 31-Inch Bathroom Vanity — Master Product & Configurator Catalog
 * Edit brand name, SKU, pricing, finishes, or copy in this single file.
 */

export const BRAND_CONFIG = {
  brandName: 'Everdale Bath Studio',
  catalogLabel: 'All Bathroom Vanities',
  currencySymbol: '$',
  rebateRate: 0.11, // 11% promotional savings / rebate (set to 0 to hide rebate row)
  rebateLabel: '11% SAVINGS*',
  rebateFootnote: '*Mail-in / instant promotional rebate estimate for demonstration. Final pricing configurable.',
  storeStockCount: 4,
  storeStockMessage: 'in stock — Ready for pickup or fast delivery',
};

export const PRODUCT_BASE = {
  id: 'everdale-31',
  name: 'Everdale 31″ Single Vanity',
  fullTitle: 'Everdale 31-Inch Bathroom Vanity Combo',
  sku: '605-9531',
  badge: 'vanity + top',
  basePrice: 799.0,
  dimensions: {
    widthIn: 31,
    depthIn: 19,
    heightIn: 34,
    backsplashIn: 4,
    widthMm: 787.4,
    depthMm: 482.6,
    heightMm: 863.6,
    backsplashMm: 101.6,
  },
  highlights: [
    'Solid wood tapered legs with painted MDF cabinet construction',
    'White engineered stone countertop with integrated rectangular basin',
    'Pre-drilled 4″ centerset faucet holes (3-hole spread)',
    '1 top false drawer + 2 full-extension soft-close undermount drawers',
    'Includes 2 modular removable interior accessory trays',
    'Matching 4″ tall engineered stone backsplash included',
  ],
};

export const CHANNELS = [
  {
    id: 'in-stock',
    label: 'In stock',
    subtitle: 'Ready to ship today',
    ctaLabel: 'ADD TO CART',
    leadTime: 'In stock — Buy now and take it home today',
    depositNote: null,
  },
  {
    id: 'quickship',
    label: 'Quickship',
    subtitle: 'Ships in 3–5 weeks',
    ctaLabel: 'REQUEST QUOTE',
    leadTime: 'Ships to store or home in 3–5 weeks',
    depositNote: '50% deposit today, balance at delivery',
  },
  {
    id: 'semi-custom',
    label: 'Semi-custom',
    subtitle: 'Tailored finishes & hardware',
    ctaLabel: 'REQUEST CUSTOM QUOTE',
    leadTime: 'Built to order in 5–7 weeks with custom finish & hardware pairing',
    depositNote: 'Dedicated design specialist confirmation included',
  },
];

export const WIDTH_OPTIONS = [
  {
    id: '24',
    label: '24″',
    disabled: false,
    topWidthIn: 25,
    baseWidthIn: 24,
    topWidthMm: 635.0,
    baseWidthMm: 609.6,
    modelFile: '/models/Everdale_24_Vanity_Interactive.glb',
    basePrice: 699.0,
    sku: '605-9530',
    basinCount: 1,
    note: '24″ base + 25″ top',
  },
  {
    id: '31',
    label: '31″',
    disabled: false,
    topWidthIn: 31,
    baseWidthIn: 30,
    topWidthMm: 787.4,
    baseWidthMm: 762.0,
    modelFile: '/models/Everdale_31_Vanity_Interactive.glb',
    basePrice: 799.0,
    sku: '605-9531',
    basinCount: 1,
    note: '30″ base + 31″ top',
  },
  {
    id: '37',
    label: '37″',
    disabled: false,
    topWidthIn: 37,
    baseWidthIn: 36,
    topWidthMm: 939.8,
    baseWidthMm: 914.4,
    modelFile: '/models/Everdale_37_Vanity_Interactive.glb',
    basePrice: 929.0,
    sku: '605-9532',
    basinCount: 1,
    note: '36″ base + 37″ top',
  },
  {
    id: '49',
    label: '49″',
    disabled: false,
    topWidthIn: 49,
    baseWidthIn: 48,
    topWidthMm: 1244.6,
    baseWidthMm: 1219.2,
    modelFile: '/models/Everdale_49_Vanity_Interactive.glb',
    basePrice: 1149.0,
    sku: '605-9533',
    basinCount: 1,
    note: '48″ base + 49″ top',
  },
  {
    id: '61',
    label: '61″',
    disabled: false,
    topWidthIn: 61,
    baseWidthIn: 60,
    topWidthMm: 1549.4,
    baseWidthMm: 1524.0,
    modelFile: '/models/Everdale_61_Vanity_Interactive.glb',
    basePrice: 1399.0,
    sku: '605-9534',
    basinCount: 2,
    note: '60″ base + 61″ top (Double Basin)',
  },
];

export const DEPTH_OPTIONS = [
  { id: '16', label: '16″', disabled: true },
  { id: '19', label: '19″', disabled: false },
  { id: '22', label: '22″', disabled: true },
];

export const CABINET_FINISHES = [
  {
    id: 'evergreen-fog',
    name: 'Evergreen Fog',
    code: 'SW 9130',
    hex: '#899281',
    legHex: '#848d7c',
    roughness: 0.42,
    priceDelta: 0,
    inStock: true,
  },
  {
    id: 'matte-white',
    name: 'Matte White',
    code: 'MW-01',
    hex: '#efeee9',
    legHex: '#e7e5df',
    roughness: 0.36,
    priceDelta: 0,
    inStock: true,
  },
  {
    id: 'light-gray',
    name: 'Dove Gray',
    code: 'DG-14',
    hex: '#c2c6c5',
    legHex: '#b8bdbc',
    roughness: 0.42,
    priceDelta: 0,
    inStock: true,
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    code: 'MB-88',
    hex: '#2b3d52',
    legHex: '#253548',
    roughness: 0.39,
    priceDelta: 30,
    inStock: true,
  },
  {
    id: 'warm-beige',
    name: 'Almond Latte',
    code: 'AL-22',
    hex: '#cec2b1',
    legHex: '#c4b7a5',
    roughness: 0.44,
    priceDelta: 0,
    inStock: true,
  },
];

export const HARDWARE_FINISHES = [
  {
    id: 'antique-brass',
    name: 'Antique Brass',
    hex: '#b08b4f',
    metalness: 0.88,
    roughness: 0.32,
    priceDelta: 0,
  },
  {
    id: 'matte-black',
    name: 'Matte Black',
    hex: '#232528',
    metalness: 0.35,
    roughness: 0.45,
    priceDelta: 24,
  },
  {
    id: 'brushed-nickel',
    name: 'Brushed Nickel',
    hex: '#c4c8cc',
    metalness: 0.88,
    roughness: 0.28,
    priceDelta: 24,
  },
  {
    id: 'brushed-gold',
    name: 'Satin Gold',
    hex: '#d5b36a',
    metalness: 0.92,
    roughness: 0.24,
    priceDelta: 32,
  },
];

export const COUNTERTOP_FINISHES = [
  {
    id: 'white-engineered-stone',
    name: 'White Engineered Stone',
    subtitle: 'Included · Satin-gloss solid white',
    swatchHex: '#f4f3ef',
    textureType: 'solid-stone',
    roughness: 0.18,
    priceDelta: 0,
  },
  {
    id: 'carrara-marble',
    name: 'White Carrara CM',
    subtitle: 'Soft gray natural veining',
    swatchHex: '#ecece9',
    textureType: 'carrara',
    roughness: 0.15,
    priceDelta: 45,
  },
  {
    id: 'light-gray-quartz',
    name: 'Light Gray Quartz',
    subtitle: 'Fine mineral speckle finish',
    swatchHex: '#d9dad8',
    textureType: 'quartz',
    roughness: 0.20,
    priceDelta: 45,
  },
];

export const BACKSPLASH_OPTIONS = [
  { id: 'included', name: '4″ Matching Backsplash', subtitle: 'Included · Protects rear wall', priceDelta: 0 },
  { id: 'none', name: 'No Backsplash', subtitle: 'Flush wall / tile installation', priceDelta: 0 },
];

export const FAUCET_OPTIONS = [
  {
    id: 'none',
    name: 'Pre-drilled Only (No Faucet)',
    subtitle: 'Standard 4″ centerset 3-hole drilling',
    priceDelta: 0,
  },
  {
    id: 'centerset-4',
    name: '4″ Centerset Faucet + Drain',
    subtitle: 'Two-handle high-arc spout + pop-up trim',
    priceDelta: 89.0,
  },
];

export const MIRROR_OPTIONS = [
  { id: 'none', name: 'No Mirror', subtitle: 'Vanity combo only', priceDelta: 0, frameType: null },
  { id: 'rectangle', name: 'Rectangle', subtitle: '24″ × 32″ framed wall mirror', priceDelta: 119.0, frameType: 'wood' },
  { id: 'arched', name: 'Arched', subtitle: '24″ × 34″ slim metal arch', priceDelta: 139.0, frameType: 'metal' },
  { id: 'round', name: 'Round', subtitle: '28″ diameter metal frame', priceDelta: 109.0, frameType: 'metal' },
  { id: 'led-backlit', name: 'LED Backlit', subtitle: '24″ × 32″ warm halo defogger', priceDelta: 249.0, frameType: null },
];

export const MIRROR_FRAMES_WOOD = [
  { id: 'match-vanity', name: 'Match Vanity', hex: '#899281', dynamicMatch: true },
  { id: 'almond-latte', name: 'Almond Latte', hex: '#cbbba5' },
  { id: 'matte-white', name: 'Matte White', hex: '#f0efe9' },
  { id: 'warm-walnut', name: 'Warm Walnut', hex: '#6c4d38' },
];

export const MIRROR_FRAMES_METAL = [
  { id: 'antique-brass', name: 'Antique Brass', hex: '#b08b4f', metalness: 0.88, roughness: 0.30 },
  { id: 'matte-black', name: 'Matte Black', hex: '#222427', metalness: 0.4, roughness: 0.42 },
  { id: 'brushed-nickel', name: 'Brushed Nickel', hex: '#c4c8cc', metalness: 0.88, roughness: 0.26 },
  { id: 'brushed-gold', name: 'Brushed Gold', hex: '#d5b36a', metalness: 0.92, roughness: 0.24 },
];

export const SCENE_WALL_PRESETS = [
  { id: 'microcement', name: 'Microcement', swatch: '#d9d5ce' },
  { id: 'plain', name: 'Plain White', swatch: '#f3f2ee' },
  { id: 'cottage', name: 'Cottage Shiplap', swatch: '#ebe9e2' },
  { id: 'classic', name: 'Classic Panel', swatch: '#dfe2df' },
  { id: 'stone', name: 'Warm Stone', swatch: '#c5bcb0' },
  { id: 'marble', name: 'Soft Marble', swatch: '#ecebe8' },
];

export const SCENE_FLOOR_PRESETS = [
  { id: 'checker', name: 'Checker Tile', swatch: '#d6d4cf' },
  { id: 'room-default', name: 'Warm Oak', swatch: '#b99771' },
  { id: 'limestone', name: 'Limestone', swatch: '#cfc8bc' },
  { id: 'marble-hex', name: 'Marble Hex', swatch: '#e7e7e4' },
];

export const SCENE_LIGHTING_PRESETS = [
  {
    id: 'warm-bath',
    name: 'Warm Bath',
    desc: 'Cozy 2700K incandescent warmth & illuminated sconces',
    badge: 'Cozy',
  },
  {
    id: 'studio',
    name: 'Studio Clean',
    desc: 'High-contrast showroom lighting with crisp reflections',
    badge: 'Showroom',
  },
  {
    id: 'daylight',
    name: 'Morning Sun',
    desc: 'Fresh bright 5500K morning window daylight',
    badge: 'Bright',
  },
  {
    id: 'evening',
    name: 'Evening Luxury',
    desc: 'Moody evening ambience with warm brass specular highlights',
    badge: 'Moody',
  },
];

export const DEFAULT_CONFIG = {
  tab: 'in-stock',
  width: '31',
  depth: '19',
  finish: 'evergreen-fog',
  hardware: 'antique-brass',
  countertop: 'white-engineered-stone',
  backsplash: 'included',
  faucet: 'centerset-4',
  faucetFinish: 'antique-brass',
  mirror: 'rectangle',
  frame: 'match-vanity',
  showDimensions: false,
  showTrays: true,
  wall: 'microcement',
  floor: 'checker',
  lighting: 'warm-bath',
  showProps: true,
};

export function calculatePricing(config) {
  const widthOpt = WIDTH_OPTIONS.find((w) => w.id === config.width) || WIDTH_OPTIONS[1];
  const finish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
  const hardware = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
  const countertop = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
  const faucet = FAUCET_OPTIONS.find((f) => f.id === config.faucet) || FAUCET_OPTIONS[0];
  const mirror = MIRROR_OPTIONS.find((m) => m.id === config.mirror) || MIRROR_OPTIONS[0];

  const effectiveBasePrice = widthOpt.basePrice || PRODUCT_BASE.basePrice;
  const basinMultiplier = widthOpt.basinCount === 2 ? 2 : 1;

  const subtotal =
    effectiveBasePrice +
    (finish.priceDelta || 0) +
    (hardware.priceDelta || 0) +
    (countertop.priceDelta || 0) +
    (faucet.priceDelta || 0) * basinMultiplier +
    (mirror.priceDelta || 0) * (widthOpt.basinCount === 2 && mirror.id !== 'none' ? 1.7 : 1);

  const rebateValue = subtotal * BRAND_CONFIG.rebateRate;
  const afterRebate = subtotal - rebateValue;

  return {
    subtotal,
    rebateValue,
    afterRebate,
    breakdown: [
      { label: `Everdale ${widthOpt.label} Vanity (${finish.name})`, amount: effectiveBasePrice + (finish.priceDelta || 0) },
      hardware.priceDelta ? { label: `Hardware: ${hardware.name}`, amount: hardware.priceDelta } : null,
      countertop.priceDelta ? { label: `Countertop: ${countertop.name}`, amount: countertop.priceDelta } : null,
      faucet.priceDelta ? { label: widthOpt.basinCount === 2 ? `${faucet.name} (Dual Set)` : faucet.name, amount: faucet.priceDelta * basinMultiplier } : null,
      mirror.priceDelta ? { label: `Mirror: ${mirror.name}`, amount: mirror.priceDelta } : null,
    ].filter(Boolean),
  };
}

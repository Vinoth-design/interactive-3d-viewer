/**
 * Everdale Product Platform — Option Groups & Configurable Options
 */

export const BRAND_CONFIG = {
  brandName: 'Everdale Bath Studio',
  catalogLabel: 'Freestanding Bathroom Vanities',
  currencySymbol: '$',
  rebateRate: 0.11,
  rebateLabel: '11% SAVINGS*',
  rebateFootnote: '*Illustrative promotional rebate estimate. Final pricing confirmed upon cart review or specification quote.',
  storeStockCount: 4,
  storeStockMessage: 'in stock — Ready for pickup or fast dispatch',
};

export const CHANNELS = [
  {
    id: 'in-stock',
    label: 'In Stock',
    subtitle: 'Ready to dispatch',
    ctaLabel: 'ADD TO CART',
    leadTime: 'In stock — Ready for pickup or fast residential dispatch',
    depositNote: null,
  },
  {
    id: 'quickship',
    label: 'Quick Ship',
    subtitle: 'Ships in 3–5 weeks',
    ctaLabel: 'REQUEST QUOTE',
    leadTime: 'Custom finishes & options ship via Quick Ship in 3–5 weeks',
    depositNote: 'Customized build — submit for itemized company quote',
  },
];

export const PURCHASE_MODES = [
  {
    id: 'combo',
    label: 'Combo Set',
    shortLabel: 'Combo',
    badge: 'cabinet + top + handles',
    description: 'Complete vanity set including cabinet, engineered/marble top & hardware pulls.',
  },
  {
    id: 'series',
    label: 'Series (Cabinet Only)',
    shortLabel: 'Series',
    badge: 'cabinet only',
    description: 'Cabinet-only purchase — countertop, hardware, faucet & mirror shown for visual preview.',
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
    finishType: 'lacquer',
    subtitle: 'Satin moisture-cured lacquer',
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
    finishType: 'lacquer',
    subtitle: 'Satin architectural white',
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
    finishType: 'lacquer',
    subtitle: 'Warm mineral neutral',
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
    finishType: 'lacquer',
    subtitle: 'Deep coastal navy satin',
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
    finishType: 'lacquer',
    subtitle: 'Warm linen taupe lacquer',
    hex: '#cec2b1',
    legHex: '#c4b7a5',
    roughness: 0.44,
    priceDelta: 0,
    inStock: true,
  },
  {
    id: 'charcoal',
    name: 'Charcoal Slate',
    code: 'CH-90',
    finishType: 'lacquer',
    subtitle: 'Architectural dark graphite',
    hex: '#383c40',
    legHex: '#303438',
    roughness: 0.45,
    priceDelta: 30,
    inStock: false,
  },
  {
    id: 'natural-oak',
    name: 'Natural Oak',
    code: 'NO-08',
    finishType: 'wood',
    subtitle: 'Rift-cut Scandinavian white oak',
    hex: '#b9956b',
    legHex: '#b08b61',
    roughness: 0.56,
    priceDelta: 75,
    inStock: false,
  },
  {
    id: 'walnut',
    name: 'Architectural Walnut',
    code: 'AW-12',
    finishType: 'wood',
    subtitle: 'Rich American walnut veneer',
    hex: '#5d402d',
    legHex: '#523726',
    roughness: 0.54,
    priceDelta: 95,
    inStock: false,
  },
];

export const HARDWARE_FINISHES = [
  {
    id: 'antique-brass',
    name: 'Antique Brass',
    subtitle: 'Brushed warm bronze-brass alloy',
    hex: '#b08b4f',
    metalness: 0.88,
    roughness: 0.32,
    priceDelta: 0,
  },
  {
    id: 'matte-black',
    name: 'Matte Black',
    subtitle: 'Powder-coated satin black',
    hex: '#232528',
    metalness: 0.35,
    roughness: 0.45,
    priceDelta: 24,
  },
  {
    id: 'brushed-nickel',
    name: 'Brushed Nickel',
    subtitle: 'Fine directional satin steel',
    hex: '#c4c8cc',
    metalness: 0.88,
    roughness: 0.28,
    priceDelta: 24,
  },
  {
    id: 'brushed-gold',
    name: 'Satin Gold',
    subtitle: 'Soft champagne brass finish',
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
    subtitle: 'Included · Satin solid white slab',
    swatchHex: '#f4f3ef',
    textureType: 'solid-stone',
    roughness: 0.18,
    priceDelta: 0,
  },
  {
    id: 'carrara-marble',
    name: 'White Carrara CM',
    subtitle: 'Soft gray natural marble veining',
    swatchHex: '#ecece9',
    textureType: 'carrara',
    roughness: 0.15,
    priceDelta: 45,
  },
  {
    id: 'light-gray-quartz',
    name: 'Light Gray Quartz',
    subtitle: 'Fine mineral aggregate speckle',
    swatchHex: '#d9dad8',
    textureType: 'quartz',
    roughness: 0.20,
    priceDelta: 45,
  },
  {
    id: 'black-granite',
    name: 'Honed Black Granite',
    subtitle: 'Deep charcoal mineral grain',
    swatchHex: '#2a2d30',
    textureType: 'black-granite',
    roughness: 0.26,
    priceDelta: 65,
  },
  {
    id: 'calacatta-gold',
    name: 'Calacatta Gold',
    subtitle: 'Warm ivory slab with subtle amber veining',
    swatchHex: '#f2eee6',
    textureType: 'calacatta-gold',
    roughness: 0.16,
    priceDelta: 85,
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
  { id: 'none', name: 'No Mirror', subtitle: 'Cabinet & vanity view only', priceDelta: 0, frameType: null, visualOnly: true },
  { id: 'rectangle', name: 'Rectangle', subtitle: '24″ × 32″ framed preview (not priced)', priceDelta: 0, frameType: 'wood', visualOnly: true },
  { id: 'arched', name: 'Arched', subtitle: '24″ × 34″ arch preview (not priced)', priceDelta: 0, frameType: 'metal', visualOnly: true },
  { id: 'round', name: 'Round', subtitle: '28″ round preview (not priced)', priceDelta: 0, frameType: 'metal', visualOnly: true },
  { id: 'led-backlit', name: 'LED Backlit', subtitle: '24″ × 32″ backlit preview (not priced)', priceDelta: 0, frameType: null, visualOnly: true },
];

export const MIRROR_FRAMES_WOOD = [
  { id: 'match-vanity', name: 'Match Vanity', hex: '#899281', dynamicMatch: true },
  { id: 'almond-latte', name: 'Almond Latte', hex: '#cbbba5' },
  { id: 'matte-white', name: 'Matte White', hex: '#f0efe9' },
  { id: 'natural-oak', name: 'Natural Oak', hex: '#b9956b', woodKey: 'natural-oak' },
  { id: 'warm-walnut', name: 'Warm Walnut', hex: '#6c4d38', woodKey: 'walnut' },
];

export const MIRROR_FRAMES_METAL = [
  { id: 'antique-brass', name: 'Antique Brass', hex: '#b08b4f', metalness: 0.88, roughness: 0.30 },
  { id: 'matte-black', name: 'Matte Black', hex: '#222427', metalness: 0.4, roughness: 0.42 },
  { id: 'brushed-nickel', name: 'Brushed Nickel', hex: '#c4c8cc', metalness: 0.88, roughness: 0.26 },
  { id: 'brushed-gold', name: 'Brushed Gold', hex: '#d5b36a', metalness: 0.92, roughness: 0.24 },
];

export const SCENE_WALL_PRESETS = [
  { id: 'microcement', name: 'Microcement', swatch: '#d9d5ce' },
  { id: 'plain', name: 'Plain White', swatch: '#eae8e2' },
  { id: 'cottage', name: 'Cottage Shiplap', swatch: '#e4e1d8' },
  { id: 'classic', name: 'Classic Panel', swatch: '#d8dcd7' },
  { id: 'stone', name: 'Warm Stone', swatch: '#c2b9ac' },
  { id: 'marble', name: 'Soft Marble', swatch: '#e7e5e0' },
];

export const SCENE_FLOOR_PRESETS = [
  { id: 'checker', name: 'Checker Tile', swatch: '#d6d4cf' },
  { id: 'room-default', name: 'Warm Oak', swatch: '#b99670' },
  { id: 'limestone', name: 'Limestone', swatch: '#ccc5b8' },
  { id: 'marble-hex', name: 'Marble Hex', swatch: '#e4e3df' },
];

export const SCENE_LIGHTING_PRESETS = [
  { id: 'warm-bath', name: 'Warm Bath', desc: 'Balanced 2700K residential bath warmth', badge: 'Warm' },
  { id: 'studio', name: 'Studio Clean', desc: 'Neutral showroom illumination & crisp edges', badge: 'Showroom' },
  { id: 'daylight', name: 'Morning Sun', desc: 'Natural 5500K bright window daylight', badge: 'Daylight' },
  { id: 'evening', name: 'Evening Luxury', desc: 'Low ambient evening mood with warm sconces', badge: 'Evening' },
];

export const DEFAULT_CONFIG = {
  purchaseMode: 'combo',
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

export const OPTION_GROUPS = [
  { id: 'width', name: 'Width', selectionType: 'single', required: true, scope: 'product' },
  { id: 'depth', name: 'Depth', selectionType: 'single', required: true, scope: 'product' },
  { id: 'finish', name: 'Cabinet Finish', selectionType: 'single', required: true, scope: 'product' },
  { id: 'hardware', name: 'Hardware Finish', selectionType: 'single', required: true, scope: 'product' },
  { id: 'countertop', name: 'Countertop', selectionType: 'single', required: true, scope: 'product' },
  { id: 'backsplash', name: 'Backsplash', selectionType: 'single', required: true, scope: 'product' },
  { id: 'faucet', name: 'Faucet Package', selectionType: 'single', required: true, scope: 'product' },
  { id: 'mirror', name: 'Mirror', selectionType: 'single', required: true, scope: 'product' },
  { id: 'frame', name: 'Mirror Frame', selectionType: 'single', required: false, scope: 'product' },
  { id: 'wall', name: 'Wall Style', selectionType: 'single', required: false, scope: 'visualisation' },
  { id: 'floor', name: 'Floor Style', selectionType: 'single', required: false, scope: 'visualisation' },
  { id: 'lighting', name: 'Lighting Ambience', selectionType: 'single', required: false, scope: 'visualisation' },
];

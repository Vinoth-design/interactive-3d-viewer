/**
 * Everdale Product Platform — Products
 */

import { VANITY_VARIANTS } from './variants.js';

export const PRODUCTS = [
  {
    id: 'everdale-vanity',
    familyId: 'freestanding-vanity',
    categoryId: 'bathroom-vanities',
    sellingCategory: 'combo',
    name: 'Everdale Bathroom Vanity Combo',
    slug: 'everdale-bathroom-vanity-combo',
    brand: 'Everdale Bath Studio',
    masterSku: '605-9531',
    badge: 'Combo',
    shortDescription:
      'Freestanding solid-wood leg vanity with engineered stone top, integrated basin, and soft-close drawer storage.',
    fullDescription:
      'The Everdale Vanity pairs restrained architectural shaker joinery with moisture-resistant painted MDF cabinetry and tapered solid wood legs. Each configuration is built around a 25 mm stone countertop with rectangular undermount basin, pre-drilled 4″ centerset faucet spread, full-extension undermount drawer glides, and removable interior accessory trays.',
    features: [
      'Solid wood tapered legs (104.8 mm) with painted MDF cabinet carcass',
      '25 mm stone countertop with integrated rectangular porcelain basin',
      'Pre-drilled 4″ centerset faucet holes (101.6 mm 3-hole spread)',
      '1 top false drawer + 2 full-extension soft-close undermount drawers',
      'Includes 2 modular removable interior accessory trays',
      'Matching 4″ (101.6 mm) tall stone backsplash included',
    ],
    materials: [
      {
        part: 'Cabinet Carcass & Drawer Fronts',
        spec: '18 mm moisture-cured painted MDF cabinet panels & 19 mm shaker fronts',
      },
      {
        part: 'Legs & Structural Support',
        spec: 'Solid hardwood tapered legs (104.8 mm height) finished to match body',
      },
      {
        part: 'Drawer Boxes & Organizers',
        spec: '12 mm natural wood-finished drawer walls with 9 mm recessed bottom and removable caddies',
      },
      {
        part: 'Countertop & Integrated Sink',
        spec: '25 mm engineered stone / natural marble slab with undermount porcelain basin',
      },
      {
        part: 'Hardware & Undermount Slides',
        spec: '140 mm machined metal pulls paired with concealed soft-close undermount glides',
      },
    ],
    careInstructions: [
      'Wipe painted wood and stone surfaces with a soft damp microfiber cloth and pH-neutral cleaner.',
      'Dry standing water along the backsplash seam and faucet collar after use.',
      'Avoid abrasive pads, acidic stone cleaners, or ammonia-based polishes on marble or brushed brass.',
    ],
    installationDetails: [
      'Cabinet carcass ships pre-assembled; countertop and 4″ backsplash install onto top supports.',
      'Plumbing clearance includes open rear cabinet wall access and top-drawer U-cutout around drain trap.',
      'Pre-drilled 4″ centerset (101.6 mm spread, 35 mm bore) accommodates standard two-handle centerset faucets.',
      'Faucet and pop-up drain are optional add-ons and are only included when selected in your configuration.',
    ],
    defaultVariantId: '31',
    pricingMode: 'configurable',
    purchaseEnabled: true,
    quoteEnabled: true,
    status: 'published',
    variants: VANITY_VARIANTS,
  },
  {
    id: 'everdale-series',
    familyId: 'freestanding-vanity',
    categoryId: 'bathroom-vanities',
    sellingCategory: 'series',
    name: 'Everdale Bathroom Vanity Series',
    slug: 'everdale-bathroom-vanity-series',
    brand: 'Everdale Bath Studio',
    masterSku: '605-9531',
    badge: 'Series · Cabinet Only',
    shortDescription:
      'Furniture-grade cabinet-only series with solid wood tapered legs and soft-close drawers. Top, handles & faucet shown in 3D for preview.',
    fullDescription:
      'The Everdale Cabinet Series offers the same signature shaker cabinetry, tapered solid wood legs, and soft-close drawer architecture sold independently as a cabinet unit—allowing builders, designers, and homeowners to visualize compatible countertops, handles, faucets, and mirrors directly on the 3D cabinet.',
    features: [
      'Solid wood tapered legs (104.8 mm) with painted MDF or wood-veneer cabinet carcass',
      '1 top false drawer + 2 full-extension soft-close undermount drawers',
      'Includes 2 modular removable interior accessory trays',
      'Pre-drilled cabinet hardware & open plumbing rear access ready for custom top & faucet pairing',
    ],
    materials: [
      {
        part: 'Cabinet Carcass & Drawer Fronts',
        spec: '18 mm moisture-cured painted MDF or wood-veneer panels & 19 mm shaker fronts',
      },
      {
        part: 'Legs & Structural Support',
        spec: 'Solid hardwood tapered legs (104.8 mm height) finished to match body',
      },
      {
        part: 'Drawer Boxes & Organizers',
        spec: '12 mm natural wood-finished drawer walls with 9 mm recessed bottom and removable caddies',
      },
      {
        part: 'Concealed Undermount Slides',
        spec: 'Full-extension soft-close undermount drawer glides',
      },
    ],
    careInstructions: [
      'Wipe painted or wood-veneer cabinetry with a soft damp microfiber cloth and pH-neutral cleaner.',
      'Dry moisture along upper rail seams after daily bath use.',
    ],
    installationDetails: [
      'Cabinet carcass ships pre-assembled ready for customer-supplied countertop and faucet installation.',
      'Plumbing clearance includes open rear cabinet wall access and top-drawer U-cutout around drain trap.',
    ],
    defaultVariantId: '31',
    pricingMode: 'configurable',
    purchaseEnabled: true,
    quoteEnabled: true,
    status: 'published',
    variants: VANITY_VARIANTS,
  },
  {
    id: 'kitchen-base-modular-sample',
    familyId: 'kitchen-base-cabinet',
    categoryId: 'kitchen-cabinets',
    name: 'Everdale Modular Kitchen Base Cabinet (Schema Template)',
    slug: 'everdale-kitchen-base-modular',
    brand: 'Everdale Kitchen Studio',
    masterSku: 'KB-ARCH-SAMPLE',
    badge: 'modular cabinetry',
    shortDescription: 'Standard 24-inch architectural kitchen base module data architecture.',
    fullDescription:
      'Architectural data model specification for future modular kitchen cabinetry. Unreleased and unpublished until certified factory CAD and manufacturing SKUs are onboarded.',
    features: [
      'Frameless 3/4-inch furniture board construction with full-extension tandem slides',
      'Adjustable 4.5-inch heavy-duty structural toe-kick system',
      'Modular compatibility with standard architectural kitchen counter depths',
    ],
    defaultVariantId: 'kb-36',
    pricingMode: 'quote-required',
    purchaseEnabled: false,
    quoteEnabled: true,
    status: 'draft',
    variants: [],
  },
];

export function getVariantHighlights(product, variant) {
  if (!product) return [];
  if (!variant) return product.features || [];
  const isDouble = variant.basinCount === 2;
  return [
    'Solid wood tapered legs (104.8 mm) with furniture-grade cabinet construction',
    `25 mm stone countertop with ${isDouble ? 'dual integrated rectangular basins' : 'integrated rectangular porcelain basin'}`,
    isDouble
      ? 'Dual 4″ centerset faucet drillings (two 3-hole 101.6 mm spreads)'
      : 'Pre-drilled 4″ centerset faucet holes (101.6 mm 3-hole spread)',
    isDouble
      ? '2 top false panels + 4 independent full-extension soft-close drawers'
      : '1 top false drawer + 2 full-extension soft-close undermount drawers',
    `Supports ${variant.trayCount} modular removable interior accessory trays in lower drawer(s)`,
    'Matching 4″ (101.6 mm) tall removable stone backsplash included',
  ];
}

export function getProducts(status = 'published') {
  if (!status) return PRODUCTS;
  return PRODUCTS.filter((p) => p.status === status);
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
}

export function getProductsByCategory(categoryId, status = 'published') {
  return PRODUCTS.filter(
    (p) => p.categoryId === categoryId && (!status || p.status === status)
  );
}

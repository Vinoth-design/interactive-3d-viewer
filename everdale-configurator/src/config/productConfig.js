/**
 * Everdale Product Configuration Adapter
 *
 * Re-exports from the centralized Catalogue Domain Service (src/catalog/)
 * ensuring complete consistency across Three.js builders and PDP components.
 */

import {
  CatalogService,
  BRAND_CONFIG,
  PURCHASE_MODES,
  CHANNELS,
  WIDTH_OPTIONS,
  DEPTH_OPTIONS,
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  BACKSPLASH_OPTIONS,
  FAUCET_OPTIONS,
  MIRROR_OPTIONS,
  MIRROR_FRAMES_WOOD,
  MIRROR_FRAMES_METAL,
  SCENE_WALL_PRESETS,
  SCENE_FLOOR_PRESETS,
  SCENE_LIGHTING_PRESETS,
  DEFAULT_CONFIG,
  calculatePricing,
  PRODUCTS,
  getVariantHighlights,
} from '../catalog/index';

export const PRODUCT_BASE = {
  id: 'everdale-vanity',
  name: 'Everdale 31″ Single Vanity',
  fullTitle: 'Everdale Bathroom Vanity Combo',
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
  highlights: PRODUCTS[0].features,
};

export {
  CatalogService,
  BRAND_CONFIG,
  PURCHASE_MODES,
  CHANNELS,
  WIDTH_OPTIONS,
  DEPTH_OPTIONS,
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  BACKSPLASH_OPTIONS,
  FAUCET_OPTIONS,
  MIRROR_OPTIONS,
  MIRROR_FRAMES_WOOD,
  MIRROR_FRAMES_METAL,
  SCENE_WALL_PRESETS,
  SCENE_FLOOR_PRESETS,
  SCENE_LIGHTING_PRESETS,
  DEFAULT_CONFIG,
  calculatePricing,
  PRODUCTS,
  getVariantHighlights,
};

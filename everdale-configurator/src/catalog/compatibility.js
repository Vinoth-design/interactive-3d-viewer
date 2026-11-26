/**
 * Everdale Product Platform — Compatibility Validator & Rules Engine
 */

import {
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  BACKSPLASH_OPTIONS,
  FAUCET_OPTIONS,
  MIRROR_OPTIONS,
  MIRROR_FRAMES_WOOD,
  MIRROR_FRAMES_METAL,
  DEPTH_OPTIONS,
  PURCHASE_MODES,
  DEFAULT_CONFIG,
} from './options.js';
import { VANITY_VARIANTS } from './variants.js';
import { getProductById } from './products.js';

export const COMPATIBILITY_RULES = [
  {
    id: 'RULE_DEPTH_19_ONLY',
    description: 'Everdale vanity collection currently supports 19-inch depth only.',
    check: (config) => config.depth === '19',
    resolve: (config) => ({ ...config, depth: '19' }),
  },
  {
    id: 'RULE_MIRROR_FRAME_TYPE',
    description: 'Rectangular mirrors require wood frames; arched and round require metal frames.',
    check: (config) => {
      if (config.mirror === 'rectangle') {
        return MIRROR_FRAMES_WOOD.some((f) => f.id === config.frame);
      }
      if (config.mirror === 'arched' || config.mirror === 'round') {
        return MIRROR_FRAMES_METAL.some((f) => f.id === config.frame);
      }
      return true;
    },
    resolve: (config) => {
      if (config.mirror === 'rectangle') {
        const isWood = MIRROR_FRAMES_WOOD.some((f) => f.id === config.frame);
        return isWood ? config : { ...config, frame: 'match-vanity' };
      }
      if (config.mirror === 'arched' || config.mirror === 'round') {
        const isMetal = MIRROR_FRAMES_METAL.some((f) => f.id === config.frame);
        return isMetal ? config : { ...config, frame: 'antique-brass' };
      }
      return config;
    },
  },
];

export function validateConfiguration(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return { isValid: false, config: { ...DEFAULT_CONFIG }, errors: ['Invalid config object'] };
  }

  const errors = [];
  const sanitized = { ...DEFAULT_CONFIG, ...rawConfig };

  // Resolve product category ('combo' | 'series') from the product definition itself
  const resolvedProduct = getProductById(sanitized.product);
  if (resolvedProduct?.sellingCategory) {
    sanitized.product = resolvedProduct.id;
    sanitized.purchaseMode = resolvedProduct.sellingCategory;
  } else if (!PURCHASE_MODES.some((m) => m.id === sanitized.purchaseMode)) {
    errors.push(`Invalid purchaseMode: ${sanitized.purchaseMode}`);
    sanitized.purchaseMode = DEFAULT_CONFIG.purchaseMode;
  }

  // Validate width variant
  const variant = VANITY_VARIANTS.find((v) => v.id === sanitized.width);
  if (!variant) {
    errors.push(`Invalid width variant: ${sanitized.width}`);
    sanitized.width = DEFAULT_CONFIG.width;
  }

  // Validate finish
  if (!CABINET_FINISHES.some((f) => f.id === sanitized.finish)) {
    errors.push(`Invalid cabinet finish: ${sanitized.finish}`);
    sanitized.finish = DEFAULT_CONFIG.finish;
  }

  // Validate hardware
  if (!HARDWARE_FINISHES.some((h) => h.id === sanitized.hardware)) {
    errors.push(`Invalid hardware finish: ${sanitized.hardware}`);
    sanitized.hardware = DEFAULT_CONFIG.hardware;
  }

  // Validate countertop
  if (!COUNTERTOP_FINISHES.some((c) => c.id === sanitized.countertop)) {
    errors.push(`Invalid countertop finish: ${sanitized.countertop}`);
    sanitized.countertop = DEFAULT_CONFIG.countertop;
  }

  // Validate backsplash
  if (!BACKSPLASH_OPTIONS.some((b) => b.id === sanitized.backsplash)) {
    errors.push(`Invalid backsplash option: ${sanitized.backsplash}`);
    sanitized.backsplash = DEFAULT_CONFIG.backsplash;
  }

  // Validate faucet
  if (!FAUCET_OPTIONS.some((f) => f.id === sanitized.faucet)) {
    errors.push(`Invalid faucet option: ${sanitized.faucet}`);
    sanitized.faucet = DEFAULT_CONFIG.faucet;
  }

  // Validate mirror
  if (!MIRROR_OPTIONS.some((m) => m.id === sanitized.mirror)) {
    errors.push(`Invalid mirror option: ${sanitized.mirror}`);
    sanitized.mirror = DEFAULT_CONFIG.mirror;
  }

  // Normalize fulfillment tab ('in-stock' | 'quickship')
  if (sanitized.tab === 'semi-custom' || (sanitized.tab !== 'in-stock' && sanitized.tab !== 'quickship')) {
    sanitized.tab = 'quickship';
  }

  // Evaluate rule resolutions
  let resolvedConfig = sanitized;
  for (const rule of COMPATIBILITY_RULES) {
    if (!rule.check(resolvedConfig)) {
      resolvedConfig = rule.resolve(resolvedConfig);
    }
  }

  // Any product customization automatically switches the active tab to Quick Ship
  if (isConfigurationCustomized(resolvedConfig)) {
    resolvedConfig.tab = 'quickship';
  }

  return {
    isValid: errors.length === 0,
    config: resolvedConfig,
    errors,
  };
}

/**
 * Determines whether the shopper has customized a priced product attribute
 * away from the standard SKU configuration (triggering Request Quote).
 * Viewing-only properties (mirror, lighting, wall, floor, Series preview parts)
 * do not count as manufacturing customizations.
 */
export function isConfigurationCustomized(config) {
  if (!config) return false;
  if (config.purchaseMode === 'series') {
    return config.finish !== DEFAULT_CONFIG.finish;
  }
  return (
    config.finish !== DEFAULT_CONFIG.finish ||
    config.hardware !== DEFAULT_CONFIG.hardware ||
    config.countertop !== DEFAULT_CONFIG.countertop ||
    config.backsplash !== DEFAULT_CONFIG.backsplash ||
    config.faucet !== DEFAULT_CONFIG.faucet ||
    config.faucetFinish !== DEFAULT_CONFIG.faucetFinish
  );
}

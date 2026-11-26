/**
 * Everdale Product Platform — Unified Catalog Service Facade
 */

import { CATEGORIES, getCategories, getCategoryById } from './categories.js';
import { PRODUCT_FAMILIES, getFamiliesByCategory, getFamilyById } from './families.js';
import {
  PRODUCTS,
  getProducts,
  getProductById,
  getProductsByCategory,
  getVariantHighlights,
} from './products.js';
import { VANITY_VARIANTS, getVariantsByProduct, getVariantById } from './variants.js';
import {
  BRAND_CONFIG,
  PURCHASE_MODES,
  CHANNELS,
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
  OPTION_GROUPS,
} from './options.js';
import { validateConfiguration, isConfigurationCustomized } from './compatibility.js';
import { ASSET_REGISTRY, getModelForVariant, getRendersForProduct } from './assets.js';
import { PricingService } from './pricing.js';
import { CommerceEligibilityService } from './eligibility.js';

export class CatalogService {
  static getCategories(status = 'published') {
    return getCategories(status);
  }

  static getCategory(id) {
    return getCategoryById(id);
  }

  static getFamilies(categoryId, status = 'published') {
    return getFamiliesByCategory(categoryId, status);
  }

  static getFamily(id) {
    return getFamilyById(id);
  }

  static getProducts(status = 'published') {
    return getProducts(status);
  }

  static getProduct(id) {
    return getProductById(id);
  }

  static getProductsByCategory(categoryId, status = 'published') {
    return getProductsByCategory(categoryId, status);
  }

  static getVariants(productId) {
    return getVariantsByProduct(productId);
  }

  static getVariant(id) {
    return getVariantById(id);
  }

  static getModelAsset(variantId) {
    return getModelForVariant(variantId);
  }

  static getRenders(productId, variantId = null) {
    return getRendersForProduct(productId, variantId);
  }

  static getVariantHighlights(product, variant) {
    return getVariantHighlights(product, variant);
  }

  static validateConfig(rawConfig) {
    return validateConfiguration(rawConfig);
  }

  static calculatePrice(config, options = {}) {
    return PricingService.calculatePrice(config, options);
  }

  static evaluateEligibility(product, variant, config) {
    return CommerceEligibilityService.evaluate(product, variant, config);
  }
}

export {
  CATEGORIES,
  PRODUCT_FAMILIES,
  PRODUCTS,
  VANITY_VARIANTS,
  VANITY_VARIANTS as WIDTH_OPTIONS,
  BRAND_CONFIG,
  PURCHASE_MODES,
  CHANNELS,
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
  OPTION_GROUPS,
  validateConfiguration,
  isConfigurationCustomized,
  ASSET_REGISTRY,
  getModelForVariant,
  getRendersForProduct,
  getVariantHighlights,
  PricingService,
  CommerceEligibilityService,
};

export const calculatePricing = (config, options) => PricingService.calculatePrice(config, options);

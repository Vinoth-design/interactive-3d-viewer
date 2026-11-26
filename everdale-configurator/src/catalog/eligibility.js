/**
 * Everdale Product Platform — Commerce Eligibility Service
 */

import { isConfigurationCustomized } from './compatibility.js';

export class CommerceEligibilityService {
  /**
   * Evaluates whether a product configuration qualifies for direct purchase (In Stock -> ADD TO CART)
   * or Request Quote (Quick Ship / customized configuration -> REQUEST QUOTE).
   * @param {Object} product - Product catalog definition
   * @param {Object} variant - ProductVariant definition
   * @param {Object} config - Active configuration state
   */
  static evaluate(product, variant, config) {
    if (!product || !variant) {
      return {
        purchaseEligible: false,
        quoteEligible: false,
        isCustomized: false,
        channel: 'unavailable',
        reason: 'Product or variant not resolved',
      };
    }

    if (product.status !== 'published') {
      return {
        purchaseEligible: false,
        quoteEligible: product.quoteEnabled,
        isCustomized: false,
        channel: 'quote-only',
        reason: 'Product is currently unpublished / made to order.',
      };
    }

    const isCustomized = isConfigurationCustomized(config);
    const channelTab = isCustomized ? 'quickship' : config?.tab || 'in-stock';

    if (channelTab === 'quickship') {
      return {
        purchaseEligible: false,
        quoteEligible: true,
        isCustomized,
        channel: 'quickship',
        leadTimeWeeks: config?.purchaseMode === 'series' ? '2–4 weeks' : '3–5 weeks',
        ctaLabel: 'REQUEST QUOTE',
        depositPercentage: 50,
      };
    }

    const isDirectPurchase = product.purchaseEnabled && variant.availabilityStatus === 'in-stock';

    return {
      purchaseEligible: isDirectPurchase,
      quoteEligible: product.quoteEnabled,
      isCustomized: false,
      channel: 'in-stock',
      leadTimeWeeks: 'Immediate',
      ctaLabel: isDirectPurchase ? 'ADD TO CART' : 'REQUEST QUOTE',
      depositPercentage: 100,
    };
  }
}

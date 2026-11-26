/**
 * Everdale Product Platform — Pricing Service & Cost Engine
 * Supports Combo (Cabinet + Top + Handles + Faucet) and Series (Cabinet Only) modes.
 * Mirror selection is strictly for 3D visual preview ($0).
 */

import {
  BRAND_CONFIG,
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
} from './options.js';
import { VANITY_VARIANTS } from './variants.js';

function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export class PricingService {
  /**
   * Calculates the deterministic retail price, promotional rebates, and itemized breakdown.
   * @param {Object} config - active product configuration
   * @param {Object} options - calculation overrides (currency, custom discount)
   */
  static calculatePrice(config, options = {}) {
    const isSeries = config?.purchaseMode === 'series';
    const widthOpt = VANITY_VARIANTS.find((w) => w.id === config.width) || VANITY_VARIANTS[1];
    const finish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
    const hardware = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
    const countertop = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
    const faucet = FAUCET_OPTIONS.find((f) => f.id === config.faucet) || FAUCET_OPTIONS[0];

    const effectiveBasePrice = isSeries
      ? widthOpt.cabinetOnlyBasePrice || 599.0
      : widthOpt.basePrice || 799.0;
    const basinMultiplier = widthOpt.basinCount === 2 ? 2 : 1;

    const hardwareCharge = isSeries ? 0 : hardware.priceDelta || 0;
    const countertopCharge = isSeries ? 0 : countertop.priceDelta || 0;
    const faucetCharge = isSeries ? 0 : (faucet.priceDelta || 0) * basinMultiplier;

    const subtotal = roundCents(
      effectiveBasePrice +
        (finish.priceDelta || 0) +
        hardwareCharge +
        countertopCharge +
        faucetCharge
    );

    const rebateRate = options.rebateRate !== undefined ? options.rebateRate : BRAND_CONFIG.rebateRate;
    const rebateValue = roundCents(subtotal * rebateRate);
    const afterRebate = roundCents(subtotal - rebateValue);

    return {
      currency: options.currency || 'USD',
      currencySymbol: BRAND_CONFIG.currencySymbol,
      purchaseMode: isSeries ? 'series' : 'combo',
      basePrice: effectiveBasePrice,
      subtotal,
      rebateRate,
      rebateValue,
      afterRebate,
      isQuoteOnly: options.isQuoteOnly || false,
      breakdown: [
        {
          id: 'base-carcass',
          label: isSeries
            ? `Everdale ${widthOpt.baseWidthIn}″ Cabinet Series (${finish.name})`
            : `Everdale ${widthOpt.label} Combo (${finish.name})`,
          amount: roundCents(effectiveBasePrice + (finish.priceDelta || 0)),
        },
        !isSeries && hardwareCharge > 0
          ? { id: 'hardware-upgrade', label: `Hardware: ${hardware.name}`, amount: hardwareCharge }
          : null,
        !isSeries && countertopCharge > 0
          ? { id: 'countertop-upgrade', label: `Countertop: ${countertop.name}`, amount: countertopCharge }
          : null,
        !isSeries && faucetCharge > 0
          ? {
              id: 'faucet-package',
              label: widthOpt.basinCount === 2 ? `${faucet.name} (Dual Set)` : faucet.name,
              amount: faucetCharge,
            }
          : null,
      ].filter(Boolean),
    };
  }

  static formatCurrency(amount, currencySymbol = '$') {
    return `${currencySymbol}${roundCents(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

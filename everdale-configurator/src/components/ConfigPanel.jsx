import React from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  CheckCircle2,
  FileText,
  MousePointerClick,
  RotateCcw,
  Ruler,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import PartOptionsEditor, { getHotspotMeta } from './PartOptionsEditor';
import {
  BRAND_CONFIG,
  CABINET_FINISHES,
  CHANNELS,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_OPTIONS,
  PURCHASE_MODES,
  PricingService,
  VANITY_VARIANTS,
} from '../catalog/index';

function formatMoney(value) {
  return PricingService.formatCurrency(value, BRAND_CONFIG.currencySymbol);
}

export default function ConfigPanel({
  product,
  activeVariant,
  config,
  pricing,
  eligibility,
  isSaved,
  activeHotspot,
  onSelectHotspot,
  onUpdateConfig,
  onResetStandard,
  onPrimaryAction,
  onToggleSave,
  onOpenShare,
  onOpenSceneSettings,
}) {
  const variant = activeVariant || VANITY_VARIANTS[1];
  const isSeries = config.purchaseMode === 'series';
  const isCustomized = Boolean(eligibility?.isCustomized);
  const activeModeObj = PURCHASE_MODES.find((m) => m.id === (isSeries ? 'series' : 'combo')) || PURCHASE_MODES[0];
  const activeChannel = CHANNELS.find((c) => c.id === config.tab) || CHANNELS[0];

  const activeFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
  const activeHardware = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
  const activeCountertop =
    COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
  const activeFaucet = FAUCET_OPTIONS.find((f) => f.id === config.faucet) || FAUCET_OPTIONS[0];
  const activeMirror = MIRROR_OPTIONS.find((m) => m.id === config.mirror) || MIRROR_OPTIONS[0];
  const activeFaucetFinish =
    HARDWARE_FINISHES.find((h) => h.id === config.faucetFinish) || activeHardware;

  const isInStockTab = config.tab === 'in-stock';
  const totalHeightIn =
    config.backsplash === 'included'
      ? variant.heightIn + variant.backsplashIn
      : variant.heightIn;

  const faucetLabel =
    config.faucet === 'centerset-4'
      ? `${activeFaucetFinish.name}${variant.basinCount === 2 ? ' (×2)' : ''}`
      : 'Pre-drilled';

  const hotspotLaunchers = [
    { id: 'finish', label: 'Cabinet', value: activeFinish.name, tag: null },
    {
      id: 'hardware',
      label: 'Handles',
      value: activeHardware.name,
      tag: isSeries ? 'Preview' : null,
    },
    {
      id: 'countertop',
      label: 'Stone Top',
      value: activeCountertop.name,
      tag: isSeries ? 'Preview' : null,
    },
    {
      id: 'faucet',
      label: 'Faucet',
      value: faucetLabel,
      tag: isSeries ? 'Preview' : null,
    },
    {
      id: 'mirror',
      label: 'Mirror',
      value: activeMirror.name,
      tag: 'View $0',
    },
  ];

  const handleLauncherClick = (hotspotId) => {
    onSelectHotspot?.(activeHotspot === hotspotId ? null : hotspotId);
    if (window.innerWidth <= 1023) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <aside className="config-column" aria-label="Product Configuration Panel">
      {/* 1. Product Header */}
      <div className="pdp-config-header">
        <div className="pdp-eyebrow-row">
          <span className="pdp-eyebrow">{BRAND_CONFIG.catalogLabel}</span>
          <span className={`combo-badge category-tag-pill ${isSeries ? 'is-series' : 'is-combo'}`}>
            {isSeries ? 'Series · Cabinet Only' : 'Combo'}
          </span>
        </div>
        <h1 className="product-h1">
          {isSeries
            ? `Everdale ${variant.baseWidthIn}″ Cabinet Series`
            : `Everdale ${variant.label} ${variant.basinCount === 2 ? 'Double' : 'Single'} Vanity`}
        </h1>
        <p className="pdp-short-desc">{product?.shortDescription}</p>
        <div className="product-sku-line">
          <span>SKU {variant.sku}</span>
          <span>·</span>
          <span>
            {isSeries
              ? `Cabinet: ${variant.baseWidthIn}″W × ${variant.bodyDepthIn}″D × 33″H`
              : `${variant.topWidthIn}″W × ${variant.depthIn}″D × ${variant.heightIn}″H${
                  config.backsplash === 'included' ? ` (+${variant.backsplashIn}″ splash)` : ''
                }`}
          </span>
          <span>·</span>
          <a href="#dimensions-specs" className="inline-spec-jump">
            Full specs
          </a>
        </div>
      </div>

      {/* 2. Fulfillment Tabs (In Stock | Quick Ship), Pricing & Primary Action CTA */}
      <div className="pricing-card">
        <div className="channel-inline-tabs" role="tablist" aria-label="Fulfillment channel">
          {CHANNELS.map((ch) => {
            const effectiveTab = isCustomized ? 'quickship' : config.tab;
            const isActive = effectiveTab === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`channel-inline-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (ch.id === 'in-stock' && isCustomized) {
                    onResetStandard?.();
                  } else {
                    onUpdateConfig({ tab: ch.id });
                  }
                }}
              >
                {ch.id === 'in-stock' && <span className="channel-dot" />}
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {isInStockTab && !isCustomized ? (
          <>
            <div className="pricing-grid">
              <div>
                <div className="price-col-label">
                  {isSeries ? 'Cabinet Retail' : 'Combo Retail'}
                </div>
                <div className="price-regular">{formatMoney(pricing.subtotal)}</div>
              </div>
              {BRAND_CONFIG.rebateRate > 0 && (
                <div>
                  <div className="price-col-label">{BRAND_CONFIG.rebateLabel}</div>
                  <div className="price-rebate">-{formatMoney(pricing.rebateValue)}</div>
                </div>
              )}
              <div>
                <div className="price-col-label">Est. After Savings*</div>
                <div>
                  <motion.span
                    key={`final-${pricing.afterRebate}`}
                    initial={{ opacity: 0.5, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="price-final"
                  >
                    {formatMoney(pricing.afterRebate)}
                  </motion.span>
                </div>
              </div>
            </div>

            <div className="stock-banner">
              <CheckCircle2 size={15} />
              <span>
                <strong>{BRAND_CONFIG.storeStockCount}</strong> {BRAND_CONFIG.storeStockMessage}
              </span>
            </div>
            <p className="price-footnote">{BRAND_CONFIG.rebateFootnote}</p>
          </>
        ) : (
          <>
            <div className="pricing-grid" style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <div className="price-col-label">
                  {isCustomized
                    ? isSeries
                      ? 'Customized Cabinet Estimate'
                      : 'Customized Combo Estimate'
                    : 'Quick Ship Estimate'}
                </div>
                <div>
                  <motion.span
                    key={`cust-${pricing.subtotal}`}
                    initial={{ opacity: 0.5, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="price-final"
                  >
                    {formatMoney(pricing.subtotal)}
                  </motion.span>
                  <span className="price-unit">quote est.</span>
                </div>
              </div>
              {isCustomized ? (
                <button
                  type="button"
                  className="reset-standard-link"
                  onClick={onResetStandard}
                  title="Revert to standard In Stock configuration"
                >
                  <RotateCcw size={12} />
                  <span>Reset to In Stock</span>
                </button>
              ) : (
                <span className="combo-badge">{activeChannel.label}</span>
              )}
            </div>

            <div className="quote-banner">
              <strong>
                {isCustomized
                  ? `Quick Ship (${eligibility?.leadTimeWeeks || '3–5 weeks'}) · Custom Selection`
                  : `Lead Time: ${eligibility?.leadTimeWeeks || '3–5 weeks'}`}
              </strong>
              <span>
                {isCustomized
                  ? 'Customizing any product attribute switches to Quick Ship. Submit below to request a quote.'
                  : activeChannel.depositNote}
              </span>
            </div>
          </>
        )}

        <div className="cta-row">
          <button type="button" className="btn-primary-cta" onClick={onPrimaryAction}>
            {isInStockTab && !isCustomized && eligibility?.purchaseEligible ? (
              <ShoppingBag size={16} />
            ) : (
              <FileText size={16} />
            )}
            <span>{eligibility?.ctaLabel || 'ADD TO CART'}</span>
          </button>

          <button
            type="button"
            className={`btn-secondary-cta ${isSaved ? 'saved' : ''}`}
            onClick={onToggleSave}
            title="Save configuration"
            aria-label="Save configuration"
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            className="btn-secondary-cta"
            onClick={onOpenShare}
            title="Share configuration URL"
            aria-label="Share configuration URL"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* 4. Primary Control: Change Product Size */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Change Product Size</span>
          <span className="section-value">
            {isSeries ? `${variant.baseWidthIn}″ cabinet box` : variant.note}
          </span>
        </div>
        <div className="pill-row" role="radiogroup" aria-label="Product size">
          {VANITY_VARIANTS.map((w) => {
            const pillPrice = isSeries ? w.cabinetOnlyBasePrice : w.basePrice;
            const displayLabel = isSeries ? `${w.baseWidthIn}″` : w.label;
            return (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={config.width === w.id}
                title={w.note}
                className={`size-pill ${config.width === w.id ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ width: w.id })}
              >
                <span>{displayLabel}</span>
                <small className="pill-sub">${pillPrice}</small>
                {w.basinCount === 2 && <small className="pill-sub">Double</small>}
              </button>
            );
          })}
        </div>

        <div className="depth-spec-line">
          <span>Depth: <strong>{variant.depthIn}″ ({variant.depthMm} mm)</strong></span>
          <span>·</span>
          <span>Cabinet Body: <strong>{variant.baseWidthIn}″W × {variant.bodyDepthIn}″D</strong></span>
        </div>

        <div className="toggle-row">
          <div className="toggle-text">
            <span className="toggle-title">
              <Ruler size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
              3D Dimension Guides
            </span>
            <span className="toggle-desc">
              Show {variant.topWidthIn}″W × {variant.depthIn}″D × {totalHeightIn}″H overlay
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.showDimensions}
            aria-label="Toggle 3D dimension guides"
            className={`switch-btn ${config.showDimensions ? 'on' : ''}`}
            onClick={() => onUpdateConfig({ showDimensions: !config.showDimensions })}
          >
            <span className="switch-knob" />
          </button>
        </div>
      </div>

      {/* 5. Finish & Fixtures Customization (All Option Lists Expanded on Desktop; Touch Launchers + 3D Pins on Mobile) */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">
            <MousePointerClick size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
            Customize Finish &amp; Fixtures
          </span>
          <span className="section-value desktop-only-hint">Available options</span>
          <span className="section-value mobile-only-hint">Tap badge or below</span>
        </div>

        {/* Desktop (>= 1024px): Direct list of all available options (no button group) */}
        <div className="desktop-inline-options-list" aria-label="Available customization options">
          {hotspotLaunchers.map((item) => {
            const meta = getHotspotMeta(item.id, isSeries);
            if (!meta) return null;
            return (
              <div
                key={item.id}
                className="desktop-option-section"
                role="region"
                aria-label={meta.title}
              >
                <div className="desktop-option-section-head">
                  <div>
                    <div className="desktop-option-section-title">{meta.title}</div>
                    <div className="desktop-option-section-sub">{meta.badge}</div>
                  </div>
                  <div className="desktop-option-active-pill">
                    <span>{item.value}</span>
                    {item.tag && <span className="launcher-tag">{item.tag}</span>}
                  </div>
                </div>
                <div className="desktop-inline-customizer-body">
                  <PartOptionsEditor
                    activeHotspot={item.id}
                    config={config}
                    isDouble={variant.basinCount === 2}
                    isSeries={isSeries}
                    onUpdateConfig={onUpdateConfig}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile (<= 1023px): Quick jump buttons paired with 3D hotspot pins & canvas popover */}
        <div className="hotspot-launcher-grid">
          {hotspotLaunchers.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`hotspot-launcher-btn ${activeHotspot === item.id ? 'active' : ''}`}
              onClick={() => handleLauncherClick(item.id)}
            >
              <div className="launcher-top">
                <span className="launcher-name">{item.label}</span>
                {item.tag && <span className="launcher-tag">{item.tag}</span>}
              </div>
              <span className="launcher-val">{item.value}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="env-quick-btn"
          onClick={onOpenSceneSettings}
        >
          <SlidersHorizontal size={14} />
          <span>Room Walls, Floor &amp; Lighting Staging</span>
        </button>
      </div>

      {/* 6. Active Configuration Receipt */}
      <div className="config-summary-box">
        <div className="section-header">
          <span className="section-title">Active Selection</span>
          <span className="section-value">{variant.sku}</span>
        </div>
        <div className="spec-list">
          <div className="spec-row">
            <span>Product Category</span>
            <span>{activeModeObj.label}</span>
          </div>
          <div className="spec-row">
            <span>Cabinet Finish</span>
            <span>{activeFinish.name}</span>
          </div>
          <div className="spec-row">
            <span>Handles {isSeries ? '(Preview)' : ''}</span>
            <span>{activeHardware.name}</span>
          </div>
          <div className="spec-row">
            <span>Countertop {isSeries ? '(Preview)' : ''}</span>
            <span>
              {activeCountertop.name}
              {config.backsplash === 'included' ? ' + 4″ Splash' : ''}
            </span>
          </div>
          <div className="spec-row">
            <span>Faucet {isSeries ? '(Preview)' : ''}</span>
            <span>{activeFaucet.id === 'centerset-4' ? faucetLabel : 'Pre-drilled Only'}</span>
          </div>
          <div className="spec-row">
            <span>Mirror (View Only · $0)</span>
            <span>{activeMirror.name}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

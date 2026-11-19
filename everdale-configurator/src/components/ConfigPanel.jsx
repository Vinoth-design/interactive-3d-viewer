import React from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Check,
  CheckCircle2,
  FileText,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import {
  BACKSPLASH_OPTIONS,
  BRAND_CONFIG,
  CABINET_FINISHES,
  CHANNELS,
  COUNTERTOP_FINISHES,
  DEPTH_OPTIONS,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_FRAMES_METAL,
  MIRROR_FRAMES_WOOD,
  MIRROR_OPTIONS,
  PRODUCT_BASE,
  SCENE_LIGHTING_PRESETS,
  WIDTH_OPTIONS,
} from '../config/productConfig';

function formatMoney(value) {
  return `${BRAND_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

export default function ConfigPanel({
  config,
  pricing,
  isSaved,
  onUpdateConfig,
  onPrimaryAction,
  onToggleSave,
}) {
  const activeChannel = CHANNELS.find((c) => c.id === config.tab) || CHANNELS[0];
  const activeWidth = WIDTH_OPTIONS.find((w) => w.id === config.width) || WIDTH_OPTIONS[1];
  const activeFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
  const activeHardware = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
  const activeCountertop =
    COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
  const activeMirror = MIRROR_OPTIONS.find((m) => m.id === config.mirror) || MIRROR_OPTIONS[0];
  const activeFaucetFinish =
    HARDWARE_FINISHES.find((h) => h.id === config.faucetFinish) || activeHardware;

  const isInStockTab = config.tab === 'in-stock';
  const showWoodFrames = activeMirror.frameType === 'wood';
  const showMetalFrames = activeMirror.frameType === 'metal';

  const frameList = showWoodFrames ? MIRROR_FRAMES_WOOD : showMetalFrames ? MIRROR_FRAMES_METAL : [];
  const activeFrame = frameList.find((f) => f.id === config.frame) || frameList[0];

  const handleMirrorSelect = (mirrorObj) => {
    const patch = { mirror: mirrorObj.id };
    if (mirrorObj.frameType === 'wood') {
      const valid = MIRROR_FRAMES_WOOD.some((f) => f.id === config.frame);
      if (!valid) patch.frame = MIRROR_FRAMES_WOOD[0].id;
    } else if (mirrorObj.frameType === 'metal') {
      const valid = MIRROR_FRAMES_METAL.some((f) => f.id === config.frame);
      if (!valid) patch.frame = config.hardware;
    }
    onUpdateConfig(patch);
  };

  const handleHardwareSelect = (hwId) => {
    // Synchronize hardware & faucet finish cleanly (like the reference Semi-custom sync)
    onUpdateConfig({ hardware: hwId, faucetFinish: hwId });
  };

  const totalHeightIn =
    config.backsplash === 'included'
      ? PRODUCT_BASE.dimensions.heightIn + PRODUCT_BASE.dimensions.backsplashIn
      : PRODUCT_BASE.dimensions.heightIn;

  return (
    <aside className="config-column" aria-label="Vanity Configuration Options">
      {/* 1. Product Summary Header */}
      <div>
        <div className="product-title-row">
          <h1 className="product-h1">{`Everdale ${activeWidth.label} ${activeWidth.basinCount === 2 ? 'Double' : 'Single'} Vanity`}</h1>
          <span className="combo-badge">{PRODUCT_BASE.badge}</span>
        </div>
        <div className="product-sku-line">
          <span>SKU {activeWidth.sku}</span>
          <span>·</span>
          <span>
            {activeWidth.topWidthIn}″W × {PRODUCT_BASE.dimensions.depthIn}″D ×{' '}
            {PRODUCT_BASE.dimensions.heightIn}″H
            {config.backsplash === 'included' ? ' (+4″ backsplash)' : ''}
          </span>
        </div>
      </div>

      {/* 2. Dynamic Pricing / Rebate / Availability Card */}
      <div className="pricing-card">
        {isInStockTab ? (
          <>
            <div className="pricing-grid">
              <div>
                <div className="price-col-label">Retail Price</div>
                <motion.div
                  key={`subtotal-${pricing.subtotal}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="price-regular"
                >
                  {formatMoney(pricing.subtotal)}
                </motion.div>
              </div>
              {BRAND_CONFIG.rebateRate > 0 && (
                <div>
                  <div className="price-col-label">{BRAND_CONFIG.rebateLabel}</div>
                  <motion.div
                    key={`rebate-${pricing.rebateValue}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="price-rebate"
                  >
                    -{formatMoney(pricing.rebateValue)}
                  </motion.div>
                </div>
              )}
              <div>
                <div className="price-col-label">After Savings*</div>
                <div>
                  <motion.span
                    key={`final-${pricing.afterRebate}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="price-final"
                  >
                    {formatMoney(pricing.afterRebate)}
                  </motion.span>
                  <span className="price-unit">ea</span>
                </div>
              </div>
            </div>

            <div className="stock-banner">
              <CheckCircle2 size={16} />
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
                <div className="price-col-label">Estimated Configured Total</div>
                <div>
                  <motion.span
                    key={`subtotal-custom-${pricing.subtotal}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="price-final"
                  >
                    {formatMoney(pricing.subtotal)}
                  </motion.span>
                  <span className="price-unit">configured</span>
                </div>
              </div>
              <span className="combo-badge">{activeChannel.label}</span>
            </div>

            <div className="quote-banner">
              <strong>{activeChannel.leadTime}</strong>
              {activeChannel.depositNote && <span>{activeChannel.depositNote}</span>}
            </div>
          </>
        )}

        <div className="cta-row">
          <motion.button
            type="button"
            className="btn-primary-cta"
            onClick={onPrimaryAction}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(42, 64, 53, 0.28)' }}
            whileTap={{ scale: 0.97 }}
          >
            {isInStockTab ? <ShoppingCart size={17} /> : <FileText size={17} />}
            <span>{activeChannel.ctaLabel}</span>
          </motion.button>

          <motion.button
            type="button"
            className={`btn-secondary-cta ${isSaved ? 'saved' : ''}`}
            onClick={onToggleSave}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save to list'}</span>
          </motion.button>
        </div>
      </div>

      {/* 3. Dimensions & Width / Depth Controls */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Width</span>
          <span className="section-value">{activeWidth.note}</span>
        </div>
        <div className="pill-row">
          {WIDTH_OPTIONS.map((w) => (
            <motion.button
              key={w.id}
              type="button"
              disabled={w.disabled}
              title={w.note}
              className={`size-pill ${config.width === w.id ? 'active' : ''}`}
              onClick={() => onUpdateConfig({ width: w.id })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {w.label}
            </motion.button>
          ))}
        </div>

        <div className="section-header" style={{ marginTop: 6 }}>
          <span className="section-title">Depth</span>
          <span className="section-value">{config.depth}″ Standard</span>
        </div>
        <div className="pill-row">
          {DEPTH_OPTIONS.map((d) => (
            <motion.button
              key={d.id}
              type="button"
              disabled={d.disabled}
              className={`size-pill ${config.depth === d.id ? 'active' : ''}`}
              onClick={() => onUpdateConfig({ depth: d.id })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {d.label}
            </motion.button>
          ))}
        </div>

        {/* Dimensions Toggle (Show on 3D Model) */}
        <div className="toggle-row" style={{ marginTop: 4 }}>
          <div className="toggle-text">
            <span className="toggle-title">Dimensions: Show on 3D model</span>
            <span className="toggle-desc">
              Overlay 31″W × 19″D × {totalHeightIn}″H guides directly on the vanity
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.showDimensions}
            className={`switch-btn ${config.showDimensions ? 'on' : ''}`}
            onClick={() => onUpdateConfig({ showDimensions: !config.showDimensions })}
          >
            <span className="switch-knob" />
          </button>
        </div>
      </div>

      {/* 4. Cabinet Finish Swatches */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Cabinet Finish</span>
          <span className="section-value">
            {activeFinish.name} ({activeFinish.code})
          </span>
        </div>
        <div className="swatch-grid">
          {CABINET_FINISHES.map((fin) => {
            const isActive = config.finish === fin.id;
            const isDark = fin.id === 'midnight-blue';
            return (
              <button
                key={fin.id}
                type="button"
                className={`swatch-item ${isActive ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ finish: fin.id })}
              >
                <span className="swatch-ring">
                  <span className="swatch-fill" style={{ backgroundColor: fin.hex }}>
                    {isActive && <Check size={16} color={isDark ? '#ffffff' : '#171d1a'} strokeWidth={2.8} />}
                  </span>
                </span>
                <span className="swatch-label">{fin.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Hardware Finish */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">
            Hardware Finish
            {config.tab === 'semi-custom' && (
              <span className="combo-badge" style={{ padding: '2px 7px', fontSize: 10 }}>
                <Sparkles size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                Synced
              </span>
            )}
          </span>
          <span className="section-value">{activeHardware.name}</span>
        </div>
        <div className="option-cards-grid">
          {HARDWARE_FINISHES.map((hw) => {
            const isActive = config.hardware === hw.id;
            return (
              <button
                key={hw.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => handleHardwareSelect(hw.id)}
              >
                <div className="option-card-top">
                  <span className="option-card-title">
                    <span className="mini-dot" style={{ backgroundColor: hw.hex }} />
                    {hw.name}
                  </span>
                  <span className="option-card-price">
                    {hw.priceDelta === 0 ? 'Included' : `+${formatMoney(hw.priceDelta)}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Countertop & Backsplash */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Countertop &amp; Integrated Basin</span>
          <span className="section-value">{activeCountertop.name}</span>
        </div>
        <div className="option-cards-grid cols-1">
          {COUNTERTOP_FINISHES.map((ct) => {
            const isActive = config.countertop === ct.id;
            return (
              <button
                key={ct.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ countertop: ct.id })}
              >
                <div className="option-card-top">
                  <span className="option-card-title">
                    <span className="mini-dot" style={{ backgroundColor: ct.swatchHex }} />
                    {ct.name}
                  </span>
                  <span className="option-card-price">
                    {ct.priceDelta === 0 ? 'Included' : `+${formatMoney(ct.priceDelta)}`}
                  </span>
                </div>
                <span className="option-card-sub">{ct.subtitle}</span>
              </button>
            );
          })}
        </div>

        <div className="section-header" style={{ marginTop: 6 }}>
          <span className="section-title">Backsplash</span>
          <span className="section-value">
            {config.backsplash === 'included' ? '4″ Matching Stone' : 'Removed'}
          </span>
        </div>
        <div className="option-cards-grid">
          {BACKSPLASH_OPTIONS.map((bs) => {
            const isActive = config.backsplash === bs.id;
            return (
              <button
                key={bs.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ backsplash: bs.id })}
              >
                <div className="option-card-top">
                  <span className="option-card-title">{bs.name}</span>
                </div>
                <span className="option-card-sub">{bs.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Faucet & Pop-up Drain */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Faucet &amp; Drain Trim</span>
          <span className="section-value">
            {config.faucet === 'centerset-4' ? `4″ Centerset (${activeFaucetFinish.name})` : 'Pre-drilled Only'}
          </span>
        </div>
        <div className="option-cards-grid cols-1">
          {FAUCET_OPTIONS.map((f) => {
            const isActive = config.faucet === f.id;
            return (
              <button
                key={f.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ faucet: f.id })}
              >
                <div className="option-card-top">
                  <span className="option-card-title">{f.name}</span>
                  <span className="option-card-price">
                    {f.priceDelta === 0 ? '—' : `+${formatMoney(f.priceDelta)}`}
                  </span>
                </div>
                <span className="option-card-sub">{f.subtitle}</span>
              </button>
            );
          })}
        </div>

        {config.faucet === 'centerset-4' && (
          <div style={{ marginTop: 4 }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <span className="section-title" style={{ fontSize: 13 }}>
                Faucet Metal Finish
              </span>
              <span className="section-value">{activeFaucetFinish.name}</span>
            </div>
            <div className="swatch-grid">
              {HARDWARE_FINISHES.map((hw) => {
                const isActive = config.faucetFinish === hw.id;
                return (
                  <button
                    key={hw.id}
                    type="button"
                    className={`swatch-item ${isActive ? 'active' : ''}`}
                    onClick={() => onUpdateConfig({ faucetFinish: hw.id })}
                  >
                    <span className="swatch-ring">
                      <span className="swatch-fill" style={{ backgroundColor: hw.hex }}>
                        {isActive && (
                          <Check
                            size={15}
                            color={hw.id === 'matte-black' ? '#ffffff' : '#171d1a'}
                            strokeWidth={2.8}
                          />
                        )}
                      </span>
                    </span>
                    <span className="swatch-label">{hw.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 8. Mirror & Conditional Frame Selection */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Matching Mirror</span>
          <span className="section-value">{activeMirror.name}</span>
        </div>
        <div className="option-cards-grid">
          {MIRROR_OPTIONS.map((m) => {
            const isActive = config.mirror === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => handleMirrorSelect(m)}
              >
                <div className="option-card-top">
                  <span className="option-card-title">{m.name}</span>
                  <span className="option-card-price">
                    {m.priceDelta === 0 ? '—' : `+${formatMoney(m.priceDelta)}`}
                  </span>
                </div>
                <span className="option-card-sub">{m.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Conditional Mirror Frame Swatches (Hidden for No Mirror & LED Backlit) */}
        {frameList.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <span className="section-title" style={{ fontSize: 13 }}>
                {showWoodFrames ? 'Wood Frame Finish' : 'Metal Frame Finish'}
              </span>
              <span className="section-value">{activeFrame?.name}</span>
            </div>
            <div className="swatch-grid">
              {frameList.map((fr) => {
                const isActive = (activeFrame?.id || '') === fr.id;
                const swatchColor = fr.dynamicMatch ? activeFinish.hex : fr.hex;
                const isDark = fr.id === 'matte-black' || fr.id === 'warm-walnut' || (fr.dynamicMatch && activeFinish.id === 'midnight-blue');
                return (
                  <button
                    key={fr.id}
                    type="button"
                    className={`swatch-item ${isActive ? 'active' : ''}`}
                    onClick={() => onUpdateConfig({ frame: fr.id })}
                  >
                    <span className="swatch-ring">
                      <span className="swatch-fill" style={{ backgroundColor: swatchColor }}>
                        {isActive && <Check size={15} color={isDark ? '#ffffff' : '#171d1a'} strokeWidth={2.8} />}
                      </span>
                    </span>
                    <span className="swatch-label">{fr.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 9. Interior Organization Toggle */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Interior Organization</span>
          <span className="section-value">{config.showTrays ? '2 Trays Installed' : 'Open Drawer'}</span>
        </div>
        <div className="toggle-row">
          <div className="toggle-text">
            <span className="toggle-title">Modular Accessory Trays (Lower Drawer)</span>
            <span className="toggle-desc">
              Open the lower drawer in the 3D view to inspect the 2 removable organizer trays
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.showTrays}
            className={`switch-btn ${config.showTrays ? 'on' : ''}`}
            onClick={() => onUpdateConfig({ showTrays: !config.showTrays })}
          >
            <span className="switch-knob" />
          </button>
        </div>
      </div>

      {/* 10. Room Atmosphere & Lighting */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Room Atmosphere &amp; Lighting</span>
          <span className="section-value">
            {SCENE_LIGHTING_PRESETS.find((l) => l.id === (config.lighting || 'warm-bath'))?.name || 'Warm Bath'}
          </span>
        </div>
        <div className="option-cards-grid">
          {SCENE_LIGHTING_PRESETS.map((preset) => {
            const isActive = (config.lighting || 'warm-bath') === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`option-card ${isActive ? 'active' : ''}`}
                onClick={() => onUpdateConfig({ lighting: preset.id })}
              >
                <div className="option-card-top">
                  <span className="option-card-title">{preset.name}</span>
                  <span
                    className="option-card-price"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                    }}
                  >
                    {preset.badge}
                  </span>
                </div>
                <span className="option-card-sub" style={{ fontSize: 11.5 }}>
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 11. Product Specifications & Highlights */}
      <div className="config-section">
        <div className="section-header">
          <span className="section-title">Product Specifications</span>
          <span className="section-value">SKU {activeWidth.sku}</span>
        </div>

        <div className="spec-list">
          <div className="spec-row">
            <span>Overall Width</span>
            <span>{activeWidth.topWidthIn}″ ({activeWidth.topWidthMm} mm)</span>
          </div>
          <div className="spec-row">
            <span>Overall Depth</span>
            <span>19″ (482.6 mm)</span>
          </div>
          <div className="spec-row">
            <span>Vanity Height (excl. backsplash)</span>
            <span>34″ (863.6 mm)</span>
          </div>
          <div className="spec-row">
            <span>Backsplash Height</span>
            <span>{config.backsplash === 'included' ? '4″ (101.6 mm) · 38″ Total' : 'Not installed'}</span>
          </div>
          <div className="spec-row">
            <span>Drawer Configuration</span>
            <span>
              {activeWidth.id === '61'
                ? '2 Fixed False (No Handles) + 4 Independent Soft-Close Drawers'
                : '1 Fixed False (No Handle) + 2 Soft-Close Functional Drawers'}
            </span>
          </div>
          <div className="spec-row">
            <span>Basin &amp; Faucet Drilling</span>
            <span>
              {activeWidth.id === '61'
                ? 'Dual Sinks · 4″ Centerset (Two 3-Hole Drill Sets)'
                : 'Single Sink · 4″ Centerset (3-Hole Pre-drilled)'}
            </span>
          </div>
          <div className="spec-row">
            <span>Cabinet &amp; Leg Construction</span>
            <span>Painted MDF Carcass · Solid Wood Legs</span>
          </div>
        </div>

        <ul className="highlights-list" style={{ marginTop: 6 }}>
          {PRODUCT_BASE.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

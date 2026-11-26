import React from 'react';
import { Check } from 'lucide-react';
import {
  BACKSPLASH_OPTIONS,
  BRAND_CONFIG,
  CABINET_FINISHES,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_FRAMES_METAL,
  MIRROR_FRAMES_WOOD,
  MIRROR_OPTIONS,
  PricingService,
} from '../catalog/index';
import { getSwatchBackgroundStyle } from './SwatchPreview';

function formatMoney(value) {
  return PricingService.formatCurrency(value, BRAND_CONFIG.currencySymbol);
}

export function getHotspotMeta(activeHotspot, isSeries) {
  const map = {
    finish: {
      title: 'Cabinet Finish',
      badge: isSeries ? 'Included / Upgrade' : 'Combo Finish',
      showPricing: true,
    },
    hardware: {
      title: 'Handles & Pulls',
      badge: isSeries ? 'Visual Preview Only' : 'Included in Combo',
      showPricing: !isSeries,
    },
    countertop: {
      title: 'Countertop & Backsplash',
      badge: isSeries ? 'Visual Preview Only' : 'Combo Countertop',
      showPricing: !isSeries,
    },
    faucet: {
      title: 'Faucet & Trim',
      badge: isSeries ? 'Visual Preview Only' : 'Combo Option',
      showPricing: !isSeries,
    },
    mirror: {
      title: 'Wall Mirror Preview',
      badge: 'Viewing Experience Only · $0',
      showPricing: false,
    },
  };
  return activeHotspot ? map[activeHotspot] || null : null;
}

/**
 * Shared contextual option selector rendered inside the 3D canvas popover on mobile
 * and directly inside the right configuration panel on desktop screens.
 */
export default function PartOptionsEditor({
  activeHotspot,
  config,
  isDouble = false,
  isSeries = false,
  onUpdateConfig,
}) {
  const meta = getHotspotMeta(activeHotspot, isSeries);
  if (!activeHotspot || !meta) return null;

  const activeMirror = MIRROR_OPTIONS.find((m) => m.id === config.mirror) || MIRROR_OPTIONS[0];
  const frameList =
    activeMirror.frameType === 'wood'
      ? MIRROR_FRAMES_WOOD
      : activeMirror.frameType === 'metal'
        ? MIRROR_FRAMES_METAL
        : [];
  const activeFrame = frameList.find((f) => f.id === config.frame) || frameList[0];
  const activeFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];

  const handleMirrorSelect = (mirrorObj) => {
    const patch = { mirror: mirrorObj.id };
    if (mirrorObj.frameType === 'wood') {
      const valid = MIRROR_FRAMES_WOOD.some((f) => f.id === config.frame);
      if (!valid) patch.frame = MIRROR_FRAMES_WOOD[0].id;
    } else if (mirrorObj.frameType === 'metal') {
      const valid = MIRROR_FRAMES_METAL.some((f) => f.id === config.frame);
      if (!valid) patch.frame = config.hardware;
    }
    onUpdateConfig?.(patch);
  };

  if (activeHotspot === 'finish') {
    return (
      <div className="hotspot-swatch-grid">
        {CABINET_FINISHES.map((fin) => {
          const selected = config.finish === fin.id;
          const isDark =
            fin.id === 'midnight-blue' || fin.id === 'charcoal' || fin.id === 'walnut';
          return (
            <button
              key={fin.id}
              type="button"
              aria-pressed={selected}
              className={`hotspot-swatch-btn ${selected ? 'active' : ''}`}
              onClick={() => onUpdateConfig?.({ finish: fin.id })}
            >
              <span
                className="hotspot-swatch-circle"
                style={getSwatchBackgroundStyle(fin, fin.finishType === 'wood' ? 'wood' : 'cabinet')}
              >
                {selected && <Check size={13} color={isDark ? '#fff' : '#171d1a'} strokeWidth={2.8} />}
              </span>
              <span className="hotspot-swatch-name">{fin.name}</span>
              <span className="hotspot-swatch-price">
                {fin.priceDelta === 0 ? 'Included' : `+${formatMoney(fin.priceDelta)}`}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (activeHotspot === 'hardware') {
    return (
      <div className="hotspot-card-grid">
        {HARDWARE_FINISHES.map((hw) => {
          const selected = config.hardware === hw.id;
          return (
            <button
              key={hw.id}
              type="button"
              aria-pressed={selected}
              className={`hotspot-option-card ${selected ? 'active' : ''}`}
              onClick={() => onUpdateConfig?.({ hardware: hw.id, faucetFinish: hw.id })}
            >
              <div className="hotspot-card-row">
                <span className="mini-dot" style={getSwatchBackgroundStyle(hw, 'hardware')} />
                <span className="hotspot-card-name">{hw.name}</span>
              </div>
              {meta.showPricing && (
                <span className="hotspot-card-price">
                  {hw.priceDelta === 0 ? 'Included' : `+${formatMoney(hw.priceDelta)}`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (activeHotspot === 'countertop') {
    return (
      <>
        <div className="hotspot-card-grid cols-1">
          {COUNTERTOP_FINISHES.map((ct) => {
            const selected = config.countertop === ct.id;
            return (
              <button
                key={ct.id}
                type="button"
                aria-pressed={selected}
                className={`hotspot-option-card ${selected ? 'active' : ''}`}
                onClick={() => onUpdateConfig?.({ countertop: ct.id })}
              >
                <div className="hotspot-card-row">
                  <span className="stone-swatch-tile" style={getSwatchBackgroundStyle(ct, 'countertop')} />
                  <span className="hotspot-card-name">{ct.name}</span>
                </div>
                {meta.showPricing && (
                  <span className="hotspot-card-price">
                    {ct.priceDelta === 0 ? 'Included' : `+${formatMoney(ct.priceDelta)}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="hotspot-sub-row">
          <span>4″ Matching Backsplash</span>
          <div className="hotspot-mini-pills">
            {BACKSPLASH_OPTIONS.map((bs) => (
              <button
                key={bs.id}
                type="button"
                className={`hotspot-mini-pill ${config.backsplash === bs.id ? 'active' : ''}`}
                onClick={() => onUpdateConfig?.({ backsplash: bs.id })}
              >
                {bs.id === 'included' ? 'Included' : 'No Splash'}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (activeHotspot === 'faucet') {
    return (
      <>
        <div className="hotspot-card-grid cols-1">
          {FAUCET_OPTIONS.map((f) => {
            const selected = config.faucet === f.id;
            const effectiveDelta = f.priceDelta * (isDouble ? 2 : 1);
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={selected}
                className={`hotspot-option-card ${selected ? 'active' : ''}`}
                onClick={() => onUpdateConfig?.({ faucet: f.id })}
              >
                <div className="hotspot-card-row">
                  <span className="hotspot-card-name">{f.name}</span>
                </div>
                {meta.showPricing && (
                  <span className="hotspot-card-price">
                    {effectiveDelta === 0 ? 'Included' : `+${formatMoney(effectiveDelta)}${isDouble ? ' (×2)' : ''}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {config.faucet === 'centerset-4' && (
          <div className="hotspot-sub-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>Faucet Finish Color</span>
            <div className="hotspot-swatch-grid">
              {HARDWARE_FINISHES.map((hw) => {
                const selected = config.faucetFinish === hw.id;
                return (
                  <button
                    key={hw.id}
                    type="button"
                    aria-pressed={selected}
                    className={`hotspot-swatch-btn ${selected ? 'active' : ''}`}
                    onClick={() => onUpdateConfig?.({ faucetFinish: hw.id })}
                  >
                    <span
                      className="hotspot-swatch-circle"
                      style={getSwatchBackgroundStyle(hw, 'hardware')}
                    >
                      {selected && (
                        <Check size={13} color={hw.id === 'matte-black' ? '#fff' : '#171d1a'} strokeWidth={2.8} />
                      )}
                    </span>
                    <span className="hotspot-swatch-name">{hw.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  if (activeHotspot === 'mirror') {
    return (
      <>
        <div className="hotspot-card-grid">
          {MIRROR_OPTIONS.map((m) => {
            const selected = config.mirror === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                className={`hotspot-option-card ${selected ? 'active' : ''}`}
                onClick={() => handleMirrorSelect(m)}
              >
                <div className="hotspot-card-row">
                  <span className="hotspot-card-name">{m.name}</span>
                </div>
                <span className="hotspot-card-sub">{m.subtitle}</span>
              </button>
            );
          })}
        </div>
        {frameList.length > 0 && (
          <div className="hotspot-sub-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>Mirror Frame Preview</span>
            <div className="hotspot-swatch-grid">
              {frameList.map((fr) => {
                const selected = (activeFrame?.id || '') === fr.id;
                const eff = fr.dynamicMatch ? activeFinish : fr;
                const cat =
                  activeMirror.frameType === 'wood'
                    ? eff.finishType === 'wood' || fr.woodKey
                      ? 'wood'
                      : 'cabinet'
                    : 'hardware';
                return (
                  <button
                    key={fr.id}
                    type="button"
                    aria-pressed={selected}
                    className={`hotspot-swatch-btn ${selected ? 'active' : ''}`}
                    onClick={() => onUpdateConfig?.({ frame: fr.id })}
                  >
                    <span className="hotspot-swatch-circle" style={getSwatchBackgroundStyle(eff, cat)}>
                      {selected && (
                        <Check
                          size={13}
                          color={
                            eff?.id === 'matte-black' ||
                            eff?.id === 'midnight-blue' ||
                            eff?.id === 'charcoal' ||
                            eff?.id === 'walnut'
                              ? '#fff'
                              : '#171d1a'
                          }
                          strokeWidth={2.8}
                        />
                      )}
                    </span>
                    <span className="hotspot-swatch-name">{fr.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

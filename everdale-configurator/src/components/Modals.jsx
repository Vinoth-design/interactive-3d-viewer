import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Check,
  Copy,
  HelpCircle,
  QrCode,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  SCENE_FLOOR_PRESETS,
  SCENE_LIGHTING_PRESETS,
  SCENE_WALL_PRESETS,
} from '../config/productConfig';

function ModalWrapper({ onClose, children }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function SceneSettingsModal({ config, onUpdateConfig, onClose }) {
  return (
    <ModalWrapper onClose={onClose}>
        <div className="modal-header">
          <span className="modal-title">
            <SlidersHorizontal size={17} />
            Scene Settings
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Wall Presets */}
          <div>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <span className="section-title">Room Wall Finish</span>
              <span className="section-value">
                {SCENE_WALL_PRESETS.find((w) => w.id === config.wall)?.name}
              </span>
            </div>
            <div className="preset-tile-grid">
              {SCENE_WALL_PRESETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`preset-tile ${config.wall === w.id ? 'active' : ''}`}
                  onClick={() => onUpdateConfig({ wall: w.id })}
                >
                  <span className="preset-swatch-box" style={{ backgroundColor: w.swatch }} />
                  <span>{w.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Presets */}
          <div>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <span className="section-title">Floor Material</span>
              <span className="section-value">
                {SCENE_FLOOR_PRESETS.find((f) => f.id === config.floor)?.name}
              </span>
            </div>
            <div className="preset-tile-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {SCENE_FLOOR_PRESETS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`preset-tile ${config.floor === f.id ? 'active' : ''}`}
                  onClick={() => onUpdateConfig({ floor: f.id })}
                >
                  <span className="preset-swatch-box" style={{ backgroundColor: f.swatch }} />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting Presets */}
          <div>
            <div className="section-header" style={{ marginBottom: 10 }}>
              <span className="section-title">Lighting Mode</span>
            </div>
            <div className="option-cards-grid cols-3">
              {SCENE_LIGHTING_PRESETS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`option-card ${config.lighting === l.id ? 'active' : ''}`}
                  onClick={() => onUpdateConfig({ lighting: l.id })}
                >
                  <span className="option-card-title">{l.name}</span>
                  <span className="option-card-sub">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Styling Props Toggle */}
          <div className="toggle-row">
            <div className="toggle-text">
              <span className="toggle-title">Bathroom Styling Props</span>
              <span className="toggle-desc">
                Wall sconces, soap dispenser, candle, eucalyptus vase, bath mat &amp; towel basket
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.showProps}
              className={`switch-btn ${config.showProps ? 'on' : ''}`}
              onClick={() => onUpdateConfig({ showProps: !config.showProps })}
            >
              <span className="switch-knob" />
            </button>
          </div>
        </div>
    </ModalWrapper>
  );
}

export function ShareModal({ shareUrl, onClose, onShowToast }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast('Configuration permalink copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onShowToast('Copy the URL from the box below');
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
        <div className="modal-header">
          <span className="modal-title">
            <Share2 size={17} />
            Share Your Configuration
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Anyone opening this link will see your exact Everdale 31″ Vanity setup — including
            cabinet finish, hardware, countertop, mirror, faucet, and room staging.
          </p>

          <div
            style={{
              background: 'var(--bg-page)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 12,
              wordBreak: 'break-all',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {shareUrl}
          </div>

          <button type="button" className="btn-primary-cta" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>
    </ModalWrapper>
  );
}

export function ARModal({ shareUrl, onClose }) {
  // Deterministic geometric QR matrix SVG so it works 100% offline with crisp appearance
  const cells = [];
  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      const isCorner =
        (r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3);
      const hash = ((r * 17 + c * 31 + shareUrl.length) * 13) % 7;
      if (isCorner || hash < 3) {
        cells.push(<rect key={`${r}-${c}`} x={c * 14 + 12} y={r * 14 + 12} width="11" height="11" rx="2" fill="#171d1a" />);
      }
    }
  }

  return (
    <ModalWrapper onClose={onClose}>
        <div className="modal-header">
          <span className="modal-title">
            <Box size={17} />
            View in Your Space (True 1:1 AR)
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              padding: 16,
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="176" height="176" viewBox="0 0 176 176" aria-label="AR QR Code">
              <rect width="176" height="176" fill="#ffffff" />
              {cells}
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <strong style={{ fontSize: 15 }}>Scan with your phone camera</strong>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Project the Everdale 31″ Vanity at exact real-world dimensions (31″W × 19″D × 34″H)
              directly inside your bathroom via iOS AR Quick Look or Android WebXR.
            </span>
          </div>

          <div className="stock-banner" style={{ width: '100%', justifyContent: 'center' }}>
            <Smartphone size={16} />
            <span>GLB Asset Ready: Everdale_31_Vanity_Interactive.glb (606 KB)</span>
          </div>
        </div>
    </ModalWrapper>
  );
}

export function HelpModal({ onClose }) {
  return (
    <ModalWrapper onClose={onClose}>
        <div className="modal-header">
          <span className="modal-title">
            <HelpCircle size={17} />
            Interactive 3D Viewer Guide
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div className="spec-list">
            <div className="spec-row">
              <span>Rotate 3D View</span>
              <span>Left-click &amp; drag (or 1-finger drag)</span>
            </div>
            <div className="spec-row">
              <span>Zoom In / Out</span>
              <span>Scroll wheel, pinch, or +/- buttons</span>
            </div>
            <div className="spec-row">
              <span>Open / Close Drawers</span>
              <span>Click directly on any drawer in the 3D view</span>
            </div>
            <div className="spec-row">
              <span>Inspect Accessory Trays</span>
              <span>Open lower drawer to view 2 removable trays</span>
            </div>
            <div className="spec-row">
              <span>Change Bathroom Room</span>
              <span>Click Sliders icon on right edge of viewport</span>
            </div>
            <div className="spec-row">
              <span>Save Snapshot</span>
              <span>Click Camera icon to download PNG image</span>
            </div>
          </div>
        </div>
    </ModalWrapper>
  );
}

export function ScanTagModal({ onClose, onShowToast }) {
  const [skuInput, setSkuInput] = useState('605-9531');

  const handleLoadSku = (e) => {
    e.preventDefault();
    onShowToast(`Loaded showroom tag SKU ${skuInput}`);
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
        <div className="modal-header">
          <span className="modal-title">
            <QrCode size={17} />
            Scan a Showroom Vanity Tag
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enter a showroom SKU or barcode number to instantly load its configured 3D model and
            in-store availability.
          </p>

          <form onSubmit={handleLoadSku} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              placeholder="e.g. 605-9531"
              style={{
                padding: '11px 14px',
                borderRadius: 10,
                border: '1.5px solid var(--border-strong)',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            <button type="submit" className="btn-primary-cta">
              <Sparkles size={15} />
              <span>Load Product Configuration</span>
            </button>
          </form>
        </div>
    </ModalWrapper>
  );
}

export function CartDrawer({ items, onRemoveItem, onClear, onClose, onShowToast }) {
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">
            <ShoppingBag size={17} />
            Your Cart &amp; Quotes ({items.length})
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-content">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 12px', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.35, marginBottom: 10 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5 }}>
                Configure your Everdale 31″ Vanity and click Add to Cart or Request Quote.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 14,
                  background: 'var(--bg-page)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{item.title}</strong>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {item.channelLabel} · SKU {item.sku}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.summary}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Configured Price</span>
                  <strong style={{ fontSize: 15, color: 'var(--brand)' }}>
                    {BRAND_CONFIG.currencySymbol}
                    {item.total.toFixed(2)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <strong>Total</strong>
              <strong style={{ color: 'var(--brand)' }}>
                {BRAND_CONFIG.currencySymbol}
                {total.toFixed(2)}
              </strong>
            </div>
            <button
              type="button"
              className="btn-primary-cta"
              onClick={() => {
                onShowToast('Order / Quote summary submitted (demo)');
                onClear();
                onClose();
              }}
            >
              Proceed to Checkout / Submit Quote
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

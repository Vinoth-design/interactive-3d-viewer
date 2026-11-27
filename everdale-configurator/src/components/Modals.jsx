import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  AlertCircle,
  Box,
  Camera,
  Check,
  Copy,
  FileText,
  HelpCircle,
  Loader2,
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
  PricingService,
  SCENE_FLOOR_PRESETS,
  SCENE_LIGHTING_PRESETS,
  SCENE_WALL_PRESETS,
  VANITY_VARIANTS,
} from '../catalog/index';
import { getARCapabilities, revokeARObjectUrl } from '../three/arExporter';

function ModalWrapper({ onClose, ariaLabel = 'Dialog', children }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
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
          Room Atmosphere &amp; Staging
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body">
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

        <div>
          <div className="section-header" style={{ marginBottom: 10 }}>
            <span className="section-title">Lighting Mode</span>
          </div>
          <div className="option-cards-grid">
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
            aria-label="Toggle bathroom styling props"
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

export function ShareModal({ activeVariant, shareUrl, onClose, onShowToast }) {
  const [copied, setCopied] = useState(false);
  const variant = activeVariant || VANITY_VARIANTS[1];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      onShowToast('Configuration permalink copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onShowToast('Select and copy the URL below');
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="modal-header">
        <span className="modal-title">
          <Share2 size={17} />
          Share {variant.label} Configuration
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body">
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Share this permalink to restore your exact <strong>{variant.name}</strong> (SKU {variant.sku}) configuration, including finishes, hardware, countertop, faucet, mirror, and room staging.
        </p>

        <div className="share-url-box">{shareUrl}</div>

        <button type="button" className="btn-primary-cta" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied!' : 'Copy Shareable Link'}</span>
        </button>
      </div>
    </ModalWrapper>
  );
}

export function ARModal({
  activeVariant,
  config,
  shareUrl,
  onLaunchWebXR,
  onExportAR,
  onShowToast,
  onClose,
}) {
  const variant = activeVariant || VANITY_VARIANTS[1];

  const [caps, setCaps] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [includeMirror, setIncludeMirror] = useState(false);
  const [busyMode, setBusyMode] = useState(null); // 'webxr' | 'usdz' | null
  const [arError, setArError] = useState(null);
  const [exportedUsdz, setExportedUsdz] = useState(null);
  const blobUrlsRef = useRef([]);
  const usdzAnchorRef = useRef(null);

  const arLaunchUrl = useMemo(() => {
    try {
      const parsed = new URL(shareUrl);
      parsed.searchParams.set('openAR', '1');
      return parsed.toString();
    } catch {
      return shareUrl ? `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}openAR=1` : '?openAR=1';
    }
  }, [shareUrl]);

  useEffect(() => {
    let active = true;
    getARCapabilities().then((res) => {
      if (active) setCaps(res);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(arLaunchUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#171d1a', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [arLaunchUrl]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => revokeARObjectUrl(u));
      blobUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    setExportedUsdz(null);
  }, [
    includeMirror,
    config?.finish,
    config?.hardware,
    config?.countertop,
    config?.faucet,
    config?.faucetFinish,
    config?.backsplash,
    config?.width,
  ]);

  const handleLaunchLiveXR = async () => {
    setArError(null);
    if (caps?.isIOS) {
      setBusyMode('usdz');
      try {
        const result = await onExportAR?.('usdz', { includeMirror });
        if (!result?.url) throw new Error('Could not prepare iOS AR scene.');
        blobUrlsRef.current.push(result.url);
        setExportedUsdz(result);
        onShowToast?.('Opening AR Room Placer…');
        requestAnimationFrame(() => {
          usdzAnchorRef.current?.click();
        });
      } catch (err) {
        setArError(err?.message || 'Unable to launch iOS AR view.');
      } finally {
        setBusyMode(null);
      }
      return;
    }

    setBusyMode('webxr');
    try {
      await onLaunchWebXR?.({ includeMirror });
    } catch (err) {
      setArError(err?.message || 'Unable to start WebXR AR session on this device.');
    } finally {
      setBusyMode(null);
    }
  };

  const hasValidMirrorOption = config?.mirror && config.mirror !== 'none';
  const canLaunchAR = Boolean(caps?.webxrSupported || caps?.isIOS);

  return (
    <ModalWrapper onClose={onClose} ariaLabel="True-Scale AR Room Placement">
      <div className="modal-header">
        <span className="modal-title">
          <Box size={17} />
          View in Your Room · True-Scale AR ({variant.label})
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body ar-modal-body">
        {/* Top: Real Scannable QR Code + Scan Instructions */}
        <div className="ar-qr-section">
          <div className="ar-qr-card">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Scan QR code to open this configured vanity in mobile AR"
                className="ar-qr-img"
                width="164"
                height="164"
              />
            ) : (
              <div className="ar-qr-loading">Generating QR…</div>
            )}
          </div>
          <div className="ar-qr-caption">
            <strong>Scan with your phone camera</strong>
            <span>
              Opens SKU {variant.sku} with your exact selected finishes and opens the AR room placer on mobile.
              {!caps?.isSecureContext && ' (Note: mobile WebXR requires HTTPS.)'}
            </span>
          </div>
        </div>

        {/* Middle: Optional Wall Mirror Inclusion Switch */}
        {hasValidMirrorOption && (
          <div className="toggle-row" style={{ padding: '8px 12px' }}>
            <div className="toggle-text">
              <span className="toggle-title" style={{ fontSize: 12.5 }}>
                Include Wall Mirror in AR
              </span>
              <span className="toggle-desc" style={{ fontSize: 11 }}>
                Default places freestanding vanity + top + faucet cleanly on floor
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={includeMirror}
              aria-label="Include wall mirror in AR export"
              className={`switch-btn ${includeMirror ? 'on' : ''}`}
              onClick={() => setIncludeMirror((v) => !v)}
            >
              <span className="switch-knob" />
            </button>
          </div>
        )}

        {/* Bottom: Live XR Button (auto-uses native Quick Look on iOS Safari) */}
        <div className="ar-action-stack">
          <button
            type="button"
            className="btn-primary-cta"
            disabled={!canLaunchAR || busyMode !== null}
            onClick={handleLaunchLiveXR}
            title={
              canLaunchAR
                ? 'Place vanity directly on your bathroom floor in AR'
                : 'Live WebXR placement requires Android Chrome over HTTPS'
            }
          >
            {busyMode !== null ? <Loader2 size={16} className="spin-icon" /> : <Camera size={16} />}
            <span>
              {busyMode === 'usdz'
                ? 'Preparing Live AR…'
                : caps?.isIOS
                  ? 'Launch Live XR Camera AR'
                  : caps?.webxrSupported
                    ? 'Launch Live XR Camera AR'
                    : 'Live WebXR Camera AR (Android Chrome HTTPS)'}
            </span>
          </button>

          {/* Native Apple Quick Look trigger (<a rel="ar"><img></a>) when on iOS */}
          {exportedUsdz && (
            <a
              ref={usdzAnchorRef}
              rel="ar"
              href={`${exportedUsdz.url}#allowsContentScaling=0`}
              className="ar-quicklook-ready-link"
            >
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt=""
                width="1"
                height="1"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <Box size={15} />
              <span>Tap to Open iOS AR Room Placer</span>
            </a>
          )}

          {arError && (
            <div className="ar-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{arError}</span>
            </div>
          )}
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
          Interactive 3D Showroom Guide
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body">
        <div className="spec-list">
          <div className="spec-row">
            <span>Orbit View</span>
            <span>Left-click &amp; drag (or 1-finger drag)</span>
          </div>
          <div className="spec-row">
            <span>Pan View</span>
            <span>Right-click &amp; drag (or 2-finger drag)</span>
          </div>
          <div className="spec-row">
            <span>Zoom In / Out</span>
            <span>Scroll wheel, pinch, or +/- toolbar buttons</span>
          </div>
          <div className="spec-row">
            <span>Customize Directly on Model</span>
            <span>Click 3D badges (Cabinet, Handles, Top, Faucet, Mirror)</span>
          </div>
          <div className="spec-row">
            <span>Open / Close Drawers</span>
            <span>Click any drawer in 3D or use the Drawers camera preset</span>
          </div>
          <div className="spec-row">
            <span>Camera Angles</span>
            <span>3/4 View, Front, Side, Top, Detail, Drawers &amp; Reset</span>
          </div>
          <div className="spec-row">
            <span>Gallery &amp; Lightbox</span>
            <span>Switch to Studio &amp; Lifestyle top-right or tap to enlarge</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

export function ScanTagModal({ onSelectVariantSku, onClose, onShowToast }) {
  const [skuInput, setSkuInput] = useState('605-9531');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLoadSku = (e) => {
    e.preventDefault();
    const cleaned = skuInput.trim().replace(/[″"]/g, '').toLowerCase();
    const found = VANITY_VARIANTS.find(
      (v) =>
        v.sku.toLowerCase() === cleaned ||
        v.id === cleaned ||
        String(v.baseWidthIn) === cleaned ||
        String(v.topWidthIn) === cleaned
    );
    if (!found) {
      setErrorMsg('SKU or size not found. Supported SKUs: 605-9530 to 605-9534 (or sizes 24, 30/31, 36/37, 48/49, 60/61).');
      return;
    }
    onSelectVariantSku(found.id);
    onShowToast(`Loaded ${found.name} (SKU ${found.sku})`);
    onClose();
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="modal-header">
        <span className="modal-title">
          <QrCode size={17} />
          Showroom SKU Lookup
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body">
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Enter a showroom tag SKU (<code>605-9530</code> to <code>605-9534</code>) or cabinet width (e.g. <code>30</code>, <code>31</code>, <code>60</code>) to load that exact vanity model.
        </p>

        <div className="sku-quick-chips">
          {VANITY_VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              className="sku-chip-btn"
              onClick={() => {
                setSkuInput(v.sku);
                setErrorMsg(null);
              }}
            >
              {v.label} · {v.sku}
            </button>
          ))}
        </div>

        <form onSubmit={handleLoadSku} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            value={skuInput}
            onChange={(e) => {
              setSkuInput(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="e.g. 605-9531"
            className="modal-input"
          />
          {errorMsg && <div className="modal-error-note">{errorMsg}</div>}
          <button type="submit" className="btn-primary-cta">
            <Sparkles size={15} />
            <span>Load Variant Model</span>
          </button>
        </form>
      </div>
    </ModalWrapper>
  );
}

export function QuoteSpecModal({
  activeVariant,
  config,
  pricing,
  summaryText,
  onExportSpecJson,
  onClose,
  onShowToast,
}) {
  const [copied, setCopied] = useState(false);
  const variant = activeVariant || VANITY_VARIANTS[1];
  const isSeries = config.purchaseMode === 'series';
  const totalHeightIn =
    config.backsplash === 'included'
      ? variant.heightIn + variant.backsplashIn
      : variant.heightIn;

  const handleCopySpec = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      onShowToast('Specification brief copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      onShowToast('Copy failed — use Download Spec JSON below');
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="modal-header">
        <span className="modal-title">
          <FileText size={17} />
          Request Quote — {isSeries ? 'Series (Cabinet Only)' : 'Combo'}
        </span>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="modal-body">
        <div className="honest-notice-box">
          <AlertCircle size={16} />
          <span>
            Direct company email quote submission will connect in the next workflow. Copy or download your customized selection below for review.
          </span>
        </div>

        <div className="quote-spec-preview">
          <strong>
            {isSeries ? `Everdale ${variant.baseWidthIn}″ Cabinet Series` : variant.name} (SKU {variant.sku})
          </strong>
          <div className="quote-spec-dims">
            {isSeries
              ? `Cabinet Body: ${variant.baseWidthIn}″W × ${variant.bodyDepthIn}″D · Preview Overall: ${variant.topWidthIn}″W × ${totalHeightIn}″H`
              : `Overall: ${variant.topWidthIn}″W × ${variant.depthIn}″D × ${totalHeightIn}″H · Body: ${variant.baseWidthIn}″W × ${variant.bodyDepthIn}″D`}
          </div>
          <pre className="quote-spec-pre">{summaryText}</pre>
          <div className="quote-spec-total">
            <span>Estimated Configured Subtotal</span>
            <strong>{PricingService.formatCurrency(pricing.subtotal, BRAND_CONFIG.currencySymbol)}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button type="button" className="btn-primary-cta" onClick={handleCopySpec}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied Spec' : 'Copy Spec'}</span>
          </button>
          <button type="button" className="btn-secondary-cta" onClick={onExportSpecJson}>
            <Download size={15} />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

export function CartDrawer({ items, onRemoveItem, onClear, onExportSpecJson, onClose, onShowToast }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const total = items.reduce((sum, item) => sum + item.total, 0);

  const handleCopyBag = async () => {
    const text = items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.title} (SKU ${item.sku}) — ${PricingService.formatCurrency(item.total, BRAND_CONFIG.currencySymbol)}\n   ${item.summary}`
      )
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('Project bag summary copied to clipboard');
    } catch {
      onShowToast('Unable to access clipboard');
    }
  };

  return (
    <motion.div
      className="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Project Bag"
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
        transition={{ duration: 0.24, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">
            <ShoppingBag size={17} />
            Project Bag ({items.length})
          </span>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="drawer-content">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 12px', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.35, marginBottom: 10 }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Your project bag is empty</p>
              <p style={{ margin: '6px 0 0', fontSize: 12.5 }}>
                Configure any Everdale vanity size and finish, then add it to compare or export specifications.
              </p>
            </div>
          ) : (
            <>
              <div className="honest-notice-box">
                <AlertCircle size={15} />
                <span>
                  Local session preview only — full payment checkout is on hold in this PDP-only build.
                </span>
              </div>

              {items.map((item) => (
                <div key={item.id} className="bag-item-card">
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

                  <div className="bag-item-price-row">
                    <span>Estimated Price</span>
                    <strong>
                      {PricingService.formatCurrency(item.total, BRAND_CONFIG.currencySymbol)}
                    </strong>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
              <strong>Estimated Total</strong>
              <strong style={{ color: 'var(--brand)' }}>
                {PricingService.formatCurrency(total, BRAND_CONFIG.currencySymbol)}
              </strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" className="btn-primary-cta" onClick={handleCopyBag}>
                <Copy size={15} />
                <span>Copy Summary</span>
              </button>
              <button type="button" className="btn-secondary-cta" onClick={onExportSpecJson}>
                <Download size={15} />
                <span>Export JSON</span>
              </button>
            </div>
            <button
              type="button"
              className="btn-text-muted"
              onClick={() => {
                onClear();
                onShowToast('Cleared project bag');
              }}
            >
              Clear bag
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, ShoppingBag, X } from 'lucide-react';
import PartOptionsEditor, { getHotspotMeta } from './components/PartOptionsEditor';
import {
  BRAND_CONFIG,
  CABINET_FINISHES,
  CHANNELS,
  COUNTERTOP_FINISHES,
  CatalogService,
  DEFAULT_CONFIG,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_OPTIONS,
  PURCHASE_MODES,
  PricingService,
  VANITY_VARIANTS,
  validateConfiguration,
} from './catalog/index';
import { buildShareUrl, readConfigFromUrl, syncConfigToUrl } from './utils/urlState';
import Header from './components/Header';
import ShowroomStage from './components/ShowroomStage';
import ConfigPanel from './components/ConfigPanel';
import ProductDetailsSections from './components/ProductDetailsSections';
import {
  ARModal,
  CartDrawer,
  HelpModal,
  QuoteSpecModal,
  ScanTagModal,
  SceneSettingsModal,
  ShareModal,
} from './components/Modals';

const STORAGE_BAG_KEY = 'everdale_pdp_bag_v1';
const STORAGE_SAVED_KEY = 'everdale_pdp_saved_v1';

export default function App() {
  const [config, setConfig] = useState(() => readConfigFromUrl());
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BAG_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSaved, setIsSaved] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_SAVED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const showroomRef = useRef(null);
  const [activeModal, setActiveModal] = useState(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('openAR') === '1') {
      return 'ar';
    }
    return null;
  }); // 'scene' | 'share' | 'ar' | 'help' | 'scan' | 'cart' | 'quote'
  const [activeHotspot, setActiveHotspot] = useState(null); // 'finish' | 'hardware' | 'countertop' | 'faucet' | 'mirror'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((message) => {
    setToastMsg(message);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    syncConfigToUrl(config);
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BAG_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota restrictions
    }
  }, [cartItems]);

  const product = useMemo(
    () => CatalogService.getProduct(config.product || 'everdale-vanity') || CatalogService.getProduct('everdale-vanity'),
    [config.product]
  );
  const activeVariant = useMemo(
    () =>
      CatalogService.getVariant(config.width) ||
      VANITY_VARIANTS.find((v) => v.id === '31') ||
      VANITY_VARIANTS[0],
    [config.width]
  );

  // Sync browser document title with active variant
  useEffect(() => {
    if (activeVariant) {
      document.title = `${activeVariant.name} (SKU ${activeVariant.sku}) — Everdale Bath Studio`;
    }
  }, [activeVariant]);

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => {
      const merged = { ...prev, ...patch };
      const validated = validateConfiguration(merged);
      return validated.config;
    });
  }, []);

  const pricing = useMemo(() => PricingService.calculatePrice(config), [config]);
  const eligibility = useMemo(
    () => CatalogService.evaluateEligibility(product, activeVariant, config),
    [product, activeVariant, config]
  );
  const activeChannel = CHANNELS.find((c) => c.id === config.tab) || CHANNELS[0];

  const activeSummaryText = useMemo(() => {
    const fin = CABINET_FINISHES.find((f) => f.id === config.finish)?.name;
    const hw = HARDWARE_FINISHES.find((h) => h.id === config.hardware)?.name;
    const ct = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop)?.name;
    const fau = FAUCET_OPTIONS.find((f) => f.id === config.faucet)?.name;
    const mir = MIRROR_OPTIONS.find((m) => m.id === config.mirror)?.name;
    const isSeries = config.purchaseMode === 'series';
    const modeLabel = PURCHASE_MODES.find((m) => m.id === (isSeries ? 'series' : 'combo'))?.label;
    const totalH =
      config.backsplash === 'included'
        ? activeVariant.heightIn + activeVariant.backsplashIn
        : activeVariant.heightIn;

    const estPrice =
      config.tab === 'in-stock' && !eligibility?.isCustomized
        ? pricing.afterRebate
        : pricing.subtotal;

    return [
      `Product: ${isSeries ? `Everdale ${activeVariant.baseWidthIn}″ Cabinet Series` : activeVariant.name} (SKU ${activeVariant.sku})`,
      `Category Mode: ${modeLabel}`,
      isSeries
        ? `Cabinet Body: ${activeVariant.baseWidthIn}"W x ${activeVariant.bodyDepthIn}"D`
        : `Overall Size: ${activeVariant.topWidthIn}"W x ${activeVariant.depthIn}"D x ${totalH}"H (Cabinet Body: ${activeVariant.baseWidthIn}"W x ${activeVariant.bodyDepthIn}"D)`,
      `Cabinet Finish: ${fin}`,
      `Hardware: ${hw}${isSeries ? ' (Preview Only)' : ''}`,
      `Countertop: ${ct}${config.backsplash === 'included' ? ' + 4" Matching Backsplash' : ' (No Backsplash)'}${isSeries ? ' (Preview Only)' : ''}`,
      `Faucet: ${fau}${isSeries ? ' (Preview Only)' : ''}`,
      `Mirror (View Only · $0): ${mir}`,
      `Fulfillment: ${eligibility?.isCustomized ? 'Customized Request Quote' : activeChannel.label}`,
      `Estimated Price: ${PricingService.formatCurrency(estPrice, BRAND_CONFIG.currencySymbol)}`,
    ].join('\n');
  }, [activeVariant, config, activeChannel, pricing, eligibility]);

  const handleResetStandard = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      tab: 'in-stock',
      finish: DEFAULT_CONFIG.finish,
      hardware: DEFAULT_CONFIG.hardware,
      countertop: DEFAULT_CONFIG.countertop,
      backsplash: DEFAULT_CONFIG.backsplash,
      faucet: DEFAULT_CONFIG.faucet,
      faucetFinish: DEFAULT_CONFIG.faucetFinish,
    }));
    setActiveHotspot(null);
    showToast('Reset to standard finish & specification');
  }, [showToast]);

  const handlePrimaryAction = () => {
    if (config.tab !== 'in-stock' || !eligibility?.purchaseEligible || eligibility?.isCustomized) {
      setActiveModal('quote');
      return;
    }

    const fin = CABINET_FINISHES.find((f) => f.id === config.finish)?.name;
    const hw = HARDWARE_FINISHES.find((h) => h.id === config.hardware)?.name;
    const ct = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop)?.name;
    const fau = FAUCET_OPTIONS.find((f) => f.id === config.faucet)?.name;
    const mir = MIRROR_OPTIONS.find((m) => m.id === config.mirror)?.name;

    const entry = {
      id: Date.now(),
      title: activeVariant.name,
      sku: activeVariant.sku,
      channelLabel: activeChannel.label,
      total: pricing.afterRebate,
      summary: `${fin} · ${hw} Hardware · ${ct}${config.backsplash === 'included' ? ' w/ 4″ Backsplash' : ''} · ${fau} · Mirror: ${mir}`,
    };

    setCartItems((prev) => [entry, ...prev]);
    setActiveModal('cart');
    showToast(`Added ${activeVariant.name} to your project bag`);
  };

  const handleToggleSave = () => {
    setIsSaved((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SAVED_KEY, String(next));
      } catch {
        // Ignore storage error
      }
      showToast(next ? `Saved ${activeVariant.label} configuration` : 'Removed from saved list');
      return next;
    });
  };

  const shareUrl = useMemo(() => buildShareUrl(config), [config]);

  const handleExportSpecJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      productId: product?.id,
      variantId: activeVariant.variantId,
      sku: activeVariant.sku,
      name: activeVariant.name,
      overallDimensions: {
        widthIn: activeVariant.topWidthIn,
        depthIn: activeVariant.depthIn,
        heightIn:
          config.backsplash === 'included'
            ? activeVariant.heightIn + activeVariant.backsplashIn
            : activeVariant.heightIn,
        widthMm: activeVariant.topWidthMm,
        depthMm: activeVariant.depthMm,
      },
      cabinetBodyDimensions: {
        widthIn: activeVariant.baseWidthIn,
        depthIn: activeVariant.bodyDepthIn,
        widthMm: activeVariant.baseWidthMm,
        depthMm: activeVariant.bodyDepthMm,
      },
      configuration: config,
      pricing,
      shareUrl,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Everdale-${activeVariant.sku}-Specification.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${activeVariant.sku} specification JSON`);
  };

  const isInStock = config.tab === 'in-stock' && !eligibility?.isCustomized;
  const mobilePrice = isInStock ? pricing.afterRebate : pricing.subtotal;
  const isSeriesMode = (product?.sellingCategory || config.purchaseMode) === 'series';
  const activeHotspotMeta = getHotspotMeta(activeHotspot, isSeriesMode);

  return (
    <div className="app-root">
      <Header
        config={config}
        activeVariant={activeVariant}
        cartCount={cartItems.length}
        isSaved={isSaved}
        onOpenCart={() => setActiveModal('cart')}
        onOpenHelp={() => setActiveModal('help')}
        onOpenScan={() => setActiveModal('scan')}
        onToggleSave={handleToggleSave}
      />

      {/* Hero Product Showroom & Configuration Split */}
      <main className="pdp-hero-layout">
        <ShowroomStage
          ref={showroomRef}
          config={config}
          activeVariant={activeVariant}
          activeHotspot={activeHotspot}
          onSelectHotspot={setActiveHotspot}
          onUpdateConfig={updateConfig}
          onToggleDimensions={() => updateConfig({ showDimensions: !config.showDimensions })}
          onOpenSceneSettings={() => setActiveModal('scene')}
          onOpenShare={() => setActiveModal('share')}
          onOpenAR={() => setActiveModal('ar')}
          onShowToast={showToast}
        />

        <ConfigPanel
          product={product}
          activeVariant={activeVariant}
          config={config}
          pricing={pricing}
          eligibility={eligibility}
          isSaved={isSaved}
          activeHotspot={activeHotspot}
          onSelectHotspot={setActiveHotspot}
          onUpdateConfig={updateConfig}
          onResetStandard={handleResetStandard}
          onPrimaryAction={handlePrimaryAction}
          onToggleSave={handleToggleSave}
          onOpenShare={() => setActiveModal('share')}
          onOpenSceneSettings={() => setActiveModal('scene')}
        />
      </main>

      {/* Below-the-Fold Editorial PDP Sections */}
      <ProductDetailsSections
        product={product}
        activeVariant={activeVariant}
        config={config}
        pricing={pricing}
        eligibility={eligibility}
        isSaved={isSaved}
        onPrimaryAction={handlePrimaryAction}
        onToggleSave={handleToggleSave}
        onOpenShare={() => setActiveModal('share')}
        onExportSpecJson={handleExportSpecJson}
      />

      {/* Mobile & Tablet Sticky Bottom Action Bar */}
      <div className="mobile-sticky-bar">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {isSeriesMode ? `${activeVariant.baseWidthIn}″ Series` : activeVariant.label} ·{' '}
            {eligibility?.isCustomized ? 'Custom Quote Est.' : isInStock ? 'Est. After Savings*' : activeChannel.label}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--brand)' }}>
            {PricingService.formatCurrency(mobilePrice, BRAND_CONFIG.currencySymbol)}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-cta"
          style={{ padding: '11px 18px', fontSize: 13 }}
          onClick={handlePrimaryAction}
        >
          {isInStock && eligibility?.purchaseEligible ? (
            <ShoppingBag size={15} />
          ) : (
            <FileText size={15} />
          )}
          <span>{eligibility?.ctaLabel || activeChannel.ctaLabel}</span>
        </button>
      </div>

      {/* Mobile Bottom Slide-In Option Drawer (<= 1023px) */}
      <AnimatePresence>
        {activeHotspot && activeHotspotMeta && (
          <>
            <motion.div
              key="mobile-sheet-backdrop"
              className="mobile-sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setActiveHotspot(null)}
            />
            <motion.div
              key={activeHotspot}
              className="hotspot-popover"
              role="dialog"
              aria-modal="true"
              aria-label={activeHotspotMeta.title}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 330 }}
            >
              <div className="mobile-sheet-handle" aria-hidden="true" />
              <div className="hotspot-popover-head">
                <div>
                  <div className="hotspot-popover-title">{activeHotspotMeta.title}</div>
                  <div className="hotspot-popover-sub">{activeHotspotMeta.badge}</div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setActiveHotspot(null)}
                  aria-label="Close options sheet"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="hotspot-popover-body">
                <PartOptionsEditor
                  activeHotspot={activeHotspot}
                  config={config}
                  isDouble={activeVariant?.basinCount === 2}
                  isSeries={isSeriesMode}
                  onUpdateConfig={updateConfig}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals & Drawers */}
      <AnimatePresence>
        {activeModal === 'scene' && (
          <SceneSettingsModal
            key="scene"
            config={config}
            onUpdateConfig={updateConfig}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'share' && (
          <ShareModal
            key="share"
            activeVariant={activeVariant}
            shareUrl={shareUrl}
            onClose={() => setActiveModal(null)}
            onShowToast={showToast}
          />
        )}

        {activeModal === 'ar' && (
          <ARModal
            key="ar"
            activeVariant={activeVariant}
            config={config}
            shareUrl={shareUrl}
            onLaunchWebXR={async (opts) => {
              setActiveModal(null);
              await showroomRef.current?.startAR(opts);
            }}
            onExportAR={(format, opts) => showroomRef.current?.exportAR(format, opts)}
            onShowToast={showToast}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'help' && (
          <HelpModal key="help" onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'scan' && (
          <ScanTagModal
            key="scan"
            onSelectVariantSku={(widthId) => updateConfig({ width: widthId })}
            onClose={() => setActiveModal(null)}
            onShowToast={showToast}
          />
        )}

        {activeModal === 'quote' && (
          <QuoteSpecModal
            key="quote"
            activeVariant={activeVariant}
            config={config}
            pricing={pricing}
            summaryText={activeSummaryText}
            onExportSpecJson={handleExportSpecJson}
            onClose={() => setActiveModal(null)}
            onShowToast={showToast}
          />
        )}

        {activeModal === 'cart' && (
          <CartDrawer
            key="cart"
            items={cartItems}
            onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.id !== id))}
            onClear={() => setCartItems([])}
            onExportSpecJson={handleExportSpecJson}
            onClose={() => setActiveModal(null)}
            onShowToast={showToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            className="toast-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <CheckCircle2 size={16} color="#5de4a4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

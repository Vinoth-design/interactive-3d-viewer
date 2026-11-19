import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ShoppingCart, FileText } from 'lucide-react';
import {
  BRAND_CONFIG,
  CABINET_FINISHES,
  CHANNELS,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_OPTIONS,
  PRODUCT_BASE,
  calculatePricing,
} from './config/productConfig';
import { buildShareUrl, readConfigFromUrl, syncConfigToUrl } from './utils/urlState';
import Header from './components/Header';
import ChannelTabs from './components/ChannelTabs';
import Viewport3D from './components/Viewport3D';
import ConfigPanel from './components/ConfigPanel';
import {
  ARModal,
  CartDrawer,
  HelpModal,
  ScanTagModal,
  SceneSettingsModal,
  ShareModal,
} from './components/Modals';

export default function App() {
  const [config, setConfig] = useState(() => readConfigFromUrl());
  const [cartItems, setCartItems] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // Active modals
  const [activeModal, setActiveModal] = useState(null); // 'scene' | 'share' | 'ar' | 'help' | 'scan' | 'cart'
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((message) => {
    setToastMsg(message);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Keep browser URL query parameters synced with active selections
  useEffect(() => {
    syncConfigToUrl(config);
  }, [config]);

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const pricing = useMemo(() => calculatePricing(config), [config]);
  const activeChannel = CHANNELS.find((c) => c.id === config.tab) || CHANNELS[0];

  const handlePrimaryAction = () => {
    const fin = CABINET_FINISHES.find((f) => f.id === config.finish)?.name;
    const hw = HARDWARE_FINISHES.find((h) => h.id === config.hardware)?.name;
    const ct = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop)?.name;
    const fau = FAUCET_OPTIONS.find((f) => f.id === config.faucet)?.name;
    const mir = MIRROR_OPTIONS.find((m) => m.id === config.mirror)?.name;

    const entry = {
      id: Date.now(),
      title: PRODUCT_BASE.name,
      sku: PRODUCT_BASE.sku,
      channelLabel: activeChannel.label,
      total: config.tab === 'in-stock' ? pricing.afterRebate : pricing.subtotal,
      summary: `${fin} · ${hw} Hardware · ${ct}${config.backsplash === 'included' ? ' w/ 4″ Backsplash' : ''} · ${fau} · Mirror: ${mir}`,
    };

    setCartItems((prev) => [entry, ...prev]);
    setActiveModal('cart');
    showToast(
      config.tab === 'in-stock'
        ? 'Added configured Everdale 31″ Vanity to cart'
        : 'Quote configuration added to summary'
    );
  };

  const handleToggleSave = () => {
    setIsSaved((prev) => {
      const next = !prev;
      showToast(next ? 'Configuration saved to your project list' : 'Removed from saved list');
      return next;
    });
  };

  const shareUrl = useMemo(() => buildShareUrl(config), [config]);

  return (
    <div className="app-root">
      <Header
        config={config}
        cartCount={cartItems.length}
        onOpenCart={() => setActiveModal('cart')}
        onOpenHelp={() => setActiveModal('help')}
        onOpenScan={() => setActiveModal('scan')}
        onShowToast={showToast}
      />

      <ChannelTabs
        activeTab={config.tab}
        onChangeTab={(tabId) => updateConfig({ tab: tabId })}
      />

      <main className="configurator-layout">
        <Viewport3D
          config={config}
          onToggleDimensions={() => updateConfig({ showDimensions: !config.showDimensions })}
          onOpenSceneSettings={() => setActiveModal('scene')}
          onOpenShare={() => setActiveModal('share')}
          onOpenAR={() => setActiveModal('ar')}
          onShowToast={showToast}
        />

        <ConfigPanel
          config={config}
          pricing={pricing}
          isSaved={isSaved}
          onUpdateConfig={updateConfig}
          onPrimaryAction={handlePrimaryAction}
          onToggleSave={handleToggleSave}
        />
      </main>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="mobile-sticky-bar">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {config.tab === 'in-stock' ? 'After Savings*' : 'Configured Est.'}
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--brand)' }}>
            {BRAND_CONFIG.currencySymbol}
            {(config.tab === 'in-stock' ? pricing.afterRebate : pricing.subtotal).toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          className="btn-primary-cta"
          style={{ padding: '11px 18px', fontSize: 13 }}
          onClick={handlePrimaryAction}
        >
          {config.tab === 'in-stock' ? <ShoppingCart size={15} /> : <FileText size={15} />}
          <span>{activeChannel.ctaLabel}</span>
        </button>
      </div>

      {/* Modals & Drawers with Spring Physics Entrance & Exit */}
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
            shareUrl={shareUrl}
            onClose={() => setActiveModal(null)}
            onShowToast={showToast}
          />
        )}

        {activeModal === 'ar' && (
          <ARModal key="ar" shareUrl={shareUrl} onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'help' && (
          <HelpModal key="help" onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'scan' && (
          <ScanTagModal
            key="scan"
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <CheckCircle2 size={16} color="#5de4a4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

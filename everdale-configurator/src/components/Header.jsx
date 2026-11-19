import React from 'react';
import {
  ArrowLeft,
  HelpCircle,
  QrCode,
  ShoppingBag,
} from 'lucide-react';
import { BRAND_CONFIG, PRODUCT_BASE, WIDTH_OPTIONS } from '../config/productConfig';

export default function Header({
  config,
  cartCount,
  onOpenCart,
  onOpenHelp,
  onOpenScan,
  onShowToast,
}) {
  const activeWidth = WIDTH_OPTIONS.find((w) => w.id === config?.width) || WIDTH_OPTIONS[1];
  const dynamicTitle = activeWidth
    ? `Everdale ${activeWidth.label} ${activeWidth.basinCount === 2 ? 'Double' : 'Single'} Vanity`
    : PRODUCT_BASE.name;
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-link-btn"
          onClick={() => onShowToast('Viewing Everdale 31″ Vanity in catalog')}
        >
          <ArrowLeft size={16} />
          <span className="header-hide-mobile">Back to all vanities</span>
        </button>

        <button
          type="button"
          className="header-outline-btn header-hide-mobile"
          onClick={onOpenScan}
        >
          <QrCode size={15} />
          <span>Scan a vanity tag</span>
        </button>
      </div>

      <div className="header-center">
        <span className="header-brand">{BRAND_CONFIG.brandName}</span>
        <span className="header-title">{dynamicTitle}</span>
      </div>

      <div className="header-right">
        <button
          type="button"
          className="header-outline-btn"
          onClick={onOpenCart}
          aria-label="Open shopping cart"
        >
          <ShoppingBag size={15} />
          <span className="header-hide-mobile">Cart</span>
          {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
        </button>

        <button
          type="button"
          className="header-link-btn"
          onClick={onOpenHelp}
          aria-label="Help and controls"
        >
          <HelpCircle size={17} />
          <span className="header-hide-mobile">Help</span>
        </button>
      </div>
    </header>
  );
}

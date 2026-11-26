import React from 'react';
import {
  Bookmark,
  HelpCircle,
  QrCode,
  ShoppingBag,
} from 'lucide-react';
import { BRAND_CONFIG, CatalogService } from '../catalog/index';

export default function Header({
  config,
  activeVariant,
  cartCount,
  isSaved,
  onOpenCart,
  onOpenHelp,
  onOpenScan,
  onToggleSave,
}) {
  const product = CatalogService.getProduct(config?.product || 'everdale-vanity');
  const variant = activeVariant || CatalogService.getVariant(config?.width || '31');
  const isSeries = (product?.sellingCategory || config?.purchaseMode) === 'series';

  const dynamicTitle = variant
    ? isSeries
      ? `Everdale ${variant.baseWidthIn}″ Cabinet Series`
      : `Everdale ${variant.label} ${variant.basinCount === 2 ? 'Double' : 'Single'} Vanity`
    : product?.name || 'Everdale Bathroom Vanity';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-brand-lockup">
          <span className="header-brand-mark">{BRAND_CONFIG.brandName}</span>
          <span className="header-series-divider header-hide-mobile">·</span>
          <span className="header-series-label header-hide-mobile">
            {isSeries ? 'Series' : 'Combo'}
          </span>
        </div>

        <button
          type="button"
          className="header-outline-btn header-sku-trigger"
          onClick={onOpenScan}
          title="Load variant configuration by showroom SKU"
          aria-label="Lookup showroom SKU"
        >
          <QrCode size={14} />
          <span className="sku-btn-desktop">SKU Lookup</span>
          <span className="sku-btn-mobile">SKU</span>
        </button>
      </div>

      <div className="header-center">
        <span className="header-title">{dynamicTitle}</span>
        {variant && <span className="header-sku-pill">SKU {variant.sku}</span>}
      </div>

      <div className="header-right">
        <button
          type="button"
          className={`header-link-btn header-hide-mobile ${isSaved ? 'saved-active' : ''}`}
          onClick={onToggleSave}
          aria-pressed={isSaved}
          title={isSaved ? 'Configuration saved' : 'Save configuration'}
        >
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button
          type="button"
          className="header-outline-btn"
          onClick={onOpenCart}
          aria-label="Open project bag and quote summary"
        >
          <ShoppingBag size={15} />
          <span className="header-hide-mobile">Bag</span>
          {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
        </button>

        <button
          type="button"
          className="header-link-btn"
          onClick={onOpenHelp}
          aria-label="Viewer guide and controls"
        >
          <HelpCircle size={16} />
          <span className="header-hide-mobile">Guide</span>
        </button>
      </div>
    </header>
  );
}

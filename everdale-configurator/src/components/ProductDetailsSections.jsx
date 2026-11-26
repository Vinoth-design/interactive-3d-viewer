import React, { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Layers,
  PackageCheck,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import {
  BRAND_CONFIG,
  CABINET_FINISHES,
  CHANNELS,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
  HARDWARE_FINISHES,
  MIRROR_FRAMES_METAL,
  MIRROR_FRAMES_WOOD,
  MIRROR_OPTIONS,
  PricingService,
  getVariantHighlights,
} from '../catalog/index';
import { getSwatchBackgroundStyle } from './SwatchPreview';

function formatDim(inches, mm, unit) {
  return unit === 'mm' ? `${mm} mm` : `${inches}″`;
}

export default function ProductDetailsSections({
  product,
  activeVariant,
  config,
  pricing,
  eligibility,
  isSaved,
  onPrimaryAction,
  onToggleSave,
  onOpenShare,
  onExportSpecJson,
}) {
  const [unit, setUnit] = useState('in'); // 'in' | 'mm'
  const [installOpen, setInstallOpen] = useState(false);

  if (!product || !activeVariant) return null;

  const highlights = getVariantHighlights(product, activeVariant);
  const activeFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
  const activeHardware = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
  const activeCountertop =
    COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
  const activeFaucet = FAUCET_OPTIONS.find((f) => f.id === config.faucet) || FAUCET_OPTIONS[0];
  const activeMirror = MIRROR_OPTIONS.find((m) => m.id === config.mirror) || MIRROR_OPTIONS[0];
  const activeChannel = CHANNELS.find((c) => c.id === config.tab) || CHANNELS[0];
  const frameList =
    activeMirror.frameType === 'wood'
      ? MIRROR_FRAMES_WOOD
      : activeMirror.frameType === 'metal'
        ? MIRROR_FRAMES_METAL
        : [];
  const activeFrame = frameList.find((f) => f.id === config.frame);

  const totalHeightIn =
    config.backsplash === 'included'
      ? activeVariant.heightIn + activeVariant.backsplashIn
      : activeVariant.heightIn;
  const totalHeightMm =
    config.backsplash === 'included'
      ? Number((activeVariant.heightMm + activeVariant.backsplashMm).toFixed(1))
      : activeVariant.heightMm;

  const isInStock = config.tab === 'in-stock' && !eligibility?.isCustomized;
  const isSeries = config.purchaseMode === 'series';
  const displayedPrice = isInStock ? pricing.afterRebate : pricing.subtotal;

  const includedItems = isSeries
    ? [
        {
          name: `Everdale ${activeVariant.baseWidthIn}″ Cabinet Series Box & 4 Tapered Wood Legs`,
          detail: `${activeFinish.name} (${activeFinish.code}) · ${activeVariant.drawerCount} soft-close drawers`,
        },
        {
          name: `${activeVariant.trayCount} Modular Removable Interior Accessory Trays`,
          detail: 'Seated inside lower drawer box(es) for vanity organization',
        },
        {
          name: 'Pre-drilled Mounting & Hardware Prep (Cabinet Only)',
          detail: 'Countertop, handles, faucet & mirror shown in 3D viewer for visual planning only',
        },
      ]
    : [
        {
          name: `${activeVariant.name} Cabinet Body & 4 Solid Wood Tapered Legs`,
          detail: `${activeFinish.name} (${activeFinish.code}) · ${activeVariant.drawerCount} soft-close drawers`,
        },
        {
          name: `25 mm Stone Countertop & ${activeVariant.basinCount === 2 ? 'Dual' : 'Integrated'} Porcelain Basin`,
          detail: `${activeCountertop.name} · Pre-drilled 4″ centerset (${activeVariant.basinCount === 2 ? 'dual 3-hole' : '3-hole'})`,
        },
        {
          name: `${activeVariant.trayCount} Modular Removable Interior Accessory Trays`,
          detail: 'Seated inside lower drawer box(es) for vanity organization',
        },
        {
          name: `Machined Drawer Hardware Pulls (${activeHardware.name})`,
          detail: `${activeVariant.drawerCount} pulls pre-fitted to functional drawer fronts`,
        },
        config.backsplash === 'included'
          ? {
              name: `4″ (101.6 mm) Matching Stone Backsplash`,
              detail: `${activeCountertop.name} · 19.05 mm slab thickness`,
            }
          : null,
        config.faucet === 'centerset-4'
          ? {
              name: `${activeVariant.basinCount === 2 ? '2× ' : ''}4″ Centerset High-Arc Faucet & Pop-up Drain`,
              detail: `${HARDWARE_FINISHES.find((h) => h.id === config.faucetFinish)?.name || activeHardware.name} finish`,
            }
          : null,
      ].filter(Boolean);

  return (
    <div className="pdp-editorial-container">
      {/* Sub-navigation anchors */}
      <nav className="pdp-anchor-bar" aria-label="Product detail sections">
        <a href="#overview">Overview</a>
        <a href="#dimensions-specs">Dimensions &amp; Specifications</a>
        <a href="#materials-craft">Materials &amp; Care</a>
        <a href="#whats-included">What’s Included</a>
        <a href="#configuration-summary">Configuration Summary</a>
      </nav>

      {/* E. Product Overview */}
      <section id="overview" className="pdp-editorial-section">
        <div className="pdp-section-grid">
          <div>
            <span className="section-kicker">Product Overview</span>
            <h2 className="pdp-section-h2">{product.name}</h2>
            <p className="pdp-editorial-lead">{product.fullDescription}</p>
          </div>
          <div className="pdp-highlights-box">
            <h3 className="pdp-subhead">Key Architecture &amp; Functional Features</h3>
            <ul className="pdp-check-list">
              {highlights.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* F. Dimensions and Technical Specifications */}
      <section id="dimensions-specs" className="pdp-editorial-section">
        <div className="pdp-section-head-row">
          <div>
            <span className="section-kicker">Dimensions &amp; Engineering Tolerances</span>
            <h2 className="pdp-section-h2">
              {activeVariant.name} — Verified Measurements
            </h2>
          </div>

          <div className="unit-toggle-group" role="group" aria-label="Measurement units">
            <button
              type="button"
              className={`unit-pill ${unit === 'in' ? 'active' : ''}`}
              onClick={() => setUnit('in')}
            >
              Inches (in)
            </button>
            <button
              type="button"
              className={`unit-pill ${unit === 'mm' ? 'active' : ''}`}
              onClick={() => setUnit('mm')}
            >
              Millimeters (mm)
            </button>
          </div>
        </div>

        <div className="pdp-specs-grid">
          {/* Card 1: Overall Countertop & Installed Footprint */}
          <div className="pdp-spec-card">
            <div className="pdp-spec-card-head">
              <Ruler size={17} />
              <h3>Overall Product Dimensions (With Stone Top)</h3>
            </div>
            <div className="spec-list">
              <div className="spec-row">
                <span>Overall Top Width</span>
                <span>{formatDim(activeVariant.topWidthIn, activeVariant.topWidthMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Overall Depth</span>
                <span>{formatDim(activeVariant.depthIn, activeVariant.depthMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Vanity Height (Excl. Backsplash)</span>
                <span>{formatDim(activeVariant.heightIn, activeVariant.heightMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Backsplash Height</span>
                <span>
                  {config.backsplash === 'included'
                    ? formatDim(activeVariant.backsplashIn, activeVariant.backsplashMm, unit)
                    : 'Omitted (0)'}
                </span>
              </div>
              <div className="spec-row">
                <span>Total Height (Installed)</span>
                <span>{formatDim(totalHeightIn, totalHeightMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Countertop Slab Thickness</span>
                <span>{unit === 'mm' ? `${activeVariant.countertopThicknessMm} mm` : '0.98″ (~1″)'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cabinet Body & Component Clearances */}
          <div className="pdp-spec-card">
            <div className="pdp-spec-card-head">
              <Layers size={17} />
              <h3>Cabinet Body &amp; Joinery Dimensions</h3>
            </div>
            <div className="spec-list">
              <div className="spec-row">
                <span>Cabinet Base Width</span>
                <span>{formatDim(activeVariant.baseWidthIn, activeVariant.baseWidthMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Cabinet Body Depth</span>
                <span>{formatDim(activeVariant.bodyDepthIn, activeVariant.bodyDepthMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Carcass Box Height</span>
                <span>{unit === 'mm' ? `${activeVariant.carcassHeightMm} mm` : '28.89″'}</span>
              </div>
              <div className="spec-row">
                <span>Solid Wood Leg Height</span>
                <span>{formatDim(activeVariant.legHeightIn, activeVariant.legHeightMm, unit)}</span>
              </div>
              <div className="spec-row">
                <span>Faucet Drill Spread</span>
                <span>{unit === 'mm' ? '101.6 mm (3-Hole)' : '4.0″ Centerset (3-Hole)'}</span>
              </div>
              <div className="spec-row">
                <span>Drawer Layout</span>
                <span>
                  {activeVariant.falseDrawerCount} Fixed False + {activeVariant.drawerCount} Soft-Close
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Official 31" Technical CAD Drawing Reference */}
          <div className="pdp-spec-card pdp-cad-card">
            <div className="pdp-spec-card-head">
              <FileText size={17} />
              <h3>Technical Spec Sheet (31″ Master SKU 605-9531)</h3>
            </div>
            <img
              src="/assets/gallery/spec_drawing_31.png"
              alt="Everdale 31 inch vanity official specification and replacement parts drawing"
              className="pdp-cad-img"
              loading="lazy"
            />
            <p className="pdp-cad-note">
              Reference elevation &amp; plumbing cutout schematic for SKU 605-9531 (31″). Width scales proportionally across 24″, 37″, 49″, and 61″ models.
            </p>
          </div>
        </div>

        {/* Collapsible Plumbing & Installation Details */}
        <div className="pdp-collapsible-bar">
          <button
            type="button"
            className="accordion-trigger"
            aria-expanded={installOpen}
            onClick={() => setInstallOpen((v) => !v)}
          >
            <div className="accordion-title-wrap">
              <Wrench size={16} />
              <span className="section-title">Plumbing Clearances &amp; Installation Details</span>
            </div>
            <ChevronDown size={17} className={`accordion-chevron ${installOpen ? 'rotated' : ''}`} />
          </button>
          {installOpen && (
            <div className="pdp-collapsible-content">
              <ul className="pdp-check-list">
                {product.installationDetails.map((detail) => (
                  <li key={detail}>
                    <CheckCircle2 size={15} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* G. Materials and Craftsmanship */}
      <section id="materials-craft" className="pdp-editorial-section">
        <span className="section-kicker">Materials &amp; Craftsmanship</span>
        <h2 className="pdp-section-h2">Engineered for High-Moisture Bath Environments</h2>

        <div className="pdp-materials-grid">
          {product.materials.map((mat) => (
            <div key={mat.part} className="pdp-material-card">
              <h3>{mat.part}</h3>
              <p>{mat.spec}</p>
            </div>
          ))}
        </div>

        <div className="pdp-care-strip">
          <div className="pdp-care-head">
            <ShieldCheck size={17} />
            <strong>Care &amp; Maintenance Guidelines</strong>
          </div>
          <ul>
            {product.careInstructions.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* H. What's Included */}
      <section id="whats-included" className="pdp-editorial-section">
        <span className="section-kicker">Configured Box Contents</span>
        <h2 className="pdp-section-h2">
          What’s Included With Your {activeVariant.label} Configuration
        </h2>
        <div className="pdp-included-grid">
          {includedItems.map((item) => (
            <div key={item.name} className="pdp-included-item">
              <PackageCheck size={18} className="included-icon" />
              <div>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* I. Configuration Summary and Commerce Actions */}
      <section id="configuration-summary" className="pdp-editorial-section pdp-summary-section">
        <div className="pdp-summary-card">
          <div className="pdp-summary-left">
            <div className="pdp-summary-preview">
              <div
                className="summary-swatch-stack"
                aria-hidden="true"
              >
                <span
                  className="summary-swatch-chip"
                  style={getSwatchBackgroundStyle(
                    activeFinish,
                    activeFinish.finishType === 'wood' ? 'wood' : 'cabinet'
                  )}
                  title={activeFinish.name}
                />
                <span
                  className="summary-swatch-chip"
                  style={getSwatchBackgroundStyle(activeCountertop, 'countertop')}
                  title={activeCountertop.name}
                />
                <span
                  className="summary-swatch-chip"
                  style={getSwatchBackgroundStyle(activeHardware, 'hardware')}
                  title={activeHardware.name}
                />
              </div>
              <div>
                <span className="section-kicker">Your Configuration</span>
                <h2 className="pdp-summary-title">
                  {isSeries ? `Everdale ${activeVariant.baseWidthIn}″ Cabinet Series` : activeVariant.name}
                </h2>
                <div className="pdp-summary-meta">
                  SKU {activeVariant.sku} · {isSeries ? `Cabinet ${activeVariant.baseWidthIn}″W × ${activeVariant.bodyDepthIn}″D` : `${activeVariant.topWidthIn}″W × ${activeVariant.depthIn}″D × ${totalHeightIn}″H overall`}
                </div>
              </div>
            </div>

            <div className="pdp-summary-chips">
              <span>{isSeries ? 'Series: Cabinet Only' : 'Combo: Vanity + Top'}</span>
              <span>{activeFinish.name}</span>
              {!isSeries && <span>{activeHardware.name} Hardware</span>}
              {!isSeries && <span>{activeCountertop.name}</span>}
              {!isSeries && <span>{config.backsplash === 'included' ? '4″ Backsplash' : 'No Backsplash'}</span>}
              {!isSeries && <span>{activeFaucet.id === 'centerset-4' ? '4″ Faucet + Drain' : 'Pre-drilled Only'}</span>}
            </div>
          </div>

          <div className="pdp-summary-right">
            <div className="pdp-summary-price-row">
              <div>
                <div className="price-col-label">
                  {isInStock ? 'Estimated After 11% Savings*' : `${activeChannel.label} Estimate`}
                </div>
                <div className="pdp-summary-price">
                  {PricingService.formatCurrency(displayedPrice, BRAND_CONFIG.currencySymbol)}
                </div>
              </div>
              <div className="pdp-summary-status">
                <span className="combo-badge">{activeChannel.label}</span>
                <small>
                  {isInStock && eligibility?.purchaseEligible
                    ? 'Ready for bag preview'
                    : eligibility?.leadTimeWeeks || activeChannel.subtitle}
                </small>
              </div>
            </div>

            <div className="pdp-summary-actions">
              <button type="button" className="btn-primary-cta" onClick={onPrimaryAction}>
                {isInStock && eligibility?.purchaseEligible ? (
                  <ShoppingBag size={16} />
                ) : (
                  <FileText size={16} />
                )}
                <span>{eligibility?.ctaLabel || activeChannel.ctaLabel}</span>
              </button>
              <button type="button" className="btn-secondary-cta" onClick={onToggleSave}>
                <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button type="button" className="btn-secondary-cta" onClick={onOpenShare}>
                <Share2 size={15} />
                <span>Share</span>
              </button>
              <button type="button" className="btn-secondary-cta" onClick={onExportSpecJson}>
                <Download size={15} />
                <span>Spec JSON</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

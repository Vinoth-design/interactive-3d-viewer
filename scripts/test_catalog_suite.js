import {
  CatalogService,
  CATEGORIES,
  PRODUCT_FAMILIES,
  PRODUCTS,
  VANITY_VARIANTS,
  OPTION_GROUPS,
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  FAUCET_OPTIONS,
  MIRROR_OPTIONS,
  ASSET_REGISTRY,
  PricingService,
  CommerceEligibilityService,
  validateConfiguration,
  DEFAULT_CONFIG,
} from '../everdale-configurator/src/catalog/index.js';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('='.repeat(80));
console.log('EVERDALE — PRODUCT CATALOGUE & PDP ASSET VERIFICATION SUITE');
console.log('='.repeat(80));

// 1. Categories
console.log('\n[1] Testing Categories...');
assert(CATEGORIES.length >= 2, 'At least 2 categories exist');
assert(CATEGORIES.some((c) => c.id === 'bathroom-vanities' && c.status === 'published'), 'Category bathroom-vanities is published');
assert(CATEGORIES.some((c) => c.id === 'kitchen-cabinets' && c.status === 'draft'), 'Category kitchen-cabinets is draft');
const catSlugs = CATEGORIES.map((c) => c.slug);
assert(new Set(catSlugs).size === catSlugs.length, 'Category slugs are unique');

// 2. Product Families
console.log('\n[2] Testing Product Families...');
assert(PRODUCT_FAMILIES.length >= 5, 'At least 5 product families defined');
assert(PRODUCT_FAMILIES.some((f) => f.id === 'freestanding-vanity' && f.categoryId === 'bathroom-vanities'), 'freestanding-vanity belongs to bathroom-vanities');
assert(PRODUCT_FAMILIES.some((f) => f.id === 'kitchen-base-cabinet' && f.categoryId === 'kitchen-cabinets'), 'kitchen-base-cabinet belongs to kitchen-cabinets');

// 3. Products
console.log('\n[3] Testing Products...');
const liveProducts = CatalogService.getProducts('published');
assert(liveProducts.length === 2, 'Published catalog exposes both Combo (everdale-vanity) and Series (everdale-series) product categories');
assert(liveProducts.some((p) => p.id === 'everdale-vanity' && p.sellingCategory === 'combo'), 'Combo product everdale-vanity has sellingCategory=combo');
assert(liveProducts.some((p) => p.id === 'everdale-series' && p.sellingCategory === 'series'), 'Series product everdale-series has sellingCategory=series');
assert(liveProducts[0].defaultVariantId === '31', 'Default variant is 31');
const draftProducts = CatalogService.getProducts('draft');
assert(draftProducts.some((p) => p.id === 'kitchen-base-modular-sample'), 'Kitchen sample product exists in draft');

// 4. Variants
console.log('\n[4] Testing Variants...');
const variants = CatalogService.getVariants('everdale-vanity');
assert(variants.length === 5, '5 physical variants exist for everdale-vanity');
const skus = variants.map((v) => v.sku);
assert(new Set(skus).size === 5, 'All 5 vanity SKUs are distinct (605-9530 to 605-9534)');
for (const v of variants) {
  assert(
    v.topWidthMm > 0 && v.baseWidthMm > 0 && v.topWidthMm > v.baseWidthMm && v.depthMm === 482.6 && v.heightMm === 863.6,
    `Variant ${v.id} overall and cabinet body dimensions are valid`
  );
  assert(fs.existsSync(path.join('everdale-configurator', 'public', v.modelFile)), `Model asset exists for variant ${v.id}: ${v.modelFile}`);
}

// 5. Option Groups & Values
console.log('\n[5] Testing Option Groups & Compatibility...');
assert(OPTION_GROUPS.length >= 8, 'Option groups defined');
assert(CABINET_FINISHES.length >= 8, 'Cabinet finishes include verified Phase 02 wood & lacquer swatches');
assert(COUNTERTOP_FINISHES.length >= 5, 'Countertop finishes include verified Phase 02 stones');
const defaultValidation = validateConfiguration(DEFAULT_CONFIG);
assert(defaultValidation.isValid, 'Default configuration is 100% valid');

const invalidWidthTest = validateConfiguration({ ...DEFAULT_CONFIG, width: '99' });
assert(invalidWidthTest.config.width === '31', 'Invalid width 99 falls back to 31');

const invalidDepthTest = validateConfiguration({ ...DEFAULT_CONFIG, depth: '16' });
assert(invalidDepthTest.config.depth === '19', 'Disabled depth 16 falls back to 19');

const archedWoodTest = validateConfiguration({ ...DEFAULT_CONFIG, mirror: 'arched', frame: 'match-vanity' });
assert(archedWoodTest.config.frame === 'antique-brass', 'Arched mirror resolves to metal frame antique-brass');

const seriesProductTest = validateConfiguration({ product: 'everdale-series' });
assert(seriesProductTest.config.purchaseMode === 'series', 'Product category derives purchaseMode=series automatically from everdale-series');

// 6. Pricing Service (Combo, Series & $0 Mirror Visual-Only Rule)
console.log('\n[6] Testing Pricing Service...');
const base31Price = PricingService.calculatePrice(DEFAULT_CONFIG);
assert(base31Price.subtotal === 888.0, `31" Combo Default ($799 + $89 faucet + $0 mirror) is $888.00 (got ${base31Price.subtotal})`);
assert(base31Price.rebateValue === 97.68, `11% rebate is $97.68 (got ${base31Price.rebateValue})`);
assert(base31Price.afterRebate === 790.32, `After rebate price is $790.32 (got ${base31Price.afterRebate})`);

const series31Price = PricingService.calculatePrice({
  ...DEFAULT_CONFIG,
  purchaseMode: 'series',
  countertop: 'calacatta-gold',
  hardware: 'matte-black',
  faucet: 'centerset-4',
});
assert(series31Price.subtotal === 599.0, `31" Series (Cabinet Only) ignores preview top/hardware/faucet/mirror ($599.00, got ${series31Price.subtotal})`);

const config61 = { ...DEFAULT_CONFIG, width: '61' };
const price61 = PricingService.calculatePrice(config61);
assert(price61.subtotal === 1577.0, `61" Combo Double basin subtotal is $1577.00 ($1399 + $178 faucet + $0 mirror, got ${price61.subtotal})`);

// 7. Assets Registry (Non-blank gallery verification)
console.log('\n[7] Testing Asset Registry...');
assert(ASSET_REGISTRY.models.length === 5, '5 GLB models registered in asset registry');
assert(ASSET_REGISTRY.renders.length >= 8, `At least 8 verified gallery images registered (got ${ASSET_REGISTRY.renders.length})`);
for (const r of ASSET_REGISTRY.renders) {
  const diskPath = path.join('everdale-configurator', 'public', r.path.replace(/^\//, ''));
  assert(fs.existsSync(diskPath), `Gallery image exists on disk: ${r.path}`);
  const stat = fs.statSync(diskPath);
  assert(stat.size > 5000, `Gallery image is non-blank (> 5 KB): ${r.path} (${stat.size} bytes)`);
}

// 8. Commerce Eligibility
console.log('\n[8] Testing Commerce Eligibility...');
const product = CatalogService.getProduct('everdale-vanity');
const variant31 = CatalogService.getVariant('31');
const instockElig = CommerceEligibilityService.evaluate(product, variant31, DEFAULT_CONFIG);
assert(instockElig.purchaseEligible === true && instockElig.ctaLabel === 'ADD TO CART', 'Uncustomized In Stock vanity uses ADD TO CART');

const customValidated = validateConfiguration({
  ...DEFAULT_CONFIG,
  finish: 'natural-oak',
});
assert(customValidated.config.tab === 'quickship', 'Customizing finish automatically switches tab to quickship');
const customElig = CommerceEligibilityService.evaluate(product, variant31, customValidated.config);
assert(customElig.purchaseEligible === false && customElig.isCustomized === true && customElig.ctaLabel === 'REQUEST QUOTE', 'Customized product uses Quick Ship + REQUEST QUOTE');

const seriesPreviewValidated = validateConfiguration({
  ...DEFAULT_CONFIG,
  product: 'everdale-series',
  countertop: 'calacatta-gold',
  hardware: 'matte-black',
});
const seriesPreviewElig = CommerceEligibilityService.evaluate(product, variant31, seriesPreviewValidated.config);
assert(seriesPreviewValidated.config.tab === 'in-stock' && seriesPreviewElig.isCustomized === false && seriesPreviewElig.ctaLabel === 'ADD TO CART', 'Changing preview-only top/hardware in Series keeps In Stock + ADD TO CART');

const quickshipElig = CommerceEligibilityService.evaluate(product, variant31, { ...DEFAULT_CONFIG, tab: 'quickship' });
assert(quickshipElig.purchaseEligible === false && quickshipElig.ctaLabel === 'REQUEST QUOTE', 'Manual Quick Ship tab uses REQUEST QUOTE');

const draftKitchen = CatalogService.getProduct('kitchen-base-modular-sample');
const draftElig = CommerceEligibilityService.evaluate(draftKitchen, null, {});
assert(draftElig.purchaseEligible === false, 'Draft kitchen product is NOT purchase eligible');

console.log('\n' + '='.repeat(80));
console.log(`TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log('='.repeat(80));

if (failed > 0) {
  process.exit(1);
}

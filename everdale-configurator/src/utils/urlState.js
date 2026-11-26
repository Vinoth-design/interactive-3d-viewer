/**
 * Everdale Product Platform — URL Serialization & Configuration State Sync
 */

import {
  DEFAULT_CONFIG,
  PURCHASE_MODES,
  CHANNELS,
  WIDTH_OPTIONS,
  DEPTH_OPTIONS,
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  COUNTERTOP_FINISHES,
  BACKSPLASH_OPTIONS,
  FAUCET_OPTIONS,
  MIRROR_OPTIONS,
  MIRROR_FRAMES_WOOD,
  MIRROR_FRAMES_METAL,
  SCENE_WALL_PRESETS,
  SCENE_FLOOR_PRESETS,
  SCENE_LIGHTING_PRESETS,
  PRODUCTS,
} from '../config/productConfig';
import { validateConfiguration } from '../catalog/compatibility';

const VALID_OPTIONS = {
  product: new Set(PRODUCTS.map((p) => p.id).concat(PRODUCTS.map((p) => p.slug))),
  purchaseMode: new Set(PURCHASE_MODES.map((m) => m.id)),
  tab: new Set([...CHANNELS.map((c) => c.id), 'semi-custom']),
  width: new Set(WIDTH_OPTIONS.map((w) => w.id)),
  depth: new Set(DEPTH_OPTIONS.map((d) => d.id)),
  finish: new Set(CABINET_FINISHES.map((f) => f.id)),
  hardware: new Set(HARDWARE_FINISHES.map((h) => h.id)),
  countertop: new Set(COUNTERTOP_FINISHES.map((c) => c.id)),
  backsplash: new Set(BACKSPLASH_OPTIONS.map((b) => b.id)),
  faucet: new Set(FAUCET_OPTIONS.map((f) => f.id)),
  faucetFinish: new Set(HARDWARE_FINISHES.map((h) => h.id)),
  mirror: new Set(MIRROR_OPTIONS.map((m) => m.id)),
  frame: new Set([
    ...MIRROR_FRAMES_WOOD.map((f) => f.id),
    ...MIRROR_FRAMES_METAL.map((f) => f.id),
  ]),
  wall: new Set(SCENE_WALL_PRESETS.map((w) => w.id)),
  floor: new Set(SCENE_FLOOR_PRESETS.map((f) => f.id)),
  lighting: new Set(SCENE_LIGHTING_PRESETS.map((l) => l.id)),
};

const SYNC_KEYS = [
  'product',
  'purchaseMode',
  'tab',
  'width',
  'depth',
  'finish',
  'hardware',
  'countertop',
  'backsplash',
  'faucet',
  'faucetFinish',
  'mirror',
  'frame',
  'wall',
  'floor',
  'lighting',
];

export function readConfigFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const next = { ...DEFAULT_CONFIG, product: 'everdale-vanity' };

  const skuParam = params.get('sku');
  if (skuParam) {
    const matchedVariant = WIDTH_OPTIONS.find(
      (v) => v.sku.toLowerCase() === skuParam.trim().toLowerCase()
    );
    if (matchedVariant) next.width = matchedVariant.id;
  }

  for (const key of SYNC_KEYS) {
    const val = params.get(key);
    if (val !== null && val !== '') {
      if (VALID_OPTIONS[key] && !VALID_OPTIONS[key].has(val)) {
        // Ignore unverified or invalid options from URL; retain safe default
        continue;
      }
      next[key] = val;
    }
  }

  // Allow ?purchaseMode=series fallback only when explicit product wasn't specified
  if (!params.get('product') && params.get('purchaseMode') === 'series') {
    next.product = 'everdale-series';
  }

  if (params.get('dims') === '1') next.showDimensions = true;
  if (params.get('props') === '0') next.showProps = false;

  // Run through compatibility engine to ensure dependent options are valid
  const validation = validateConfiguration(next);
  return validation.config;
}

export function buildShareUrl(config) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  for (const key of SYNC_KEYS) {
    if (config[key] !== undefined && config[key] !== null) {
      params.set(key, String(config[key]));
    }
  }
  if (config.showDimensions) params.set('dims', '1');
  if (!config.showProps) params.set('props', '0');

  url.search = params.toString();
  return url.toString();
}

export function syncConfigToUrl(config) {
  try {
    const nextUrl = buildShareUrl(config);
    window.history.replaceState(null, '', nextUrl);
  } catch {
    // Ignore history restrictions in sandboxed/file contexts
  }
}

import { DEFAULT_CONFIG } from '../config/productConfig';

const SYNC_KEYS = [
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
  const next = { ...DEFAULT_CONFIG };

  for (const key of SYNC_KEYS) {
    const val = params.get(key);
    if (val !== null && val !== '') {
      next[key] = val;
    }
  }

  if (params.get('dims') === '1') next.showDimensions = true;
  if (params.get('props') === '0') next.showProps = false;

  return next;
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

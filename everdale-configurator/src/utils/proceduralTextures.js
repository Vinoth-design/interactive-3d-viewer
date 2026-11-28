import * as THREE from 'three';

const textureCache = new Map();
const textureLoader = new THREE.TextureLoader();

function createCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function finalizeTexture(canvas, repeatX = 1, repeatY = 1, isColor = true) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

function loadImageTexture(url, repeatX = 1, repeatY = 1, isColor = true) {
  const cacheKey = `img_${url}_${repeatX}_${repeatY}_${isColor}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const tex = textureLoader.load(url);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 8;
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  textureCache.set(cacheKey, tex);
  return tex;
}

function loadPBRSet(id, repeatX = 2, repeatY = 2) {
  const cacheKey = `pbrset_${id}_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const base = `/textures/pbr/${id}`;
  const set = {
    map: loadImageTexture(`${base}/diffuse.jpg`, repeatX, repeatY, true),
    normalMap: loadImageTexture(`${base}/normal.jpg`, repeatX, repeatY, false),
    roughnessMap: loadImageTexture(`${base}/roughness.jpg`, repeatX, repeatY, false),
  };
  textureCache.set(cacheKey, set);
  return set;
}

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates seamless normal map from grayscale height canvas.
 */
function createNormalFromHeightCanvas(heightCanvas, strength = 2.0, repeatX = 1, repeatY = 1) {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d');
  const srcData = srcCtx.getImageData(0, 0, w, h).data;

  const outCanvas = createCanvas(w);
  const outCtx = outCanvas.getContext('2d');
  const outImg = outCtx.createImageData(w, h);
  const dst = outImg.data;

  const sample = (x, y) => {
    const wx = ((x % w) + w) % w;
    const wy = ((y % h) + h) % h;
    return srcData[(wy * w + wx) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (sample(x + 1, y) - sample(x - 1, y)) * strength;
      const dy = (sample(x, y + 1) - sample(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1.0);
      const nx = (-dx / len) * 0.5 + 0.5;
      const ny = (-dy / len) * 0.5 + 0.5;
      const nz = (1.0 / len) * 0.5 + 0.5;
      const idx = (y * w + x) * 4;
      dst[idx] = Math.round(nx * 255);
      dst[idx + 1] = Math.round(ny * 255);
      dst[idx + 2] = Math.round(nz * 255);
      dst[idx + 3] = 255;
    }
  }
  outCtx.putImageData(outImg, 0, 0);
  return finalizeTexture(outCanvas, repeatX, repeatY, false);
}

/**
 * Returns calibrated brushed metal normal map for machined hardware & sconces.
 */
export function getBrushedMetalNormal() {
  return loadImageTexture('/textures/brushed_metal_normal.png', 3, 3, false);
}

/**
 * Real Poly Haven CC0 wood veneer PBR sets (diffuse, OpenGL normal, roughness).
 */
export function getWoodTextures(variant = 'natural-oak') {
  if (variant === 'walnut') {
    return loadPBRSet('natural_walnut_veneer', 2.2, 2.2);
  }
  if (variant === 'drawer-maple') {
    return loadPBRSet('oak_veneer_03', 2.6, 2.6);
  }
  return loadPBRSet('oak_veneer_03', 2.2, 2.2);
}

/**
 * Real Poly Haven CC0 fabric linen weave PBR set for towels & curtains.
 */
export function getFabricPBR(repeatX = 3.5, repeatY = 2.5) {
  return loadPBRSet('rough_linen', repeatX, repeatY);
}

/**
 * Real Poly Haven CC0 Waffle Pique Cotton PBR set (diffuse, normal, bump/disp, ao, roughness)
 * for high-detail 3D bath mat depth, waffle pockets, and lighting relief.
 */
export function getBathMatPBR(repeatX = 2.5, repeatY = 1.65) {
  const cacheKey = `bath_mat_waffle_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const base = '/textures/pbr/bath_mat_waffle';
  // Poly Haven's waffle_pique_cotton AO + bump encode crisp neutral waffle weave without the dyed yellow tint
  const set = {
    map: loadImageTexture(`${base}/ao.jpg`, repeatX, repeatY, true),
    normalMap: loadImageTexture(`${base}/normal.jpg`, repeatX, repeatY, false),
    bumpMap: loadImageTexture(`${base}/bump.jpg`, repeatX, repeatY, false),
    aoMap: loadImageTexture(`${base}/ao.jpg`, repeatX, repeatY, false),
    roughnessMap: loadImageTexture(`${base}/roughness.jpg`, repeatX, repeatY, false),
  };
  textureCache.set(cacheKey, set);
  return set;
}

/**
 * Calibrated stone countertop PBR set (monolithic slab veining + micro-normal polish).
 */
export function getCountertopPBR(type) {
  const key = `countertop_pbr_${type}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const microStoneNormal = loadImageTexture('/textures/pbr/marble_01/normal.jpg', 2.2, 1.6, false);

  if (type === 'solid-stone') {
    const canvas = createCanvas(512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f2f1ed';
    ctx.fillRect(0, 0, 512, 512);
    const rand = seededRandom(11);
    for (let i = 0; i < 2400; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const a = 0.015 + rand() * 0.025;
      ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(185,182,176,${a})`;
      ctx.fillRect(x, y, 2, 2);
    }
    const result = {
      map: finalizeTexture(canvas, 2, 2, true),
      normalMap: microStoneNormal,
      roughnessMap: null,
    };
    textureCache.set(key, result);
    return result;
  }

  if (type === 'carrara' || type === 'calacatta-gold') {
    const isGold = type === 'calacatta-gold';
    const size = 1024;
    const canvas = createCanvas(size);
    const ctx = canvas.getContext('2d');
    const hCanvas = createCanvas(size);
    const hCtx = hCanvas.getContext('2d');

    ctx.fillStyle = isGold ? '#f3efe8' : '#f1f0ec';
    ctx.fillRect(0, 0, size, size);
    hCtx.fillStyle = '#d8d8d8';
    hCtx.fillRect(0, 0, size, size);

    const rand = seededRandom(isGold ? 99 : 42);
    for (let i = 0; i < 42; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 80 + rand() * 210;
      const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
      grad.addColorStop(0, isGold ? 'rgba(185, 168, 144, 0.09)' : 'rgba(160, 165, 170, 0.09)');
      grad.addColorStop(1, 'rgba(170, 174, 178, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    for (let v = 0; v < 28; v++) {
      ctx.beginPath();
      hCtx.beginPath();
      let x = rand() * size - 200;
      let y = rand() * size - 200;
      ctx.moveTo(x, y);
      hCtx.moveTo(x, y);
      for (let s = 0; s < 16; s++) {
        x += 34 + rand() * 48;
        y += 18 + (rand() - 0.35) * 58;
        ctx.lineTo(x, y);
        hCtx.lineTo(x, y);
      }
      ctx.strokeStyle = isGold
        ? v % 3 === 0
          ? `rgba(176, 141, 86, ${0.16 + rand() * 0.16})`
          : `rgba(138, 134, 128, ${0.12 + rand() * 0.15})`
        : `rgba(128, 134, 142, ${0.13 + rand() * 0.18})`;
      ctx.lineWidth = 1.2 + rand() * 4.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      hCtx.strokeStyle = 'rgba(160, 160, 160, 0.25)';
      hCtx.lineWidth = ctx.lineWidth;
      hCtx.stroke();

      ctx.strokeStyle = isGold
        ? `rgba(148, 125, 92, ${0.07 + rand() * 0.08})`
        : `rgba(104, 108, 114, ${0.07 + rand() * 0.09})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    const result = {
      map: finalizeTexture(canvas, 1.4, 1.4, true),
      normalMap: createNormalFromHeightCanvas(hCanvas, 0.45, 1.4, 1.4),
      roughnessMap: null,
    };
    textureCache.set(key, result);
    return result;
  }

  if (type === 'quartz') {
    const canvas = createCanvas(512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#dadbd8';
    ctx.fillRect(0, 0, 512, 512);
    const rand = seededRandom(77);
    for (let i = 0; i < 7200; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const s = 1 + rand() * 2.5;
      const pick = rand();
      if (pick < 0.34) ctx.fillStyle = 'rgba(255,255,255,0.48)';
      else if (pick < 0.72) ctx.fillStyle = 'rgba(150,154,152,0.34)';
      else ctx.fillStyle = 'rgba(102,106,108,0.24)';
      ctx.fillRect(x, y, s, s);
    }
    const result = {
      map: finalizeTexture(canvas, 3, 3, true),
      normalMap: loadImageTexture('/textures/white_quartz_normal.png', 3, 3, false),
      roughnessMap: null,
    };
    textureCache.set(key, result);
    return result;
  }

  if (type === 'black-granite') {
    const canvas = createCanvas(512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#252729';
    ctx.fillRect(0, 0, 512, 512);
    const rand = seededRandom(149);
    for (let i = 0; i < 7500; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const s = 1 + rand() * 2.2;
      const pick = rand();
      if (pick < 0.25) ctx.fillStyle = 'rgba(110,115,120,0.22)';
      else if (pick < 0.55) ctx.fillStyle = 'rgba(65,68,72,0.35)';
      else ctx.fillStyle = 'rgba(18,20,22,0.35)';
      ctx.fillRect(x, y, s, s);
    }
    const result = {
      map: finalizeTexture(canvas, 3, 3, true),
      normalMap: loadImageTexture('/textures/black_granite_normal.png', 3, 3, false),
      roughnessMap: null,
    };
    textureCache.set(key, result);
    return result;
  }

  return { map: null, normalMap: null, roughnessMap: null };
}

export function getCountertopTexture(type) {
  return getCountertopPBR(type).map;
}

/**
 * Full Poly Haven CC0 PBR sets for architectural bathroom walls.
 */
export function getWallPBR(preset = 'microcement') {
  const key = `wall_pbr_${preset}`;
  if (textureCache.has(key)) return textureCache.get(key);

  let result;
  if (preset === 'marble') {
    const set = loadPBRSet('marble_01', 4.5, 2.8);
    result = { ...set, tint: '#f3f2ee', roughness: 0.28, normalScale: 0.45 };
  } else if (preset === 'stone') {
    const set = loadPBRSet('floor_tiles_04', 3.4, 2.2);
    result = { ...set, tint: '#dfd7cb', roughness: 0.72, normalScale: 0.65 };
  } else if (preset === 'cottage' || preset === 'classic') {
    const panelMap = getWallTexture(preset);
    const plaster = loadPBRSet('white_plaster_02', 4.5, 2.8);
    result = {
      map: panelMap,
      normalMap: plaster.normalMap,
      roughnessMap: plaster.roughnessMap,
      tint: '#ffffff',
      roughness: 0.78,
      normalScale: 0.22,
    };
  } else if (preset === 'plain') {
    const plaster = loadPBRSet('white_plaster_02', 3.4, 2.0);
    result = { ...plaster, tint: '#f3f1ec', roughness: 0.88, normalScale: 0.12 };
  } else {
    // 'microcement' default
    const plaster = loadPBRSet('white_plaster_02', 3.2, 1.9);
    result = { ...plaster, tint: '#ebe6de', roughness: 0.86, normalScale: 0.16 };
  }

  textureCache.set(key, result);
  return result;
}

/**
 * Full Poly Haven CC0 PBR sets for bathroom floors.
 */
export function getFloorPBR(preset = 'checker') {
  const key = `floor_pbr_${preset}`;
  if (textureCache.has(key)) return textureCache.get(key);

  let result;
  if (preset === 'room-default') {
    const set = loadPBRSet('rectangular_parquet', 4.2, 3.4);
    result = { ...set, tint: '#f2ece4', roughness: 0.52, normalScale: 0.55 };
  } else if (preset === 'limestone') {
    const set = loadPBRSet('floor_tiles_04', 2.8, 2.3);
    result = { ...set, tint: '#ebe7e0', roughness: 0.62, normalScale: 0.55 };
  } else if (preset === 'marble-hex') {
    const set = loadPBRSet('terrazzo_tiles', 4.2, 3.4);
    result = { ...set, tint: '#f3f1ed', roughness: 0.34, normalScale: 0.45 };
  } else {
    // 'checker'
    const set = loadPBRSet('floor_tiles_06', 3.4, 2.8);
    result = { ...set, tint: '#f4f2ee', roughness: 0.44, normalScale: 0.52 };
  }

  textureCache.set(key, result);
  return result;
}

export function getWallTexture(preset) {
  const key = `wall_tex_${preset}`;
  if (textureCache.has(key)) return textureCache.get(key);

  if (preset !== 'cottage' && preset !== 'classic') {
    return loadImageTexture('/textures/pbr/white_plaster_02/diffuse.jpg', 4.8, 3.0, true);
  }

  const canvas = createCanvas(512);
  const ctx = canvas.getContext('2d');
  const rand = seededRandom(preset.length * 101 + 7);

  if (preset === 'cottage') {
    ctx.fillStyle = '#e4e1d8';
    ctx.fillRect(0, 0, 512, 512);
    const plankW = 64;
    for (let x = 0; x < 512; x += plankW) {
      const shade = (rand() - 0.5) * 6;
      ctx.fillStyle = `rgb(${228 + shade}, ${225 + shade}, ${216 + shade})`;
      ctx.fillRect(x, 0, plankW - 2, 512);
      ctx.fillStyle = 'rgba(120, 116, 108, 0.45)';
      ctx.fillRect(x + plankW - 2, 0, 2, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(x, 0, 1.5, 512);
    }
  } else {
    ctx.fillStyle = '#d8dcd7';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(110, 118, 112, 0.34)';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 440, 440);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.lineWidth = 3;
    ctx.strokeRect(42, 42, 428, 428);
    ctx.strokeStyle = 'rgba(115, 122, 118, 0.24)';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 400, 400);
  }

  const repeat = preset === 'classic' ? 4 : 4.5;
  const tex = finalizeTexture(canvas, repeat, repeat * 0.72, true);
  textureCache.set(key, tex);
  return tex;
}

export function getFloorTexture(preset) {
  return getFloorPBR(preset).map;
}

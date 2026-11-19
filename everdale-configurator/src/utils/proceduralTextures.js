import * as THREE from 'three';

const textureCache = new Map();

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

// Deterministic pseudo-random helper so procedural patterns stay crisp and consistent
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getCountertopTexture(type) {
  const key = `countertop_${type}`;
  if (textureCache.has(key)) return textureCache.get(key);

  if (type === 'solid-stone') {
    const canvas = createCanvas(512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f2ee';
    ctx.fillRect(0, 0, 512, 512);
    const rand = seededRandom(11);
    for (let i = 0; i < 1800; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const a = 0.015 + rand() * 0.025;
      ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(195,192,186,${a})`;
      ctx.fillRect(x, y, 2, 2);
    }
    const tex = finalizeTexture(canvas, 2, 2);
    textureCache.set(key, tex);
    return tex;
  }

  if (type === 'carrara') {
    const canvas = createCanvas(1024);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f2f1ee';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle misty clouds
    const rand = seededRandom(42);
    for (let i = 0; i < 36; i++) {
      const x = rand() * 1024;
      const y = rand() * 1024;
      const r = 80 + rand() * 200;
      const grad = ctx.createRadialGradient(x, y, 5, x, y, r);
      grad.addColorStop(0, 'rgba(170, 174, 178, 0.08)');
      grad.addColorStop(1, 'rgba(170, 174, 178, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Diagonal Carrara marble veins
    for (let v = 0; v < 26; v++) {
      ctx.beginPath();
      let x = rand() * 1024 - 200;
      let y = rand() * 1024 - 200;
      ctx.moveTo(x, y);
      const steps = 16;
      for (let s = 0; s < steps; s++) {
        x += 35 + rand() * 45;
        y += 20 + (rand() - 0.35) * 55;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(135, 140, 146, ${0.11 + rand() * 0.16})`;
      ctx.lineWidth = 1.2 + rand() * 4.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Secondary wispy filament
      ctx.strokeStyle = `rgba(110, 114, 120, ${0.06 + rand() * 0.09})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    const tex = finalizeTexture(canvas, 1.5, 1.5);
    textureCache.set(key, tex);
    return tex;
  }

  if (type === 'quartz') {
    const canvas = createCanvas(512);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#dddedc';
    ctx.fillRect(0, 0, 512, 512);
    const rand = seededRandom(77);
    for (let i = 0; i < 6500; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const size = 1 + rand() * 2.4;
      const pick = rand();
      if (pick < 0.35) ctx.fillStyle = 'rgba(255,255,255,0.45)';
      else if (pick < 0.72) ctx.fillStyle = 'rgba(155,158,156,0.32)';
      else ctx.fillStyle = 'rgba(110,113,115,0.22)';
      ctx.fillRect(x, y, size, size);
    }
    const tex = finalizeTexture(canvas, 3, 3);
    textureCache.set(key, tex);
    return tex;
  }

  return null;
}

export function getWallTexture(preset) {
  const key = `wall_${preset}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const canvas = createCanvas(512);
  const ctx = canvas.getContext('2d');
  const rand = seededRandom(preset.length * 101 + 7);

  if (preset === 'plain') {
    ctx.fillStyle = '#f2f1ed';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rand() * 0.015})`;
      ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
    }
  } else if (preset === 'microcement') {
    ctx.fillStyle = '#dad6ce';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 55; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      const r = 40 + rand() * 110;
      const grad = ctx.createRadialGradient(x, y, 4, x, y, r);
      const tone = rand() > 0.5 ? '236,232,226' : '185,179,170';
      grad.addColorStop(0, `rgba(${tone}, 0.16)`);
      grad.addColorStop(1, `rgba(${tone}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(90,84,78,${rand() * 0.04})`;
      ctx.fillRect(rand() * 512, rand() * 512, 1.5, 1.5);
    }
  } else if (preset === 'cottage') {
    // Vertical shiplap planks
    ctx.fillStyle = '#eceae3';
    ctx.fillRect(0, 0, 512, 512);
    const plankW = 64;
    for (let x = 0; x < 512; x += plankW) {
      const shade = (rand() - 0.5) * 6;
      ctx.fillStyle = `rgb(${236 + shade}, ${234 + shade}, ${227 + shade})`;
      ctx.fillRect(x, 0, plankW - 2, 512);
      ctx.fillStyle = 'rgba(130, 126, 118, 0.42)';
      ctx.fillRect(x + plankW - 2, 0, 2, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(x, 0, 1.5, 512);
    }
  } else if (preset === 'classic') {
    // Architectural wall molding frames
    ctx.fillStyle = '#e0e3df';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(115, 122, 116, 0.32)';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 440, 440);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(42, 42, 428, 428);
    ctx.strokeStyle = 'rgba(120, 126, 122, 0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 400, 400);
  } else if (preset === 'stone') {
    // Large architectural limestone wall slabs
    ctx.fillStyle = '#c8bfb3';
    ctx.fillRect(0, 0, 512, 512);
    const rows = 4;
    const rowH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * 128;
      for (let c = -1; c < 3; c++) {
        const x = c * 256 + offset;
        const y = r * rowH;
        const delta = (rand() - 0.5) * 14;
        ctx.fillStyle = `rgb(${198 + delta}, ${190 + delta}, ${178 + delta})`;
        ctx.fillRect(x + 2, y + 2, 252, rowH - 4);
      }
    }
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = `rgba(95,88,78,${rand() * 0.06})`;
      ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
    }
  } else if (preset === 'marble') {
    ctx.fillStyle = '#eeede9';
    ctx.fillRect(0, 0, 512, 512);
    for (let v = 0; v < 18; v++) {
      ctx.beginPath();
      let x = rand() * 512 - 80;
      let y = rand() * 512 - 80;
      ctx.moveTo(x, y);
      for (let s = 0; s < 12; s++) {
        x += 25 + rand() * 35;
        y += 15 + (rand() - 0.4) * 40;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(145, 148, 152, ${0.12 + rand() * 0.14})`;
      ctx.lineWidth = 1.5 + rand() * 3;
      ctx.stroke();
    }
    // Subtle large format tile joints
    ctx.strokeStyle = 'rgba(180, 178, 174, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.strokeRect(256, 0, 256, 256);
    ctx.strokeRect(0, 256, 256, 256);
    ctx.strokeRect(256, 256, 256, 256);
  }

  const repeat = preset === 'classic' ? 3 : 3.5;
  const tex = finalizeTexture(canvas, repeat, repeat * 0.75);
  textureCache.set(key, tex);
  return tex;
}

export function getFloorTexture(preset) {
  const key = `floor_${preset}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const canvas = createCanvas(512);
  const ctx = canvas.getContext('2d');
  const rand = seededRandom(preset.length * 233 + 19);

  if (preset === 'checker') {
    // Classic warm stone & off-white checkerboard tiles
    const tiles = 4;
    const size = 512 / tiles;
    for (let r = 0; r < tiles; r++) {
      for (let c = 0; c < tiles; c++) {
        const isDark = (r + c) % 2 === 0;
        ctx.fillStyle = isDark ? '#c9c4bb' : '#eceae4';
        ctx.fillRect(c * size, r * size, size, size);
        // Subtle stone variation
        for (let k = 0; k < 20; k++) {
          ctx.fillStyle = isDark ? 'rgba(95,90,82,0.035)' : 'rgba(170,165,158,0.035)';
          ctx.fillRect(c * size + rand() * size, r * size + rand() * size, 16, 16);
        }
        ctx.strokeStyle = 'rgba(145, 140, 134, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(c * size + 1, r * size + 1, size - 2, size - 2);
      }
    }
  } else if (preset === 'room-default') {
    // Warm natural oak planks
    ctx.fillStyle = '#bd9b76';
    ctx.fillRect(0, 0, 512, 512);
    const plankH = 64;
    for (let r = 0; r < 8; r++) {
      const y = r * plankH;
      const tone = (rand() - 0.5) * 16;
      ctx.fillStyle = `rgb(${188 + tone}, ${155 + tone * 0.85}, ${118 + tone * 0.7})`;
      ctx.fillRect(0, y, 512, plankH - 1.5);
      // Wood grain lines
      for (let g = 0; g < 18; g++) {
        ctx.strokeStyle = `rgba(110, 78, 48, ${0.06 + rand() * 0.08})`;
        ctx.lineWidth = 1 + rand() * 1.5;
        ctx.beginPath();
        const gy = y + rand() * plankH;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(170, gy + (rand() - 0.5) * 8, 340, gy + (rand() - 0.5) * 8, 512, gy);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(90, 65, 42, 0.32)';
      ctx.fillRect(0, y + plankH - 1.5, 512, 1.5);
    }
  } else if (preset === 'limestone') {
    ctx.fillStyle = '#d3ccc0';
    ctx.fillRect(0, 0, 512, 512);
    const tiles = 2;
    const size = 512 / tiles;
    for (let r = 0; r < tiles; r++) {
      for (let c = 0; c < tiles; c++) {
        const delta = (rand() - 0.5) * 10;
        ctx.fillStyle = `rgb(${210 + delta}, ${203 + delta}, ${192 + delta})`;
        ctx.fillRect(c * size + 2, r * size + 2, size - 4, size - 4);
      }
    }
    for (let i = 0; i < 4500; i++) {
      ctx.fillStyle = `rgba(105,98,88,${rand() * 0.055})`;
      ctx.fillRect(rand() * 512, rand() * 512, 2, 2);
    }
  } else if (preset === 'marble-hex') {
    ctx.fillStyle = '#c9c8c4'; // grout
    ctx.fillRect(0, 0, 512, 512);
    const radius = 34;
    const hexH = Math.sqrt(3) * radius;
    const drawHex = (cx, cy) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = cx + (radius - 1.6) * Math.cos(angle);
        const py = cy + (radius - 1.6) * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      const tone = 232 + Math.floor((rand() - 0.5) * 16);
      ctx.fillStyle = `rgb(${tone}, ${tone}, ${tone - 2})`;
      ctx.fill();
    };
    for (let col = -1; col < 12; col++) {
      for (let row = -1; row < 12; row++) {
        const cx = col * radius * 1.5;
        const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
        drawHex(cx, cy);
      }
    }
  }

  const repeat = preset === 'limestone' ? 3.5 : 4.5;
  const tex = finalizeTexture(canvas, repeat, repeat);
  textureCache.set(key, tex);
  return tex;
}

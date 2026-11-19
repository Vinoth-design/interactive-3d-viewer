import * as THREE from 'three';
import { WIDTH_OPTIONS } from '../config/productConfig';

/**
 * Architectural 3D Dimension Lines & High-DPI Floating Callout Badges
 * dynamically anchored to the active vanity width:
 * 24" -> 25" Top (635 mm)
 * 31" -> 31" Top (787.4 mm)
 * 37" -> 37" Top (939.8 mm)
 * 49" -> 49" Top (1244.6 mm)
 * 61" -> 61" Top (1549.4 mm)
 * Depth: 19" (482.6 mm)
 * Height: 34" (863.6 mm) / 38" w/ 4" Backsplash (965.2 mm)
 */
export class DimensionOverlay {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Dimensions_3D_Overlay';
    this.root.visible = false;

    this.lineMat = new THREE.LineBasicMaterial({
      color: '#1b2b25',
      transparent: true,
      opacity: 0.88,
      depthTest: false,
    });

    this._lastBacksplash = null;
    this._lastWidth = null;
    this._rebuild(true, '31');
  }

  _createLabelSprite(text, subtext = '') {
    const canvas = document.createElement('canvas');
    const w = 320;
    const h = 92;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Rounded pill card
    const r = 18;
    ctx.fillStyle = 'rgba(20, 28, 25, 0.92)';
    ctx.beginPath();
    ctx.moveTo(r, 8);
    ctx.lineTo(w - r, 8);
    ctx.quadraticCurveTo(w - 8, 8, w - 8, r + 8);
    ctx.lineTo(w - 8, h - r - 8);
    ctx.quadraticCurveTo(w - 8, h - 8, w - r, h - 8);
    ctx.lineTo(r, h - 8);
    ctx.quadraticCurveTo(8, h - 8, 8, h - r - 8);
    ctx.lineTo(8, r + 8);
    ctx.quadraticCurveTo(8, 8, r, 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, subtext ? 37 : h / 2);

    if (subtext) {
      ctx.fillStyle = '#b9ccc2';
      ctx.font = '500 20px Inter, sans-serif';
      ctx.fillText(subtext, w / 2, 66);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.24, 0.069, 1);
    sprite.renderOrder = 999;
    return sprite;
  }

  _addDimensionSegment(p1, p2, tickDir, labelText, subText, labelOffset) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const line = new THREE.Line(lineGeo, this.lineMat);
    line.renderOrder = 998;
    this.root.add(line);

    const tickLen = 0.025;
    [p1, p2].forEach((pt) => {
      const a = pt.clone().addScaledVector(tickDir, -tickLen);
      const b = pt.clone().addScaledVector(tickDir, tickLen);
      const tGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
      const tick = new THREE.Line(tGeo, this.lineMat);
      tick.renderOrder = 998;
      this.root.add(tick);
    });

    const mid = p1.clone().add(p2).multiplyScalar(0.5).add(labelOffset);
    const label = this._createLabelSprite(labelText, subText);
    label.position.copy(mid);
    this.root.add(label);
  }

  _rebuild(hasBacksplash, widthId = '31') {
    while (this.root.children.length > 0) {
      const child = this.root.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material && child.material.map) child.material.map.dispose();
      if (child.material && child.material !== this.lineMat) child.material.dispose();
      this.root.remove(child);
    }

    const widthOpt = WIDTH_OPTIONS.find((w) => w.id === widthId) || WIDTH_OPTIONS[1];
    const halfW = (widthOpt.topWidthMm / 1000.0) / 2.0;
    const halfD = 0.2413; // 19" / 2
    const topY = 0.8636; // 34"
    const bsTopY = 0.9652; // 38"

    // 1. Overall Width along front floor edge
    this._addDimensionSegment(
      new THREE.Vector3(-halfW, 0.02, halfD + 0.095),
      new THREE.Vector3(halfW, 0.02, halfD + 0.095),
      new THREE.Vector3(0, 0, 1),
      `${widthOpt.topWidthIn}″ W`,
      `${Math.round(widthOpt.topWidthMm)} mm`,
      new THREE.Vector3(0, 0.04, 0.02)
    );

    // 2. Overall Depth along right countertop edge
    this._addDimensionSegment(
      new THREE.Vector3(halfW + 0.085, topY + 0.01, -halfD),
      new THREE.Vector3(halfW + 0.085, topY + 0.01, halfD),
      new THREE.Vector3(1, 0, 0),
      '19″ D',
      '483 mm',
      new THREE.Vector3(0.08, 0.04, 0)
    );

    // 3. Vanity Height along left side
    this._addDimensionSegment(
      new THREE.Vector3(-halfW - 0.085, 0, halfD),
      new THREE.Vector3(-halfW - 0.085, topY, halfD),
      new THREE.Vector3(1, 0, 0),
      '34″ H',
      '864 mm',
      new THREE.Vector3(-0.08, 0, 0.02)
    );

    // 4. Backsplash Height callout (+4" -> 38" Total) when backsplash is active
    if (hasBacksplash) {
      this._addDimensionSegment(
        new THREE.Vector3(-halfW - 0.085, topY, -halfD + 0.01),
        new THREE.Vector3(-halfW - 0.085, bsTopY, -halfD + 0.01),
        new THREE.Vector3(1, 0, 0),
        '+4″ BS',
        '38″ Total',
        new THREE.Vector3(-0.095, 0.02, 0.02)
      );
    }

    this._lastBacksplash = hasBacksplash;
    this._lastWidth = widthId;
  }

  update(config) {
    this.root.visible = Boolean(config.showDimensions);
    const hasBs = config.backsplash === 'included';
    const widthId = config.width || '31';
    if (this._lastBacksplash !== hasBs || this._lastWidth !== widthId) {
      this._rebuild(hasBs, widthId);
    }
  }
}

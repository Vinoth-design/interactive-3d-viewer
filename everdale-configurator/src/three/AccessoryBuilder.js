import * as THREE from 'three';
import {
  CABINET_FINISHES,
  HARDWARE_FINISHES,
  MIRROR_FRAMES_METAL,
  MIRROR_FRAMES_WOOD,
} from '../config/productConfig';

/**
 * Builds procedural PBR 3D mirrors and 4" centerset faucet + pop-up drain
 * aligned to the exact millimeter coordinates of Everdale_31_Vanity_Interactive.glb.
 */
export class AccessoryBuilder {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Everdale_Accessories_Group';

    this.faucetGroup = new THREE.Group();
    this.faucetGroup.name = 'Faucet_Assembly';
    this.mirrorGroup = new THREE.Group();
    this.mirrorGroup.name = 'Mirror_Assembly';

    this.root.add(this.faucetGroup);
    this.root.add(this.mirrorGroup);

    this.faucetMetalMat = new THREE.MeshStandardMaterial({
      color: '#b08b4f',
      metalness: 0.88,
      roughness: 0.30,
    });

    this.mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: '#eef3f6',
      metalness: 0.96,
      roughness: 0.04,
      envMapIntensity: 1.35,
    });

    this.mirrorFrameMat = new THREE.MeshStandardMaterial({
      color: '#899281',
      metalness: 0.05,
      roughness: 0.42,
    });

    this.ledHaloMat = new THREE.MeshStandardMaterial({
      color: '#fff6e4',
      emissive: '#ffe9be',
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });

    this._lastFaucetWidth = null;
    this._buildCentersetFaucets([0]);
  }

  _buildCentersetFaucets(xOffsets = [0]) {
    this._clearGroup(this.faucetGroup);
    const deckY = 0.8636;
    const holeZ = -0.17;
    const mat = this.faucetMetalMat;

    xOffsets.forEach((cx) => {
      // 1. Sculpted 4" centerset escutcheon base plate
      const plateShape = new THREE.Shape();
      const pw = 0.076;
      const pd = 0.024;
      const r = 0.018;
      plateShape.moveTo(-pw + r, -pd);
      plateShape.lineTo(pw - r, -pd);
      plateShape.quadraticCurveTo(pw, -pd, pw, -pd + r);
      plateShape.lineTo(pw, pd - r);
      plateShape.quadraticCurveTo(pw, pd, pw - r, pd);
      plateShape.lineTo(-pw + r, pd);
      plateShape.quadraticCurveTo(-pw, pd, -pw, pd - r);
      plateShape.lineTo(-pw, -pd + r);
      plateShape.quadraticCurveTo(-pw, -pd, -pw + r, -pd);

      const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
        depth: 0.008,
        bevelEnabled: true,
        bevelThickness: 0.0025,
        bevelSize: 0.0025,
        bevelSegments: 3,
      });
      plateGeo.rotateX(-Math.PI / 2);
      const plate = new THREE.Mesh(plateGeo, mat);
      plate.position.set(cx, deckY + 0.001, holeZ);
      plate.castShadow = true;
      plate.receiveShadow = true;
      this.faucetGroup.add(plate);

      // 2. Center spout pedestal collar
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.018, 0.042, 24),
        mat
      );
      pedestal.position.set(cx, deckY + 0.028, holeZ);
      pedestal.castShadow = true;
      this.faucetGroup.add(pedestal);

      // 3. Smooth high-arc gooseneck spout
      const spoutCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cx, deckY + 0.042, holeZ),
        new THREE.Vector3(cx, deckY + 0.132, holeZ + 0.006),
        new THREE.Vector3(cx, deckY + 0.168, holeZ + 0.048),
        new THREE.Vector3(cx, deckY + 0.155, holeZ + 0.102),
        new THREE.Vector3(cx, deckY + 0.112, holeZ + 0.125),
      ]);
      const spoutGeo = new THREE.TubeGeometry(spoutCurve, 32, 0.0095, 16, false);
      const spout = new THREE.Mesh(spoutGeo, mat);
      spout.castShadow = true;
      this.faucetGroup.add(spout);

      // Aerator nozzle collar
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0115, 0.0105, 0.014, 20),
        mat
      );
      nozzle.position.set(cx, deckY + 0.108, holeZ + 0.126);
      nozzle.rotation.x = 0.22;
      this.faucetGroup.add(nozzle);

      // 4. Hot & Cold side valve stems & lever handles
      [-0.0508, 0.0508].forEach((xRel) => {
        const sign = Math.sign(xRel);
        const xPos = cx + xRel;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.0145, 0.036, 20),
          mat
        );
        stem.position.set(xPos, deckY + 0.026, holeZ);
        stem.castShadow = true;
        this.faucetGroup.add(stem);

        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.0125, 18, 12),
          mat
        );
        cap.position.set(xPos, deckY + 0.044, holeZ);
        this.faucetGroup.add(cap);

        const lever = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0042, 0.0065, 0.046, 14),
          mat
        );
        lever.rotation.z = -sign * (Math.PI / 2 - 0.12);
        lever.position.set(xPos + sign * 0.025, deckY + 0.046, holeZ);
        lever.castShadow = true;
        this.faucetGroup.add(lever);
      });

      // 5. Matching Pop-Up Drain Flange & Cap
      const drainFlange = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.022, 0.004, 24),
        mat
      );
      drainFlange.position.set(cx, 0.6735, 0.0213);
      this.faucetGroup.add(drainFlange);

      const drainStopper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.017, 0.006, 24),
        mat
      );
      drainStopper.position.set(cx, 0.6765, 0.0213);
      this.faucetGroup.add(drainStopper);
    });
  }

  _clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }
  }

  _buildMirrorMesh(mirrorType, xOffsets = [0]) {
    this._clearGroup(this.mirrorGroup);
    if (!mirrorType || mirrorType === 'none') return;

    const wallZ = -0.2415; // Flush on rear bathroom wall
    const centerY = 1.49;
    const isDouble = xOffsets.length > 1;

    xOffsets.forEach((cx) => {
      if (mirrorType === 'rectangle') {
        const w = isDouble ? 0.52 : 0.62;
        const h = 0.80;
        const frameW = 0.036;
        const depth = 0.028;

        const topRail = new THREE.Mesh(new THREE.BoxGeometry(w, frameW, depth), this.mirrorFrameMat);
        topRail.position.set(cx, centerY + h / 2 - frameW / 2, wallZ + depth / 2);
        topRail.castShadow = true;
        topRail.receiveShadow = true;

        const botRail = new THREE.Mesh(new THREE.BoxGeometry(w, frameW, depth), this.mirrorFrameMat);
        botRail.position.set(cx, centerY - h / 2 + frameW / 2, wallZ + depth / 2);
        botRail.castShadow = true;

        const sideH = h - frameW * 2;
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(frameW, sideH, depth), this.mirrorFrameMat);
        leftRail.position.set(cx - w / 2 + frameW / 2, centerY, wallZ + depth / 2);
        leftRail.castShadow = true;

        const rightRail = new THREE.Mesh(new THREE.BoxGeometry(frameW, sideH, depth), this.mirrorFrameMat);
        rightRail.position.set(cx + w / 2 - frameW / 2, centerY, wallZ + depth / 2);
        rightRail.castShadow = true;

        const glass = new THREE.Mesh(
          new THREE.PlaneGeometry(w - frameW * 1.9, h - frameW * 1.9),
          this.mirrorGlassMat
        );
        glass.position.set(cx, centerY, wallZ + depth - 0.007);

        const backing = new THREE.Mesh(
          new THREE.BoxGeometry(w - 0.02, h - 0.02, 0.008),
          new THREE.MeshStandardMaterial({ color: '#2b2d30', roughness: 0.9 })
        );
        backing.position.set(cx, centerY, wallZ + 0.005);

        this.mirrorGroup.add(topRail, botRail, leftRail, rightRail, glass, backing);
      } else if (mirrorType === 'arched') {
        const w = isDouble ? 0.50 : 0.60;
        const rectH = 0.56;
        const radius = w / 2;
        const totalH = rectH + radius;
        const bottomY = centerY - totalH / 2;
        const depth = 0.026;
        const border = 0.018;

        const outerShape = new THREE.Shape();
        outerShape.moveTo(-radius, 0);
        outerShape.lineTo(radius, 0);
        outerShape.lineTo(radius, rectH);
        outerShape.absarc(0, rectH, radius, 0, Math.PI, false);
        outerShape.lineTo(-radius, 0);

        const innerRadius = radius - border;
        const holePath = new THREE.Path();
        holePath.moveTo(-innerRadius, border);
        holePath.lineTo(innerRadius, border);
        holePath.lineTo(innerRadius, rectH);
        holePath.absarc(0, rectH, innerRadius, 0, Math.PI, false);
        holePath.lineTo(-innerRadius, border);
        outerShape.holes.push(holePath);

        const frameGeo = new THREE.ExtrudeGeometry(outerShape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.002,
          bevelSize: 0.0015,
          bevelSegments: 2,
          curveSegments: 40,
        });
        const frame = new THREE.Mesh(frameGeo, this.mirrorFrameMat);
        frame.position.set(cx, bottomY, wallZ);
        frame.castShadow = true;

        const glassShape = new THREE.Shape();
        glassShape.moveTo(-innerRadius - 0.002, border - 0.002);
        glassShape.lineTo(innerRadius + 0.002, border - 0.002);
        glassShape.lineTo(innerRadius + 0.002, rectH);
        glassShape.absarc(0, rectH, innerRadius + 0.002, 0, Math.PI, false);
        glassShape.lineTo(-innerRadius - 0.002, border - 0.002);

        const glassGeo = new THREE.ShapeGeometry(glassShape, 40);
        const glass = new THREE.Mesh(glassGeo, this.mirrorGlassMat);
        glass.position.set(cx, bottomY, wallZ + depth - 0.006);

        this.mirrorGroup.add(frame, glass);
      } else if (mirrorType === 'round') {
        const radius = isDouble ? 0.28 : 0.34;
        const depth = 0.026;
        const border = 0.017;

        const outerShape = new THREE.Shape();
        outerShape.absarc(0, 0, radius, 0, Math.PI * 2, false);
        const hole = new THREE.Path();
        hole.absarc(0, 0, radius - border, 0, Math.PI * 2, true);
        outerShape.holes.push(hole);

        const frameGeo = new THREE.ExtrudeGeometry(outerShape, {
          depth,
          bevelEnabled: true,
          bevelThickness: 0.002,
          bevelSize: 0.0015,
          bevelSegments: 2,
          curveSegments: 56,
        });
        const frame = new THREE.Mesh(frameGeo, this.mirrorFrameMat);
        frame.position.set(cx, centerY, wallZ);
        frame.castShadow = true;

        const glass = new THREE.Mesh(
          new THREE.CircleGeometry(radius - border + 0.003, 56),
          this.mirrorGlassMat
        );
        glass.position.set(cx, centerY, wallZ + depth - 0.006);

        this.mirrorGroup.add(frame, glass);
      } else if (mirrorType === 'led-backlit') {
        const w = isDouble ? 0.52 : 0.62;
        const h = 0.80;

        const haloBox = new THREE.Mesh(
          new THREE.BoxGeometry(w - 0.03, h - 0.03, 0.022),
          this.ledHaloMat
        );
        haloBox.position.set(cx, centerY, wallZ + 0.012);

        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.008),
          this.mirrorGlassMat
        );
        glass.position.set(cx, centerY, wallZ + 0.028);
        glass.castShadow = true;

        const stripShape = new THREE.Shape();
        const sw = w / 2 - 0.032;
        const sh = h / 2 - 0.032;
        stripShape.moveTo(-sw, -sh);
        stripShape.lineTo(sw, -sh);
        stripShape.lineTo(sw, sh);
        stripShape.lineTo(-sw, sh);
        stripShape.closePath();

        const innerHole = new THREE.Path();
        const iw = sw - 0.014;
        const ih = sh - 0.014;
        innerHole.moveTo(-iw, -ih);
        innerHole.lineTo(iw, -ih);
        innerHole.lineTo(iw, ih);
        innerHole.lineTo(-iw, ih);
        innerHole.closePath();
        stripShape.holes.push(innerHole);

        const ledStrip = new THREE.Mesh(new THREE.ShapeGeometry(stripShape), this.ledHaloMat);
        ledStrip.position.set(cx, centerY, wallZ + 0.0328);

        const glowLight = new THREE.PointLight('#fff1d6', 0.55, 1.4, 2);
        glowLight.position.set(cx, centerY, wallZ + 0.08);

        this.mirrorGroup.add(haloBox, glass, ledStrip, glowLight);
      }
    });
  }

  update(config) {
    const isDouble = config.width === '61';
    const xOffsets = isDouble ? [-0.381, 0.381] : [0];

    // 1. Faucet visibility & metallic finish
    this.faucetGroup.visible = config.faucet === 'centerset-4';
    if (this._lastFaucetWidth !== config.width) {
      this._buildCentersetFaucets(xOffsets);
      this._lastFaucetWidth = config.width;
    }

    const hw =
      HARDWARE_FINISHES.find((h) => h.id === config.faucetFinish) ||
      HARDWARE_FINISHES.find((h) => h.id === config.hardware) ||
      HARDWARE_FINISHES[0];

    this.faucetMetalMat.color.set(hw.hex);
    this.faucetMetalMat.metalness = hw.metalness;
    this.faucetMetalMat.roughness = hw.roughness;

    // 2. Mirror geometry rebuild only when type or width layout changes
    if (this._lastMirrorType !== config.mirror || this._lastMirrorWidth !== config.width) {
      this._buildMirrorMesh(config.mirror, xOffsets);
      this._lastMirrorType = config.mirror;
      this._lastMirrorWidth = config.width;
    }

    // 3. Mirror frame material update
    if (config.mirror === 'rectangle') {
      const frame = MIRROR_FRAMES_WOOD.find((f) => f.id === config.frame) || MIRROR_FRAMES_WOOD[0];
      if (frame.dynamicMatch) {
        const cab = CABINET_FINISHES.find((c) => c.id === config.finish) || CABINET_FINISHES[0];
        this.mirrorFrameMat.color.set(cab.hex);
      } else {
        this.mirrorFrameMat.color.set(frame.hex);
      }
      this.mirrorFrameMat.metalness = 0.04;
      this.mirrorFrameMat.roughness = 0.42;
    } else if (config.mirror === 'arched' || config.mirror === 'round') {
      const frame = MIRROR_FRAMES_METAL.find((f) => f.id === config.frame) || MIRROR_FRAMES_METAL[0];
      this.mirrorFrameMat.color.set(frame.hex);
      this.mirrorFrameMat.metalness = frame.metalness;
      this.mirrorFrameMat.roughness = frame.roughness;
    }
  }
}

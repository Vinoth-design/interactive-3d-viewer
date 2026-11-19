import * as THREE from 'three';
import { getFloorTexture, getWallTexture } from '../utils/proceduralTextures';

/**
 * Builds the architectural bathroom room staging (back wall, baseboard, floor, contact shadow)
 * and dynamically responsive styling props (wall sconces, soap dispenser, candle, eucalyptus vase,
 * woven towel basket, and bath mat) positioned adaptively for 24", 31", 37", 49", and 61" vanities.
 */
export class BathroomRoomBuilder {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Bathroom_Room_Group';

    this.wallMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.85,
      metalness: 0.02,
    });

    this.floorMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.55,
      metalness: 0.04,
    });

    this.sconceMetalMat = new THREE.MeshStandardMaterial({
      color: '#b08b4f',
      metalness: 0.88,
      roughness: 0.30,
    });

    this.globeMat = new THREE.MeshStandardMaterial({
      color: '#fffcf6',
      emissive: '#ffedd1',
      emissiveIntensity: 0.85,
      roughness: 0.22,
    });

    this.propsGroup = new THREE.Group();
    this.propsGroup.name = 'Bathroom_Styling_Props';

    this.sconcesGroup = new THREE.Group();
    this.sconcesGroup.name = 'Sconces_Group';
    this.propsGroup.add(this.sconcesGroup);

    this.soapGroup = new THREE.Group();
    this.soapGroup.name = 'Soap_Dispenser_Group';
    this.propsGroup.add(this.soapGroup);

    this.candleGroup = new THREE.Group();
    this.candleGroup.name = 'Candle_Group';
    this.propsGroup.add(this.candleGroup);

    this.vaseGroup = new THREE.Group();
    this.vaseGroup.name = 'Vase_Group';
    this.propsGroup.add(this.vaseGroup);

    this.basketGroup = new THREE.Group();
    this.basketGroup.name = 'Basket_Group';
    this.propsGroup.add(this.basketGroup);

    this.bathMatGroup = new THREE.Group();
    this.bathMatGroup.name = 'Bath_Mat_Group';
    this.propsGroup.add(this.bathMatGroup);

    this.contactShadow = null;
    this.sconcePointLights = [];

    this._lastWidth = null;
    this._lastMirror = null;

    this._buildRoomShell();
    this._buildStaticModels();
    this.root.add(this.propsGroup);

    this.updateLayout('31', 'rectangle');
  }

  _buildRoomShell() {
    // 1. Floor plane at Y = 0
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 5.0), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 1.4);
    floor.receiveShadow = true;
    this.root.add(floor);

    // 2. Back wall cleanly behind vanity/backsplash (Z = -0.244 m)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4), this.wallMat);
    backWall.position.set(0, 1.7, -0.244);
    backWall.receiveShadow = true;
    this.root.add(backWall);

    // 3. Baseboard trim along back wall
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: '#f1f0ec',
      roughness: 0.48,
      metalness: 0.02,
    });
    const baseboard = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.102, 0.012), baseboardMat);
    baseboard.position.set(0, 0.051, -0.249);
    baseboard.receiveShadow = true;
    this.root.add(baseboard);

    // 4. Contact shadow under vanity
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 240);
    grad.addColorStop(0, 'rgba(20, 22, 24, 0.75)');
    grad.addColorStop(0.4, 'rgba(30, 32, 34, 0.45)');
    grad.addColorStop(0.8, 'rgba(40, 42, 44, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.set(0, 0.0015, 0.0);
    this.root.add(this.contactShadow);
  }

  _buildStaticModels() {
    const deckY = 0.8636;

    // --- Soap Dispenser Model ---
    const ceramicMat = new THREE.MeshStandardMaterial({ color: '#e5dfd5', roughness: 0.62, metalness: 0.02 });
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.11, 24), ceramicMat);
    bottle.position.y = deckY + 0.055;
    bottle.castShadow = true;
    bottle.receiveShadow = true;

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.013, 0.020, 16), this.sconceMetalMat);
    neck.position.y = deckY + 0.12;

    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.022, 12), this.sconceMetalMat);
    pump.position.y = deckY + 0.14;

    const spout = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.006, 0.028), this.sconceMetalMat);
    spout.position.set(0, deckY + 0.148, 0.012);

    this.soapGroup.add(bottle, neck, pump, spout);

    // --- Amber Glass Candle ---
    const candleJar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.024, 0.062, 24),
      new THREE.MeshStandardMaterial({ color: '#6b472a', roughness: 0.18, metalness: 0.08 })
    );
    candleJar.position.y = deckY + 0.031;
    candleJar.castShadow = true;

    const wax = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.005, 20),
      new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.85 })
    );
    wax.position.y = deckY + 0.06;
    this.candleGroup.add(candleJar, wax);

    // --- Sculpted Ceramic Vase with Botanical Eucalyptus ---
    const vaseMat = new THREE.MeshStandardMaterial({ color: '#dcd5cb', roughness: 0.52 });
    const vaseProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.026, 0.0),
      new THREE.Vector2(0.034, 0.042),
      new THREE.Vector2(0.028, 0.090),
      new THREE.Vector2(0.016, 0.118),
      new THREE.Vector2(0.019, 0.130),
    ];
    const vase = new THREE.Mesh(new THREE.LatheGeometry(vaseProfile, 24), vaseMat);
    vase.position.y = deckY;
    vase.castShadow = true;
    this.vaseGroup.add(vase);

    const stemMat = new THREE.MeshStandardMaterial({ color: '#4d6149', roughness: 0.72 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#677d61', roughness: 0.65, side: THREE.DoubleSide });
    const leafGeo = new THREE.CircleGeometry(0.015, 12);

    const stemAngles = [
      { rx: 0.14, rz: -0.18, h: 0.23 },
      { rx: -0.12, rz: 0.14, h: 0.26 },
      { rx: 0.08, rz: 0.22, h: 0.20 },
    ];
    stemAngles.forEach((st) => {
      const branch = new THREE.Group();
      branch.position.set(0, deckY + 0.085, 0);
      branch.rotation.set(st.rx, 0, st.rz);

      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.002, st.h, 8), stemMat);
      stalk.position.y = st.h / 2;
      branch.add(stalk);

      for (let i = 1; i <= 5; i++) {
        const ly = 0.05 + (st.h - 0.06) * (i / 5);
        [-1, 1].forEach((side) => {
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(side * 0.015, ly, (i % 2 === 0 ? 1 : -1) * 0.007);
          leaf.rotation.set(0.4, side * 0.5, side * 0.35);
          leaf.castShadow = true;
          branch.add(leaf);
        });
      }
      this.vaseGroup.add(branch);
    });

    // --- Woven Seagrass Towel Basket ---
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.115, 0.27, 28),
      new THREE.MeshStandardMaterial({ color: '#bfa17c', roughness: 0.88 })
    );
    basket.position.y = 0.135;
    basket.castShadow = true;
    basket.receiveShadow = true;

    const towel1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.050, 0.050, 0.22, 18),
      new THREE.MeshStandardMaterial({ color: '#f3f0ea', roughness: 0.92 })
    );
    towel1.position.set(-0.04, 0.26, -0.03);
    towel1.rotation.z = 0.16;
    towel1.castShadow = true;

    const towel2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.20, 18),
      new THREE.MeshStandardMaterial({ color: '#d8d3c8', roughness: 0.92 })
    );
    towel2.position.set(0.05, 0.24, 0.03);
    towel2.rotation.z = -0.18;
    towel2.castShadow = true;

    this.basketGroup.add(basket, towel1, towel2);

    // --- Woven Bath Mat ---
    const bathMat = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.011, 0.46),
      new THREE.MeshStandardMaterial({ color: '#e6e0d5', roughness: 0.94, metalness: 0 })
    );
    bathMat.position.set(0, 0.0055, 0.56);
    bathMat.receiveShadow = true;
    bathMat.castShadow = true;
    this.bathMatGroup.add(bathMat);
  }

  updateLayout(widthId = '31', mirrorType = 'rectangle') {
    if (this._lastWidth === widthId && this._lastMirror === mirrorType) return;
    this._lastWidth = widthId;
    this._lastMirror = mirrorType;

    const wallZ = -0.243;
    const isDouble = widthId === '61';

    // 1. Rebuild Wall Sconces with zero mirror overlap
    while (this.sconcesGroup.children.length > 0) {
      const child = this.sconcesGroup.children[0];
      this.sconcesGroup.remove(child);
    }
    this.sconcePointLights = [];

    // Define sconce X coordinates
    // Single mirror: 2 sconces flanking the center mirror
    // 61" Double mirror (mirrors at X = ±0.381 m, width 0.52m -> [-0.641, -0.121] and [0.121, 0.641]):
    // 3 architectural sconces at [-0.74, 0.0, 0.74] m. None intersect mirrors!
    let sconceXPositions = [];
    if (widthId === '24') {
      sconceXPositions = [-0.38, 0.38];
    } else if (widthId === '31') {
      sconceXPositions = [-0.45, 0.45];
    } else if (widthId === '37') {
      sconceXPositions = [-0.48, 0.48];
    } else if (widthId === '49') {
      sconceXPositions = [-0.52, 0.52];
    } else if (widthId === '61') {
      sconceXPositions = [-0.74, 0.0, 0.74];
    }

    sconceXPositions.forEach((xPos) => {
      const sconce = new THREE.Group();
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.040, 0.040, 0.012, 24),
        this.sconceMetalMat
      );
      plate.rotation.x = Math.PI / 2;
      plate.position.set(xPos, 1.52, wallZ + 0.006);

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.082, 14),
        this.sconceMetalMat
      );
      arm.rotation.x = Math.PI / 2;
      arm.position.set(xPos, 1.52, wallZ + 0.046);

      const socket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.012, 0.024, 16),
        this.sconceMetalMat
      );
      socket.position.set(xPos, 1.545, wallZ + 0.084);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 18), this.globeMat);
      globe.position.set(xPos, 1.605, wallZ + 0.084);
      globe.castShadow = true;

      // Realistic warm point light emitted from each sconce
      const light = new THREE.PointLight('#ffe8c6', 0.85, 2.8, 1.8);
      light.position.set(xPos, 1.605, wallZ + 0.12);
      light.castShadow = false; // Soft ambient bounce
      this.sconcePointLights.push(light);

      sconce.add(plate, arm, socket, globe, light);
      this.sconcesGroup.add(sconce);
    });

    // 2. Position Countertop Props (Never floating, never overlapping faucets)
    if (widthId === '24') {
      // 24" Vanity: countertop half-width is 0.3175 m.
      // Sits comfortably on stone wings (X in [-0.3175, -0.240] and [+0.240, +0.3175])
      this.soapGroup.position.set(-0.275, 0, -0.115);
      this.candleGroup.position.set(-0.275, 0, 0.055);
      this.vaseGroup.position.set(0.275, 0, -0.095);
      this.basketGroup.position.set(0.52, 0, -0.02);
      if (this.contactShadow) {
        this.contactShadow.scale.set(0.85, 0.9, 1);
      }
    } else if (widthId === '31') {
      this.soapGroup.position.set(-0.325, 0, -0.115);
      this.candleGroup.position.set(-0.318, 0, 0.055);
      this.vaseGroup.position.set(0.325, 0, -0.095);
      this.basketGroup.position.set(0.62, 0, -0.02);
      if (this.contactShadow) {
        this.contactShadow.scale.set(1.0, 1.0, 1);
      }
    } else if (widthId === '37') {
      this.soapGroup.position.set(-0.365, 0, -0.115);
      this.candleGroup.position.set(-0.365, 0, 0.055);
      this.vaseGroup.position.set(0.365, 0, -0.095);
      this.basketGroup.position.set(0.70, 0, -0.02);
      if (this.contactShadow) {
        this.contactShadow.scale.set(1.15, 1.0, 1);
      }
    } else if (widthId === '49') {
      this.soapGroup.position.set(-0.42, 0, -0.115);
      this.candleGroup.position.set(-0.42, 0, 0.055);
      this.vaseGroup.position.set(0.42, 0, -0.095);
      this.basketGroup.position.set(0.84, 0, -0.02);
      if (this.contactShadow) {
        this.contactShadow.scale.set(1.45, 1.0, 1);
      }
    } else if (widthId === '61') {
      // 61" Double Vanity:
      // Basins at X = ±0.381 m. Center bridge between basins: X in [-0.141, +0.141] m!
      // Vase sits gracefully in the center bridge:
      this.vaseGroup.position.set(0.0, 0, -0.095);
      // Soap dispenser on outer left deck:
      this.soapGroup.position.set(-0.68, 0, -0.115);
      // Candle on outer right deck:
      this.candleGroup.position.set(0.68, 0, -0.115);
      // Basket outside right edge (cabinet right edge is 0.762m):
      this.basketGroup.position.set(1.00, 0, -0.02);
      if (this.contactShadow) {
        this.contactShadow.scale.set(1.85, 1.0, 1);
      }
    }
  }

  update(config, hardwareSpec) {
    // 1. Reactive layout based on width and mirror type
    this.updateLayout(config.width || '31', config.mirror || 'rectangle');

    // 2. Wall material
    if (this._lastWall !== config.wall) {
      this.wallMat.map = getWallTexture(config.wall);
      this.wallMat.roughness = config.wall === 'marble' ? 0.28 : 0.86;
      this.wallMat.needsUpdate = true;
      this._lastWall = config.wall;
    }

    // 3. Floor material
    if (this._lastFloor !== config.floor) {
      this.floorMat.map = getFloorTexture(config.floor);
      this.floorMat.roughness = config.floor === 'marble-hex' ? 0.30 : 0.56;
      this.floorMat.needsUpdate = true;
      this._lastFloor = config.floor;
    }

    // 4. Sync sconce metal finish with vanity hardware
    if (hardwareSpec) {
      this.sconceMetalMat.color.set(hardwareSpec.hex);
      this.sconceMetalMat.metalness = hardwareSpec.metalness;
      this.sconceMetalMat.roughness = hardwareSpec.roughness;
    }

    // 5. Toggle styling props & sconce lights
    const showProps = Boolean(config.showProps);
    this.propsGroup.visible = showProps;
    this.sconcePointLights.forEach((light) => {
      light.visible = showProps;
    });
  }

  setSconceLightIntensity(intensity) {
    this.sconcePointLights.forEach((light) => {
      light.intensity = intensity;
    });
    this.globeMat.emissiveIntensity = Math.min(intensity * 1.1, 2.0);
  }
}

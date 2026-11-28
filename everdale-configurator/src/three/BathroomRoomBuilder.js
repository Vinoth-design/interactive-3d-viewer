import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  getBathMatPBR,
  getBrushedMetalNormal,
  getFabricPBR,
  getFloorPBR,
  getWallPBR,
  getWoodTextures,
} from '../utils/proceduralTextures';

/**
 * Builds the photorealistic architectural bathroom room staging (PBR wall, baseboard, PBR floor,
 * contact shadow) and loads real Poly Haven CC0 & Blender-modeled 3D styling props
 * positioned adaptively across 24", 31", 37", 49", and 61" vanities.
 */
export class BathroomRoomBuilder {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'Bathroom_Room_Group';
    this.isDisposed = false;
    this.gltfLoader = new GLTFLoader();

    this.wallMat = new THREE.MeshStandardMaterial({
      color: '#ded9d0',
      roughness: 0.82,
      metalness: 0.0,
      envMapIntensity: 0.45,
    });

    this.floorMat = new THREE.MeshStandardMaterial({
      color: '#f4f2ee',
      roughness: 0.44,
      metalness: 0.02,
      envMapIntensity: 0.65,
    });

    this.sconceMetalMat = new THREE.MeshStandardMaterial({
      color: '#b08b4f',
      metalness: 0.88,
      roughness: 0.28,
      normalMap: getBrushedMetalNormal(),
      normalScale: new THREE.Vector2(0.35, 0.35),
      envMapIntensity: 1.15,
    });

    this.globeMat = new THREE.MeshPhysicalMaterial({
      color: '#fffbf4',
      emissive: '#ffe4b5',
      emissiveIntensity: 0.56,
      roughness: 0.22,
      transmission: 0.25,
      thickness: 0.02,
      ior: 1.48,
      clearcoat: 0.35,
      clearcoatRoughness: 0.15,
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
    this.candleGroup.name = 'Diffuser_Prop_Group';
    this.propsGroup.add(this.candleGroup);

    this.vaseGroup = new THREE.Group();
    this.vaseGroup.name = 'Plant_Vase_Group';
    this.propsGroup.add(this.vaseGroup);

    this.basketGroup = new THREE.Group();
    this.basketGroup.name = 'Stool_And_Basket_Group';
    this.propsGroup.add(this.basketGroup);

    this.bathMatGroup = new THREE.Group();
    this.bathMatGroup.name = 'Bath_Mat_Group';
    this.propsGroup.add(this.bathMatGroup);

    this.contactShadow = null;
    this.sconcePointLights = [];
    this._loadedProps = [];

    this._lastWidth = null;
    this._lastMirror = null;

    this._buildRoomShell();
    this._loadPhotorealisticProps();
    this.root.add(this.propsGroup);

    this.updateLayout('31', 'rectangle');
  }

  _buildRoomShell() {
    // 1. Floor plane at Y = 0
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 8.0), this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 2.4);
    floor.receiveShadow = true;
    this.root.add(floor);

    // 2. Back wall cleanly behind vanity/backsplash (Z = -0.244 m)
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 4.4), this.wallMat);
    backWall.position.set(0, 2.2, -0.244);
    backWall.receiveShadow = true;
    this.root.add(backWall);

    // 3. Baseboard trim along back wall
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: '#eae7e0',
      roughness: 0.48,
      metalness: 0.0,
      envMapIntensity: 0.45,
    });
    const baseboard = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.102, 0.014), baseboardMat);
    baseboard.position.set(0, 0.051, -0.247);
    baseboard.receiveShadow = true;
    this.root.add(baseboard);

    // 4. Soft grounded contact shadow beneath cabinet legs
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 128, 18, 256, 128, 240);
    grad.addColorStop(0, 'rgba(18, 20, 22, 0.64)');
    grad.addColorStop(0.45, 'rgba(26, 28, 30, 0.36)');
    grad.addColorStop(0.82, 'rgba(34, 36, 38, 0.10)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.74,
    });
    this.contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.68), shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.set(0, 0.0015, 0.0);
    this.root.add(this.contactShadow);
  }

  /**
   * Centers X/Z, rests bounding-box bottom cleanly at Y = baseOffsetY, and scales to real-world target height.
   */
  _normalizeAndMount(obj, targetGroup, targetHeight, baseOffsetY = 0, onMaterial) {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const scale = targetHeight && size.y > 0.0001 ? targetHeight / size.y : 1.0;

    const wrapper = new THREE.Group();
    obj.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    obj.scale.multiplyScalar(scale);

    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (onMaterial && child.material) {
          onMaterial(child);
        }
      }
    });

    wrapper.add(obj);
    wrapper.position.y = baseOffsetY;
    targetGroup.add(wrapper);
    this._loadedProps.push(wrapper);
    return wrapper;
  }

  _loadPropAsset(url, targetGroup, targetHeight, baseOffsetY = 0, onMounted = null, onMaterial = null) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        if (this.isDisposed) return;
        const mounted = this._normalizeAndMount(gltf.scene, targetGroup, targetHeight, baseOffsetY, onMaterial);
        if (onMounted) onMounted(mounted);
      },
      undefined,
      (err) => {
        console.warn(`Optional prop ${url} could not be loaded:`, err);
      }
    );
  }

  _loadPhotorealisticProps() {
    const deckY = 0.8636;
    const oakPBR = getWoodTextures('natural-oak');
    const fabricPBR = getFabricPBR(3.5, 2.5);

    // 1. Sculpted Soap Dispenser with Brushed Brass Pump (from architectural scene)
    this._loadPropAsset('/models/props/arch/arch_soap.glb', this.soapGroup, 0.145, deckY, null, (child) => {
      if (child.name === 'Soap_Pump') {
        child.material = this.sconceMetalMat;
      } else if (child.material) {
        child.material.roughness = 0.42;
        child.material.envMapIntensity = 0.85;
      }
    });

    // 2. Amber Glass Reed Diffuser (from architectural scene)
    this._loadPropAsset('/models/props/arch/arch_diffuser.glb', this.candleGroup, 0.21, deckY, null, (child) => {
      if (child.name === 'Diffuser_Bottle' && child.material) {
        child.material.roughness = 0.12;
        child.material.metalness = 0.05;
        child.material.envMapIntensity = 1.25;
      } else if (child.name.startsWith('Diffuser_Reed') && child.material) {
        child.material.map = oakPBR.map;
        child.material.roughness = 0.65;
        child.material.needsUpdate = true;
      }
    });

    // 3. Real Poly Haven CC0 Potted Succulent Plant (1K PBR diffuse/normal/ARM)
    this._loadPropAsset(
      '/models/props/potted_plant_04/potted_plant_04.gltf',
      this.vaseGroup,
      0.21,
      deckY
    );

    // 4. Sculpted Oak Bathroom Stool w/ Rolled Plush Towels + Poly Haven Wicker Basket
    this._loadPropAsset(
      '/models/props/arch/arch_stool.glb',
      this.basketGroup,
      0.41,
      0,
      null,
      (child) => {
        if (!child.material) return;
        if (child.name.startsWith('Stool_')) {
          child.material.map = oakPBR.map;
          child.material.normalMap = oakPBR.normalMap;
          child.material.roughnessMap = oakPBR.roughnessMap;
          child.material.color.set('#cfb088');
          child.material.roughness = 0.58;
          child.material.needsUpdate = true;
        } else if (child.name.startsWith('Rolled_Towel')) {
          child.material.map = fabricPBR.map;
          child.material.normalMap = fabricPBR.normalMap;
          child.material.roughnessMap = fabricPBR.roughnessMap;
          child.material.color.set('#f4f1ea');
          child.material.roughness = 0.92;
          child.material.needsUpdate = true;
        }
      }
    );

    this._loadPropAsset(
      '/models/props/wicker_basket_01/wicker_basket_01.gltf',
      this.basketGroup,
      0.115,
      0.41,
      (mounted) => {
        mounted.rotation.y = 0.12;
      }
    );

    // 5. High-detail Sculpted Cotton Bath Mat (Poly Haven waffle_pique_cotton 1K PBR + bump/disp/AO)
    this._buildPhotorealisticBathMat();
  }

  /**
   * Builds a dense subdivided rounded-rectangle bath mat with rolled border hem,
   * Poly Haven waffle_pique_cotton PBR (diffuse, normal, bump + displacement, AO, roughness),
   * and soft perimeter contact shadow for realistic floor grounding.
   */
  _buildPhotorealisticBathMat() {
    while (this.bathMatGroup.children.length > 0) {
      const child = this.bathMatGroup.children[0];
      child.traverse((obj) => {
        obj.geometry?.dispose?.();
      });
      this.bathMatGroup.remove(child);
    }

    const width = 0.88;
    const depth = 0.56;
    const halfW = width * 0.5;
    const halfD = depth * 0.5;
    const cornerR = 0.048;
    const baseHeight = 0.015;
    const segX = 120;
    const segZ = 80;

    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const uvAttr = geo.attributes.uv;
    const innerX = halfW - cornerR;
    const innerZ = halfD - cornerR;

    for (let i = 0; i < posAttr.count; i++) {
      let x = posAttr.getX(i);
      let z = posAttr.getZ(i);

      // Clamp outer corners onto rounded-rectangle perimeter
      const ox = Math.max(0, Math.abs(x) - innerX);
      const oz = Math.max(0, Math.abs(z) - innerZ);
      const cDist = Math.hypot(ox, oz);
      if (cDist > cornerR) {
        const s = cornerR / cDist;
        x = Math.sign(x) * (innerX + ox * s);
        z = Math.sign(z) * (innerZ + oz * s);
      }

      // Signed distance inward from rounded border edge
      const qx = Math.abs(x) - innerX;
      const qz = Math.abs(z) - innerZ;
      const sdf =
        Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) +
        Math.min(Math.max(qx, qz), 0) -
        cornerR;
      const edgeIn = Math.max(0, -sdf);

      // Rounded cushion edge bevel + tailored stitched border frame groove
      const bevelRatio = Math.min(1, edgeIn / 0.024);
      let y = baseHeight * Math.sin(bevelRatio * Math.PI * 0.5);

      if (edgeIn > 0.016 && edgeIn < 0.068) {
        const hemPhase = (edgeIn - 0.016) / 0.052;
        y += 0.0038 * Math.sin(hemPhase * Math.PI);
      } else if (edgeIn >= 0.068 && edgeIn < 0.088) {
        const seamPhase = (edgeIn - 0.068) / 0.020;
        y -= 0.0028 * Math.sin(seamPhase * Math.PI);
      }
      if (edgeIn <= 0.0005) {
        y = 0;
      }

      posAttr.setXYZ(i, x, y, z);
      uvAttr.setXY(i, x / width + 0.5, 1.0 - (z / depth + 0.5));
    }

    posAttr.needsUpdate = true;
    uvAttr.needsUpdate = true;
    geo.setAttribute('uv1', uvAttr.clone());
    geo.computeVertexNormals();

    const matPBR = getBathMatPBR(2.5, 1.65);
    const bathMatMaterial = new THREE.MeshPhysicalMaterial({
      map: matPBR.map,
      normalMap: matPBR.normalMap,
      normalScale: new THREE.Vector2(2.4, 2.4),
      bumpMap: matPBR.bumpMap,
      bumpScale: 0.055,
      displacementMap: matPBR.bumpMap,
      displacementScale: 0.0085,
      displacementBias: 0.0005,
      aoMap: matPBR.aoMap,
      aoMapIntensity: 1.65,
      roughnessMap: matPBR.roughnessMap,
      color: new THREE.Color('#ded9ce'),
      roughness: 0.94,
      metalness: 0.0,
      sheen: 0.92,
      sheenRoughness: 0.68,
      sheenColor: new THREE.Color('#faf6ef'),
      envMapIntensity: 0.55,
    });

    const matMesh = new THREE.Mesh(geo, bathMatMaterial);
    matMesh.name = 'Bath_Mat_Mesh';
    matMesh.castShadow = true;
    matMesh.receiveShadow = true;

    // Grounded soft perimeter AO shadow halo underneath the bath mat
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 256;
    haloCanvas.height = 192;
    const hctx = haloCanvas.getContext('2d');
    const grad = hctx.createRadialGradient(128, 96, 36, 128, 96, 124);
    grad.addColorStop(0, 'rgba(18, 20, 22, 0.58)');
    grad.addColorStop(0.62, 'rgba(20, 22, 24, 0.36)');
    grad.addColorStop(0.88, 'rgba(20, 22, 24, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hctx.fillStyle = grad;
    hctx.fillRect(0, 0, 256, 192);

    const haloTex = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
    const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.66), haloMat);
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.y = -0.0006;

    this.bathMatGroup.add(haloMesh, matMesh);
    this.bathMatGroup.position.set(0, 0.0018, 0.58);
  }

  updateLayout(widthId = '31', mirrorType = 'rectangle') {
    if (this._lastWidth === widthId && this._lastMirror === mirrorType) return;
    this._lastWidth = widthId;
    this._lastMirror = mirrorType;

    const wallZ = -0.243;

    // 1. Rebuild Architectural Wall Sconces cleanly with zero mirror overlap
    while (this.sconcesGroup.children.length > 0) {
      const child = this.sconcesGroup.children[0];
      child.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
      });
      this.sconcesGroup.remove(child);
    }
    this.sconcePointLights = [];

    let sconceXPositions = [];
    if (widthId === '24') {
      sconceXPositions = [-0.40, 0.40];
    } else if (widthId === '31') {
      sconceXPositions = [-0.46, 0.46];
    } else if (widthId === '37') {
      sconceXPositions = [-0.50, 0.50];
    } else if (widthId === '49') {
      sconceXPositions = [-0.56, 0.56];
    } else if (widthId === '61') {
      sconceXPositions = [-0.76, 0.0, 0.76];
    }

    sconceXPositions.forEach((xPos) => {
      const sconce = new THREE.Group();

      const backplate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.046, 0.014, 28),
        this.sconceMetalMat
      );
      backplate.rotation.x = Math.PI / 2;
      backplate.position.set(xPos, 1.52, wallZ + 0.007);
      backplate.castShadow = true;

      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.020, 0.018, 20),
        this.sconceMetalMat
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.set(xPos, 1.52, wallZ + 0.020);

      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.082, 16),
        this.sconceMetalMat
      );
      arm.rotation.x = Math.PI / 2;
      arm.position.set(xPos, 1.52, wallZ + 0.056);

      const socket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.013, 0.026, 20),
        this.sconceMetalMat
      );
      socket.position.set(xPos, 1.545, wallZ + 0.094);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.056, 28, 22), this.globeMat);
      globe.position.set(xPos, 1.608, wallZ + 0.094);
      globe.castShadow = true;

      const light = new THREE.PointLight('#ffe8c6', 0.45, 2.4, 2.0);
      light.position.set(xPos, 1.608, wallZ + 0.15);
      light.castShadow = false;
      this.sconcePointLights.push(light);

      sconce.add(backplate, collar, arm, socket, globe, light);
      this.sconcesGroup.add(sconce);
    });

    // 2. Adaptive Positioning per Vanity Width (no clipping with basins, legs, or faucets)
    if (widthId === '24') {
      this.soapGroup.position.set(-0.26, 0, -0.105);
      this.candleGroup.position.set(-0.25, 0, 0.065);
      this.vaseGroup.position.set(0.255, 0, -0.075);
      this.basketGroup.position.set(0.62, 0, -0.04);
      this.bathMatGroup.scale.set(0.88, 1, 1);
      if (this.contactShadow) this.contactShadow.scale.set(0.85, 0.9, 1);
    } else if (widthId === '31') {
      this.soapGroup.position.set(-0.315, 0, -0.105);
      this.candleGroup.position.set(-0.305, 0, 0.065);
      this.vaseGroup.position.set(0.31, 0, -0.075);
      this.basketGroup.position.set(0.68, 0, -0.04);
      this.bathMatGroup.scale.set(1.0, 1, 1);
      if (this.contactShadow) this.contactShadow.scale.set(1.0, 1.0, 1);
    } else if (widthId === '37') {
      this.soapGroup.position.set(-0.36, 0, -0.105);
      this.candleGroup.position.set(-0.35, 0, 0.065);
      this.vaseGroup.position.set(0.36, 0, -0.075);
      this.basketGroup.position.set(0.76, 0, -0.04);
      this.bathMatGroup.scale.set(1.12, 1, 1);
      if (this.contactShadow) this.contactShadow.scale.set(1.16, 1.0, 1);
    } else if (widthId === '49') {
      this.soapGroup.position.set(-0.42, 0, -0.105);
      this.candleGroup.position.set(-0.41, 0, 0.065);
      this.vaseGroup.position.set(0.42, 0, -0.075);
      this.basketGroup.position.set(0.92, 0, -0.04);
      this.bathMatGroup.scale.set(1.35, 1, 1);
      if (this.contactShadow) this.contactShadow.scale.set(1.48, 1.0, 1);
    } else if (widthId === '61') {
      this.vaseGroup.position.set(0.0, 0, -0.075);
      this.soapGroup.position.set(-0.67, 0, -0.105);
      this.candleGroup.position.set(0.67, 0, -0.095);
      this.basketGroup.position.set(1.10, 0, -0.04);
      this.bathMatGroup.scale.set(1.58, 1, 1);
      if (this.contactShadow) this.contactShadow.scale.set(1.88, 1.0, 1);
    }
  }

  update(config, hardwareSpec) {
    this.updateLayout(config.width || '31', config.mirror || 'rectangle');

    if (this._lastWall !== config.wall) {
      const wallPBR = getWallPBR(config.wall || 'microcement');
      this.wallMat.map = wallPBR.map;
      this.wallMat.normalMap = wallPBR.normalMap || null;
      this.wallMat.normalScale?.set(wallPBR.normalScale || 0.35, wallPBR.normalScale || 0.35);
      this.wallMat.roughnessMap = wallPBR.roughnessMap || null;
      this.wallMat.color.set(wallPBR.tint || '#ffffff');
      this.wallMat.roughness = wallPBR.roughness ?? 0.84;
      this.wallMat.needsUpdate = true;
      this._lastWall = config.wall;
    }

    if (this._lastFloor !== config.floor) {
      const floorPBR = getFloorPBR(config.floor || 'checker');
      this.floorMat.map = floorPBR.map;
      this.floorMat.normalMap = floorPBR.normalMap || null;
      this.floorMat.normalScale?.set(floorPBR.normalScale || 0.5, floorPBR.normalScale || 0.5);
      this.floorMat.roughnessMap = floorPBR.roughnessMap || null;
      this.floorMat.color.set(floorPBR.tint || '#ffffff');
      this.floorMat.roughness = floorPBR.roughness ?? 0.48;
      this.floorMat.needsUpdate = true;
      this._lastFloor = config.floor;
    }

    if (hardwareSpec) {
      this.sconceMetalMat.color.set(hardwareSpec.hex);
      this.sconceMetalMat.metalness = hardwareSpec.metalness;
      this.sconceMetalMat.roughness = hardwareSpec.roughness;
    }

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
    this.globeMat.emissiveIntensity = Math.min(intensity * 0.9, 1.05);
  }

  dispose() {
    this.isDisposed = true;
    this.root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }
}

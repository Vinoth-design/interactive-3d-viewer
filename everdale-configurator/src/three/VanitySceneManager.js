import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
  CABINET_FINISHES,
  COUNTERTOP_FINISHES,
  HARDWARE_FINISHES,
  WIDTH_OPTIONS,
} from '../config/productConfig';
import {
  getBrushedMetalNormal,
  getCountertopPBR,
  getWoodTextures,
} from '../utils/proceduralTextures';
import { AccessoryBuilder } from './AccessoryBuilder';
import { BathroomRoomBuilder } from './BathroomRoomBuilder';
import { DimensionOverlay } from './DimensionOverlay';

// Exact closed rest positions in glTF local millimeter coordinates
const D1_CLOSED_POS = new THREE.Vector3(0, 523.5, 238.075);
const D2_CLOSED_POS = new THREE.Vector3(0, 265.0, 238.075);

const OPPOSITE_DRAWER_ACTIONS = {
  Drawer01_Open: 'Drawer01_Close',
  Drawer01_Close: 'Drawer01_Open',
  Drawer02_Open: 'Drawer02_Close',
  Drawer02_Close: 'Drawer02_Open',
  Drawer_L1_Open: 'Drawer_L1_Close',
  Drawer_L1_Close: 'Drawer_L1_Open',
  Drawer_L2_Open: 'Drawer_L2_Close',
  Drawer_L2_Close: 'Drawer_L2_Open',
  Drawer_R1_Open: 'Drawer_R1_Close',
  Drawer_R1_Close: 'Drawer_R1_Open',
  Drawer_R2_Open: 'Drawer_R2_Close',
  Drawer_R2_Close: 'Drawer_R2_Open',
  All_Drawers_Open: 'All_Drawers_Close',
  All_Drawers_Close: 'All_Drawers_Open',
};

const WIDTH_DIST_FACTORS = {
  '24': 0.90,
  '31': 1.00,
  '37': 1.08,
  '49': 1.24,
  '61': 1.42,
};

const CAMERA_PRESETS = {
  threeQuarter: { pos: new THREE.Vector3(1.44, 1.46, 2.86), target: new THREE.Vector3(0, 0.92, 0.0) },
  front: { pos: new THREE.Vector3(0, 1.08, 2.90), target: new THREE.Vector3(0, 0.90, 0.0) },
  side: { pos: new THREE.Vector3(2.45, 1.06, 0.56), target: new THREE.Vector3(0, 0.68, 0.0) },
  top: { pos: new THREE.Vector3(0, 1.90, 0.94), target: new THREE.Vector3(0, 0.82, -0.02) },
  detail: { pos: new THREE.Vector3(0.46, 0.96, 1.02), target: new THREE.Vector3(0.06, 0.68, 0.14) },
  drawers: { pos: new THREE.Vector3(1.06, 0.92, 1.72), target: new THREE.Vector3(0, 0.44, 0.20) },
};

export class VanitySceneManager {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e4e0d8');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.05, 30);
    this.camera.position.copy(CAMERA_PRESETS.threeQuarter.pos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    const maxDpr = width < 768 ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.98;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // PMREM Studio Environment for physically-based brass, stone & mirror reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.defaultEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.defaultEnv;

    this.hdrMaps = { studio: null, warm: null };
    const rgbeLoader = new RGBELoader();

    rgbeLoader.load('/textures/studio_small_09_1k.hdr', (texture) => {
      if (this.isDisposed) {
        texture.dispose();
        return;
      }
      this.hdrMaps.studio = pmremGenerator.fromEquirectangular(texture).texture;
      texture.dispose();
      if (this.currentLightingPreset === 'studio' || this.currentLightingPreset === 'daylight') {
        this.scene.environment = this.hdrMaps.studio;
      }
    });

    rgbeLoader.load('/textures/warm_studio_1k.hdr', (texture) => {
      if (this.isDisposed) {
        texture.dispose();
        return;
      }
      this.hdrMaps.warm = pmremGenerator.fromEquirectangular(texture).texture;
      texture.dispose();
      if (!this.currentLightingPreset || this.currentLightingPreset === 'warm-bath' || this.currentLightingPreset === 'evening') {
        this.scene.environment = this.hdrMaps.warm;
      }
      pmremGenerator.dispose();
    });

    // Post-Processing Pipeline: High bloom threshold (>= 1.15) avoids washing out walls or stone
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.09, // subtle highlight sheen only
      0.28,
      1.15  // threshold > 1.0 so white walls/stone never bloom into fog
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // Smooth constrained OrbitControls (orbit, zoom, clamped pan)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.65;
    this.controls.screenSpacePanning = true;
    this.controls.target.copy(CAMERA_PRESETS.threeQuarter.target);
    this.controls.minDistance = 0.62;
    this.controls.maxDistance = 4.6;
    this.controls.minPolarAngle = 0.14;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minAzimuthAngle = -Math.PI * 0.44;
    this.controls.maxAzimuthAngle = Math.PI * 0.44;
    this.controls.update();

    this.lastInteractionTime = performance.now();
    this.activeWidthId = '31';
    this.activePreset = 'threeQuarter';
    this._loadGeneration = 0;
    this._loadingUrl = null;
    this._rafId = null;

    this._setupLights();

    this.roomBuilder = new BathroomRoomBuilder();
    this.scene.add(this.roomBuilder.root);

    this.accessoryBuilder = new AccessoryBuilder();
    this.scene.add(this.accessoryBuilder.root);

    this.dimensionOverlay = new DimensionOverlay();
    this.scene.add(this.dimensionOverlay.root);

    this.modelRoot = null;
    this.mixer = null;
    this.actions = {};
    this.d1Node = null;
    this.d2Node = null;
    this.backsplashMesh = null;
    this.tray1Node = null;
    this.tray2Node = null;

    this.materials = {
      cabinet: null,
      legs: null,
      hardware: null,
      countertop: null,
      sink: null,
      drawerInterior: null,
    };

    this.drawerState = {
      d1Open: false,
      d2Open: false,
      l1Open: false,
      l2Open: false,
      r1Open: false,
      r2Open: false,
    };
    this.drawerHitMap = new Map();
    this.dL1Node = null;
    this.dL2Node = null;
    this.dR1Node = null;
    this.dR2Node = null;

    this.cameraTween = null;

    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = new THREE.Vector2();
    this.hotspotElements = {};
    this._projVec = new THREE.Vector3();
    this._bindEvents();

    this.clock = new THREE.Clock();
    this.isDisposed = false;
    this._animate();
  }

  _setupLights() {
    this.hemiLight = new THREE.HemisphereLight('#fff8ec', '#cfc5b6', 0.58);
    this.hemiLight.position.set(0, 3.6, 0);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight('#fff6eb', 1.95);
    this.keyLight.position.set(2.4, 3.6, 2.8);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.bias = -0.00025;
    this.keyLight.shadow.normalBias = 0.018;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 11.0;
    // Wide shadow frustum prevents visible shadow-edge clipping across 61" scenes
    this.keyLight.shadow.camera.left = -3.4;
    this.keyLight.shadow.camera.right = 3.4;
    this.keyLight.shadow.camera.top = 3.2;
    this.keyLight.shadow.camera.bottom = -0.6;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight('#eae0d0', 0.58);
    this.fillLight.position.set(-2.6, 2.2, 1.8);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight('#ffffff', 0.42);
    this.rimLight.position.set(0.2, 3.0, -0.8);
    this.scene.add(this.rimLight);
  }

  _bindEvents() {
    this._onResize = () => {
      if (!this.container || this.isDisposed) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;
      const maxDpr = w < 768 ? 1.5 : 2;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      if (this.composer) {
        this.composer.setSize(w, h);
      }
    };

    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(this.container);

    const dom = this.renderer.domElement;

    this._onPointerDown = (e) => {
      this.lastInteractionTime = performance.now();
      this.controls.autoRotate = false;
      this.pointerDownPos.set(e.clientX, e.clientY);
      this.cameraTween = null;
    };

    this._onPointerMove = (e) => {
      this.lastInteractionTime = performance.now();
      if (!this.modelRoot) return;
      const hit = this._raycastDrawer(e);
      dom.style.cursor = hit ? 'pointer' : 'grab';
    };

    this._onPointerUp = (e) => {
      this.lastInteractionTime = performance.now();
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      if (Math.hypot(dx, dy) > 5) return;

      const hit = this._raycastDrawer(e);
      if (hit) {
        this.toggleDrawer(hit);
      }
    };

    this._onWheel = () => {
      this.lastInteractionTime = performance.now();
      this.controls.autoRotate = false;
    };

    dom.addEventListener('pointerdown', this._onPointerDown);
    dom.addEventListener('pointermove', this._onPointerMove);
    dom.addEventListener('pointerup', this._onPointerUp);
    dom.addEventListener('wheel', this._onWheel, { passive: true });
  }

  _raycastDrawer(event) {
    if (!this.drawerHitMap || this.drawerHitMap.size === 0) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);

    const targets = Array.from(this.drawerHitMap.keys());
    if (targets.length === 0) return null;

    const hits = this.raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return null;

    return this.drawerHitMap.get(hits[0].object);
  }

  _cleanupCurrentModel() {
    if (!this.modelRoot) return;
    this.scene.remove(this.modelRoot);
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.modelRoot);
    }
    this.actions = {};

    const disposedMaterials = new Set();
    this.modelRoot.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (child.material && !disposedMaterials.has(child.material)) {
          disposedMaterials.add(child.material);
          child.material.dispose();
        }
      }
    });
    this.modelRoot = null;
    this.drawerHitMap.clear();
  }

  _initModel(gltf, url) {
    this.modelRoot = gltf.scene;
    this.currentModelFile = url;
    this._loadingUrl = null;

    const countertopMat = new THREE.MeshPhysicalMaterial({
      color: '#f4f3ef',
      roughness: 0.16,
      metalness: 0.0,
      clearcoat: 0.24,
      clearcoatRoughness: 0.14,
      envMapIntensity: 0.92,
    });
    this.materials.countertop = countertopMat;

    const mapleTex = getWoodTextures('drawer-maple');

    this.modelRoot.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === 'Stone_Top' || child.name === 'Backsplash') {
          child.material = countertopMat;
        } else if (child.material) {
          child.material.envMapIntensity = 0.95;
          if (child.material.name === 'MAT_Evergreen_Fog') {
            this.materials.cabinet = child.material;
          } else if (child.material.name === 'MAT_Solid_Wood_Legs') {
            this.materials.legs = child.material;
          } else if (child.material.name === 'MAT_Antique_Brass') {
            this.materials.hardware = child.material;
          } else if (child.material.name === 'MAT_Engineered_Stone_White') {
            this.materials.sink = child.material;
            child.material.color.set('#f6f6f3');
            child.material.roughness = 0.14;
            child.material.envMapIntensity = 0.75;
          } else if (child.material.name === 'MAT_Drawer_Interior') {
            this.materials.drawerInterior = child.material;
            child.material.map = mapleTex.map;
            child.material.normalMap = mapleTex.normalMap;
            child.material.roughnessMap = mapleTex.roughnessMap;
            child.material.color.set('#ffffff');
            child.material.needsUpdate = true;
          }
        }
      }
    });

    this.scene.add(this.modelRoot);

    this.dL1Node = this.modelRoot.getObjectByName('Drawer_L1_Root');
    this.dL2Node = this.modelRoot.getObjectByName('Drawer_L2_Root');
    this.dR1Node = this.modelRoot.getObjectByName('Drawer_R1_Root');
    this.dR2Node = this.modelRoot.getObjectByName('Drawer_R2_Root');
    this.d1Node = this.modelRoot.getObjectByName('Drawer_01_Root') || this.dL1Node;
    this.d2Node = this.modelRoot.getObjectByName('Drawer_02_Root') || this.dL2Node;
    this.backsplashMesh = this.modelRoot.getObjectByName('Backsplash');
    this.tray1Node = this.modelRoot.getObjectByName('Accessory_Tray_01');
    this.tray2Node = this.modelRoot.getObjectByName('Accessory_Tray_02');

    this.drawerHitMap.clear();
    const registerHits = (node, id) => {
      if (!node) return;
      node.traverse((obj) => {
        if (obj.isMesh) this.drawerHitMap.set(obj, id);
      });
    };

    if (this.dL1Node && this.dR1Node) {
      registerHits(this.dL1Node, 'L1');
      registerHits(this.dL2Node, 'L2');
      registerHits(this.dR1Node, 'R1');
      registerHits(this.dR2Node, 'R2');
    } else {
      registerHits(this.d1Node, 'd1');
      registerHits(this.d2Node, 'd2');
    }

    this._setupAnimationMixer(gltf);
    this.resetDrawers();
  }

  loadModel(url, initialConfig) {
    this._loadGeneration = (this._loadGeneration || 0) + 1;
    const currentGen = this._loadGeneration;
    this._loadingUrl = url;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.isDisposed || currentGen !== this._loadGeneration) return;

        this._cleanupCurrentModel();
        this._initModel(gltf, url);

        if (initialConfig) {
          this.activeWidthId = initialConfig.width || '31';
          this.applyConfig(initialConfig);
          this.setCameraPreset('threeQuarter', true);
        }

        this.callbacks.onLoaded?.();
      },
      (progress) => {
        if (currentGen === this._loadGeneration && this.callbacks.onProgress && progress.total > 0) {
          this.callbacks.onProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (error) => {
        if (currentGen === this._loadGeneration) {
          this._loadingUrl = null;
          console.warn(`Model not available yet: ${url}.`, error);
          this.callbacks.onError?.(error);
        }
      }
    );
  }

  switchModel(url, config) {
    if (this.currentModelFile === url && this.modelRoot) return;
    if (this._loadingUrl === url) return;

    this._loadGeneration = (this._loadGeneration || 0) + 1;
    const currentGen = this._loadGeneration;
    this._loadingUrl = url;

    this.callbacks.onSwitching?.(true);

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.isDisposed || currentGen !== this._loadGeneration) return;

        this._cleanupCurrentModel();
        this._initModel(gltf, url);
        this.applyConfig(config);
        this.callbacks.onSwitching?.(false);
      },
      undefined,
      (error) => {
        if (currentGen === this._loadGeneration) {
          this._loadingUrl = null;
          this.callbacks.onSwitching?.(false);
          console.warn(`Model file ${url} failed to load. Retaining active model.`, error);
        }
      }
    );
  }

  applyConfig(config) {
    const widthOpt = WIDTH_OPTIONS.find((w) => w.id === config.width) || WIDTH_OPTIONS[1];
    if (
      widthOpt.modelFile &&
      this.currentModelFile &&
      this.currentModelFile !== widthOpt.modelFile &&
      this._loadingUrl !== widthOpt.modelFile
    ) {
      this.switchModel(widthOpt.modelFile, config);
    }

    if (config.width && config.width !== this.activeWidthId) {
      this.activeWidthId = config.width;
      this.setCameraPreset(this.activePreset || 'threeQuarter');
    }

    // 1. Cabinet & Wood Legs Finish (instantaneous PBR swap, zero GLB reload)
    const cabFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
    const applySurfaceFinish = (mat, fallbackHex, roughnessOffset = 0) => {
      if (!mat) return;
      if (cabFinish.finishType === 'wood') {
        const woodPBR = getWoodTextures(cabFinish.id);
        mat.map = woodPBR.map;
        mat.normalMap = woodPBR.normalMap;
        mat.normalScale?.set(0.65, 0.65);
        mat.roughnessMap = woodPBR.roughnessMap;
        mat.color.set(cabFinish.id === 'natural-oak' ? '#cfb088' : '#e6ddd5');
        mat.roughness = 0.58 + roughnessOffset;
      } else {
        mat.map = null;
        mat.normalMap = null;
        mat.roughnessMap = null;
        mat.color.set(fallbackHex);
        mat.roughness = cabFinish.roughness + roughnessOffset;
      }
      mat.needsUpdate = true;
    };

    applySurfaceFinish(this.materials.cabinet, cabFinish.hex, 0);
    applySurfaceFinish(this.materials.legs, cabFinish.legHex || cabFinish.hex, 0.04);

    // 2. Hardware Finish (Drawer pulls with anisotropic brushed normal)
    const hwFinish = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
    if (this.materials.hardware) {
      this.materials.hardware.color.set(hwFinish.hex);
      this.materials.hardware.metalness = hwFinish.metalness;
      this.materials.hardware.roughness = hwFinish.roughness;
      this.materials.hardware.normalMap =
        hwFinish.id === 'matte-black' ? null : getBrushedMetalNormal();
      this.materials.hardware.normalScale?.set(0.45, 0.45);
      this.materials.hardware.envMapIntensity = 1.15;
      this.materials.hardware.needsUpdate = true;
    }

    // 3. Countertop Stone Finish & Backsplash Visibility
    const ctFinish = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
    if (this.materials.countertop) {
      const stonePBR = getCountertopPBR(ctFinish.textureType);
      this.materials.countertop.map = stonePBR.map;
      this.materials.countertop.normalMap = stonePBR.normalMap;
      if (stonePBR.normalMap && this.materials.countertop.normalScale) {
        this.materials.countertop.normalScale.set(0.35, 0.35);
      }
      this.materials.countertop.color.set('#ffffff');
      this.materials.countertop.roughness = ctFinish.roughness;
      this.materials.countertop.envMapIntensity = 0.85;
      this.materials.countertop.needsUpdate = true;
    }
    if (this.backsplashMesh) {
      this.backsplashMesh.visible = config.backsplash === 'included';
    }

    // 4. Interior Accessory Trays Toggle
    const showTrays = Boolean(config.showTrays);
    if (this.tray1Node) this.tray1Node.visible = showTrays;
    if (this.tray2Node) this.tray2Node.visible = showTrays;

    // 5. Procedural Accessories (Faucet & Mirror)
    this.accessoryBuilder.update(config);

    // 6. Bathroom Room Staging
    this.roomBuilder.update(config, hwFinish);

    // 7. Lighting & Tone Mapping
    this._applyLightingPreset(config.lighting);

    // 8. 3D Dimension Lines
    this.dimensionOverlay.update(config);
  }

  _applyLightingPreset(preset) {
    if (!preset) preset = 'warm-bath';
    this.currentLightingPreset = preset;

    if (preset === 'studio') {
      this.scene.background.set('#dadde2');
      this.hemiLight.color.set('#f5f8fa');
      this.hemiLight.groundColor.set('#b4b8bd');
      this.hemiLight.intensity = 0.56;
      this.keyLight.color.set('#ffffff');
      this.keyLight.intensity = 2.05;
      this.fillLight.color.set('#d8e6f4');
      this.fillLight.intensity = 0.62;
      this.rimLight.intensity = 0.45;
      this.renderer.toneMappingExposure = 0.96;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.08;
        this.bloomPass.radius = 0.25;
        this.bloomPass.threshold = 1.15;
      }
      if (this.hdrMaps?.studio) {
        this.scene.environment = this.hdrMaps.studio;
      }
      this.roomBuilder?.setSconceLightIntensity(0.28);
    } else if (preset === 'daylight') {
      this.scene.background.set('#e6ecf1');
      this.hemiLight.color.set('#e8f2fc');
      this.hemiLight.groundColor.set('#c4beb2');
      this.hemiLight.intensity = 0.62;
      this.keyLight.color.set('#fffcf2');
      this.keyLight.intensity = 2.35;
      this.fillLight.color.set('#cde2f8');
      this.fillLight.intensity = 0.52;
      this.rimLight.intensity = 0.48;
      this.renderer.toneMappingExposure = 1.00;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.09;
        this.bloomPass.radius = 0.28;
        this.bloomPass.threshold = 1.15;
      }
      if (this.hdrMaps?.studio) {
        this.scene.environment = this.hdrMaps.studio;
      }
      this.roomBuilder?.setSconceLightIntensity(0.22);
    } else if (preset === 'evening') {
      this.scene.background.set('#22272e');
      this.hemiLight.color.set('#536276');
      this.hemiLight.groundColor.set('#201c18');
      this.hemiLight.intensity = 0.44;
      this.keyLight.color.set('#ffdfae');
      this.keyLight.intensity = 1.45;
      this.fillLight.color.set('#3a4c66');
      this.fillLight.intensity = 0.36;
      this.rimLight.intensity = 0.68;
      this.renderer.toneMappingExposure = 1.08;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.14;
        this.bloomPass.radius = 0.35;
        this.bloomPass.threshold = 1.05;
      }
      if (this.hdrMaps?.warm) {
        this.scene.environment = this.hdrMaps.warm;
      }
      this.roomBuilder?.setSconceLightIntensity(0.95);
    } else {
      // 'warm-bath' (Default) - Calibrated natural architectural bathroom lighting
      this.scene.background.set('#e5e1d8');
      this.hemiLight.color.set('#fff8ec');
      this.hemiLight.groundColor.set('#c8beae');
      this.hemiLight.intensity = 0.56;
      this.keyLight.color.set('#fff5e4');
      this.keyLight.intensity = 1.88;
      this.fillLight.color.set('#eadbc6');
      this.fillLight.intensity = 0.55;
      this.rimLight.intensity = 0.42;
      this.renderer.toneMappingExposure = 0.96;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.09;
        this.bloomPass.radius = 0.28;
        this.bloomPass.threshold = 1.15;
      }
      if (this.hdrMaps?.warm) {
        this.scene.environment = this.hdrMaps.warm;
      }
      this.roomBuilder?.setSconceLightIntensity(0.55);
    }
  }

  _setupAnimationMixer(gltf) {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.modelRoot);
    }
    this.actions = {};
    if (!gltf.animations || gltf.animations.length === 0) return;

    this.mixer = new THREE.AnimationMixer(this.modelRoot);
    gltf.animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;
      this.actions[clip.name] = action;
    });

    this.mixer.addEventListener('finished', (e) => {
      const clipName = e.action.getClip().name;
      if (clipName.endsWith('_Close')) {
        e.action.stop();
        if (clipName === 'Drawer01_Close' && this.d1Node) this.d1Node.position.copy(D1_CLOSED_POS);
        if (clipName === 'Drawer02_Close' && this.d2Node) this.d2Node.position.copy(D2_CLOSED_POS);
        if (clipName === 'Drawer_L1_Close' && this.dL1Node) this.dL1Node.position.set(-381.0, 523.5, 238.075);
        if (clipName === 'Drawer_L2_Close' && this.dL2Node) this.dL2Node.position.set(-381.0, 265.0, 238.075);
        if (clipName === 'Drawer_R1_Close' && this.dR1Node) this.dR1Node.position.set(381.0, 523.5, 238.075);
        if (clipName === 'Drawer_R2_Close' && this.dR2Node) this.dR2Node.position.set(381.0, 265.0, 238.075);
      }
    });
  }

  playDrawerAction(name) {
    if (!this.actions || !this.actions[name]) return;
    const action = this.actions[name];
    const clip = action.getClip();
    const oppositeName = OPPOSITE_DRAWER_ACTIONS[name];

    let startTime = 0;
    if (oppositeName && this.actions[oppositeName]) {
      const oppAction = this.actions[oppositeName];
      if (oppAction.isRunning()) {
        const oppClip = oppAction.getClip();
        const progress = Math.min(Math.max(oppAction.time / oppClip.duration, 0), 1);
        startTime = (1 - progress) * clip.duration;
      }
      oppAction.stop();
    }

    action.reset();
    if (startTime > 0) {
      action.time = startTime;
    }
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
    if (this.mixer) {
      this.mixer.update(0);
    }
    this._notifyDrawerState();
  }

  toggleDrawer(id) {
    this.lastInteractionTime = performance.now();
    this.controls.autoRotate = false;
    if (id === 1 || id === 'd1') {
      this.drawerState.d1Open = !this.drawerState.d1Open;
      this.playDrawerAction(this.drawerState.d1Open ? 'Drawer01_Open' : 'Drawer01_Close');
    } else if (id === 2 || id === 'd2') {
      this.drawerState.d2Open = !this.drawerState.d2Open;
      this.playDrawerAction(this.drawerState.d2Open ? 'Drawer02_Open' : 'Drawer02_Close');
    } else if (id === 'L1') {
      this.drawerState.l1Open = !this.drawerState.l1Open;
      this.playDrawerAction(this.drawerState.l1Open ? 'Drawer_L1_Open' : 'Drawer_L1_Close');
    } else if (id === 'L2') {
      this.drawerState.l2Open = !this.drawerState.l2Open;
      this.playDrawerAction(this.drawerState.l2Open ? 'Drawer_L2_Open' : 'Drawer_L2_Close');
    } else if (id === 'R1') {
      this.drawerState.r1Open = !this.drawerState.r1Open;
      this.playDrawerAction(this.drawerState.r1Open ? 'Drawer_R1_Open' : 'Drawer_R1_Close');
    } else if (id === 'R2') {
      this.drawerState.r2Open = !this.drawerState.r2Open;
      this.playDrawerAction(this.drawerState.r2Open ? 'Drawer_R2_Open' : 'Drawer_R2_Close');
    }
  }

  setAllDrawers(open) {
    this.lastInteractionTime = performance.now();
    this.controls.autoRotate = false;
    const isDouble = Boolean(this.dL1Node && this.dR1Node);
    if (isDouble) {
      if (this.drawerState.l1Open !== open) this.toggleDrawer('L1');
      if (this.drawerState.l2Open !== open) this.toggleDrawer('L2');
      if (this.drawerState.r1Open !== open) this.toggleDrawer('R1');
      if (this.drawerState.r2Open !== open) this.toggleDrawer('R2');
    } else {
      if (this.drawerState.d1Open !== open) this.toggleDrawer('d1');
      if (this.drawerState.d2Open !== open) this.toggleDrawer('d2');
    }
  }

  openLowerDrawerForInspection() {
    this.lastInteractionTime = performance.now();
    this.controls.autoRotate = false;
    const isDouble = Boolean(this.dL1Node && this.dR1Node);
    if (isDouble) {
      if (!this.drawerState.l2Open) this.toggleDrawer('L2');
    } else if (!this.drawerState.d2Open) {
      this.toggleDrawer('d2');
    }
  }

  resetDrawers() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    if (this.actions) {
      Object.values(this.actions).forEach((a) => {
        a.stop();
        a.reset();
      });
    }

    if (this.d1Node) this.d1Node.position.copy(D1_CLOSED_POS);
    if (this.d2Node) this.d2Node.position.copy(D2_CLOSED_POS);
    if (this.dL1Node) this.dL1Node.position.set(-381.0, 523.5, 238.075);
    if (this.dL2Node) this.dL2Node.position.set(-381.0, 265.0, 238.075);
    if (this.dR1Node) this.dR1Node.position.set(381.0, 523.5, 238.075);
    if (this.dR2Node) this.dR2Node.position.set(381.0, 265.0, 238.075);

    this.drawerState = {
      d1Open: false,
      d2Open: false,
      l1Open: false,
      l2Open: false,
      r1Open: false,
      r2Open: false,
    };
    this._notifyDrawerState();
  }

  _notifyDrawerState() {
    this.callbacks.onDrawerStateChange?.({ ...this.drawerState });
  }

  _getPresetTransform(presetName) {
    const preset = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.threeQuarter;
    const factor = WIDTH_DIST_FACTORS[this.activeWidthId] || 1.0;
    const offset = preset.pos.clone().sub(preset.target);
    // Detail preset keeps tight focal distance regardless of cabinet width
    const scaledOffset = presetName === 'detail' ? offset : offset.multiplyScalar(factor);
    return {
      targetPos: preset.target.clone().add(scaledOffset),
      targetLook: preset.target.clone(),
    };
  }

  setCameraPreset(presetName, immediate = false) {
    this.activePreset = presetName || 'threeQuarter';
    this.lastInteractionTime = performance.now();
    this.controls.autoRotate = false;

    const { targetPos, targetLook } = this._getPresetTransform(this.activePreset);
    if (immediate) {
      this.cameraTween = null;
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLook);
      this.controls.update();
    } else {
      this.cameraTween = { targetPos, targetLook };
    }
  }

  resetCamera() {
    this.setCameraPreset('threeQuarter');
  }

  zoom(factor) {
    this.lastInteractionTime = performance.now();
    this.controls.autoRotate = false;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const currentDist = offset.length();
    const nextDist = THREE.MathUtils.clamp(
      currentDist * factor,
      this.controls.minDistance,
      this.controls.maxDistance
    );
    offset.setLength(nextDist);
    this.cameraTween = {
      targetPos: this.controls.target.clone().add(offset),
      targetLook: this.controls.target.clone(),
    };
  }

  setHotspotElements(elMap) {
    this.hotspotElements = elMap || {};
  }

  _getHotspotWorldAnchors() {
    const widthOpt = WIDTH_OPTIONS.find((w) => w.id === this.activeWidthId) || WIDTH_OPTIONS[1];
    const halfW = (widthOpt.topWidthMm / 1000.0) / 2.0;
    const isDouble = this.activeWidthId === '61';
    return {
      finish: new THREE.Vector3(-halfW * 0.56, 0.34, 0.255),
      hardware: new THREE.Vector3(isDouble ? -0.26 : 0.145, 0.523, 0.275),
      countertop: new THREE.Vector3(halfW * 0.52, 0.878, 0.14),
      faucet: new THREE.Vector3(isDouble ? 0.38 : 0.0, 0.985, -0.115),
      mirror: new THREE.Vector3(isDouble ? 0.46 : 0.24, 1.32, -0.205),
    };
  }

  _updateHotspotPositions() {
    if (!this.hotspotElements || !this.renderer?.domElement) return;
    const w = this.container?.clientWidth || 0;
    const h = this.container?.clientHeight || 0;
    if (w === 0 || h === 0) return;

    const anchors = this._getHotspotWorldAnchors();
    Object.entries(this.hotspotElements).forEach(([key, el]) => {
      if (!el || !anchors[key]) return;
      this._projVec.copy(anchors[key]).project(this.camera);
      const outOfBounds =
        this._projVec.z > 1 ||
        this._projVec.z < -1 ||
        this._projVec.x < -0.96 ||
        this._projVec.x > 0.96 ||
        this._projVec.y < -0.92 ||
        this._projVec.y > 0.92;
      if (outOfBounds) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }
      const px = Math.round((this._projVec.x * 0.5 + 0.5) * w);
      const py = Math.round((-this._projVec.y * 0.5 + 0.5) * h);
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
    });
  }

  captureSnapshot() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    return this.renderer.domElement.toDataURL('image/png');
  }

  _animate() {
    if (this.isDisposed) return;
    this._rafId = requestAnimationFrame(() => this._animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Clamp pan target so the vanity never disappears off-screen
    this.controls.target.x = THREE.MathUtils.clamp(this.controls.target.x, -0.65, 0.65);
    this.controls.target.y = THREE.MathUtils.clamp(this.controls.target.y, 0.25, 1.45);
    this.controls.target.z = THREE.MathUtils.clamp(this.controls.target.z, -0.30, 0.45);

    const anyDrawerOpen = Object.values(this.drawerState).some(Boolean);
    const now = performance.now();
    if (
      now - this.lastInteractionTime > 9000 &&
      !this.cameraTween &&
      !anyDrawerOpen &&
      this.activePreset === 'threeQuarter'
    ) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.45;
    } else {
      this.controls.autoRotate = false;
    }

    if (this.cameraTween) {
      this.camera.position.lerp(this.cameraTween.targetPos, 0.10);
      this.controls.target.lerp(this.cameraTween.targetLook, 0.10);
      if (
        this.camera.position.distanceTo(this.cameraTween.targetPos) < 0.003 &&
        this.controls.target.distanceTo(this.cameraTween.targetLook) < 0.003
      ) {
        this.cameraTween = null;
      }
    }

    this.controls.update();
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    this._updateHotspotPositions();
  }

  dispose() {
    this.isDisposed = true;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
    }
    this.resizeObserver?.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this._onPointerDown);
    dom.removeEventListener('pointermove', this._onPointerMove);
    dom.removeEventListener('pointerup', this._onPointerUp);
    dom.removeEventListener('wheel', this._onWheel);
    this.controls.dispose();
    this.defaultEnv?.dispose();
    if (this.hdrMaps) {
      this.hdrMaps.studio?.dispose();
      this.hdrMaps.warm?.dispose();
    }
    this._cleanupCurrentModel();
    this.roomBuilder?.dispose();
    this.accessoryBuilder?.dispose();
    this.dimensionOverlay?.dispose();
    this.composer?.dispose();
    this.renderer.dispose();
    if (dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  }
}

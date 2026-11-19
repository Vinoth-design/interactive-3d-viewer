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
import { getCountertopTexture } from '../utils/proceduralTextures';
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

const CAMERA_PRESETS = {
  threeQuarter: { pos: new THREE.Vector3(1.38, 1.46, 2.62), target: new THREE.Vector3(0, 0.86, 0.0) },
  front: { pos: new THREE.Vector3(0, 1.08, 2.75), target: new THREE.Vector3(0, 0.86, 0.0) },
  top: { pos: new THREE.Vector3(0, 1.88, 0.96), target: new THREE.Vector3(0, 0.82, -0.02) },
  drawers: { pos: new THREE.Vector3(1.05, 0.94, 1.72), target: new THREE.Vector3(0, 0.44, 0.22) },
};

export class VanitySceneManager {
  constructor(container, callbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e8e6e1');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 30);
    this.camera.position.copy(CAMERA_PRESETS.threeQuarter.pos);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true, // Enables crisp PNG snapshots
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // PMREM Studio Environment for physically-based brass & mirror reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    this.defaultEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.defaultEnv;

    // Load Photorealistic HDRI Studio Maps
    this.hdrMaps = { studio: null, warm: null };
    const rgbeLoader = new RGBELoader();

    rgbeLoader.load('/textures/studio_small_09_1k.hdr', (texture) => {
      if (this.isDisposed) return;
      this.hdrMaps.studio = pmremGenerator.fromEquirectangular(texture).texture;
      texture.dispose();
      if (this.currentLightingPreset === 'studio' || this.currentLightingPreset === 'daylight') {
        this.scene.environment = this.hdrMaps.studio;
      }
    });

    rgbeLoader.load('/textures/warm_studio_1k.hdr', (texture) => {
      if (this.isDisposed) return;
      this.hdrMaps.warm = pmremGenerator.fromEquirectangular(texture).texture;
      texture.dispose();
      if (!this.currentLightingPreset || this.currentLightingPreset === 'warm-bath' || this.currentLightingPreset === 'evening') {
        this.scene.environment = this.hdrMaps.warm;
      }
    });

    // Post-Processing Pipeline (Bloom, Tone Mapping, Glow on Brass & Emissive Sconces)
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.32, // strength (elegant, subtle sheen)
      0.42, // radius
      0.82  // threshold (only glints & glowing lamps bloom)
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // Smooth constrained OrbitControls (prevent orbiting under floor or behind bathroom wall)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(CAMERA_PRESETS.threeQuarter.target);
    this.controls.minDistance = 0.85;
    this.controls.maxDistance = 4.4;
    this.controls.minPolarAngle = 0.16;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.025;
    this.controls.minAzimuthAngle = -Math.PI * 0.44;
    this.controls.maxAzimuthAngle = Math.PI * 0.44;
    this.controls.update();

    // Idle turntable auto-rotation timer
    this.lastInteractionTime = performance.now();
    this.activeWidthId = '31';

    // Lights
    this._setupLights();

    // Sub-builders
    this.roomBuilder = new BathroomRoomBuilder();
    this.scene.add(this.roomBuilder.root);

    this.accessoryBuilder = new AccessoryBuilder();
    this.scene.add(this.accessoryBuilder.root);

    this.dimensionOverlay = new DimensionOverlay();
    this.scene.add(this.dimensionOverlay.root);

    // Model & Animation state
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
    this.drawer1HitMeshes = [];
    this.drawer2HitMeshes = [];
    this.dL1Node = null;
    this.dL2Node = null;
    this.dR1Node = null;
    this.dR2Node = null;

    // Smooth camera lerp state
    this.cameraTween = null;

    // Pointer interaction for click-to-open drawers
    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = new THREE.Vector2();
    this._bindEvents();

    this.clock = new THREE.Clock();
    this.isDisposed = false;
    this._animate();
  }

  _setupLights() {
    this.hemiLight = new THREE.HemisphereLight('#fff8ec', '#cfc4b4', 0.75);
    this.hemiLight.position.set(0, 3.4, 0);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight('#fff5ea', 2.3);
    this.keyLight.position.set(2.3, 3.5, 2.6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.bias = -0.0003;
    this.keyLight.shadow.normalBias = 0.02;
    this.keyLight.shadow.camera.near = 0.4;
    this.keyLight.shadow.camera.far = 9.0;
    this.keyLight.shadow.camera.left = -2.0;
    this.keyLight.shadow.camera.right = 2.0;
    this.keyLight.shadow.camera.top = 2.5;
    this.keyLight.shadow.camera.bottom = -0.4;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight('#eddcc8', 0.75);
    this.fillLight.position.set(-2.5, 2.2, 1.6);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight('#ffffff', 0.55);
    this.rimLight.position.set(0.2, 3.0, -0.6);
    this.scene.add(this.rimLight);
  }

  _bindEvents() {
    this._onResize = () => {
      if (!this.container || this.isDisposed) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      if (w === 0 || h === 0) return;
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
      this.cameraTween = null; // Cancel camera lerp on manual orbit
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
      if (Math.hypot(dx, dy) > 5) return; // User was orbiting, not clicking

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

  loadModel(url, initialConfig) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (this.isDisposed) return;

        this.modelRoot = gltf.scene;

        // Shared dedicated countertop material so Integrated_Sink stays crisp ceramic white
        const countertopMat = new THREE.MeshStandardMaterial({
          color: '#f4f3ef',
          roughness: 0.18,
          metalness: 0.0,
          envMapIntensity: 0.9,
        });
        this.materials.countertop = countertopMat;

        this.modelRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name === 'Stone_Top' || child.name === 'Backsplash') {
              child.material = countertopMat;
            } else if (child.material) {
              child.material.envMapIntensity = 1.0;
              if (child.material.name === 'MAT_Evergreen_Fog') {
                this.materials.cabinet = child.material;
              } else if (child.material.name === 'MAT_Solid_Wood_Legs') {
                this.materials.legs = child.material;
              } else if (child.material.name === 'MAT_Antique_Brass') {
                this.materials.hardware = child.material;
              } else if (child.material.name === 'MAT_Engineered_Stone_White') {
                this.materials.sink = child.material;
              }
            }
          }
        });

        this.currentModelFile = url;
        this.scene.add(this.modelRoot);

        // Locate functional nodes
        this.dL1Node = this.modelRoot.getObjectByName('Drawer_L1_Root');
        this.dL2Node = this.modelRoot.getObjectByName('Drawer_L2_Root');
        this.dR1Node = this.modelRoot.getObjectByName('Drawer_R1_Root');
        this.dR2Node = this.modelRoot.getObjectByName('Drawer_R2_Root');
        this.d1Node = this.modelRoot.getObjectByName('Drawer_01_Root') || this.dL1Node;
        this.d2Node = this.modelRoot.getObjectByName('Drawer_02_Root') || this.dL2Node;
        this.backsplashMesh = this.modelRoot.getObjectByName('Backsplash');
        this.tray1Node = this.modelRoot.getObjectByName('Accessory_Tray_01');
        this.tray2Node = this.modelRoot.getObjectByName('Accessory_Tray_02');

        // Populate drawerHitMap
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

        // Register all glTF animation clips with conflict-free mixer
        this._setupAnimationMixer(gltf);
        this.resetDrawers();

        if (initialConfig) {
          this.applyConfig(initialConfig);
        }

        if (this.callbacks.onLoaded) {
          this.callbacks.onLoaded();
        }
      },
      (progress) => {
        if (this.callbacks.onProgress && progress.total > 0) {
          this.callbacks.onProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (error) => {
        console.warn(`Model not available yet: ${url}. Retaining active model.`);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      }
    );
  }

  switchModel(url, config) {
    if (this._loadingUrl === url) return;
    this._loadingUrl = url;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this._loadingUrl = null;
        if (this.isDisposed) return;

        // Remove old model cleanly
        if (this.modelRoot) {
          this.scene.remove(this.modelRoot);
          if (this.mixer) this.mixer.stopAllAction();
          this.actions = {};
        }

        this.modelRoot = gltf.scene;
        this.currentModelFile = url;

        const countertopMat = new THREE.MeshStandardMaterial({
          color: '#f4f3ef',
          roughness: 0.18,
          metalness: 0.0,
          envMapIntensity: 0.9,
        });
        this.materials.countertop = countertopMat;

        this.modelRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.name === 'Stone_Top' || child.name === 'Backsplash') {
              child.material = countertopMat;
            } else if (child.material) {
              child.material.envMapIntensity = 1.0;
              if (child.material.name === 'MAT_Evergreen_Fog') {
                this.materials.cabinet = child.material;
              } else if (child.material.name === 'MAT_Solid_Wood_Legs') {
                this.materials.legs = child.material;
              } else if (child.material.name === 'MAT_Antique_Brass') {
                this.materials.hardware = child.material;
              } else if (child.material.name === 'MAT_Engineered_Stone_White') {
                this.materials.sink = child.material;
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

        this.applyConfig(config);
      },
      undefined,
      (error) => {
        this._loadingUrl = null;
        console.warn(`Model file ${url} not found or failed to load. Retaining active model.`, error);
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

    // Adaptive camera reframing when vanity size changes
    if (config.width && config.width !== this.activeWidthId) {
      this.activeWidthId = config.width;
      const widthDists = { '24': 0.94, '31': 1.0, '37': 1.05, '49': 1.15, '61': 1.26 };
      const factor = widthDists[config.width] || 1.0;
      const basePreset = CAMERA_PRESETS.threeQuarter;
      const baseOffset = basePreset.pos.clone().sub(basePreset.target);
      const targetPos = basePreset.target.clone().add(baseOffset.multiplyScalar(factor));
      this.cameraTween = {
        targetPos,
        targetLook: basePreset.target.clone(),
      };
    }
    // 1. Cabinet & Wood Legs Finish (instantaneous PBR swap, zero re-fetch)
    const cabFinish = CABINET_FINISHES.find((f) => f.id === config.finish) || CABINET_FINISHES[0];
    if (this.materials.cabinet) {
      this.materials.cabinet.color.set(cabFinish.hex);
      this.materials.cabinet.roughness = cabFinish.roughness;
      this.materials.cabinet.needsUpdate = true;
    }
    if (this.materials.legs) {
      this.materials.legs.color.set(cabFinish.legHex || cabFinish.hex);
      this.materials.legs.roughness = cabFinish.roughness + 0.04;
      this.materials.legs.needsUpdate = true;
    }

    // 2. Hardware Finish (Drawer & False Drawer handles)
    const hwFinish = HARDWARE_FINISHES.find((h) => h.id === config.hardware) || HARDWARE_FINISHES[0];
    if (this.materials.hardware) {
      this.materials.hardware.color.set(hwFinish.hex);
      this.materials.hardware.metalness = hwFinish.metalness;
      this.materials.hardware.roughness = hwFinish.roughness;
      this.materials.hardware.needsUpdate = true;
    }

    // 3. Countertop Finish & Backsplash Visibility
    const ctFinish = COUNTERTOP_FINISHES.find((c) => c.id === config.countertop) || COUNTERTOP_FINISHES[0];
    if (this.materials.countertop) {
      this.materials.countertop.map = getCountertopTexture(ctFinish.textureType);
      this.materials.countertop.color.set('#ffffff');
      this.materials.countertop.roughness = ctFinish.roughness;
      this.materials.countertop.needsUpdate = true;
    }
    if (this.backsplashMesh) {
      this.backsplashMesh.visible = config.backsplash === 'included';
    }

    // 4. Interior Accessory Trays Toggle
    const showTrays = Boolean(config.showTrays);
    if (this.tray1Node) this.tray1Node.visible = showTrays;
    if (this.tray2Node) this.tray2Node.visible = showTrays;

    // 5. Update Procedural Accessories (Faucet & Mirror)
    this.accessoryBuilder.update(config);

    // 6. Update Bathroom Room Staging (Wall, Floor, Props)
    this.roomBuilder.update(config, hwFinish);

    // 7. Update Lighting Preset
    this._applyLightingPreset(config.lighting);

    // 8. Update 3D Dimension Lines
    this.dimensionOverlay.update(config);
  }

  _applyLightingPreset(preset) {
    if (!preset) preset = 'warm-bath';
    this.currentLightingPreset = preset;

    if (preset === 'studio') {
      this.scene.background.set('#d8dce0');
      this.hemiLight.color.set('#f5f8fa');
      this.hemiLight.groundColor.set('#b4b8bd');
      this.hemiLight.intensity = 0.65;
      this.keyLight.color.set('#ffffff');
      this.keyLight.intensity = 2.4;
      this.fillLight.color.set('#d8e6f4');
      this.fillLight.intensity = 0.75;
      this.rimLight.intensity = 0.5;
      this.renderer.toneMappingExposure = 1.08;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.22;
        this.bloomPass.radius = 0.35;
      }
      if (this.hdrMaps?.studio) {
        this.scene.environment = this.hdrMaps.studio;
      }
      if (this.roomBuilder) this.roomBuilder.setSconceLightIntensity(0.4);
    } else if (preset === 'daylight') {
      this.scene.background.set('#edf2f6');
      this.hemiLight.color.set('#e8f2fc');
      this.hemiLight.groundColor.set('#c8c2b7');
      this.hemiLight.intensity = 0.75;
      this.keyLight.color.set('#fffcf0');
      this.keyLight.intensity = 3.0;
      this.fillLight.color.set('#cde2f8');
      this.fillLight.intensity = 0.6;
      this.rimLight.intensity = 0.6;
      this.renderer.toneMappingExposure = 1.16;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.26;
        this.bloomPass.radius = 0.40;
      }
      if (this.hdrMaps?.studio) {
        this.scene.environment = this.hdrMaps.studio;
      }
      if (this.roomBuilder) this.roomBuilder.setSconceLightIntensity(0.3);
    } else if (preset === 'evening') {
      this.scene.background.set('#242930');
      this.hemiLight.color.set('#485568');
      this.hemiLight.groundColor.set('#201c18');
      this.hemiLight.intensity = 0.45;
      this.keyLight.color.set('#ffdfae');
      this.keyLight.intensity = 1.6;
      this.fillLight.color.set('#3a4c66');
      this.fillLight.intensity = 0.4;
      this.rimLight.intensity = 0.8;
      this.renderer.toneMappingExposure = 1.25;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.48;
        this.bloomPass.radius = 0.65;
      }
      if (this.hdrMaps?.warm) {
        this.scene.environment = this.hdrMaps.warm;
      }
      if (this.roomBuilder) this.roomBuilder.setSconceLightIntensity(1.6);
    } else {
      // 'warm-bath' (Default) - Cozy 2700K residential bath lighting
      this.scene.background.set('#ece8e0');
      this.hemiLight.color.set('#fff8ec');
      this.hemiLight.groundColor.set('#cfc4b4');
      this.hemiLight.intensity = 0.75;
      this.keyLight.color.set('#fff3df');
      this.keyLight.intensity = 2.2;
      this.fillLight.color.set('#eddcc8');
      this.fillLight.intensity = 0.7;
      this.rimLight.intensity = 0.55;
      this.renderer.toneMappingExposure = 1.12;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.32;
        this.bloomPass.radius = 0.45;
      }
      if (this.hdrMaps?.warm) {
        this.scene.environment = this.hdrMaps.warm;
      }
      if (this.roomBuilder) this.roomBuilder.setSconceLightIntensity(1.0);
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
        // Stop action so it leaves zero residual weight on the mixer
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
    if (this.callbacks.onDrawerStateChange) {
      this.callbacks.onDrawerStateChange({ ...this.drawerState });
    }
  }

  setCameraPreset(presetName) {
    const preset = CAMERA_PRESETS[presetName] || CAMERA_PRESETS.threeQuarter;
    this.cameraTween = {
      targetPos: preset.pos.clone(),
      targetLook: preset.target.clone(),
    };
  }

  zoom(factor) {
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
    requestAnimationFrame(() => this._animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Auto-rotate turntable after 6.5s of idle inactivity
    const now = performance.now();
    if (now - this.lastInteractionTime > 6500 && !this.cameraTween) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.55;
    } else {
      this.controls.autoRotate = false;
    }

    if (this.cameraTween) {
      this.camera.position.lerp(this.cameraTween.targetPos, 0.08);
      this.controls.target.lerp(this.cameraTween.targetLook, 0.08);
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
  }

  dispose() {
    this.isDisposed = true;
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
    this.composer?.dispose();
    this.renderer.dispose();
    if (dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  }
}

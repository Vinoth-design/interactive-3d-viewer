import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';

/**
 * Detects client device AR support (iOS Quick Look, Android Scene Viewer, WebXR immersive-ar).
 */
export async function getARCapabilities() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const platform = typeof navigator !== 'undefined' ? navigator.platform || '' : '';
  const maxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints || 0 : 0;

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || maxTouchPoints > 1;
  const isSecureContext = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false;

  let webxrSupported = false;
  if (isSecureContext && typeof navigator !== 'undefined' && navigator.xr?.isSessionSupported) {
    try {
      webxrSupported = await navigator.xr.isSessionSupported('immersive-ar');
    } catch {
      webxrSupported = false;
    }
  }

  return {
    isIOS,
    isAndroid,
    isMobile,
    isSecureContext,
    webxrSupported,
    quickLookSupported: isIOS,
    sceneViewerSupported: isAndroid,
  };
}

/**
 * Waits briefly for any active HTMLImageElement maps on a group to finish decoding
 * so USDZExporter / GLTFExporter never hit an unready image element.
 */
async function waitForGroupTextures(group, timeoutMs = 4000) {
  const pending = [];
  const texProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];

  group.traverseVisible((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      texProps.forEach((prop) => {
        const tex = mat[prop];
        const img = tex?.image;
        if (img && typeof HTMLImageElement !== 'undefined' && img instanceof HTMLImageElement && !img.complete) {
          pending.push(
            new Promise((resolve) => {
              const timer = setTimeout(resolve, timeoutMs);
              const done = () => {
                clearTimeout(timer);
                resolve();
              };
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            })
          );
        }
      });
    });
  });

  if (pending.length > 0) {
    await Promise.all(pending);
  }
}

/**
 * Creates a lightweight AR-safe texture clone capped at maxSize so mobile USDZ/GLB
 * exports stay fast (< 5s) and memory-safe on iOS Quick Look & Android WebXR.
 */
function cloneDownscaledTexture(tex, maxSize, textureCache, allocatedTextures) {
  if (!tex || !tex.image) return tex;
  const cacheKey = `${tex.uuid}_${maxSize}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const img = tex.image;
  const srcW = img.width || img.naturalWidth || 0;
  const srcH = img.height || img.naturalHeight || 0;
  if (srcW === 0 || srcH === 0 || Math.max(srcW, srcH) <= maxSize) {
    textureCache.set(cacheKey, tex);
    return tex;
  }

  const scale = maxSize / Math.max(srcW, srcH);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(srcW * scale));
  canvas.height = Math.max(1, Math.round(srcH * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const resized = new THREE.CanvasTexture(canvas);
  resized.wrapS = tex.wrapS;
  resized.wrapT = tex.wrapT;
  resized.repeat.copy(tex.repeat);
  resized.offset.copy(tex.offset);
  resized.rotation = tex.rotation;
  resized.flipY = tex.flipY;
  resized.colorSpace = tex.colorSpace;
  resized.needsUpdate = true;

  allocatedTextures?.add(resized);
  textureCache.set(cacheKey, resized);
  return resized;
}

function getOrCloneMaterial(sourceMat, materialCache, textureCache, allocatedTextures) {
  if (!sourceMat) return sourceMat;
  if (materialCache.has(sourceMat.uuid)) {
    return materialCache.get(sourceMat.uuid);
  }

  const clonedMat = sourceMat.clone ? sourceMat.clone() : sourceMat;
  if (clonedMat.map) clonedMat.map = cloneDownscaledTexture(clonedMat.map, 512, textureCache, allocatedTextures);
  if (clonedMat.normalMap) clonedMat.normalMap = cloneDownscaledTexture(clonedMat.normalMap, 512, textureCache, allocatedTextures);
  if (clonedMat.roughnessMap) clonedMat.roughnessMap = cloneDownscaledTexture(clonedMat.roughnessMap, 256, textureCache, allocatedTextures);
  if (clonedMat.metalnessMap) clonedMat.metalnessMap = cloneDownscaledTexture(clonedMat.metalnessMap, 256, textureCache, allocatedTextures);
  if (clonedMat.aoMap) clonedMat.aoMap = cloneDownscaledTexture(clonedMat.aoMap, 256, textureCache, allocatedTextures);
  // USDZ does not support double-sided materials; default to front side for clean mobile compatibility
  if (clonedMat.side === THREE.DoubleSide) {
    clonedMat.side = THREE.FrontSide;
  }

  materialCache.set(sourceMat.uuid, clonedMat);
  return clonedMat;
}

/**
 * Recursively clones only visible mesh nodes into an export-safe hierarchy,
 * deduplicating shared materials and textures and stripping studio room context.
 */
function cloneVisibleSubtree(sourceNode, materialCache, textureCache, allocatedTextures) {
  if (!sourceNode || !sourceNode.visible) return null;
  sourceNode.updateMatrixWorld(true);

  if (sourceNode.isMesh) {
    const mat = sourceNode.material;
    const clonedMat = Array.isArray(mat)
      ? mat.map((m) => getOrCloneMaterial(m, materialCache, textureCache, allocatedTextures))
      : getOrCloneMaterial(mat, materialCache, textureCache, allocatedTextures);
    const mesh = new THREE.Mesh(sourceNode.geometry, clonedMat);
    mesh.name = sourceNode.name || 'Mesh';
    mesh.position.copy(sourceNode.position);
    mesh.quaternion.copy(sourceNode.quaternion);
    mesh.scale.copy(sourceNode.scale);
    return mesh;
  }

  const group = new THREE.Group();
  group.name = sourceNode.name || 'Group';
  group.position.copy(sourceNode.position);
  group.quaternion.copy(sourceNode.quaternion);
  group.scale.copy(sourceNode.scale);

  for (const child of sourceNode.children) {
    const clonedChild = cloneVisibleSubtree(child, materialCache, textureCache, allocatedTextures);
    if (clonedChild) {
      group.add(clonedChild);
    }
  }

  return group.children.length > 0 ? group : null;
}

/**
 * Builds a clean, product-only 1:1 meter Group grounded with floor pivot y = 0.
 * Excludes studio walls, floor tiles, lighting sconces, and decor props.
 */
export function buildProductARGroup(sceneManager, options = {}) {
  const { includeMirror = false } = options;
  if (!sceneManager?.modelRoot) {
    throw new Error('3D vanity model is still loading.');
  }

  const root = new THREE.Group();
  root.name = 'Everdale_AR_Vanity';
  const materialCache = new Map();
  const textureCache = new Map();
  const allocatedTextures = new Set();

  const modelClone = cloneVisibleSubtree(sceneManager.modelRoot, materialCache, textureCache, allocatedTextures);
  if (modelClone) {
    root.add(modelClone);
  }

  const faucetGroup = sceneManager.accessoryBuilder?.faucetGroup;
  if (faucetGroup && faucetGroup.visible && faucetGroup.children.length > 0) {
    const faucetClone = cloneVisibleSubtree(faucetGroup, materialCache, textureCache, allocatedTextures);
    if (faucetClone) {
      root.add(faucetClone);
    }
  }

  if (includeMirror) {
    const mirrorGroup = sceneManager.accessoryBuilder?.mirrorGroup;
    if (mirrorGroup && mirrorGroup.visible && mirrorGroup.children.length > 0) {
      const mirrorClone = cloneVisibleSubtree(mirrorGroup, materialCache, textureCache, allocatedTextures);
      if (mirrorClone) {
        root.add(mirrorClone);
      }
    }
  }

  // Ensure true floor resting contact at y = 0 (1 unit = 1 meter)
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  if (isFinite(bounds.min.y) && Math.abs(bounds.min.y) > 0.0005) {
    const offsetY = -bounds.min.y;
    root.children.forEach((child) => {
      child.position.y += offsetY;
    });
    root.updateMatrixWorld(true);
  }

  root.userData._disposeCaches = () => {
    materialCache.forEach((m) => m?.dispose?.());
    allocatedTextures.forEach((t) => t?.dispose?.());
  };

  return root;
}

/**
 * Generates a binary .glb Blob + ObjectURL of the currently configured vanity assembly.
 */
export async function exportConfiguredGLB(sceneManager, options = {}) {
  await waitForGroupTextures(sceneManager.modelRoot);
  const exportRoot = buildProductARGroup(sceneManager, options);

  try {
    const exporter = new GLTFExporter();
    const arrayBuffer = await new Promise((resolve, reject) => {
      exporter.parse(
        exportRoot,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(result);
          } else {
            const json = JSON.stringify(result);
            resolve(new TextEncoder().encode(json).buffer);
          }
        },
        (err) => reject(err || new Error('GLB export failed')),
        { binary: true, onlyVisible: true, maxTextureSize: 512 }
      );
    });

    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      sizeBytes: blob.size,
    };
  } finally {
    exportRoot.userData._disposeCaches?.();
  }
}

/**
 * Generates an Apple AR Quick Look compatible .usdz Blob + ObjectURL (1 unit = 1 meter, plane anchored).
 */
export async function exportConfiguredUSDZ(sceneManager, options = {}) {
  await waitForGroupTextures(sceneManager.modelRoot);
  const exportRoot = buildProductARGroup(sceneManager, options);

  try {
    const exporter = new USDZExporter();
    const usdzBytes = await exporter.parseAsync(exportRoot, {
      quickLookCompatible: true,
      maxTextureSize: 512,
      includeAnchoringProperties: true,
      ar: {
        anchoring: { type: 'plane' },
        planeAnchoring: { alignment: 'horizontal' },
      },
    });

    const blob = new Blob([usdzBytes], { type: 'model/vnd.usdz+zip' });
    const url = URL.createObjectURL(blob);
    return {
      blob,
      url,
      sizeBytes: blob.size,
    };
  } finally {
    exportRoot.userData._disposeCaches?.();
  }
}

/**
 * Revokes an AR ObjectURL safely when done.
 */
export function revokeARObjectUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error
    }
  }
}

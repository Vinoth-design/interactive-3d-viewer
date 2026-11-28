import * as THREE from 'three';

/**
 * Real-time WebXR immersive-ar session controller (Phase B).
 * Handles floor hit-testing, architectural placement reticle, tap-to-place,
 * 1-finger drag + yaw rotation, shadow-catching floor plane, and clean exit restore.
 */
export class ARSessionController {
  constructor(sceneManager) {
    this.manager = sceneManager;
    this.isActive = false;
    this.isPlaced = false;
    this.includeMirror = false;

    this.xrSession = null;
    this.refSpace = null;
    this.viewerSpace = null;
    this.hitTestSource = null;

    this.arAnchor = new THREE.Group();
    this.arAnchor.name = 'Everdale_WebXR_Anchor';

    this.reticle = this._createReticle();
    this.shadowPlane = this._createShadowPlane();

    this._savedState = null;
    this._callbacks = {};
    this._lastHitMatrix = new THREE.Matrix4();
    this._hasHit = false;
    this._dragPointerId = null;
    this._isDragging = false;
    this._prevDragX = 0;
    this._downPos = { x: 0, y: 0 };
    this._movedDist = 0;
    this.arHotspotElements = {};
    this._projVec = new THREE.Vector3();
    this._worldAnchor = new THREE.Vector3();
    this._rayNdc = new THREE.Vector2();
    this._xrOrigin = new THREE.Vector3();
    this._xrDir = new THREE.Vector3();
    this._xrQuat = new THREE.Quaternion();

    this._boundOnSelect = (e) => this._handleXRSelect(e);
    this._boundBeforeXRSelect = (e) => this._handleBeforeXRSelect(e);
    this._boundOnSessionEnd = () => this._cleanupAfterSessionEnd();
    this._boundTouchMove = (e) => this._handleDomMove(e);
    this._boundTouchStart = (e) => this._handleDomStart(e);
    this._boundTouchEnd = (e) => this._handleDomEnd(e);
  }

  _createReticle() {
    const group = new THREE.Group();
    group.name = 'Everdale_AR_Reticle';
    group.matrixAutoUpdate = false;
    group.visible = false;

    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.16, 0.20, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: '#24382f',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      })
    );
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.055, 0.08, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      })
    );
    innerRing.position.y = 0.002;
    group.add(outerRing, innerRing);
    return group;
  }

  _createShadowPlane() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2).rotateX(-Math.PI / 2),
      new THREE.ShadowMaterial({ opacity: 0.34 })
    );
    plane.name = 'Everdale_AR_ShadowCatcher';
    plane.position.y = 0.001;
    plane.receiveShadow = true;
    return plane;
  }

  /**
   * Ensures a freshly loaded modelRoot swaps cleanly inside arAnchor if AR is running.
   */
  attachModelRoot(modelRoot) {
    if (!this.isActive || !modelRoot) return;
    if (modelRoot.parent !== this.arAnchor) {
      this.arAnchor.add(modelRoot);
    }
    this._syncFaucetPlacement();
  }

  _syncFaucetPlacement() {
    const faucetGroup = this.manager.accessoryBuilder?.faucetGroup;
    if (faucetGroup && faucetGroup.parent !== this.arAnchor) {
      this.arAnchor.add(faucetGroup);
    }
    const mirrorGroup = this.manager.accessoryBuilder?.mirrorGroup;
    if (mirrorGroup) {
      if (this.includeMirror) {
        if (mirrorGroup.parent !== this.arAnchor) {
          this.arAnchor.add(mirrorGroup);
        }
        mirrorGroup.visible = true;
      } else {
        mirrorGroup.visible = false;
      }
    }
  }

  async start(overlayElement, callbacks = {}) {
    if (this.isActive) return;
    if (!navigator.xr) {
      throw new Error('WebXR immersive-ar is not supported in this browser.');
    }
    const supported = await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      throw new Error('This device or browser does not support WebXR AR placement.');
    }

    this._callbacks = callbacks;
    this.includeMirror = Boolean(callbacks.includeMirror);

    const sessionInit = {
      requiredFeatures: ['hit-test', 'local-floor'],
      optionalFeatures: ['dom-overlay', 'light-estimation'],
    };
    if (overlayElement) {
      sessionInit.domOverlay = { root: overlayElement };
    }

    const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    this.xrSession = session;
    this.isActive = true;
    this.isPlaced = false;
    this._hasHit = false;

    const mgr = this.manager;
    // Pause showcase rAF loop; WebXR drives frame cadence via setAnimationLoop
    if (mgr._rafId !== null) {
      cancelAnimationFrame(mgr._rafId);
      mgr._rafId = null;
    }

    // Snapshot scene state to restore cleanly when exiting AR
    this._savedState = {
      background: mgr.scene.background,
      roomVisible: mgr.roomBuilder?.root?.visible ?? true,
      dimVisible: mgr.dimensionOverlay?.root?.visible ?? false,
      mirrorVisible: mgr.accessoryBuilder?.mirrorGroup?.visible ?? true,
      controlsEnabled: mgr.controls.enabled,
      autoRotate: mgr.controls.autoRotate,
      cameraPos: mgr.camera.position.clone(),
      controlsTarget: mgr.controls.target.clone(),
      hemiIntensity: mgr.hemiLight.intensity,
      keyIntensity: mgr.keyLight.intensity,
      keyColor: mgr.keyLight.color.clone(),
    };

    mgr.controls.enabled = false;
    mgr.controls.autoRotate = false;
    mgr.scene.background = null;
    mgr.renderer.setClearColor(0x000000, 0);
    mgr.renderer.xr.enabled = true;
    mgr.renderer.xr.setReferenceSpaceType('local-floor');

    if (mgr.roomBuilder?.root) {
      mgr.roomBuilder.root.visible = false;
    }
    if (mgr.dimensionOverlay?.root) {
      mgr.dimensionOverlay.root.visible = false;
    }

    // Re-parent vanity product assembly into draggable/placeable arAnchor
    if (mgr.modelRoot) {
      this.arAnchor.add(mgr.modelRoot);
    }
    this._syncFaucetPlacement();
    this.arAnchor.add(this.shadowPlane);
    this.arAnchor.visible = false;
    mgr.scene.add(this.arAnchor);
    mgr.scene.add(this.reticle);

    session.addEventListener('end', this._boundOnSessionEnd);
    session.addEventListener('select', this._boundOnSelect);

    this._overlayEl = overlayElement || mgr.renderer.domElement;
    this._overlayEl.addEventListener('beforexrselect', this._boundBeforeXRSelect);
    this._overlayEl.addEventListener('pointerdown', this._boundTouchStart, { passive: true });
    this._overlayEl.addEventListener('pointermove', this._boundTouchMove, { passive: true });
    this._overlayEl.addEventListener('pointerup', this._boundTouchEnd);
    this._overlayEl.addEventListener('pointercancel', this._boundTouchEnd);

    await mgr.renderer.xr.setSession(session);

    try {
      this.refSpace = await session.requestReferenceSpace('local-floor');
      this.viewerSpace = await session.requestReferenceSpace('viewer');
      this.hitTestSource = await session.requestHitTestSource({ space: this.viewerSpace });
    } catch (err) {
      console.warn('WebXR hit-test initialization failed:', err);
    }

    this._callbacks.onSessionStateChange?.({
      active: true,
      placed: false,
      floorDetected: false,
    });

    mgr.renderer.setAnimationLoop((_time, xrFrame) => {
      this._renderXRFrame(xrFrame);
    });
  }

  _handleBeforeXRSelect(event) {
    // Prevent WebXR select firing when user taps UI controls, swatches, or hotspot pins
    if (event?.target?.closest?.('.ar-hud-interactive, .ar-hotspot-pin-btn')) {
      event.preventDefault();
    }
  }

  _handleXRSelect(event) {
    if (!this.isActive) return;

    if (!this.isPlaced) {
      if (this._hasHit) {
        this._placeAtLastHit();
      }
      return;
    }

    // Placed state: raycast WebXR screen-tap ray onto placed vanity drawer meshes
    const hitDrawer = this._raycastXRSelectDrawer(event);
    if (hitDrawer) {
      this.manager.toggleDrawer(hitDrawer);
    }
  }

  _raycastXRSelectDrawer(event) {
    const mgr = this.manager;
    if (!mgr.drawerHitMap || mgr.drawerHitMap.size === 0) return null;

    this.arAnchor.updateMatrixWorld(true);
    let rayConfigured = false;

    const frame = event?.frame;
    const inputSource = event?.inputSource;
    if (frame && inputSource?.targetRaySpace && this.refSpace) {
      const rayPose = frame.getPose(inputSource.targetRaySpace, this.refSpace);
      if (rayPose) {
        const p = rayPose.transform.position;
        const o = rayPose.transform.orientation;
        this._xrOrigin.set(p.x, p.y, p.z);
        this._xrQuat.set(o.x, o.y, o.z, o.w);
        this._xrDir.set(0, 0, -1).applyQuaternion(this._xrQuat).normalize();
        mgr.raycaster.set(this._xrOrigin, this._xrDir);
        rayConfigured = true;
      }
    }

    // Fallback for screen-mode XR input sources exposing normalized touch axes
    if (!rayConfigured && inputSource?.gamepad?.axes?.length >= 2) {
      const [axX, axY] = inputSource.gamepad.axes;
      this._rayNdc.set(axX, -axY);
      const activeCam = this._getActiveXRCamera();
      activeCam.updateMatrixWorld(true);
      mgr.raycaster.setFromCamera(this._rayNdc, activeCam);
      rayConfigured = true;
    }

    if (!rayConfigured) return null;

    const targets = Array.from(mgr.drawerHitMap.keys());
    const hits = mgr.raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return null;
    return mgr.drawerHitMap.get(hits[0].object);
  }

  _placeAtLastHit() {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this._lastHitMatrix.decompose(pos, quat, scale);

    this.arAnchor.position.copy(pos);

    // Orient vanity cleanly facing the viewer around world Y (keep cabinet strictly upright)
    const camPos = new THREE.Vector3();
    this.manager.renderer.xr.getCamera().getWorldPosition(camPos);
    const dx = camPos.x - pos.x;
    const dz = camPos.z - pos.z;
    if (Math.hypot(dx, dz) > 0.05) {
      this.arAnchor.rotation.set(0, Math.atan2(dx, dz), 0);
    }

    this.arAnchor.visible = true;
    this.reticle.visible = false;
    this.isPlaced = true;

    this._callbacks.onSessionStateChange?.({
      active: true,
      placed: true,
      floorDetected: true,
    });
  }

  setHotspotElements(elMap) {
    this.arHotspotElements = elMap || {};
  }

  _getActiveXRCamera() {
    const xrCam = this.manager.renderer.xr.getCamera();
    return xrCam?.cameras?.[0] || xrCam || this.manager.camera;
  }

  _handleDomStart(e) {
    if (!this.isActive || !this.isPlaced) return;
    // Only interact with 3D model when touching outside HUD buttons / hotspot badges
    if (e.target?.closest?.('.ar-hud-interactive') || e.target?.closest?.('.ar-hotspot-pin-btn')) {
      return;
    }
    this._isDragging = true;
    this._dragPointerId = e.pointerId;
    this._prevDragX = e.clientX;
    this._downPos = { x: e.clientX, y: e.clientY };
    this._movedDist = 0;
  }

  _handleDomMove(e) {
    if (!this._isDragging || e.pointerId !== this._dragPointerId) return;
    const dist = Math.hypot(e.clientX - this._downPos.x, e.clientY - this._downPos.y);
    if (dist > this._movedDist) {
      this._movedDist = dist;
    }
    // Wait until movement exceeds tap threshold (8px) before repositioning cabinet
    if (this._movedDist <= 8) return;

    if (this._hasHit) {
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      this._lastHitMatrix.decompose(pos, quat, scale);
      this.arAnchor.position.lerp(pos, 0.45);
    } else {
      // Smooth local horizontal nudge if hit-test loses plane momentarily
      const dx = (e.clientX - this._prevDragX) * 0.0025;
      this.arAnchor.position.x += dx;
    }
    this._prevDragX = e.clientX;
  }

  _handleDomEnd(e) {
    const wasTap = this._isDragging && e.pointerId === this._dragPointerId && this._movedDist <= 8;
    this._isDragging = false;
    this._dragPointerId = null;

    if (!wasTap || !this.isActive || !this.isPlaced) return;
    const hitDrawer = this._raycastDrawerTap(e);
    if (hitDrawer) {
      this.manager.toggleDrawer(hitDrawer);
    }
  }

  _raycastDrawerTap(event) {
    const mgr = this.manager;
    if (!mgr.drawerHitMap || mgr.drawerHitMap.size === 0) return null;
    const hostEl = this._overlayEl || mgr.renderer.domElement;
    const rect = hostEl.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;
    if (w === 0 || h === 0) return null;

    this._rayNdc.set(
      ((event.clientX - rect.left) / w) * 2 - 1,
      -((event.clientY - rect.top) / h) * 2 + 1
    );

    const activeCam = this._getActiveXRCamera();
    activeCam.updateMatrixWorld(true);
    mgr.raycaster.setFromCamera(this._rayNdc, activeCam);

    const targets = Array.from(mgr.drawerHitMap.keys());
    const hits = mgr.raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return null;
    return mgr.drawerHitMap.get(hits[0].object);
  }

  _updateARHotspots() {
    if (!this.arHotspotElements || !this.isActive || !this.isPlaced) return;
    const hostEl = this._overlayEl || this.manager.renderer.domElement;
    const w = hostEl?.clientWidth || window.innerWidth;
    const h = hostEl?.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    this.arAnchor.updateMatrixWorld(true);
    const activeCam = this._getActiveXRCamera();
    activeCam.updateMatrixWorld(true);
    activeCam.matrixWorldInverse.copy(activeCam.matrixWorld).invert();

    const anchors = this.manager._getHotspotWorldAnchors();
    Object.entries(this.arHotspotElements).forEach(([key, el]) => {
      if (!el || !anchors[key]) return;
      this._worldAnchor.copy(anchors[key]).applyMatrix4(this.arAnchor.matrixWorld);
      this._projVec.copy(this._worldAnchor).project(activeCam);

      const outOfBounds =
        this._projVec.z > 1 ||
        this._projVec.z < -1 ||
        this._projVec.x < -0.95 ||
        this._projVec.x > 0.95 ||
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

  /**
   * Triggers manual re-placement mode (shows floor reticle again).
   */
  reposition() {
    if (!this.isActive) return;
    this.isPlaced = false;
    this.arAnchor.visible = false;
    this._callbacks.onSessionStateChange?.({
      active: true,
      placed: false,
      floorDetected: this._hasHit,
    });
  }

  rotateBy(deltaRadians) {
    if (!this.isActive) return;
    this.arAnchor.rotation.y += deltaRadians;
  }

  setIncludeMirror(includeMirror) {
    this.includeMirror = Boolean(includeMirror);
    if (this.isActive) {
      this._syncFaucetPlacement();
    }
  }

  _renderXRFrame(xrFrame) {
    const mgr = this.manager;
    const delta = Math.min(mgr.clock.getDelta(), 0.1);
    if (mgr.mixer) {
      mgr.mixer.update(delta);
    }

    if (xrFrame && this.hitTestSource && this.refSpace) {
      const hitResults = xrFrame.getHitTestResults(this.hitTestSource);
      if (hitResults.length > 0) {
        const pose = hitResults[0].getPose(this.refSpace);
        if (pose) {
          this._lastHitMatrix.fromArray(pose.transform.matrix);
          if (!this.isPlaced) {
            this.reticle.visible = true;
            this.reticle.matrix.copy(this._lastHitMatrix);
          }
          if (!this._hasHit) {
            this._hasHit = true;
            this._callbacks.onSessionStateChange?.({
              active: true,
              placed: this.isPlaced,
              floorDetected: true,
            });
          }
        }
      } else if (!this.isPlaced) {
        this.reticle.visible = false;
      }
    }

    // WebXR bypasses EffectComposer so alpha passthrough renders crisply
    mgr.renderer.render(mgr.scene, mgr.camera);
    this._updateARHotspots();
  }

  async stop() {
    if (!this.xrSession) return;
    try {
      await this.xrSession.end();
    } catch {
      this._cleanupAfterSessionEnd();
    }
  }

  _cleanupAfterSessionEnd() {
    if (!this.isActive) return;
    this.isActive = false;
    this.isPlaced = false;
    this._hasHit = false;
    this._isDragging = false;

    const mgr = this.manager;
    mgr.renderer.setAnimationLoop(null);

    if (this.hitTestSource) {
      try {
        this.hitTestSource.cancel();
      } catch {
        // Ignore
      }
      this.hitTestSource = null;
    }

    if (this.xrSession) {
      this.xrSession.removeEventListener('end', this._boundOnSessionEnd);
      this.xrSession.removeEventListener('select', this._boundOnSelect);
      this.xrSession = null;
    }

    if (this._overlayEl) {
      this._overlayEl.removeEventListener('beforexrselect', this._boundBeforeXRSelect);
      this._overlayEl.removeEventListener('pointerdown', this._boundTouchStart);
      this._overlayEl.removeEventListener('pointermove', this._boundTouchMove);
      this._overlayEl.removeEventListener('pointerup', this._boundTouchEnd);
      this._overlayEl.removeEventListener('pointercancel', this._boundTouchEnd);
      this._overlayEl = null;
    }

    mgr.renderer.xr.enabled = false;
    mgr.renderer.setClearColor(0xe5e1d8, 1);

    // Restore product parts back to showcase world origin
    if (mgr.modelRoot) {
      mgr.modelRoot.position.set(0, 0, 0);
      mgr.modelRoot.rotation.set(0, 0, 0);
      mgr.scene.add(mgr.modelRoot);
    }
    if (mgr.accessoryBuilder?.root) {
      if (mgr.accessoryBuilder.faucetGroup) {
        mgr.accessoryBuilder.faucetGroup.position.set(0, 0, 0);
        mgr.accessoryBuilder.faucetGroup.rotation.set(0, 0, 0);
        mgr.accessoryBuilder.root.add(mgr.accessoryBuilder.faucetGroup);
      }
      if (mgr.accessoryBuilder.mirrorGroup) {
        mgr.accessoryBuilder.mirrorGroup.position.set(0, 0, 0);
        mgr.accessoryBuilder.mirrorGroup.rotation.set(0, 0, 0);
        mgr.accessoryBuilder.root.add(mgr.accessoryBuilder.mirrorGroup);
        mgr.accessoryBuilder.mirrorGroup.visible = this._savedState?.mirrorVisible ?? true;
      }
    }

    this.arAnchor.remove(this.shadowPlane);
    this.arAnchor.position.set(0, 0, 0);
    this.arAnchor.rotation.set(0, 0, 0);
    mgr.scene.remove(this.arAnchor);
    mgr.scene.remove(this.reticle);

    if (this._savedState) {
      mgr.scene.background = this._savedState.background;
      if (mgr.roomBuilder?.root) mgr.roomBuilder.root.visible = this._savedState.roomVisible;
      if (mgr.dimensionOverlay?.root) mgr.dimensionOverlay.root.visible = this._savedState.dimVisible;
      mgr.controls.enabled = this._savedState.controlsEnabled;
      mgr.controls.autoRotate = this._savedState.autoRotate;
      mgr.camera.position.copy(this._savedState.cameraPos);
      mgr.controls.target.copy(this._savedState.controlsTarget);
      mgr.hemiLight.intensity = this._savedState.hemiIntensity;
      mgr.keyLight.intensity = this._savedState.keyIntensity;
      mgr.keyLight.color.copy(this._savedState.keyColor);
      mgr.controls.update();
      this._savedState = null;
    }

    this._callbacks.onSessionStateChange?.({
      active: false,
      placed: false,
      floorDetected: false,
    });

    mgr._animate();
  }

  dispose() {
    if (this.isActive) {
      this._cleanupAfterSessionEnd();
    }
    this.reticle.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose();
        obj.material?.dispose();
      }
    });
    this.shadowPlane.geometry?.dispose();
    this.shadowPlane.material?.dispose();
  }
}

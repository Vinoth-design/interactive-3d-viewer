import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  Camera,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Ruler,
  Share2,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { VanitySceneManager } from '../three/VanitySceneManager';
import { WIDTH_OPTIONS } from '../catalog/index';

const CAMERA_VIEWS = [
  { id: 'threeQuarter', label: '3/4 View' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'top', label: 'Top' },
  { id: 'detail', label: 'Detail' },
  { id: 'drawers', label: 'Drawers' },
];

const HOTSPOT_DEFS = [
  { id: 'finish', label: 'Cabinet' },
  { id: 'hardware', label: 'Handles' },
  { id: 'countertop', label: 'Top' },
  { id: 'faucet', label: 'Faucet' },
  { id: 'mirror', label: 'Mirror' },
];

const Viewport3D = React.forwardRef(function Viewport3D(
  {
    config,
    activeVariant,
    isActive = true,
    activeHotspot = null,
    onSelectHotspot,
    onUpdateConfig,
    onToggleDimensions,
    onOpenSceneSettings,
    onOpenShare,
    onOpenAR,
    onShowToast,
    fullscreenTargetRef,
  },
  ref
) {
  const localContainerRef = useRef(null);
  const hostRef = useRef(null);
  const managerRef = useRef(null);
  const hotspotRefs = useRef({});

  const [loading, setLoading] = useState(true);
  const [switchingVariant, setSwitchingVariant] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [activePreset, setActivePreset] = useState('threeQuarter');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

  const isSeries = config?.purchaseMode === 'series';
  const variant = activeVariant || WIDTH_OPTIONS.find((w) => w.id === config?.width) || WIDTH_OPTIONS[1];
  const isDouble = variant?.basinCount === 2;

  useEffect(() => {
    if (!hostRef.current) return;

    const manager = new VanitySceneManager(hostRef.current, {
      onLoaded: () => {
        setLoading(false);
        setLoadPct(100);
      },
      onProgress: (pct) => setLoadPct(pct),
      onSwitching: (busy) => setSwitchingVariant(busy),
      onError: () => {
        setLoading(false);
        setLoadError('Unable to load 3D vanity model.');
      },
    });

    managerRef.current = manager;
    manager.setHotspotElements(hotspotRefs.current);

    const initialWidthOpt = WIDTH_OPTIONS.find((w) => w.id === config?.width) || WIDTH_OPTIONS[1];
    const initialModelFile = initialWidthOpt.modelFile || '/models/Everdale_31_Vanity_Interactive.glb';
    manager.loadModel(initialModelFile, config);

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.applyConfig(config);
    }
  }, [config]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && activeHotspot && onSelectHotspot) {
        onSelectHotspot(null);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeHotspot, onSelectHotspot]);

  const handleCameraPreset = (presetId) => {
    setActivePreset(presetId);
    managerRef.current?.setCameraPreset(presetId);
    if (presetId === 'drawers') {
      managerRef.current?.openLowerDrawerForInspection();
    }
  };

  useImperativeHandle(ref, () => ({
    focusPreset: (presetId, openDrawer = false) => {
      setActivePreset(presetId || 'threeQuarter');
      managerRef.current?.setCameraPreset(presetId || 'threeQuarter');
      if (openDrawer) {
        managerRef.current?.openLowerDrawerForInspection();
      }
    },
    resetCamera: () => {
      setActivePreset('threeQuarter');
      managerRef.current?.resetCamera();
    },
  }));

  const handleResetCamera = () => {
    setActivePreset('threeQuarter');
    managerRef.current?.resetCamera();
  };

  const handleSnapshot = () => {
    if (!managerRef.current) return;
    const dataUrl = managerRef.current.captureSnapshot();
    const link = document.createElement('a');
    link.download = `Everdale-${config.width}-Vanity-${config.finish}.png`;
    link.href = dataUrl;
    link.click();
    onShowToast('High-resolution PNG snapshot downloaded');
  };

  const handleToggleFullscreen = () => {
    const targetEl = fullscreenTargetRef?.current || localContainerRef.current;
    if (!targetEl) return;
    if (!document.fullscreenElement) {
      targetEl.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleHotspotClick = (hotspotId) => {
    if (!onSelectHotspot) return;
    onSelectHotspot(activeHotspot === hotspotId ? null : hotspotId);
  };

  return (
    <div
      ref={localContainerRef}
      className={`viewport-stage-layer ${isActive ? 'visible' : 'hidden'}`}
      aria-hidden={!isActive}
    >
      <div ref={hostRef} className="viewport-canvas-host" />

      <AnimatePresence>
        {loading && (
          <motion.div
            className="viewport-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
          >
            <div className="loader-brand-badge">
              <Sparkles size={13} />
              <span>Everdale Bath Studio · 3D Showroom</span>
            </div>
            <div className="loader-spinner" />
            <div className="loader-progress-track">
              <div
                className="loader-progress-bar"
                style={{ width: `${Math.max(loadPct, 20)}%` }}
              />
            </div>
            <div className="loader-label">
              Preparing {config.width}″ Interactive Showroom{loadPct > 0 ? ` (${loadPct}%)` : '…'}
            </div>
            <div className="loader-sublabel">
              Real PBR Wood &amp; Stone · Poly Haven Props · Soft Shadows
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {switchingVariant && !loading && (
        <div className="variant-switch-pill" role="status">
          Updating {config.width}″ vanity geometry…
        </div>
      )}

      {loadError && (
        <div className="viewport-loader">
          <div className="loader-label" style={{ color: '#b42318' }}>
            {loadError}
          </div>
        </div>
      )}

      {/* Projected On-Model 3D Hotspot Badges */}
      <div
        className={`hotspot-pins-layer ${showHotspots && !loading && isActive ? 'visible' : 'hidden'}`}
        aria-label="Direct 3D product hotspots"
      >
        {HOTSPOT_DEFS.map((hs) => {
          const isSelected = activeHotspot === hs.id;
          return (
            <button
              key={hs.id}
              ref={(el) => {
                hotspotRefs.current[hs.id] = el;
              }}
              type="button"
              className={`hotspot-pin-btn ${isSelected ? 'active' : ''}`}
              onClick={() => handleHotspotClick(hs.id)}
              aria-expanded={isSelected}
              aria-label={`Customize ${hs.label} directly on 3D model`}
              title={`Click to change ${hs.label}`}
            >
              <span className="hotspot-pin-dot" />
              <span className="hotspot-pin-label">{hs.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top-Left Camera Angle Presets */}
      <div className="camera-presets-bar" role="toolbar" aria-label="3D camera views">
        {CAMERA_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className={`preset-pill ${activePreset === view.id ? 'active' : ''}`}
            onClick={() => handleCameraPreset(view.id)}
            title={`Switch to ${view.label} camera angle`}
          >
            {view.label}
          </button>
        ))}
        <button
          type="button"
          className="preset-pill preset-reset"
          onClick={handleResetCamera}
          title="Reset camera framing"
          aria-label="Reset camera"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Right Edge Floating Minimal 3D Toolbar */}
      <div className="floating-toolbar" aria-label="3D Viewport Tools">
        <div className="toolbar-group">
          <button
            type="button"
            className="tool-icon-btn"
            title="Zoom in"
            aria-label="Zoom in"
            onClick={() => managerRef.current?.zoom(0.8)}
          >
            <ZoomIn size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="Zoom out"
            aria-label="Zoom out"
            onClick={() => managerRef.current?.zoom(1.25)}
          >
            <ZoomOut size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="Reset camera view"
            aria-label="Reset camera view"
            onClick={handleResetCamera}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className={`tool-icon-btn hotspot-toggle-mobile-only ${showHotspots ? 'active' : ''}`}
            title={showHotspots ? 'Hide 3D Hotspot Badges' : 'Show 3D Hotspot Badges'}
            aria-label={showHotspots ? 'Hide 3D hotspot badges' : 'Show 3D hotspot badges'}
            onClick={() => setShowHotspots((v) => !v)}
          >
            {showHotspots ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>
          <button
            type="button"
            className={`tool-icon-btn ${config.showDimensions ? 'active' : ''}`}
            title="Toggle 3D Dimension Guides"
            aria-label="Toggle 3D dimension guides"
            onClick={onToggleDimensions}
          >
            <Ruler size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="Room Atmosphere & Staging"
            aria-label="Room atmosphere settings"
            onClick={onOpenSceneSettings}
          >
            <SlidersHorizontal size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="Download PNG Snapshot"
            aria-label="Download PNG snapshot"
            onClick={handleSnapshot}
          >
            <Camera size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="Share Configuration Link"
            aria-label="Share configuration link"
            onClick={onOpenShare}
          >
            <Share2 size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title="View True-Scale AR Info"
            aria-label="View true-scale AR preview"
            onClick={onOpenAR}
          >
            <Box size={17} />
          </button>
          <button
            type="button"
            className="tool-icon-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>

      {/* Bottom Interaction Hint */}
      <div className="viewport-bottom-dock">
        <div className="viewport-hint-pill">
          Drag to rotate · Right-drag to pan · Scroll to zoom · Click drawers in 3D
        </div>
      </div>
    </div>
  );
});

export default Viewport3D;

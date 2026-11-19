import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  Camera,
  Maximize2,
  Minimize2,
  Ruler,
  Share2,
  SlidersHorizontal,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { VanitySceneManager } from '../three/VanitySceneManager';

const CAMERA_VIEWS = [
  { id: 'threeQuarter', label: '3/4 View' },
  { id: 'front', label: 'Front' },
  { id: 'top', label: 'Basin' },
  { id: 'drawers', label: 'Drawers' },
];

export default function Viewport3D({
  config,
  onToggleDimensions,
  onOpenSceneSettings,
  onOpenShare,
  onOpenAR,
  onShowToast,
}) {
  const containerRef = useRef(null);
  const hostRef = useRef(null);
  const managerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadPct, setLoadPct] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [activePreset, setActivePreset] = useState('threeQuarter');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Three.js Scene Manager once
  useEffect(() => {
    if (!hostRef.current) return;

    const manager = new VanitySceneManager(hostRef.current, {
      onLoaded: () => {
        setLoading(false);
        setLoadPct(100);
      },
      onProgress: (pct) => setLoadPct(pct),
      onError: () => {
        setLoading(false);
        setLoadError('Unable to load 3D vanity model.');
      },
    });

    managerRef.current = manager;
    manager.loadModel('/models/Everdale_31_Vanity_Interactive.glb', config);

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push configuration updates to Three.js smoothly without reloading the GLB
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.applyConfig(config);
    }
  }, [config]);

  // Listen to fullscreen state changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleCameraPreset = (presetId) => {
    setActivePreset(presetId);
    managerRef.current?.setCameraPreset(presetId);
  };

  const handleSnapshot = () => {
    if (!managerRef.current) return;
    const dataUrl = managerRef.current.captureSnapshot();
    const link = document.createElement('a');
    link.download = `Everdale-31-Vanity-${config.finish}.png`;
    link.href = dataUrl;
    link.click();
    onShowToast('High-resolution PNG snapshot saved');
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <section
      ref={containerRef}
      className="viewport-column"
      aria-label="Interactive 3D Vanity Preview"
    >
      <div ref={hostRef} className="viewport-canvas-host" />

      {/* Cinematic SaleVerse-Class Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="viewport-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          >
            <div className="loader-brand-badge">
              <Sparkles size={13} />
              <span>Everdale Bath Studio · 3D Configurator</span>
            </div>
            <div className="loader-spinner" />
            <div className="loader-progress-track">
              <div
                className="loader-progress-bar"
                style={{ width: `${Math.max(loadPct, 20)}%` }}
              />
            </div>
            <div className="loader-label">
              Loading Photorealistic Environment{loadPct > 0 ? ` (${loadPct}%)` : '…'}
            </div>
            <div className="loader-sublabel">
              HDR Studio Lighting · Soft Shadows · Real-Time Reflections
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <div className="viewport-loader">
          <div className="loader-label" style={{ color: '#b42318' }}>
            {loadError}
          </div>
        </div>
      )}

      {/* Top-Left Camera Angle Presets */}
      <div className="camera-presets-bar">
        {CAMERA_VIEWS.map((view) => (
          <motion.button
            key={view.id}
            type="button"
            className={`preset-pill ${activePreset === view.id ? 'active' : ''}`}
            onClick={() => handleCameraPreset(view.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {view.label}
          </motion.button>
        ))}
      </div>

      {/* Right Edge Floating 3D Toolbar (Matches Reference) */}
      <div className="floating-toolbar" aria-label="3D Viewport Tools">
        <div className="toolbar-group">
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="Zoom in"
            onClick={() => managerRef.current?.zoom(0.8)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ZoomIn size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="Zoom out"
            onClick={() => managerRef.current?.zoom(1.25)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ZoomOut size={18} />
          </motion.button>
        </div>

        <div className="toolbar-group">
          <motion.button
            type="button"
            className={`tool-icon-btn ${config.showDimensions ? 'active' : ''}`}
            title="Toggle 3D Dimensions"
            onClick={onToggleDimensions}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Ruler size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="Scene Settings (Walls, Floors, Lighting & Props)"
            onClick={onOpenSceneSettings}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <SlidersHorizontal size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="Take Snapshot (PNG)"
            onClick={handleSnapshot}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Camera size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="Share Configuration Link"
            onClick={onOpenShare}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Share2 size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title="View in AR (True Scale)"
            onClick={onOpenAR}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <Box size={18} />
          </motion.button>
          <motion.button
            type="button"
            className="tool-icon-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            onClick={handleToggleFullscreen}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </motion.button>
        </div>
      </div>

      {/* Bottom Viewport Interaction Hint */}
      <div className="viewport-bottom-dock">
        <div className="viewport-hint-pill">
          Drag to rotate · Scroll to zoom · Click directly on drawers to open/close
        </div>
      </div>
    </section>
  );
}

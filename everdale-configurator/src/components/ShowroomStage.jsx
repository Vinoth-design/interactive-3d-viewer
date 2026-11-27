import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Box, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, Sparkles } from 'lucide-react';
import { CatalogService } from '../catalog/index';
import Viewport3D from './Viewport3D';
import GalleryLightbox from './GalleryLightbox';

const ShowroomStage = React.forwardRef(function ShowroomStage(
  {
    config,
    activeVariant,
    activeHotspot,
    onSelectHotspot,
    onUpdateConfig,
    onToggleDimensions,
    onOpenSceneSettings,
    onOpenShare,
    onOpenAR,
    onShowToast,
  },
  ref
) {
  const stageContainerRef = useRef(null);
  const viewportRef = useRef(null);
  const touchStartX = useRef(null);

  const galleryImages = useMemo(() => {
    return CatalogService.getRenders('everdale-vanity');
  }, []);

  const [mode, setMode] = useState('3d'); // '3d' | 'gallery'
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    startAR: async (options) => {
      setMode('3d');
      return viewportRef.current?.startAR(options);
    },
    exportAR: async (format, options) => {
      setMode('3d');
      return viewportRef.current?.exportAR(format, options);
    },
  }));

  const activeImage = galleryImages[selectedIdx] || galleryImages[0];

  const handleInspectAngleIn3D = (img) => {
    setMode('3d');
    if (img) {
      viewportRef.current?.focusPreset(img.cameraPreset || 'threeQuarter', Boolean(img.openDrawer));
    }
  };

  const handlePrevImage = () => {
    setSelectedIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    setSelectedIdx((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <section className="showroom-column" aria-label="Product Showroom and Gallery">
      <div ref={stageContainerRef} className="showroom-hero-stage">
        <div className="stage-mode-toggle" role="tablist" aria-label="Showroom view mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === '3d'}
            className={`stage-mode-btn ${mode === '3d' ? 'active' : ''}`}
            onClick={() => setMode('3d')}
          >
            <Box size={14} />
            <span>Interactive 3D</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'gallery'}
            className={`stage-mode-btn ${mode === 'gallery' ? 'active' : ''}`}
            onClick={() => setMode('gallery')}
          >
            <ImageIcon size={14} />
            <span>Studio &amp; Lifestyle ({galleryImages.length})</span>
          </button>
        </div>

        <Viewport3D
          ref={viewportRef}
          config={config}
          activeVariant={activeVariant}
          isActive={mode === '3d'}
          activeHotspot={activeHotspot}
          onSelectHotspot={onSelectHotspot}
          onUpdateConfig={onUpdateConfig}
          onToggleDimensions={onToggleDimensions}
          onOpenSceneSettings={onOpenSceneSettings}
          onOpenShare={onOpenShare}
          onOpenAR={onOpenAR}
          onShowToast={onShowToast}
          fullscreenTargetRef={stageContainerRef}
        />

        {mode === 'gallery' && activeImage && (
          <div
            className="gallery-stage-layer"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(deltaX) > 40) {
                if (deltaX > 0) handlePrevImage();
                else handleNextImage();
              }
            }}
          >
            <img
              src={activeImage.path}
              alt={activeImage.caption || activeImage.title}
              className="gallery-stage-img"
              loading="eager"
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                if (activeImage.fallbackPath && e.currentTarget.src !== activeImage.fallbackPath) {
                  e.currentTarget.src = activeImage.fallbackPath;
                }
              }}
            />

            <div className="gallery-stage-overlay-top">
              <div className="gallery-source-badge">
                <Sparkles size={12} />
                <span>{activeImage.sourceLabel}</span>
                {config.width !== '31' && (
                  <span className="gallery-ref-tag"> · Shown in 31″ Reference</span>
                )}
              </div>

              <div className="gallery-stage-actions">
                <button
                  type="button"
                  className="gallery-pill-action primary"
                  onClick={() => handleInspectAngleIn3D(activeImage)}
                >
                  <Box size={14} />
                  <span>Inspect in Live 3D ({activeVariant?.label || '31″'})</span>
                </button>
                <button
                  type="button"
                  className="gallery-pill-action"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open fullscreen image lightbox"
                  title="Enlarge image"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-arrow-btn left"
                  onClick={handlePrevImage}
                  aria-label="Previous gallery image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="gallery-arrow-btn right"
                  onClick={handleNextImage}
                  aria-label="Next gallery image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="gallery-stage-caption">
              <div>
                <strong>{activeImage.title}</strong>
                <span>{activeImage.caption}</span>
              </div>
              <span className="gallery-counter">
                {selectedIdx + 1} / {galleryImages.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <GalleryLightbox
          images={galleryImages}
          activeIndex={selectedIdx}
          activeVariant={activeVariant}
          onChangeIndex={setSelectedIdx}
          onClose={() => setLightboxOpen(false)}
          onInspectIn3D={handleInspectAngleIn3D}
        />
      )}
    </section>
  );
});

export default ShowroomStage;

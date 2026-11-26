import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function GalleryLightbox({
  images,
  activeIndex,
  activeVariant,
  onChangeIndex,
  onClose,
  onInspectIn3D,
}) {
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(null);

  const activeImage = images[activeIndex] || images[0];

  const handlePrev = () => {
    setZoomed(false);
    onChangeIndex((activeIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setZoomed(false);
    onChangeIndex((activeIndex + 1) % images.length);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, images.length]);

  if (!activeImage) return null;

  return createPortal(
    <div
      className="gallery-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${activeImage.title} enlarged view`}
      onClick={onClose}
    >
      <div
        className="gallery-lightbox-shell"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(deltaX) > 40) {
            if (deltaX > 0) handlePrev();
            else handleNext();
          }
        }}
      >
        <div className="gallery-lightbox-topbar">
          <div className="gallery-lightbox-meta">
            <span className="gallery-source-pill">
              {activeImage.sourceLabel}
              {activeVariant && activeVariant.id !== '31' ? ' · Shown in 31″ Reference' : ''}
            </span>
            <span className="gallery-lightbox-title">{activeImage.title}</span>
            <span className="gallery-lightbox-count">
              {activeIndex + 1} / {images.length}
            </span>
          </div>

          <div className="gallery-lightbox-actions">
            {onInspectIn3D && (
              <button
                type="button"
                className="lightbox-action-btn primary"
                onClick={() => {
                  onInspectIn3D(activeImage);
                  onClose();
                }}
              >
                <Box size={15} />
                <span>Inspect in Live 3D</span>
              </button>
            )}
            <button
              type="button"
              className="lightbox-action-btn"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
            >
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
              <span>{zoomed ? '1× Fit' : '2× Zoom'}</span>
            </button>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={onClose}
              aria-label="Close gallery lightbox"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="gallery-lightbox-stage">
          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn left"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className={`gallery-lightbox-img-wrap ${zoomed ? 'zoomed' : ''}`}>
            <img
              src={activeImage.path}
              alt={activeImage.caption || activeImage.title}
              onClick={() => setZoomed((z) => !z)}
              onError={(e) => {
                if (activeImage.fallbackPath && e.currentTarget.src !== activeImage.fallbackPath) {
                  e.currentTarget.src = activeImage.fallbackPath;
                }
              }}
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn right"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        <div className="gallery-lightbox-footer">
          <p className="gallery-lightbox-caption">{activeImage.caption}</p>
          <div className="gallery-lightbox-thumbs" role="tablist" aria-label="Lightbox thumbnails">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={idx === activeIndex}
                className={`lightbox-thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  setZoomed(false);
                  onChangeIndex(idx);
                }}
              >
                <img src={img.path} alt={img.title} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

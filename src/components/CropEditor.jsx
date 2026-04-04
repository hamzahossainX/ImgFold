/**
 * CropEditor.jsx
 * Full-screen crop modal using react-easy-crop.
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';

export default function CropEditor({
  isOpen,
  imageUrl,
  imageName,
  crop,
  zoom,
  rotation,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onCropComplete,
  onApply,
  onCancel,
}) {
  /* Escape key closes the modal */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          {/* ── Top bar ────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-3 bg-black/40">
            <p className="text-sm text-white/80 font-medium truncate max-w-[50%]">
              ✂ {imageName || 'Crop Image'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onApply}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md transition-colors"
              >
                Apply Crop
              </motion.button>
            </div>
          </div>

          {/* ── Crop area ──────────────────────────────────── */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex-1 relative"
          >
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              onCropComplete={onCropComplete}
              showGrid
              style={{
                containerStyle: { borderRadius: 0 },
              }}
            />
          </motion.div>

          {/* ── Bottom controls ────────────────────────────── */}
          <div className="shrink-0 bg-black/50 backdrop-blur-sm px-3 sm:px-5 py-3 sm:py-4 space-y-3">
            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/50 uppercase tracking-widest w-14">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-white/70 font-mono w-10 text-right">{zoom.toFixed(1)}×</span>
            </div>

            {/* Rotation slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/50 uppercase tracking-widest w-14">Rotate</span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => onRotationChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-white/70 font-mono w-10 text-right">{rotation}°</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

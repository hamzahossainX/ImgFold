/**
 * ImageFilters.jsx
 * Real-time filter preview panel showing thumbnails with CSS filter previews.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FILTER_OPTIONS = [
  { value: 'original',      label: 'Original',      css: 'none' },
  { value: 'auto-enhance',  label: 'Auto Enhance',  css: 'contrast(1.3) saturate(1.1) brightness(1.05)' },
  { value: 'grayscale',     label: 'Grayscale',      css: 'grayscale(1)' },
  { value: 'bw',            label: 'Black & White',  css: 'grayscale(1) contrast(2)' },
  { value: 'high-contrast', label: 'High Contrast',  css: 'contrast(1.6) brightness(1.1)' },
];

export default function ImageFilters({ imageDataUrl, selectedFilter, onFilterSelect, onApplyToAll }) {
  const [loadingPreviews, setLoadingPreviews] = useState({});

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 sm:p-4 space-y-3 sm:space-y-4"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        ✦ Image Filters
      </p>

      {/* ── Preview grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterSelect(f.value)}
            className={[
              'relative rounded-lg overflow-hidden border-2 transition-all duration-150 group',
              selectedFilter === f.value
                ? 'border-brand-500 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-600 hover:border-brand-300',
            ].join(' ')}
          >
            {/* Thumbnail with CSS filter preview */}
            <div className="aspect-square relative">
              <img
                src={imageDataUrl}
                alt={f.label}
                className="w-full h-full object-cover"
                style={{ filter: f.css }}
                onLoad={() => setLoadingPreviews((p) => ({ ...p, [f.value]: false }))}
              />

              {/* Selected checkmark */}
              {selectedFilter === f.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-brand-500/20"
                >
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">
                    ✓
                  </span>
                </motion.div>
              )}
            </div>

            {/* Label */}
            <p className="text-[9px] font-medium text-center py-1 text-slate-600 dark:text-slate-300 truncate px-0.5">
              {f.label}
            </p>
          </button>
        ))}
      </div>

      {/* ── Apply to all button ───────────────────────────────── */}
      {onApplyToAll && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onApplyToAll}
          className="w-full py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40 text-brand-600 dark:text-brand-400 text-xs font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
        >
          Apply "{FILTER_OPTIONS.find((f) => f.value === selectedFilter)?.label}" to All
        </motion.button>
      )}
    </motion.div>
  );
}

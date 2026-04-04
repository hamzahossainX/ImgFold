/**
 * ScannerControls.jsx
 * Control panel shown below the camera view with capture, flip,
 * filter toggle, and clear buttons.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = [
  { value: 'original',      label: 'Original' },
  { value: 'auto-enhance',  label: 'Auto Enhance' },
  { value: 'grayscale',     label: 'Grayscale' },
  { value: 'bw',            label: 'Black & White' },
  { value: 'high-contrast', label: 'High Contrast' },
];

export default function ScannerControls({
  capturedCount,
  isStreaming,
  selectedFilter,
  showFilters,
  onCapture,
  onFlipCamera,
  onToggleFilters,
  onClearAll,
  onFilterSelect,
}) {
  return (
    <div className="space-y-3">
      {/* ── Main control row ─────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {/* Flip camera (mobile only) */}
        <motion.button
          whileTap={{ rotate: 180 }}
          onClick={onFlipCamera}
          className="lg:hidden w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors active:bg-slate-400"
          aria-label="Flip camera"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
            <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
            <polyline points="16 3 18 5 16 7" />
            <polyline points="8 21 6 19 8 17" />
          </svg>
        </motion.button>

        {/* Capture button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCapture}
          disabled={!isStreaming}
          className={[
            'relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200',
            isStreaming
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 capture-pulse'
              : 'bg-slate-300 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed',
          ].join(' ')}
          aria-label="Capture photo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
          </svg>
        </motion.button>

        {/* Filter toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFilters}
          className={[
            'w-14 h-14 rounded-full flex items-center justify-center transition-colors',
            showFilters
              ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600',
          ].join(' ')}
          aria-label="Toggle filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </motion.button>
      </div>

      {/* ── Filter chips panel ───────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-2 px-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
              {FILTERS.map((f) => (
                <motion.button
                  key={f.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onFilterSelect(f.value)}
                  className={[
                    'px-3 py-2 sm:py-1.5 rounded-full text-xs font-medium border transition-all duration-150 shrink-0 snap-start',
                    selectedFilter === f.value
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-brand-400',
                  ].join(' ')}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clear all button ─────────────────────────────────── */}
      <AnimatePresence>
        {capturedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex justify-center"
          >
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              ✕ Clear all {capturedCount} capture{capturedCount !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

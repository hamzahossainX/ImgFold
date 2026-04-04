/**
 * ImageUploader.jsx
 * Animated drag-and-drop upload area. Collapses to a compact strip when
 * images already exist (so the grid has more room).
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACCEPTED_TYPES } from '../utils/imageUtils.js';

/* ── SVG Icons ─────────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect x="2" y="2" width="40" height="40" rx="12"
      stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4"/>
    <path d="M22 28V16M14 22l8-8 8 8" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 33h16" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────── */

export default function ImageUploader({ onFiles, hasImages }) {
  const inputRef   = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rejected,   setRejected]   = useState(false); // flash on bad file type

  /* ── Drag handlers ──────────────────────────────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    const hasValid = Array.from(files).some((f) => ACCEPTED_TYPES.has(f.type));

    if (!hasValid) {
      // Flash rejection indicator
      setRejected(true);
      setTimeout(() => setRejected(false), 1200);
      return;
    }
    onFiles(files);
  }, [onFiles]);

  /* ── File input change ──────────────────────────────────────────── */
  const handleInputChange = useCallback((e) => {
    if (e.target.files?.length) {
      onFiles(e.target.files);
      e.target.value = ''; // reset so same file can be re-selected
    }
  }, [onFiles]);

  const openPicker = () => inputRef.current?.click();

  /* ── Compact strip (when images already loaded) ─────────────────── */
  if (hasImages) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className={[
          'flex items-center justify-between gap-3 px-4 py-3 rounded-xl',
          'border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isDragging ? '✦ Drop images here' : 'Drop more images or'}
        </p>
        <button
          onClick={openPicker}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
        >
          <PlusIcon />
          Add more
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          hidden
          onChange={handleInputChange}
        />
      </motion.div>
    );
  }

  /* ── Full upload zone ────────────────────────────────────────────── */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        aria-label="Drop images here or click to upload"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
        animate={{
          scale:       isDragging ? 1.015 : 1,
          borderColor: rejected
            ? '#ef4444'
            : isDragging
            ? '#14b8a6'
            : undefined,
        }}
        transition={{ duration: 0.18 }}
        className={[
          'relative flex flex-col items-center justify-center gap-4',
          'min-h-[260px] rounded-2xl cursor-pointer border-2 border-dashed',
          'transition-all duration-200',
          isDragging
            ? 'border-brand-400 bg-brand-50/80 dark:bg-brand-900/20'
            : rejected
            ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10',
        ].join(' ')}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30 dark:opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{ y: isDragging ? -6 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`${isDragging ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'} transition-colors duration-200`}
        >
          <UploadIcon />
        </motion.div>

        {/* Text */}
        <div className="text-center z-10 pointer-events-none select-none">
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.p
                key="dropping"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-lg font-semibold text-brand-600 dark:text-brand-400 font-poppins"
              >
                Release to upload
              </motion.p>
            ) : rejected ? (
              <motion.p
                key="rejected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-base font-semibold text-red-500 font-poppins"
              >
                Only JPG and PNG supported
              </motion.p>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-base font-semibold text-slate-700 dark:text-slate-200 font-poppins mb-1">
                  Drop images here
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  JPG, JPEG, PNG — or{' '}
                  <span className="text-brand-500 font-medium underline underline-offset-2">
                    browse files
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Supported formats */}
        <div className="flex items-center gap-2 z-10 pointer-events-none">
          {['JPG', 'JPEG', 'PNG'].map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide"
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          hidden
          onChange={handleInputChange}
        />
      </motion.div>
    </motion.div>
  );
}

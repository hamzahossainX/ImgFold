/**
 * SortableImageCard.jsx
 * A single draggable image card using @dnd-kit/sortable.
 * Shows thumbnail, order badge, file info, and hover-reveal actions.
 */

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Icons ─────────────────────────────────────────────────────────── */
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

const ZoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const GripIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="9"  cy="5"  r="1" fill="currentColor"/>
    <circle cx="15" cy="5"  r="1" fill="currentColor"/>
    <circle cx="9"  cy="12" r="1" fill="currentColor"/>
    <circle cx="15" cy="12" r="1" fill="currentColor"/>
    <circle cx="9"  cy="19" r="1" fill="currentColor"/>
    <circle cx="15" cy="19" r="1" fill="currentColor"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────── */

export default function SortableImageCard({ image, index, onRemove }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  /* dnd-kit provides a CSS transform string for the drag animation */
  const style = {
    transform:  CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex:     isDragging ? 50 : 'auto',
  };

  return (
    <>
      {/* ── Card wrapper (dnd-kit ref + style) ── */}
      <div ref={setNodeRef} style={style} className="relative">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{
            opacity: isDragging ? 0.45 : 1,
            scale:   isDragging ? 1.04  : 1,
          }}
          exit={{ opacity: 0, scale: 0.8, y: -8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className={[
            'group relative rounded-xl overflow-hidden select-none',
            'border-2 transition-all duration-150',
            isDragging
              ? 'border-brand-400 shadow-2xl shadow-brand-500/20 ring-2 ring-brand-400/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md',
            'bg-white dark:bg-slate-800',
          ].join(' ')}
        >
          {/* ── Order badge ── */}
          <span className="absolute top-2 left-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold font-poppins shadow">
            {index + 1}
          </span>

          {/* ── Drag handle (top-right) ── */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-white/80 dark:bg-slate-700/80 text-slate-400 dark:text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity duration-150 hover:bg-white dark:hover:bg-slate-700"
            title="Drag to reorder"
          >
            <GripIcon />
          </div>

          {/* ── Thumbnail ── */}
          <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
            <motion.img
              src={image.dataUrl}
              alt={image.name}
              loading="lazy"
              draggable={false}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>

          {/* ── Hover action overlay ── */}
          <div className="absolute inset-0 top-auto bottom-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
            <div className="w-full flex gap-1.5 p-2 bg-gradient-to-t from-black/60 to-transparent">
              {/* Preview button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setPreviewOpen(true)}
                title="Preview"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-sm transition-colors"
              >
                <ZoomIcon />
                <span className="hidden sm:inline">Preview</span>
              </motion.button>

              {/* Remove button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => onRemove(image.id)}
                title="Remove"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium backdrop-blur-sm transition-colors"
              >
                <TrashIcon />
                <span className="hidden sm:inline">Remove</span>
              </motion.button>
            </div>
          </div>

          {/* ── Footer: filename + size ── */}
          <div className="px-2.5 py-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700">
            <p
              className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate"
              title={image.name}
            >
              {image.name}
            </p>
            <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
              {image.size}
            </span>
          </div>

          {/* ── Dimension tag ── */}
          <div className="absolute top-2 left-8 right-10">
            <span className="hidden group-hover:inline-block text-[9px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">
              {image.width} × {image.height}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Full-screen preview modal ── */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.88,    opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl"
            >
              <img
                src={image.dataUrl}
                alt={image.name}
                className="block max-w-[88vw] max-h-[82vh] object-contain"
              />
              <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate">
                  {image.name}
                </p>
                <p className="shrink-0 text-xs text-slate-400">
                  {image.width} × {image.height} • {image.size}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

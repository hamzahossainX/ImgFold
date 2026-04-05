/**
 * PDFPreview.jsx
 * Full-featured PDF preview modal with zoom, page navigation, thumbnails,
 * keyboard shortcuts, and responsive design.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePDFPreview } from '../hooks/usePDFPreview';

/* ── Helper: format bytes to KB / MB ─────────────────────────────────── */
function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/* ── Icons ───────────────────────────────────────────────────────────── */
const EyeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronLeft = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const SpinnerSVG = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
  </svg>
);

/* ── Main Component ─────────────────────────────────────────────────── */

export default function PDFPreview({ pdfBytes, pdfName, pageCount: propPageCount, onDownload }) {
  const {
    isOpen,
    currentPage,
    zoomLevel,
    blobUrl,
    isLoading,
    error: previewError,
    pageCount,
    filename,
    openPreview,
    closePreview,
    nextPage,
    prevPage,
    goToPage,
    zoomIn,
    zoomOut,
    getZoomPercent,
  } = usePDFPreview();

  const thumbnailStripRef = useRef(null);

  const zoom = zoomLevel * 100;
  const fileSize = pdfBytes ? formatFileSize(pdfBytes.byteLength) : '';

  /* ── Open ────────────────────────────────────────────────────────── */
  const handleOpen = () => {
    if (pdfBytes) {
      openPreview(pdfBytes, pdfName, propPageCount);
    }
  };

  /* ── Download & close ────────────────────────────────────────────── */
  const handleDownloadAndClose = () => {
    if (onDownload) onDownload();
    closePreview();
  };

  /* ── Keyboard shortcuts ──────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closePreview();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          handleDownloadAndClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, closePreview, prevPage, nextPage, zoomIn, zoomOut]);

  /* ── Scroll active thumbnail into view ──────────────────────────── */
  useEffect(() => {
    if (!thumbnailStripRef.current) return;
    const active = thumbnailStripRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentPage]);

  /* ── Build iframe src with page hash ─────────────────────────────── */
  // +1 because pdf fragment #page= is 1-based but our currentPage is 0-based
  const iframeSrc = blobUrl ? `${blobUrl}#page=${currentPage + 1}` : '';

  const isDisabled = !pdfBytes;

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Preview Button ── */}
      <motion.button
        whileTap={!isDisabled ? { scale: 0.97 } : {}}
        whileHover={!isDisabled ? { scale: 1.01 } : {}}
        onClick={handleOpen}
        disabled={isDisabled}
        title={isDisabled ? 'Generate PDF first to preview' : 'Preview PDF'}
        className={[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm font-poppins transition-all duration-200 border-2',
          isDisabled
            ? 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
            : 'border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20',
        ].join(' ')}
        aria-label={isDisabled ? 'Generate PDF first to preview' : 'Preview PDF'}
      >
        <EyeIcon size={16} />
        <span>Preview</span>
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="pdf-preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-4"
            style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) closePreview(); }}
          >
            {/* ── Modal Container ── */}
            <motion.div
              key="pdf-preview-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl w-[95vw] md:w-[90vw] max-w-[900px]"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >

              {/* ── HEADER ── */}
              <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                {/* Left: icon + title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                    <EyeIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 font-poppins">
                      PDF Preview
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {filename}.pdf{pageCount > 0 ? ` • ${pageCount} page${pageCount !== 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                </div>

                {/* Right: zoom controls + close */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Zoom controls — hidden on small screens */}
                  <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-1 py-0.5">
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 0.5}
                      className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Zoom out"
                    >
                      <ZoomOutIcon />
                    </button>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-12 text-center tabular-nums">
                      {getZoomPercent()}
                    </span>
                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 2.0}
                      className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Zoom in"
                    >
                      <ZoomInIcon />
                    </button>
                  </div>

                  {/* Separator — hidden on small screens */}
                  <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

                  {/* Close button */}
                  <button
                    onClick={closePreview}
                    className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    aria-label="Close preview"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>

              {/* ── PAGE NAVIGATION BAR ── */}
              {pageCount > 1 && (
                <div className="shrink-0 border-b border-slate-200 dark:border-slate-700">
                  {/* Nav arrows + page indicator */}
                  <div className="flex items-center justify-center gap-3 px-4 py-2">
                    <motion.button
                      whileTap={currentPage > 0 ? { scale: 0.9 } : {}}
                      onClick={prevPage}
                      disabled={currentPage === 0}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={22} />
                    </motion.button>

                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentPage}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-medium text-slate-700 dark:text-slate-200 tabular-nums"
                      >
                        Page {currentPage + 1} of {pageCount}
                      </motion.span>
                    </AnimatePresence>

                    <motion.button
                      whileTap={currentPage < pageCount - 1 ? { scale: 0.9 } : {}}
                      onClick={nextPage}
                      disabled={currentPage === pageCount - 1}
                      className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight size={22} />
                    </motion.button>
                  </div>

                  {/* Thumbnail strip — hidden on mobile */}
                  <div
                    ref={thumbnailStripRef}
                    className="hidden md:flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-thin"
                    style={{ maxHeight: 80 }}
                  >
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <button
                        key={i}
                        data-active={i === currentPage}
                        onClick={() => goToPage(i)}
                        className={[
                          'shrink-0 w-12 h-[60px] rounded-md border-2 flex items-center justify-center text-xs font-semibold transition-all duration-150',
                          i === currentPage
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500',
                        ].join(' ')}
                        aria-label={`Go to page ${i + 1}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PDF DISPLAY AREA ── */}
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 flex items-start justify-center p-2 sm:p-4"
                   style={{ minHeight: 200 }}>
                {isLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
                    <SpinnerSVG />
                    <span className="text-sm">Loading preview…</span>
                  </div>
                )}

                {previewError && !isLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
                    <ErrorIcon />
                    <span className="text-sm font-medium">{previewError}</span>
                    <button
                      onClick={handleDownloadAndClose}
                      className="mt-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors"
                    >
                      Download instead
                    </button>
                  </div>
                )}

                {!isLoading && !previewError && blobUrl && (
                  <iframe
                    src={iframeSrc}
                    title="PDF Preview"
                    className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 bg-white transition-all duration-300"
                    style={{
                      width: `${zoom}%`,
                      height: `${Math.max(300, (zoomLevel) * 600)}px`,
                      border: 'none',
                      minHeight: 300,
                    }}
                  />
                )}
              </div>

              {/* ── FOOTER ── */}
              <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                {/* Left: file info */}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  📄 {pageCount} page{pageCount !== 1 ? 's' : ''} • {fileSize}
                </span>

                {/* Right: buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={closePreview}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownloadAndClose}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200"
                  >
                    <DownloadIcon />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

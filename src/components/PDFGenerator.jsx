/**
 * PDFGenerator.jsx
 * Bottom action bar: shows generate button, progress bar, and download button.
 * The download button is disabled until a PDF is ready.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar.jsx';
import PDFPreview from './PDFPreview.jsx';

/* ── Icons ─────────────────────────────────────────────────────────── */
const GenerateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9"  y1="15" x2="15" y2="15"/>
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

const SpinnerIcon = () => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className="animate-spin"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────── */

export default function PDFGenerator({
  imageCount,
  isGenerating,
  progress,
  pdfReady,
  pdfBytes,
  error,
  pdfName,
  onGenerate,
  onDownload,
}) {
  const canGenerate = imageCount > 0 && !isGenerating;

  return (
    <div className="space-y-3">
      {/* Progress bar — visible while generating */}
      <ProgressBar
        isVisible={isGenerating || (progress > 0 && progress < 100)}
        progress={progress}
        label={`Processing image ${Math.ceil((progress / 85) * imageCount)} of ${imageCount}…`}
      />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs"
          >
            <AlertIcon />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons row */}
      <div className="flex items-center gap-3">

        {/* ── Generate button ── */}
        <motion.button
          whileTap={canGenerate ? { scale: 0.97 } : {}}
          whileHover={canGenerate ? { scale: 1.01 } : {}}
          onClick={onGenerate}
          disabled={!canGenerate}
          className={[
            'flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm font-poppins transition-all duration-200',
            canGenerate
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35'
              : imageCount === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              : 'bg-brand-300 dark:bg-brand-900/50 text-brand-100 cursor-not-allowed',
          ].join(' ')}
          aria-label={
            imageCount === 0
              ? 'Upload images first'
              : isGenerating
              ? 'Generating PDF…'
              : 'Generate PDF'
          }
        >
          {isGenerating ? (
            <>
              <SpinnerIcon />
              Generating…
            </>
          ) : (
            <>
              <GenerateIcon />
              Generate PDF
              {imageCount > 0 && (
                <span className="ml-0.5 text-brand-200 text-xs font-normal">
                  ({imageCount} image{imageCount !== 1 ? 's' : ''})
                </span>
              )}
            </>
          )}
        </motion.button>

        {/* ── Download button — only shown when PDF is ready ── */}
        <AnimatePresence>
          {pdfReady && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85, x: 10 }}
              animate={{ opacity: 1, scale: 1,    x: 0  }}
              exit={{ opacity: 0, scale: 0.85, x: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={onDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm font-poppins shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200"
              aria-label={`Download ${pdfName || 'converted'}.pdf`}
            >
              <DownloadIcon />
              <span>Download</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Preview button ── */}
        <PDFPreview
          pdfBytes={pdfBytes}
          pdfName={pdfName}
          pageCount={imageCount}
          onDownload={onDownload}
        />
      </div>

      {/* Success status */}
      <AnimatePresence>
        {pdfReady && !isGenerating && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <CheckIcon />
            PDF ready — click Download to save{' '}
            <strong className="font-semibold">
              {pdfName || 'converted'}.pdf
            </strong>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Idle hint */}
      {imageCount === 0 && !isGenerating && (
        <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
          Upload at least one image to get started.
        </p>
      )}
    </div>
  );
}

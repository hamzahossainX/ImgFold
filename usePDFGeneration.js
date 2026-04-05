/**
 * usePDFGeneration.js
 * Custom hook that encapsulates all PDF generation state and logic.
 * Keeps App.jsx clean of generation internals.
 */

import { useState, useCallback } from 'react';
import { generatePDF, downloadPDF } from '../utils/pdfUtils';

/**
 * @typedef {Object} PDFGenerationState
 * @property {boolean}    isGenerating - True while the PDF is being built
 * @property {number}     progress     - 0–100 completion percentage
 * @property {Uint8Array|null} pdfBytes - Raw PDF bytes once ready
 * @property {string|null}    error    - Error message if generation failed
 * @property {Function}   generate     - (images, settings) => Promise<void>
 * @property {Function}   download     - (filename: string) => void
 * @property {Function}   reset        - Clear pdf / error state
 */

/**
 * @returns {PDFGenerationState}
 */
export function usePDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [pdfBytes,     setPdfBytes]     = useState(null);
  const [error,        setError]        = useState(null);

  /**
   * Generate a PDF from the given images with the given settings.
   * Updates progress state during generation.
   */
  const generate = useCallback(async (images, settings) => {
    if (!images.length) return;

    setIsGenerating(true);
    setProgress(0);
    setPdfBytes(null);
    setError(null);

    try {
      const bytes = await generatePDF(images, settings, setProgress);
      setPdfBytes(bytes);
    } catch (err) {
      console.error('[usePDFGeneration] Error:', err);
      setError(err?.message || 'PDF generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Trigger browser download of the generated PDF.
   * No-op if pdfBytes is null.
   */
  const download = useCallback(
    (filename) => {
      if (!pdfBytes) return;
      downloadPDF(pdfBytes, filename);
    },
    [pdfBytes]
  );

  /**
   * Reset generation state (call when images change or settings change).
   */
  const reset = useCallback(() => {
    setPdfBytes(null);
    setProgress(0);
    setError(null);
  }, []);

  return { isGenerating, progress, pdfBytes, error, generate, download, reset };
}

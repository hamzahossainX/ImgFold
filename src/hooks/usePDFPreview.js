/**
 * usePDFPreview.js
 * Custom hook to manage PDF preview modal state:
 * blob URL lifecycle, page navigation, and zoom levels.
 */

import { useState, useCallback } from 'react';

const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function usePDFPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 0-based index
  const [zoomLevel, setZoomLevel] = useState(1.0); // 0.5 to 2.0
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [filename, setFilename] = useState('');

  const openPreview = useCallback((pdfBytes, newFilename, newPageCount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setBlobUrl(url);
      setPageCount(newPageCount);
      setFilename(newFilename || 'converted');
      setIsLoading(false);
      setIsOpen(true);
      setCurrentPage(0);
      setZoomLevel(1.0);
    } catch (err) {
      console.error('[usePDFPreview] Error:', err);
      setError(err.message || 'Failed to create PDF preview.');
      setIsLoading(false);
    }
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    setBlobUrl(null);
    setCurrentPage(0);
    setPageCount(0);
    setZoomLevel(1.0);
    setError(null);
    setFilename('');
  }, [blobUrl]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < pageCount - 1 ? prev + 1 : prev));
  }, [pageCount]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToPage = useCallback((index) => {
    if (index >= 0 && index < pageCount) {
      setCurrentPage(index);
    }
  }, [pageCount]);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const currentIndex = ZOOM_PRESETS.indexOf(prev);
      if (currentIndex === -1) {
        const next = ZOOM_PRESETS.find(z => z > prev);
        return next || ZOOM_PRESETS[ZOOM_PRESETS.length - 1];
      }
      if (currentIndex < ZOOM_PRESETS.length - 1) {
        return ZOOM_PRESETS[currentIndex + 1];
      }
      return prev;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const currentIndex = ZOOM_PRESETS.indexOf(prev);
      if (currentIndex === -1) {
        const prevValues = [...ZOOM_PRESETS].reverse().find(z => z < prev);
        return prevValues || ZOOM_PRESETS[0];
      }
      if (currentIndex > 0) {
        return ZOOM_PRESETS[currentIndex - 1];
      }
      return prev;
    });
  }, []);

  const getZoomPercent = useCallback(() => {
    return `${Math.round(zoomLevel * 100)}%`;
  }, [zoomLevel]);

  return {
    isOpen,
    currentPage,
    zoomLevel,
    blobUrl,
    isLoading,
    error,
    pageCount,
    filename,
    openPreview,
    closePreview,
    nextPage,
    prevPage,
    goToPage,
    zoomIn,
    zoomOut,
    getZoomPercent
  };
}

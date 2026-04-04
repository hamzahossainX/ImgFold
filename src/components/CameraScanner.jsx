/**
 * CameraScanner.jsx
 * Main camera scanner component — live feed, capture, filters, crop, and export.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';

import ScannerControls from './ScannerControls.jsx';
import ImageFilters    from './ImageFilters.jsx';
import CropEditor      from './CropEditor.jsx';

import { useCamera }    from '../hooks/useCamera.js';
import { useImageCrop } from '../hooks/useImageCrop.js';

import { applyDocumentScan, resizeForPDF } from '../utils/scannerUtils.js';
import {
  applyGrayscale,
  applyAutoEnhance,
  applyBlackAndWhite,
  applyContrast,
} from '../utils/filterUtils.js';
import { uid, getImageDimensions, formatBytes } from '../utils/imageUtils.js';

/* ── Apply selected filter to a dataUrl ───────────────────────────── */
async function runFilter(dataUrl, filterName) {
  switch (filterName) {
    case 'auto-enhance':  return applyAutoEnhance(dataUrl);
    case 'grayscale':     return applyGrayscale(dataUrl);
    case 'bw':            return applyBlackAndWhite(dataUrl);
    case 'high-contrast': return applyContrast(dataUrl, 60);
    default:              return dataUrl;
  }
}

export default function CameraScanner({ onImagesReady, onSwitchTab }) {
  const webcamRef = useRef(null);
  const {
    isStreaming, isCameraSupported, facingMode,
    capturedImages, setCapturedImages, error,
    startCamera, stopCamera, toggleFacingMode,
    removeCapture, clearCaptures,
  } = useCamera();

  const cropHook = useImageCrop();

  const [selectedFilter, setSelectedFilter] = useState('original');
  const [showFilters, setShowFilters]       = useState(false);
  const [autoEnhance, setAutoEnhance]       = useState(true);
  const [hdQuality, setHdQuality]           = useState(true);
  const [cropIndex, setCropIndex]           = useState(-1);
  const [showFilterPanel, setShowFilterPanel] = useState(-1);
  const [processing, setProcessing]         = useState(false);

  /* Start camera on mount */
  useEffect(() => {
    if (isCameraSupported) startCamera();
    return () => stopCamera();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  /* Restart camera when facingMode changes */
  useEffect(() => {
    if (isCameraSupported && isStreaming) {
      stopCamera();
      const t = setTimeout(startCamera, 200);
      return () => clearTimeout(t);
    }
  }, [facingMode]);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Capture handler ────────────────────────────────────────────── */
  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    const raw = webcamRef.current.getScreenshot();
    if (!raw) return;

    setProcessing(true);
    try {
      let processed = raw;
      if (autoEnhance) processed = await applyDocumentScan(processed);
      if (selectedFilter !== 'original') processed = await runFilter(processed, selectedFilter);
      if (hdQuality) processed = await resizeForPDF(processed);
      setCapturedImages((prev) => [...prev, processed]);
    } finally {
      setProcessing(false);
    }
  }, [autoEnhance, selectedFilter, hdQuality, setCapturedImages]);

  /* ── Crop handlers ──────────────────────────────────────────────── */
  const openCropForIndex = (idx) => {
    setCropIndex(idx);
    cropHook.openCrop(capturedImages[idx]);
  };

  const handleCropApply = async () => {
    const result = await cropHook.applyCrop();
    if (result && cropIndex >= 0) {
      setCapturedImages((prev) => prev.map((img, i) => (i === cropIndex ? result : img)));
    }
    setCropIndex(-1);
  };

  /* ── Filter apply to single image ───────────────────────────────── */
  const applyFilterToIndex = async (idx, filterName) => {
    const result = await runFilter(capturedImages[idx], filterName);
    setCapturedImages((prev) => prev.map((img, i) => (i === idx ? result : img)));
    setShowFilterPanel(-1);
  };

  /* ── Apply filter to all images ─────────────────────────────────── */
  const applyFilterToAll = async () => {
    setProcessing(true);
    try {
      const processed = await Promise.all(capturedImages.map((img) => runFilter(img, selectedFilter)));
      setCapturedImages(processed);
    } finally {
      setProcessing(false);
      setShowFilterPanel(-1);
    }
  };

  /* ── Send images to main app ────────────────────────────────────── */
  const handleUseImages = useCallback(async () => {
    if (capturedImages.length === 0) return;
    setProcessing(true);
    try {
      const images = await Promise.all(
        capturedImages.map(async (dataUrl, i) => {
          const { width, height } = await getImageDimensions(dataUrl);
          // estimate size from dataUrl length
          const sizeEstimate = Math.round((dataUrl.length * 3) / 4);
          return {
            id:      uid(),
            file:    new File([], `scan-${i + 1}.jpg`, { type: 'image/jpeg' }),
            dataUrl,
            name:    `scan-${i + 1}.jpg`,
            size:    formatBytes(sizeEstimate),
            width,
            height,
          };
        })
      );
      onImagesReady(images);
      clearCaptures();
      onSwitchTab();
    } finally {
      setProcessing(false);
    }
  }, [capturedImages, onImagesReady, onSwitchTab, clearCaptures]);

  /* ── Camera not supported ───────────────────────────────────────── */
  if (!isCameraSupported) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-600">
          <path d="M16.5 3.5h-9L5 7H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V9a2 2 0 00-2-2h-2l-2.5-3.5z"
            strokeLinecap="round" strokeLinejoin="round" />
          <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
        </svg>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Camera not available</p>
        <button
          onClick={onSwitchTab}
          className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          Upload images instead
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Camera view ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-h-[420px]">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-sm text-red-300 max-w-xs">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }}
              className="w-full h-full object-cover"
            />

            {/* Corner brackets */}
            <div className="camera-corner camera-corner-tl" />
            <div className="camera-corner camera-corner-tr" />
            <div className="camera-corner camera-corner-bl" />
            <div className="camera-corner camera-corner-br" />

            {/* Scanning line */}
            <div className="scan-line" />

            {/* Label */}
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/70 font-medium">
                Align document within frame
              </span>
            </div>

            {/* Processing overlay */}
            <AnimatePresence>
              {processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center"
                >
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── Scan quality toggles ────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-center">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={autoEnhance}
            onChange={(e) => setAutoEnhance(e.target.checked)}
            className="accent-brand-500 w-3.5 h-3.5"
          />
          Auto Document Enhance
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={hdQuality}
            onChange={(e) => setHdQuality(e.target.checked)}
            className="accent-brand-500 w-3.5 h-3.5"
          />
          HD Quality
        </label>
      </div>

      {/* ── Scanner controls ────────────────────────────────────── */}
      <ScannerControls
        capturedCount={capturedImages.length}
        isStreaming={!error}
        selectedFilter={selectedFilter}
        showFilters={showFilters}
        onCapture={handleCapture}
        onFlipCamera={toggleFacingMode}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onClearAll={clearCaptures}
        onFilterSelect={setSelectedFilter}
      />

      {/* ── Captured images strip ───────────────────────────────── */}
      <AnimatePresence>
        {capturedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {capturedImages.length} Captured
            </p>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {capturedImages.map((img, idx) => (
                <div key={idx} className="relative shrink-0 group">
                  <img
                    src={img}
                    alt={`Scan ${idx + 1}`}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                  {/* Order badge */}
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                    {idx + 1}
                  </span>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {/* Crop */}
                    <button
                      onClick={() => openCropForIndex(idx)}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs"
                      title="Crop"
                    >✂</button>
                    {/* Filter */}
                    <button
                      onClick={() => setShowFilterPanel(showFilterPanel === idx ? -1 : idx)}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xs"
                      title="Filter"
                    >◐</button>
                    {/* Remove */}
                    <button
                      onClick={() => removeCapture(idx)}
                      className="w-7 h-7 rounded-full bg-red-500/60 hover:bg-red-500/80 flex items-center justify-center text-white text-xs"
                      title="Remove"
                    >✕</button>
                  </div>
                </div>
              ))}

              {/* Add more placeholder */}
              <button
                onClick={handleCapture}
                className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
              >
                <span className="text-2xl leading-none">+</span>
              </button>
            </div>

            {/* Per-image filter panel */}
            <AnimatePresence>
              {showFilterPanel >= 0 && showFilterPanel < capturedImages.length && (
                <ImageFilters
                  imageDataUrl={capturedImages[showFilterPanel]}
                  selectedFilter={selectedFilter}
                  onFilterSelect={(f) => applyFilterToIndex(showFilterPanel, f)}
                  onApplyToAll={applyFilterToAll}
                />
              )}
            </AnimatePresence>

            {/* Use these images button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleUseImages}
              disabled={processing}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all"
            >
              {processing ? 'Processing…' : `Use ${capturedImages.length} Image${capturedImages.length !== 1 ? 's' : ''} →`}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Crop editor modal ───────────────────────────────────── */}
      <CropEditor
        isOpen={cropHook.isCropping}
        imageUrl={cropHook.imageToEdit}
        imageName={cropIndex >= 0 ? `Scan ${cropIndex + 1}` : ''}
        crop={cropHook.crop}
        zoom={cropHook.zoom}
        rotation={cropHook.rotation}
        onCropChange={cropHook.setCrop}
        onZoomChange={cropHook.setZoom}
        onRotationChange={cropHook.setRotation}
        onCropComplete={cropHook.onCropComplete}
        onApply={handleCropApply}
        onCancel={cropHook.closeCrop}
      />
    </div>
  );
}

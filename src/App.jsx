// Root component — manages all application state
/**
 * App.jsx
 * Root component. Manages all application state and composes the layout.
 * Layout: sticky Header → left ControlsPanel + right (Uploader + Grid + Generator)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import Header           from './components/Header.jsx';
import ImageUploader    from './components/ImageUploader.jsx';
import ImagePreviewGrid from './components/ImagePreviewGrid.jsx';
import ControlsPanel    from './components/ControlsPanel.jsx';
import PDFGenerator     from './components/PDFGenerator.jsx';
import PDFPreview       from './components/PDFPreview.jsx';
import TabSwitcher      from './components/TabSwitcher.jsx';
import CameraScanner    from './components/CameraScanner.jsx';
import CropEditor       from './components/CropEditor.jsx';

import { useImageCrop }  from './hooks/useImageCrop.js';
import { usePDFPreview } from './hooks/usePDFPreview.js';

import { usePDFGeneration } from './hooks/usePDFGeneration.js';
import {
  readFileAsDataUrl,
  getImageDimensions,
  uid,
  ACCEPTED_TYPES,
  formatBytes,
} from './utils/imageUtils.js';

/* ── Default settings ───────────────────────────────────────────────── */
const DEFAULT_SETTINGS = {
  pdfName:     'converted',
  sizeMode:    'auto',       // 'auto' | 'a4' | 'letter'
  orientation: 'portrait',   // 'portrait' | 'landscape'
  fit:         'contain',    // 'contain' | 'fill'
  margin:      20,           // PDF points (0–60)
  compression: 0.85,         // JPEG quality (0.1–1.0)
};

/* ── Font-size class map ─────────────────────────────────────────────── */
const FONT_SIZE_CLASS = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

/* ─────────────────────────────────────────────────────────────────────── */

export default function App() {
  // Image list: [{id, file, dataUrl, name, size, width, height}]
  const [images,   setImages]   = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDark,   setIsDark]   = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [fontSize, setFontSize] = useState('md');
  const [activeTab, setActiveTab] = useState('upload');

  const { isGenerating, progress, pdfBytes, error, generate, download, reset } =
    usePDFGeneration();

  const {
    isOpen: previewOpen,
    currentPage,
    zoomLevel,
    blobUrl,
    isLoading: previewLoading,
    pageCount: previewPageCount,
    openPreview,
    closePreview,
    nextPage,
    prevPage,
    goToPage,
    zoomIn,
    zoomOut,
    getZoomPercent
  } = usePDFPreview();

  const cropHook = useImageCrop();
  const [cropTargetId, setCropTargetId] = useState(null);

  /* Sync dark-mode class on <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  /* ── File ingestion ─────────────────────────────────────────────── */
  const handleFiles = useCallback(
    async (files) => {
      const validFiles = Array.from(files).filter((f) => ACCEPTED_TYPES.has(f.type));
      if (!validFiles.length) return;

      // Read all files concurrently
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const dataUrl            = await readFileAsDataUrl(file);
          const { width, height }  = await getImageDimensions(dataUrl);
          return {
            id:     uid(),
            file,
            dataUrl,
            name:   file.name,
            size:   formatBytes(file.size),
            width,
            height,
          };
        })
      );

      setImages((prev) => [...prev, ...newImages]);
      reset(); // clear stale PDF when list changes
    },
    [reset]
  );

  /* ── Remove a single image ──────────────────────────────────────── */
  const handleRemove = useCallback(
    (id) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
      reset();
    },
    [reset]
  );

  /* ── Reorder (from @dnd-kit arrayMove) ─────────────────────────── */
  const handleReorder = useCallback(
    (newOrder) => {
      setImages(newOrder);
      reset();
    },
    [reset]
  );

  /* ── Scanned images from camera ────────────────────────────────── */
  const handleScannedImages = useCallback(
    (scannedImages) => {
      setImages((prev) => [...prev, ...scannedImages]);
      reset();
      setActiveTab('upload');
    },
    [reset]
  );

  /* ── Crop an existing image ────────────────────────────────────── */
  const handleCropOpen = useCallback((id) => {
    const img = images.find((i) => i.id === id);
    if (img) {
      setCropTargetId(id);
      cropHook.openCrop(img.dataUrl);
    }
  }, [images, cropHook]);

  const handleCropApply = useCallback(async () => {
    const result = await cropHook.applyCrop();
    if (result && cropTargetId) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === cropTargetId ? { ...img, dataUrl: result } : img
        )
      );
      reset();
    }
    setCropTargetId(null);
  }, [cropHook, cropTargetId, reset]);

  /* ── Settings ───────────────────────────────────────────────────── */
  const handleSettingChange = useCallback(
    (key, value) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      // Reset PDF on any change except the download name
      if (key !== 'pdfName') reset();
    },
    [reset]
  );

  /* ── PDF actions ────────────────────────────────────────────────── */
  const handleGenerate = () => generate(images, settings);
  const handleDownload = () => download(settings.pdfName);

  const handlePreview = useCallback(() => {
    if (!pdfBytes) return;
    openPreview(pdfBytes, settings.pdfName, images.length);
  }, [pdfBytes, settings.pdfName, images.length, openPreview]);

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div
      className={`min-h-screen flex flex-col ${FONT_SIZE_CLASS[fontSize]} transition-colors duration-300`}
    >
      {/* ── Header ── */}
      <Header
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        imageCount={images.length}
      />

      {/* ── Body: sidebar + main ── */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row">

        {/* Left sidebar — Controls */}
        <aside
          className={[
            'w-full lg:w-80 xl:w-96 shrink-0',
            'order-2 lg:order-none',
            'border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800',
            'bg-white dark:bg-slate-900',
            'max-h-[40vh] lg:max-h-none overflow-y-auto',
          ].join(' ')}
        >
          <ControlsPanel
            settings={settings}
            onChange={handleSettingChange}
            imageCount={images.length}
          />
        </aside>

        {/* Right — uploader + grid + generator bar */}
        <div className="flex-1 flex flex-col order-1 lg:order-none min-h-0 bg-slate-50 dark:bg-slate-950">

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-7">

            {/* Tab switcher */}
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Upload tab */}
            {activeTab === 'upload' && (
              <>
                <ImageUploader
                  onFiles={handleFiles}
                  hasImages={images.length > 0}
                />

                <AnimatePresence mode="wait">
                  {images.length > 0 && (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                      className="mt-6"
                    >
                      <ImagePreviewGrid
                        images={images}
                        onRemove={handleRemove}
                        onReorder={handleReorder}
                        onCrop={handleCropOpen}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Camera tab */}
            {activeTab === 'camera' && (
              <CameraScanner
                onImagesReady={handleScannedImages}
                onSwitchTab={() => setActiveTab('upload')}
              />
            )}
          </div>

          {/* Fixed bottom bar — PDF generator */}
          <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 lg:px-7 py-4">
            <PDFGenerator
              imageCount={images.length}
              isGenerating={isGenerating}
              progress={progress}
              pdfReady={!!pdfBytes}
              pdfBytes={pdfBytes}
              error={error}
              pdfName={settings.pdfName}
              onGenerate={handleGenerate}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </div>

      {/* Crop editor modal (global) */}
      <CropEditor
        isOpen={cropHook.isCropping}
        imageUrl={cropHook.imageToEdit}
        imageName={cropTargetId ? images.find((i) => i.id === cropTargetId)?.name : ''}
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

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <PDFPreview
            isOpen={previewOpen}
            blobUrl={blobUrl}
            filename={settings.pdfName}
            pageCount={previewPageCount}
            currentPage={currentPage}
            zoomLevel={zoomLevel}
            isLoading={previewLoading}
            pdfBytes={pdfBytes}
            onClose={closePreview}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            getZoomPercent={getZoomPercent}
            onDownload={handleDownload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * useImageCrop.js
 * Custom React hook to manage image cropping state with react-easy-crop.
 */

import { useState, useCallback } from 'react';
import { getCroppedImg } from '../utils/cropUtils';

export function useImageCrop() {
  const [crop, setCrop]                       = useState({ x: 0, y: 0 });
  const [zoom, setZoom]                       = useState(1);
  const [rotation, setRotation]               = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping]           = useState(false);
  const [imageToEdit, setImageToEdit]         = useState(null);

  /* ── Open crop modal ──────────────────────────────────────────── */
  const openCrop = useCallback((dataUrl) => {
    setImageToEdit(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setIsCropping(true);
  }, []);

  /* ── Close without saving ─────────────────────────────────────── */
  const closeCrop = useCallback(() => {
    setIsCropping(false);
    setImageToEdit(null);
  }, []);

  /* ── Called by react-easy-crop on each interaction ─────────────── */
  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  /* ── Apply crop and return new Data URL ───────────────────────── */
  const applyCrop = useCallback(async () => {
    if (!imageToEdit || !croppedAreaPixels) return null;
    const cropped = await getCroppedImg(imageToEdit, croppedAreaPixels, rotation);
    setIsCropping(false);
    setImageToEdit(null);
    return cropped;
  }, [imageToEdit, croppedAreaPixels, rotation]);

  /* ── Reset to defaults ────────────────────────────────────────── */
  const resetCrop = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  }, []);

  return {
    crop, setCrop,
    zoom, setZoom,
    rotation, setRotation,
    croppedAreaPixels,
    isCropping,
    imageToEdit,
    openCrop,
    closeCrop,
    onCropComplete,
    applyCrop,
    resetCrop,
  };
}

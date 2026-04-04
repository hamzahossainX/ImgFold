/**
 * useCamera.js
 * Custom React hook for managing camera access, capture, and state.
 */

import { useState, useCallback, useRef } from 'react';
import { captureFrame } from '../utils/scannerUtils';

export function useCamera() {
  const [isStreaming, setIsStreaming]           = useState(false);
  const [isCameraSupported]                    = useState(
    () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  );
  const [facingMode, setFacingMode]            = useState('environment');
  const [capturedImages, setCapturedImages]    = useState([]);
  const [error, setError]                      = useState(null);

  const streamRef = useRef(null);

  /* ── Start camera ─────────────────────────────────────────────── */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permission in your browser settings.'
          : `Camera error: ${err.message}`
      );
      setIsStreaming(false);
    }
  }, [facingMode]);

  /* ── Stop camera ──────────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  /* ── Capture current frame ────────────────────────────────────── */
  const captureImage = useCallback((videoRef) => {
    const dataUrl = captureFrame(videoRef);
    if (dataUrl) {
      setCapturedImages((prev) => [...prev, dataUrl]);
    }
    return dataUrl;
  }, []);

  /* ── Toggle front / back camera ───────────────────────────────── */
  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    // Restart camera with new facing mode after state update
  }, []);

  /* ── Remove a single capture ──────────────────────────────────── */
  const removeCapture = useCallback((index) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ── Clear all captures ───────────────────────────────────────── */
  const clearCaptures = useCallback(() => {
    setCapturedImages([]);
  }, []);

  return {
    isStreaming,
    isCameraSupported,
    facingMode,
    capturedImages,
    setCapturedImages,
    error,
    startCamera,
    stopCamera,
    captureImage,
    toggleFacingMode,
    removeCapture,
    clearCaptures,
  };
}

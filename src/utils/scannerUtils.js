/**
 * scannerUtils.js
 * Utilities to capture frames from a video feed and process them
 * to look like scanned documents.
 */

import { applyAutoEnhance, applySharpen, applyContrast } from './filterUtils';

/* ── Capture a single frame from a <video> element ────────────────── */

/**
 * Draw the current video frame onto a canvas and return a Data URL.
 * @param {{ current: HTMLVideoElement }} videoRef  React ref
 * @returns {string|null}
 */
export function captureFrame(videoRef) {
  const video = videoRef?.current;
  if (!video || video.readyState < 2) return null;

  const canvas = document.createElement('canvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/* ── Document-scan post-processing pipeline ───────────────────────── */

/**
 * Apply a combination of enhancements that make a photo look like a scan:
 *   1. Auto-contrast (histogram stretch)
 *   2. Slight sharpening
 *   3. Cool-tone adjustment (remove warm cast)
 *
 * @param {string} dataUrl
 * @returns {Promise<string>}
 */
export async function applyDocumentScan(dataUrl) {
  // Step 1 — auto-enhance
  let result = await applyAutoEnhance(dataUrl);
  // Step 2 — sharpen
  result = await applySharpen(result);
  // Step 3 — slight contrast boost
  result = await applyContrast(result, 20);
  return result;
}

/* ── Simple edge detection (Sobel-like) ───────────────────────────── */

/**
 * Highlight edges using a simplified Sobel operator.
 * @param {string} dataUrl
 * @returns {Promise<string>}
 */
export async function detectEdges(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, w, h);
      const out = ctx.createImageData(w, h);
      const sd = src.data;
      const od = out.data;

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          // Greyscale luminance of neighbours
          const tl = sd[((y-1)*w+(x-1))*4]*0.3 + sd[((y-1)*w+(x-1))*4+1]*0.59 + sd[((y-1)*w+(x-1))*4+2]*0.11;
          const t  = sd[((y-1)*w+ x   )*4]*0.3 + sd[((y-1)*w+ x   )*4+1]*0.59 + sd[((y-1)*w+ x   )*4+2]*0.11;
          const tr = sd[((y-1)*w+(x+1))*4]*0.3 + sd[((y-1)*w+(x+1))*4+1]*0.59 + sd[((y-1)*w+(x+1))*4+2]*0.11;
          const ml = sd[( y   *w+(x-1))*4]*0.3 + sd[( y   *w+(x-1))*4+1]*0.59 + sd[( y   *w+(x-1))*4+2]*0.11;
          const mr = sd[( y   *w+(x+1))*4]*0.3 + sd[( y   *w+(x+1))*4+1]*0.59 + sd[( y   *w+(x+1))*4+2]*0.11;
          const bl = sd[((y+1)*w+(x-1))*4]*0.3 + sd[((y+1)*w+(x-1))*4+1]*0.59 + sd[((y+1)*w+(x-1))*4+2]*0.11;
          const b  = sd[((y+1)*w+ x   )*4]*0.3 + sd[((y+1)*w+ x   )*4+1]*0.59 + sd[((y+1)*w+ x   )*4+2]*0.11;
          const br = sd[((y+1)*w+(x+1))*4]*0.3 + sd[((y+1)*w+(x+1))*4+1]*0.59 + sd[((y+1)*w+(x+1))*4+2]*0.11;

          const gx = -tl + tr - 2*ml + 2*mr - bl + br;
          const gy = -tl - 2*t - tr + bl + 2*b + br;
          const mag = Math.min(255, Math.sqrt(gx*gx + gy*gy));

          od[idx]     = mag;
          od[idx + 1] = mag;
          od[idx + 2] = mag;
          od[idx + 3] = 255;
        }
      }
      ctx.putImageData(out, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

/* ── Resize to A4 @ 300 DPI ───────────────────────────────────────── */

/**
 * Resize an image to fit A4 at 300 DPI (2480 × 3508) while preserving
 * aspect ratio.
 * @param {string} dataUrl
 * @param {number} [maxWidth=2480]
 * @param {number} [maxHeight=3508]
 * @returns {Promise<string>}
 */
export async function resizeForPDF(dataUrl, maxWidth = 2480, maxHeight = 3508) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxWidth || h > maxHeight) {
        const ratio = Math.min(maxWidth / w, maxHeight / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = dataUrl;
  });
}

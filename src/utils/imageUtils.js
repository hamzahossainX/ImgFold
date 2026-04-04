// Utility functions for image reading, compression and processing
/**
 * imageUtils.js
 * Client-side image helpers: reading, compression via Canvas, dimension detection.
 */

/** Accepted MIME types */
export const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

/** Generate a short random ID */
export const uid = () => Math.random().toString(36).slice(2, 9);

/** Format bytes → human-readable string */
export function formatBytes(bytes) {
  if (bytes < 1_024)       return `${bytes} B`;
  if (bytes < 1_048_576)   return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

/**
 * Read a File object as a base-64 Data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error(`Cannot read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Get the natural pixel dimensions of an image from a Data URL.
 * @param {string} dataUrl
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = dataUrl;
  });
}

/**
 * Compress an image using the Canvas API.
 * Scales it down if it exceeds maxDimension, then encodes as JPEG at given quality.
 *
 * @param {string} dataUrl         - Source image (any format browsers can decode)
 * @param {number} [quality=0.85]  - JPEG quality 0.1–1.0
 * @param {number} [maxDimension=2400] - Max side length in pixels before scaling
 * @returns {Promise<{dataUrl: string, width: number, height: number}>}
 */
export function compressImage(dataUrl, quality = 0.85, maxDimension = 2400) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;

      // Scale down proportionally if either dimension exceeds the limit
      if (w > maxDimension || h > maxDimension) {
        const ratio = Math.min(maxDimension / w, maxDimension / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      // White background for PNGs with transparency
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', quality),
        width:  w,
        height: h,
      });
    };

    img.src = dataUrl;
  });
}

/**
 * Convert a Data URL string to a Uint8Array of raw bytes.
 * Required by pdf-lib's embed methods.
 * @param {string} dataUrl
 * @returns {Uint8Array}
 */
export function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const raw    = atob(base64);
  const bytes  = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

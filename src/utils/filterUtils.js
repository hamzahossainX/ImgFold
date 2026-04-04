/**
 * filterUtils.js
 * Canvas-based image filter utilities for document enhancement.
 * Every function takes a Data URL and returns a Promise<string> (new Data URL).
 */

/* ── Helper: load an image into a canvas and return its ImageData ──── */

function loadToCanvas(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve({ canvas, ctx, imageData });
    };
    img.src = dataUrl;
  });
}

/* ── Grayscale ────────────────────────────────────────────────────── */

export async function applyGrayscale(dataUrl) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const avg = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    d[i] = d[i + 1] = d[i + 2] = avg;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Auto Enhance (histogram stretching) ──────────────────────────── */

export async function applyAutoEnhance(dataUrl) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const d = imageData.data;

  // Find min/max across channels
  let rMin = 255, gMin = 255, bMin = 255;
  let rMax = 0,   gMax = 0,   bMax = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i]     < rMin) rMin = d[i];
    if (d[i]     > rMax) rMax = d[i];
    if (d[i + 1] < gMin) gMin = d[i + 1];
    if (d[i + 1] > gMax) gMax = d[i + 1];
    if (d[i + 2] < bMin) bMin = d[i + 2];
    if (d[i + 2] > bMax) bMax = d[i + 2];
  }

  const stretch = (val, min, max) =>
    max === min ? val : ((val - min) / (max - min)) * 255;

  for (let i = 0; i < d.length; i += 4) {
    d[i]     = stretch(d[i],     rMin, rMax);
    d[i + 1] = stretch(d[i + 1], gMin, gMax);
    d[i + 2] = stretch(d[i + 2], bMin, bMax);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Black & White (threshold) ────────────────────────────────────── */

export async function applyBlackAndWhite(dataUrl) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const d = imageData.data;
  const threshold = 128;
  for (let i = 0; i < d.length; i += 4) {
    const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const val = lum >= threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Contrast ─────────────────────────────────────────────────────── */

export async function applyContrast(dataUrl, level = 50) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const d = imageData.data;
  const factor = (259 * (level + 255)) / (255 * (259 - level));
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.max(0, factor * (d[i]     - 128) + 128));
    d[i + 1] = Math.min(255, Math.max(0, factor * (d[i + 1] - 128) + 128));
    d[i + 2] = Math.min(255, Math.max(0, factor * (d[i + 2] - 128) + 128));
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Brightness ───────────────────────────────────────────────────── */

export async function applyBrightness(dataUrl, level = 30) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, Math.max(0, d[i]     + level));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + level));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + level));
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── Sharpen (3×3 convolution kernel) ─────────────────────────────── */

export async function applySharpen(dataUrl) {
  const { canvas, ctx, imageData } = await loadToCanvas(dataUrl);
  const { width, height } = canvas;
  const src = imageData.data;
  const out = ctx.createImageData(width, height);
  const dst = out.data;

  // Sharpen kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            val += src[idx] * k[(ky + 1) * 3 + (kx + 1)];
          }
        }
        dst[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, val));
      }
      dst[(y * width + x) * 4 + 3] = 255; // alpha
    }
  }

  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

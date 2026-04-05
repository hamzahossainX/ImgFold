/**
 * pdfUtils.js
 * PDF generation using pdf-lib.
 * Handles page sizing, orientation, image fit, margins, and compression.
 */

import { PDFDocument } from 'pdf-lib';
import { compressImage, dataUrlToBytes } from './imageUtils';

/** Standard page sizes in PDF points [width, height] (portrait) */
export const PAGE_SIZES = {
  a4:     [595.28, 841.89],
  letter: [612,    792   ],
  a3:     [841.89, 1190.55],
  legal:  [612,    1008  ],
};

/** Max PDF point dimension used when auto-sizing from image */
const AUTO_MAX_PT = 842; // ~A4 height

/**
 * Yield control to the browser event loop so the UI can repaint.
 * Prevents the tab from freezing during heavy PDF processing.
 */
const yieldToUI = () =>
  new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

/**
 * Determine page [width, height] in PDF points for one image, respecting settings.
 *
 * @param {Object} settings - App settings
 * @param {number} imgW     - Pixel width of (possibly compressed) image
 * @param {number} imgH     - Pixel height of (possibly compressed) image
 * @returns {[number, number]} [pageW, pageH]
 */
function resolvePageSize(settings, imgW, imgH) {
  let pageW, pageH;

  if (settings.sizeMode === 'auto') {
    // Map image pixels → PDF points, capped at AUTO_MAX_PT on the longer side
    const scale = Math.min(AUTO_MAX_PT / imgW, AUTO_MAX_PT / imgH, 1);
    pageW = Math.round(imgW * scale);
    pageH = Math.round(imgH * scale);
  } else {
    // Standard preset
    [pageW, pageH] = PAGE_SIZES[settings.sizeMode] ?? PAGE_SIZES.a4;
  }

  // Apply orientation
  const shouldBeWide = settings.orientation === 'landscape';
  const isCurrentlyWide = pageW > pageH;
  if (shouldBeWide !== isCurrentlyWide) {
    [pageW, pageH] = [pageH, pageW]; // swap to match desired orientation
  }

  return [pageW, pageH];
}

/**
 * Build a PDF from an ordered list of image entries.
 *
 * @param {Array<{dataUrl:string, width:number, height:number, file:File}>} images
 * @param {Object} settings - { sizeMode, orientation, fit, margin, compression }
 * @param {(pct: number) => void} onProgress - called with 0–100
 * @returns {Promise<Uint8Array>} Raw PDF bytes
 */
export async function generatePDF(images, settings, onProgress) {
  const pdfDoc = await PDFDocument.create();
  const total  = images.length;

  for (let i = 0; i < total; i++) {
    const imgEntry = images[i];

    // Report progress (0–85% covers image processing)
    onProgress(Math.round((i / total) * 85));
    await yieldToUI(); // let the progress bar render

    // ── 1. Compress / resize image ──
    const { dataUrl: compressedDataUrl, width: imgW, height: imgH } =
      await compressImage(imgEntry.dataUrl, settings.compression);

    // ── 2. Determine page dimensions ──
    const [pageW, pageH] = resolvePageSize(settings, imgW, imgH);

    // ── 3. Add page ──
    const page = pdfDoc.addPage([pageW, pageH]);

    // ── 4. Embed image (always JPEG after compression) ──
    let embedded;
    try {
      const imgBytes = dataUrlToBytes(compressedDataUrl);
      embedded = await pdfDoc.embedJpg(imgBytes);
    } catch (err) {
      console.warn(`[ImgFold] Skipping "${imgEntry.file?.name}":`, err);
      continue;
    }

    // ── 5. Calculate draw position respecting margin and fit mode ──
    const m     = settings.margin;
    const drawW = pageW - m * 2;
    const drawH = pageH - m * 2;

    let x, y, w, h;

    if (settings.fit === 'fill') {
      // Stretch image to fill the draw area (ignores aspect ratio)
      x = m;
      y = m;
      w = drawW;
      h = drawH;
    } else {
      // Contain: scale uniformly so image fits within draw area, then centre
      const scale = Math.min(drawW / imgW, drawH / imgH);
      w = imgW * scale;
      h = imgH * scale;
      // pdf-lib origin is bottom-left, so centre vertically from the bottom
      x = m + (drawW - w) / 2;
      y = m + (drawH - h) / 2;
    }

    page.drawImage(embedded, { x, y, width: w, height: h });
  }

  // ── 6. Serialise ──
  onProgress(95);
  await yieldToUI();

  const pdfBytes = await pdfDoc.save();
  onProgress(100);

  return pdfBytes;
}

/**
 * Trigger a browser file download from a Uint8Array.
 * @param {Uint8Array} bytes
 * @param {string} filename - without extension
 */
export function downloadPDF(bytes, filename = 'converted') {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: `${filename.trim() || 'converted'}.pdf`,
  });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 150);
}

/**
 * cropUtils.js
 * Canvas-based image cropping utilities for react-easy-crop integration.
 */

/**
 * Convert degrees to radians.
 * @param {number} degreeValue
 * @returns {number}
 */
export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Return new bounding-box dimensions after rotating a rectangle.
 * @param {number} width
 * @param {number} height
 * @param {number} rotation  — degrees
 * @returns {{ width: number, height: number }}
 */
export function rotateSize(width, height, rotation) {
  const rad = getRadianAngle(rotation);
  return {
    width:  Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

/**
 * Load an image from a Data URL or src string.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Crop (and optionally rotate) an image using the Canvas API.
 *
 * @param {string} imageSrc    — source Data URL or image URL
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @param {number} [rotation=0] — degrees
 * @returns {Promise<string>}  — cropped image as Data URL
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');

  // Compute the safe bounding box that fits the rotated image
  const rotRad    = getRadianAngle(rotation);
  const { width: bBoxW, height: bBoxH } = rotateSize(image.width, image.height, rotation);

  // Set canvas to bounding-box size, draw rotated image centred
  canvas.width  = bBoxW;
  canvas.height = bBoxH;

  ctx.translate(bBoxW / 2, bBoxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the cropped region into a second canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx    = croppedCanvas.getContext('2d');

  croppedCanvas.width  = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return croppedCanvas.toDataURL('image/jpeg', 0.92);
}

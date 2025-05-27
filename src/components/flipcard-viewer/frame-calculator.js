import { DEFAULT_FRAME_SIZE } from '../../utils/constants.js';
import { handleError } from '../../utils/error-handling.js';

/**
 * Gets the document font size in pixels
 * @returns {number} - Font size in pixels
 */
export function getDocumentFontSize() {
  try {
    return parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("font-size")
        .trim()
        .replace("px", "")
    ) || 16; // Fallback to 16px if can't get font size
  } catch (error) {
    handleError(error, 'Getting document font size', true);
    return 16;
  }
}

/**
 * Rounds a number to two decimal places.
 * @param {number} num - The number to round.
 * @returns {number} The rounded number.
 */
export function roundToDecimals(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates the screen size and updates frame dimensions
 * @param {Object} element - The component element
 */
export function calculateScreenSize(element) {
  if(element.size) {
    element.frameWidth = element.size;
    element.frameHeight = element.size;
    return;
  }
  try {
    const docFontSize = getDocumentFontSize();

    const computedStyle = getComputedStyle(element);
    const width = parseInt(computedStyle.getPropertyValue('width')) || element.offsetWidth;
    const height = parseInt(computedStyle.getPropertyValue('height')) || element.offsetHeight;

    const parentElement = element.parentElement;
    const parentWidth = parentElement ? parentElement.offsetWidth : width;
    const parentHeight = parentElement ? parentElement.offsetHeight : height;

    // Avoid division by zero or negative values
    if (docFontSize <= 0 || width <= 0 || height <= 0) {
      element.frameWidth = DEFAULT_FRAME_SIZE;
      element.frameHeight = DEFAULT_FRAME_SIZE;
      return;
    }

    element.frameWidth = (Math.min(width, parentWidth) / docFontSize) * 0.9;
    element.frameHeight = (Math.min(height, parentHeight) / docFontSize) * 0.9;

    // Ensure minimum dimensions
    element.frameWidth = Math.max(element.frameWidth, 1);
    element.frameHeight = Math.max(element.frameHeight, 1);
  } catch (error) {
    handleError(error, 'Calculating screen size');
    // Set default values if calculation fails
    element.frameWidth = DEFAULT_FRAME_SIZE;
    element.frameHeight = DEFAULT_FRAME_SIZE;
  }
}

/**
 * Calculates the frame size based on the aspect ratio
 * @param {Object} element - The component element
 */
export function calculateFrameSize(element) {
  calculateScreenSize(element);
  if (element.aspectRatio > 1) {
    element.frameHeight = roundToDecimals(element.frameWidth / element.aspectRatio);
  } else {
    element.frameWidth = roundToDecimals(element.aspectRatio * element.frameHeight);
  }
  element.imgWidth = `${element.frameWidth * element.columns}rem`;
  element.imgHeight = `${element.frameHeight * element.rows}rem`;
  element.containerWidth = `${element.frameWidth}rem`;
  element.containerHeight = `${element.frameHeight}rem`;
}

/**
 * Computes the aspect ratio of the image
 * @param {Object} element - The component element
 * @returns {Promise<void>}
 */
export async function computeAspectRatio(element) {
  // Check if image source is available
  if (!element.imgSrc) {
    handleError(new Error('No image source available'), 'Aspect ratio calculation', true);
    element.aspectRatio = 1;
    calculateFrameSize(element);
    return;
  }

  try {
    const fusedImage = new Image();
    fusedImage.crossOrigin = 'Anonymous';

    await new Promise((resolve, reject) => {
      fusedImage.onload = () => {
        const iw = fusedImage.width / element.columns;
        const ih = fusedImage.height / element.rows;
        element.aspectRatio = (iw && ih) ? iw / ih : 1;
        calculateFrameSize(element);
        resolve();
      };
      fusedImage.onerror = (err) => {
        handleError(err, 'Loading image for aspect ratio calculation', true);
        element.aspectRatio = 1;
        calculateFrameSize(element);
        reject(err);
      };
      fusedImage.src = element.imgSrc;
    });
  } catch (error) {
    handleError(error, 'Calculating aspect ratio');
    element.aspectRatio = 1;
    calculateFrameSize(element);
  }
} 
import exifr from 'exifr';
import { ORIENTATION_TRANSFORMS, DEFAULT_ORIENTATION, IMAGE_LOAD_TIMEOUT_MS } from '../../utils/constants.js';
import { handleError } from '../../utils/error-handling.js';

/**
 * Parses EXIF data from a given image blob.
 * @param {Blob} blob - The image blob to parse.
 * @returns {Promise<Object>} A promise that resolves to the parsed EXIF data.
 */
export async function parseExifData(blob) {
  return await exifr.parse(blob, true);
}

/**
 * Gets the orientation from EXIF data
 * @param {Blob} blob - Image blob
 * @returns {Promise<number>} - Orientation value (1-8)
 */
export async function getImageOrientation(blob) {
  try {
    const exifData = await parseExifData(blob);
    return exifData?.Orientation || DEFAULT_ORIENTATION;
  } catch (exifError) {
    handleError(exifError, 'Parsing EXIF data', true);
    return DEFAULT_ORIENTATION;
  }
}

/**
 * Creates a canvas with the image drawn with correct orientation
 * @param {HTMLImageElement} img - The image element
 * @param {number} orientation - EXIF orientation value (1-8)
 * @returns {Object} - Canvas and format information
 */
export function createOrientedCanvas(img, orientation) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const width = img.width;
  const height = img.height;

  if (width === 0 || height === 0) {
    throw new Error('Image has zero width or height');
  }

  // Set canvas dimensions based on orientation
  if ([5, 6, 7, 8].includes(orientation)) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  // Apply transform based on orientation
  const transform = ORIENTATION_TRANSFORMS[orientation] || 
                    ORIENTATION_TRANSFORMS[DEFAULT_ORIENTATION];
  
  transform(ctx, width, height);

  // Draw the image with the applied transformation
  ctx.drawImage(img, 0, 0);

  return { canvas, format: 'image/jpeg' };
}

/**
 * Corrects image orientation based on EXIF data
 * @param {string} imageUrl - URL of the image to correct
 * @param {number} orientation - EXIF orientation value (1-8)
 * @returns {Promise<string>} - Data URL of the corrected image
 */
export async function correctImageOrientation(imageUrl, orientation) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Set a timeout for image loading
    const loadTimeout = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, IMAGE_LOAD_TIMEOUT_MS);

    img.onload = () => {
      clearTimeout(loadTimeout);
      try {
        const { canvas, format } = createOrientedCanvas(img, orientation);
        resolve(canvas.toDataURL(format || 'image/jpeg'));
      } catch (err) {
        handleError(err, 'Processing image orientation');
        reject(err);
      }
    };

    img.onerror = (err) => {
      clearTimeout(loadTimeout);
      handleError(err, 'Loading image');
      reject(err);
    };

    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;
  });
}

/**
 * Loads an image, corrects its orientation based on EXIF data
 * @param {string} mediaUrl - URL of the image to process
 * @returns {Promise<string>} - Data URL of the processed image
 */
export async function processImage(mediaUrl) {
  if (!mediaUrl) {
    handleError(new Error('No media URL provided'), 'Image orientation correction');
    return null;
  }

  let imageUrl = null;

  try {
    // Fetch the image
    const response = await fetch(mediaUrl, {
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    imageUrl = URL.createObjectURL(blob);

    // Get EXIF data with better error handling
    const orientation = await getImageOrientation(blob);
    
    // Process the image with the correct orientation
    return await correctImageOrientation(imageUrl, orientation);
  } catch (error) {
    handleError(error, 'Loading image or getting EXIF data');
    return null;
  } finally {
    // Clean up URL object if it was created
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  }
} 
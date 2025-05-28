export const DEFAULT_ORIENTATION = 1;
export const DEFAULT_FRAME_SIZE = 20;
export const IMAGE_LOAD_TIMEOUT_MS = 10000;
export const RESIZE_DEBOUNCE_MS = 100;
export const DEFAULT_ASPECT_RATIO = 1;

export const ORIENTATION_TRANSFORMS = {
  // Normal orientation, no transformation needed
  1: (ctx, width, height) => {},
  // Flipped horizontally
  2: (ctx, width, height) => { ctx.transform(-1, 0, 0, 1, width, 0); },
  // Rotated 180 degrees
  3: (ctx, width, height) => { ctx.transform(-1, 0, 0, -1, width, height); },
  // Flipped vertically
  4: (ctx, width, height) => { ctx.transform(1, 0, 0, -1, 0, height); },
  // Flipped horizontally and rotated 270 degrees
  5: (ctx, width, height) => { ctx.transform(0, 1, 1, 0, 0, 0); },
  // Rotated 90 degrees
  6: (ctx, width, height) => { ctx.transform(0, -1, 1, 0, 0, width); },
  // Flipped horizontally and rotated 90 degrees
  7: (ctx, width, height) => { ctx.transform(0, -1, -1, 0, height, width); },
  // Rotated 270 degrees
  8: (ctx, width, height) => { ctx.transform(0, -1, 1, 0, height, 0); }
};


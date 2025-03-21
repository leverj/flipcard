/**
 * Standard error handling method that logs errors with context
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {boolean} isWarning - Whether to log as warning instead of error
 */
export function handleError(error, context, isWarning = false) {
  const message = error?.message || String(error);
  const logFn = isWarning ? console.warn : console.error;
  logFn(`${context}: ${message}`);
} 
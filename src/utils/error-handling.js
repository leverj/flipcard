import { logger } from './logger.js';

/**
 * Standard error handling method that logs errors with context
 * @param {Error} error - The error object
 * @param {string} context - The context where the error occurred
 * @param {boolean} isFatal - Whether to log as fatal error instead of warning
 */
export const handleError = (error, context, isFatal = false) => {
  const errorMessage = `Error in ${context}: ${error.message}`;
  
  if (isFatal) {
    logger.error(errorMessage);
    throw error;
  } else {
    logger.warn(errorMessage);
  }
}; 
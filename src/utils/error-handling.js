import { logger } from './logger.js';

/**
 * Standard error handling method that logs errors with context
 * @param {Error|string|null|undefined} error - The error object or message
 * @param {string} context - The context where the error occurred
 * @param {boolean} isWarning - Whether to log as warning instead of error
 * @returns {boolean} - Returns true if error was handled successfully
 */
export const handleError = (error, context, isWarning = false) => {
  try {
    let errorMessage;
    
    if (error === null) {
      errorMessage = `${context}: null`;
    } else if (error === undefined) {
      errorMessage = `${context}: undefined`;
    } else if (typeof error === 'string') {
      errorMessage = `${context}: ${error}`;
    } else if (error instanceof Error) {
      errorMessage = `${context}: ${error.message}`;
    } else {
      errorMessage = `${context}: ${error}`;
    }
    
    if (isWarning) {
      console.warn(errorMessage);
    } else {
      console.error(errorMessage);
    }
    
    return true;
  } catch (e) {
    console.error(`Failed to handle error in ${context}: ${e.message}`);
    return false;
  }
}; 
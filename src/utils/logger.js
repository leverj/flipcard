// Logging configuration
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

let currentLogLevel = LOG_LEVELS.INFO;
let isLoggingEnabled = true;

export const logger = {
  setLogLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      currentLogLevel = LOG_LEVELS[level];
    }
  },

  enableLogging() {
    isLoggingEnabled = true;
  },

  disableLogging() {
    isLoggingEnabled = false;
  },

  debug(...args) {
    if (isLoggingEnabled && currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug('[Flipcard]', ...args);
    }
  },

  info(...args) {
    if (isLoggingEnabled && currentLogLevel <= LOG_LEVELS.INFO) {
      console.info('[Flipcard]', ...args);
    }
  },

  warn(...args) {
    if (isLoggingEnabled && currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn('[Flipcard]', ...args);
    }
  },

  error(...args) {
    if (isLoggingEnabled && currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error('[Flipcard]', ...args);
    }
  }
};

// Export the log levels for external configuration
export { LOG_LEVELS }; 
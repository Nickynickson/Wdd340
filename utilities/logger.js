/**
 * Logger Utility
 * Provides standardized logging functionality throughout the application
 */

/**
 * Logger object with methods for different log levels
 */
const logger = {
  /**
   * Log error messages
   * @param {string} message - The error message to log
   */
  error: (message) => console.error(`ERROR: ${message}`),
  
  /**
   * Log informational messages
   * @param {string} message - The info message to log
   */
  info: (message) => console.log(`INFO: ${message}`),
  
  /**
   * Log warning messages
   * @param {string} message - The warning message to log
   */
  warn: (message) => console.warn(`WARNING: ${message}`),
  
  /**
   * Log debug messages (only in development)
   * @param {string} message - The debug message to log
   */
  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`DEBUG: ${message}`);
    }
  }
};


module.exports = { logger };
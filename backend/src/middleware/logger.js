/**
 * Request Logging Middleware
 * Provides structured logging for API requests
 */

/**
 * Format duration for human readability
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Get log level based on status code
 */
function getLogLevel(statusCode) {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * Create a request logging middleware
 * @param {Object} options - Logging options
 * @param {boolean} options.enabled - Whether logging is enabled (default: true in development)
 * @param {boolean} options.includeBody - Whether to log request bodies (default: false for security)
 */
function requestLogger(options = {}) {
  const {
    enabled = process.env.NODE_ENV !== 'production',
    includeBody = false
  } = options;

  return (req, res, next) => {
    if (!enabled) return next();

    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 10);
    req.requestId = requestId;

    // Log request start
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']?.substring(0, 100)
    };

    if (includeBody && req.body && Object.keys(req.body).length > 0) {
      // Sanitize sensitive fields
      const sanitizedBody = { ...req.body };
      const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
      for (const field of sensitiveFields) {
        if (sanitizedBody[field]) {
          sanitizedBody[field] = '[REDACTED]';
        }
      }
      logData.body = sanitizedBody;
    }

    console.log(`→ [${requestId}] ${req.method} ${req.path}`);

    // Capture response
    const originalSend = res.send;
    res.send = function(body) {
      const duration = Date.now() - startTime;
      const level = getLogLevel(res.statusCode);
      
      const logSymbol = level === 'error' ? '✗' : level === 'warn' ? '!' : '✓';
      console.log(`${logSymbol} [${requestId}] ${res.statusCode} ${formatDuration(duration)}`);
      
      return originalSend.call(this, body);
    };

    next();
  };
}

module.exports = {
  requestLogger
};

/**
 * Simple Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 */

// Store for tracking request counts per IP
const requestCounts = new Map();

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now - data.windowStart > 60000) {
      requestCounts.delete(ip);
    }
  }
}, 300000);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Custom error message
 */
function rateLimit(options = {}) {
  const {
    windowMs = 60000,
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    // Get client IP (support for proxied requests)
    const clientIp = req.ip || 
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.connection?.remoteAddress || 
      'unknown';
    
    const now = Date.now();
    const data = requestCounts.get(clientIp);
    
    if (!data || now - data.windowStart > windowMs) {
      // New window
      requestCounts.set(clientIp, {
        count: 1,
        windowStart: now
      });
      return next();
    }
    
    if (data.count >= maxRequests) {
      const retryAfter = Math.ceil((data.windowStart + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        error: message,
        retryAfter
      });
    }
    
    data.count++;
    next();
  };
}

/**
 * Stricter rate limit for authentication endpoints
 */
const authRateLimit = rateLimit({
  windowMs: 300000, // 5 minutes
  maxRequests: 20,
  message: 'Too many authentication attempts, please try again later'
});

/**
 * Standard API rate limit
 */
const apiRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  message: 'API rate limit exceeded, please slow down'
});

module.exports = {
  rateLimit,
  authRateLimit,
  apiRateLimit
};

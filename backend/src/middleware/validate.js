/**
 * Input Validation Middleware
 * Provides reusable validation for common API request patterns
 */

/**
 * Validate that required fields exist in request body
 * @param {string[]} fields - Array of required field names
 */
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }
    
    next();
  };
}

/**
 * Validate that ID parameters are valid positive integers
 * @param {string[]} params - Array of parameter names to validate
 */
function validateIds(params) {
  return (req, res, next) => {
    for (const param of params) {
      const value = req.params[param] || req.query[param] || req.body[param];
      if (value !== undefined) {
        const id = parseInt(value, 10);
        if (isNaN(id) || id <= 0) {
          return res.status(400).json({
            error: `Invalid ${param}: must be a positive integer`
          });
        }
      }
    }
    next();
  };
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
  const { page, limit } = req.query;
  
  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: 'Invalid page: must be a positive integer'
      });
    }
    req.pagination = req.pagination || {};
    req.pagination.page = pageNum;
  }
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Invalid limit: must be between 1 and 100'
      });
    }
    req.pagination = req.pagination || {};
    req.pagination.limit = limitNum;
  }
  
  // Set defaults
  req.pagination = req.pagination || {};
  req.pagination.page = req.pagination.page || 1;
  req.pagination.limit = req.pagination.limit || 50;
  req.pagination.offset = (req.pagination.page - 1) * req.pagination.limit;
  
  next();
}

/**
 * Sanitize string inputs by trimming whitespace
 * @param {string[]} fields - Array of field names to sanitize
 */
function sanitizeStrings(fields) {
  return (req, res, next) => {
    for (const field of fields) {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    }
    next();
  };
}

/**
 * Validate quality rating for reviews (0-5)
 */
function validateQuality(req, res, next) {
  const { quality } = req.body;
  
  if (quality === undefined || quality === null) {
    return res.status(400).json({
      error: 'Missing required field: quality'
    });
  }
  
  const qualityNum = parseInt(quality, 10);
  if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 5) {
    return res.status(400).json({
      error: 'Invalid quality: must be between 0 and 5'
    });
  }
  
  req.body.quality = qualityNum;
  next();
}

module.exports = {
  requireFields,
  validateIds,
  validatePagination,
  sanitizeStrings,
  validateQuality
};

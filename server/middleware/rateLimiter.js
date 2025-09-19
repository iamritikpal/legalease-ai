const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

// Rate limiter configurations
const rateLimiters = {
  // General API rate limiter
  general: new RateLimiterMemory({
    keyPrefix: 'general',
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
    duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes (900 seconds)
  }),

  // File upload rate limiter (more restrictive)
  upload: new RateLimiterMemory({
    keyPrefix: 'upload',
    points: 10, // 10 uploads
    duration: 900, // Per 15 minutes
  }),

  // AI processing rate limiter (most restrictive)
  ai: new RateLimiterMemory({
    keyPrefix: 'ai',
    points: 20, // 20 AI requests
    duration: 3600, // Per hour
  }),

  // Q&A rate limiter
  qa: new RateLimiterMemory({
    keyPrefix: 'qa',
    points: 50, // 50 questions
    duration: 3600, // Per hour
  }),
};

/**
 * Create rate limiter middleware
 * @param {string} limiterType - Type of rate limiter to use
 * @returns {Function} Express middleware
 */
const createRateLimiter = (limiterType = 'general') => {
  const limiter = rateLimiters[limiterType];
  
  if (!limiter) {
    logger.error(`Rate limiter type '${limiterType}' not found`);
    return (req, res, next) => next(); // Skip rate limiting if limiter not found
  }

  return async (req, res, next) => {
    try {
      // Use IP address as key (in production, consider using user ID if authenticated)
      const key = req.ip || req.connection.remoteAddress;
      
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const remainingPoints = rejRes.remainingPoints || 0;
      const msBeforeNext = rejRes.msBeforeNext || 0;
      const totalHits = rejRes.totalHits || 0;

      // Set rate limit headers
      res.set({
        'Retry-After': Math.round(msBeforeNext / 1000) || 1,
        'X-RateLimit-Limit': limiter.points,
        'X-RateLimit-Remaining': remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext),
      });

      logger.warn(`Rate limit exceeded for ${limiterType}`, {
        ip: req.ip,
        totalHits,
        remainingPoints,
        msBeforeNext,
        endpoint: req.path,
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(msBeforeNext / 1000)} seconds.`,
        retryAfter: Math.ceil(msBeforeNext / 1000),
        timestamp: new Date().toISOString(),
      });
    }
  };
};

/**
 * General rate limiter middleware
 */
const rateLimiter = createRateLimiter('general');

/**
 * Upload rate limiter middleware
 */
const uploadRateLimiter = createRateLimiter('upload');

/**
 * AI processing rate limiter middleware
 */
const aiRateLimiter = createRateLimiter('ai');

/**
 * Q&A rate limiter middleware
 */
const qaRateLimiter = createRateLimiter('qa');

/**
 * Reset rate limits for a specific key (admin use)
 * @param {string} limiterType - Type of rate limiter
 * @param {string} key - Key to reset
 * @returns {Promise<boolean>} Success status
 */
const resetRateLimit = async (limiterType, key) => {
  try {
    const limiter = rateLimiters[limiterType];
    if (limiter) {
      await limiter.delete(key);
      logger.info(`Rate limit reset for ${limiterType}:${key}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error resetting rate limit:', error);
    return false;
  }
};

/**
 * Get rate limit status for a key
 * @param {string} limiterType - Type of rate limiter
 * @param {string} key - Key to check
 * @returns {Promise<Object>} Rate limit status
 */
const getRateLimitStatus = async (limiterType, key) => {
  try {
    const limiter = rateLimiters[limiterType];
    if (limiter) {
      const status = await limiter.get(key);
      return {
        totalHits: status?.totalHits || 0,
        remainingPoints: limiter.points - (status?.totalHits || 0),
        msBeforeNext: status?.msBeforeNext || 0,
        limit: limiter.points,
      };
    }
    return null;
  } catch (error) {
    logger.error('Error getting rate limit status:', error);
    return null;
  }
};

module.exports = {
  rateLimiter,
  uploadRateLimiter,
  aiRateLimiter,
  qaRateLimiter,
  createRateLimiter,
  resetRateLimit,
  getRateLimitStatus,
};

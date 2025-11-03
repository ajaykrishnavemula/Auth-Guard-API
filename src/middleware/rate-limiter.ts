import rateLimit from 'express-rate-limit';
import config from '../config';
import { TooManyRequestsError } from '../errors';

/**
 * Rate limiter middleware to prevent abuse
 * Limits the number of requests from the same IP address
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    throw new TooManyRequestsError('Too many requests, please try again later');
  },
});

export default rateLimiter;


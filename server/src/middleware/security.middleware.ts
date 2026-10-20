import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

/**
 * Global API Rate Limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: ENV.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate Limit Exceeded',
    message: 'Too many requests from this IP. Please wait a few moments before trying again.'
  }
});

/**
 * Diagnostic Intake Rate Limiter (tighter limit on heavy AI analysis endpoints)
 */
export const diagnosticRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Diagnostic Limit Reached',
    message: 'Please wait a moment between diagnostic steps to allow thorough processing.'
  }
});

/**
 * CSRF Protection for state-changing browser cookie requests.
 * Modern defense: verifies custom header (e.g. X-Requested-With: XMLHttpRequest or X-Zelqora-CSRF: 1).
 * Since cross-origin requests cannot set custom headers without CORS preflight approval,
 * this reliably blocks CSRF attacks.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // If request uses cookie session, enforce custom header
  if (req.cookies?.zelqora_session) {
    const customHeader = req.headers['x-requested-with'] || req.headers['x-zelqora-csrf'];
    if (!customHeader) {
      res.status(403).json({
        error: 'CSRF Token Missing',
        message: 'State-changing requests must include a valid CSRF header.'
      });
      return;
    }
  }

  next();
}

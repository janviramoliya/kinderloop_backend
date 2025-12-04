import { Application } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

export function applyRateLimitingMiddlewares(app: Application): void {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
  });

  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: () => 500 // ✅ New behavior (fixed)
  });

  app.use('/api', limiter);
  app.use('/api', speedLimiter);
}

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

// === Middleware Imports ===
import { applySecurityMiddlewares } from './middlewares/security.middleware';
import { applyRateLimitingMiddlewares } from './middlewares/rate-limit.middleware';
import { applyCompressionMiddleware } from './middlewares/compression.middleware';
import { notFoundHandler } from './middlewares/not-found-handler.middleware';
import { globalErrorHandler } from './middlewares/global-error-handler.middleware';
import { requestId } from './middlewares/request-id.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { responseTimeLogger } from './middlewares/response-time.middleware';
import { invalidJsonHandler } from './middlewares/invalid-json.middleware';
import { multerErrorHandler } from './middlewares/multer-error.middleware';

// === Routes ===
import allRoutes from './routes';

dotenv.config();

const app = express();

/**
 * === Request Tracing & Logging Middlewares ===
 * - Attach a unique request ID for tracing logs.
 * - Log all incoming requests (dev: console, prod: file/winston).
 * - Log response times for performance monitoring.
 */
app.use(requestId);
app.use(requestLogger);
app.use(responseTimeLogger);

/**
 * === Security Middlewares ===
 * - Helmet: Secure HTTP headers.
 * - HPP: Prevent HTTP Parameter Pollution.
 * - CORS: Restrict cross-origin requests (origins configurable via env).
 * - XSS Clean, etc.
 */
applySecurityMiddlewares(app);

/**
 * === Body Parsers & Cookie Parser ===
 * - Parse JSON and cookies.
 * - Limit JSON body size to prevent DoS attacks.
 */
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(process.env.ACCESS_TOKEN_SECRET));

/**
 * === Rate Limiting & Compression ===
 * - Prevent brute force attacks and compress responses for speed.
 */
applyRateLimitingMiddlewares(app);
applyCompressionMiddleware(app);

/**
 * === Serve Static Files ===
 * - Serve static assets (e.g., uploads, public) efficiently.
 * - Set strong cache headers for production.
 */
const staticDir = path.join(__dirname, '../public');
app.use(
  '/static',
  express.static(staticDir, {
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
    etag: true,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  })
);

import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

/**
 * === API Routes ===
 * - All API endpoints go here.
 */
app.use('/', allRoutes);

/**
 * === Health Check Endpoint ===
 * - Useful for uptime monitoring and cloud deployments.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

/**
 * === 404 Not Found Handler ===
 * - Handles unmatched routes.
 */
app.use(notFoundHandler);

/**
 * === Multer Error Handler ===
 * - Handles file upload errors (e.g., file too large).
 */
app.use(multerErrorHandler);

/**
 * === Invalid JSON Error Handler ===
 * - Handles invalid JSON payload errors from express.json().
 */
app.use(invalidJsonHandler);

/**
 * === Global Error Handler ===
 * - Catches all errors and sends a formatted response.
 * - Never leak stack traces in production.
 */
app.use(globalErrorHandler);

/**
 * === Edge Case: Unhandled Rejections in Async Middleware ===
 * - Express 5+ will handle this natively, but for Express 4, use catchAsync in controllers.
 */

/**
 * === Documentation ===
 * - For API docs, serve Swagger UI or Redoc here if needed.
 *   Example: app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 */

export default app;

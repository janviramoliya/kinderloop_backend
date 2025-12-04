import { Application } from 'express';
import compression from 'compression';

export function applyCompressionMiddleware(app: Application): void {
  app.use(compression());
}

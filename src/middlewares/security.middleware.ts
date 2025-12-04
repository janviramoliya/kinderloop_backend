import { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';

export function applySecurityMiddlewares(app: Application): void {
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true
    })
  );

  app.use(helmet());
  app.use(hpp());
}

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Attach a unique request ID
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  next();
};
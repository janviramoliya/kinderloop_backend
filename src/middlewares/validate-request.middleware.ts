import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      const errorMsg = err.errors?.[0]?.message || 'Invalid request body';
      next(new ApiError(errorMsg, 400));
    }
  };
};


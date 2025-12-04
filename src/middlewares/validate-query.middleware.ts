import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/apiError';

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log the incoming query for debugging
      console.log('Incoming query parameters:', req.query);

      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;

      console.log('Validated query parameters:', validatedQuery);
      next();
    } catch (error: any) {
      console.error('Query validation error:', error);

      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        throw new ApiError(`Query validation failed: ${errorMessage}`, 400);
      }
      throw new ApiError('Invalid query parameters', 400);
    }
  };
};

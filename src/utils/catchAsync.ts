import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsync = (fn: (...args: any[]) => Promise<any>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
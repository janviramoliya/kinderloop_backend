import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/apiError';

const authorizePermission = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      throw new ApiError('Access denied. No role found.', 403);
    }

    if (!roles.includes(userRole)) {
      throw new ApiError('Access denied. You do not have the required permissions.', 403);
    }

    next();
  };
};

export default authorizePermission;

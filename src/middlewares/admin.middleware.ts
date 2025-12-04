import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { Roles } from '../constants/roles';

// Middleware to ensure only admin users can access certain routes
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (!userRole) {
    throw new ApiError('Authentication required', 401);
  }

  if (userRole !== Roles.ADMIN) {
    throw new ApiError('Admin access required', 403);
  }

  next();
};

// Middleware to check if user has admin or specific role access
export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      throw new ApiError('Authentication required', 401);
    }

    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403);
    }

    next();
  };
};

// Middleware to check admin permissions for product management
export const requireProductManagementAccess = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  const userId = req.user?.userId;

  if (!userRole || !userId) {
    throw new ApiError('Authentication required', 401);
  }

  // Admins have full access
  if (userRole === Roles.ADMIN) {
    return next();
  }

  // For non-admin users, check if they're trying to access their own products
  const productUserId = req.body.userId || req.params.userId;
  if (productUserId && productUserId !== userId) {
    throw new ApiError('You can only manage your own products', 403);
  }

  next();
};

export default {
  requireAdmin,
  requireRoles,
  requireProductManagementAccess
};

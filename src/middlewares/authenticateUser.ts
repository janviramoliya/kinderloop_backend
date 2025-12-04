import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { verifyAccessToken } from '../utils/jwt';

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.signedCookies.accessToken) {
    token = req.signedCookies.accessToken;
  }

  if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError('Token is not present', 401);
  }

  try {
    const payload = verifyAccessToken(token);

    // Attach the user and his permissions to the req object
    req.user = {
      email: payload.email,
      userId: payload.userId,
      role: payload.role
    };

    next();
  } catch (error) {
    throw new ApiError('Authentication invalid', 401);
  }
};

export default authenticateUser;

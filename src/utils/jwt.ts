import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'refresh_secret';

export const signAccessToken = (payload: Omit<TokenPayload, 'iat'>) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '1d' } as SignOptions);
};

export const signRefreshToken = (payload: Omit<TokenPayload, 'iat'>) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' } as SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch (err) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};
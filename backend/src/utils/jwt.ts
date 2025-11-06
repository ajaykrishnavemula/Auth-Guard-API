import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return jwt.sign(payload, config.jwtSecret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as any,
  };
  return jwt.sign(payload, config.jwtRefreshSecret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
};

export const generateEmailVerificationToken = (): string => {
  const options: SignOptions = {
    expiresIn: '24h',
  };
  return jwt.sign({ purpose: 'email-verification' }, config.jwtSecret, options);
};

export const generatePasswordResetToken = (): string => {
  const options: SignOptions = {
    expiresIn: '1h',
  };
  return jwt.sign({ purpose: 'password-reset' }, config.jwtSecret, options);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};



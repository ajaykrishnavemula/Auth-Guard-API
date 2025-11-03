import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthenticatedError, ForbiddenError } from '../errors';
import config from '../config';
import { JwtPayload } from '../interfaces/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // Check if 2FA is enabled but not verified for this session
    if (payload.isTwoFactorEnabled && !payload.isTwoFactorVerified) {
      throw new UnauthenticatedError('Two-factor authentication required');
    }
    
    // Attach the user to the request object
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Not authorized to access this route');
  }
  
  next();
};

/**
 * Middleware to authorize users based on their roles
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthenticatedError('Authentication invalid');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Not authorized to access this route');
    }
    
    next();
  };
};

export const requireVerifiedEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  
  // This would require adding emailVerified to the JWT payload
  // For now, we'll assume it's there
  if (!req.user.emailVerified) {
    throw new ForbiddenError('Please verify your email address first');
  }
  
  next();
};

export default authenticateUser;


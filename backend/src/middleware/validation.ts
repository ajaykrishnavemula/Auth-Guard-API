import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('All fields are required', 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  // Password validation
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  if (!/(?=.*[a-z])/.test(password)) {
    throw new AppError('Password must contain at least one lowercase letter', 400);
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter', 400);
  }

  if (!/(?=.*\d)/.test(password)) {
    throw new AppError('Password must contain at least one number', 400);
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    throw new AppError('Password must contain at least one special character', 400);
  }

  next();
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  next();
};

export const validateEmail = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  next();
};

export const validateResetPassword = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { password } = req.body;

  if (!password) {
    throw new AppError('Password is required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  if (!/(?=.*[a-z])/.test(password)) {
    throw new AppError('Password must contain at least one lowercase letter', 400);
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter', 400);
  }

  if (!/(?=.*\d)/.test(password)) {
    throw new AppError('Password must contain at least one number', 400);
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    throw new AppError('Password must contain at least one special character', 400);
  }

  next();
};

export const validateChangePassword = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }

  if (!/(?=.*[a-z])/.test(newPassword)) {
    throw new AppError('New password must contain at least one lowercase letter', 400);
  }

  if (!/(?=.*[A-Z])/.test(newPassword)) {
    throw new AppError('New password must contain at least one uppercase letter', 400);
  }

  if (!/(?=.*\d)/.test(newPassword)) {
    throw new AppError('New password must contain at least one number', 400);
  }

  if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
    throw new AppError('New password must contain at least one special character', 400);
  }

  next();
};

export const validateUpdateProfile = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { firstName, lastName, phoneNumber } = req.body;

  if (firstName && firstName.trim().length === 0) {
    throw new AppError('First name cannot be empty', 400);
  }

  if (lastName && lastName.trim().length === 0) {
    throw new AppError('Last name cannot be empty', 400);
  }

  if (phoneNumber && !/^\+?[\d\s-()]+$/.test(phoneNumber)) {
    throw new AppError('Invalid phone number format', 400);
  }

  next();
};



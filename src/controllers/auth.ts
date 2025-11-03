import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User';
import asyncWrapper from '../middleware/async';
import { BadRequestError, UnauthenticatedError, NotFoundError, TooManyRequestsError } from '../errors';
import emailService from '../services/email.service';
import auditService from '../services/audit.service';
import config from '../config';

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
export const register = asyncWrapper(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('Email already in use');
  }
  
  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });
  
  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();
  
  // Send verification email
  await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
  
  // Generate token
  const token = user.generateAuthToken();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'user_registered',
    'info',
    req,
    { name: user.name, email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  });
});

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
export const login = asyncWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Check if email and password are provided
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  
  // Check if user exists
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  
  // Check if account is locked
  if (user.isLocked()) {
    const lockTime = new Date(user.lockUntil as Date).getTime();
    const currentTime = new Date().getTime();
    const timeLeft = Math.ceil((lockTime - currentTime) / 1000 / 60); // minutes
    
    throw new TooManyRequestsError(
      `Account locked due to too many failed login attempts. Try again in ${timeLeft} minutes.`
    );
  }
  
  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    // Increment login attempts
    await user.incrementLoginAttempts();
    
    // Log failed login attempt
    auditService.logAudit(
      user._id.toString(),
      'user_login_failure',
      'warning',
      req,
      {
        email: user.email,
        reason: 'Invalid password',
        attempts: user.loginAttempts
      },
      'failure'
    ).catch(err => {
      console.error('Failed to log audit event:', err);
    });
    
    // Check if we should log a security event for multiple failures
    if (user.loginAttempts >= 3) {
      auditService.logSecurityEvent(
        'brute_force_attempt',
        user.loginAttempts >= 5 ? 'high' : 'medium',
        user._id.toString(),
        req,
        {
          email: user.email,
          attempts: user.loginAttempts
        }
      ).catch(err => {
        console.error('Failed to log security event:', err);
      });
    }
    
    throw new UnauthenticatedError('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();
  
  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  // Create session
  const sessionId = await auditService.createSession(
    user._id.toString(),
    token,
    refreshToken,
    req
  );
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'user_login_success',
    'info',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  // Check if 2FA is enabled
  const isTwoFactorRequired = user.isTwoFactorEnabled;
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: isTwoFactorRequired 
      ? 'Please complete two-factor authentication' 
      : 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    },
    token,
    refreshToken,
    isTwoFactorRequired,
  });
});

/**
 * Verify email
 * @route POST /api/v1/auth/verify-email
 */
export const verifyEmail = asyncWrapper(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    throw new BadRequestError('Verification token is required');
  }
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user by verification token
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: new Date() },
  });
  
  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }
  
  // Update user
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'email_verification_completed',
    'info',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully',
  });
});

/**
 * Resend verification email
 * @route POST /api/v1/auth/resend-verification
 */
export const resendVerification = asyncWrapper(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Email is required');
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (user.isEmailVerified) {
    throw new BadRequestError('Email is already verified');
  }
  
  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();
  
  // Send verification email
  await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'email_verification_requested',
    'info',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Verification email sent',
  });
});

/**
 * Forgot password
 * @route POST /api/v1/auth/forgot-password
 */
export const forgotPassword = asyncWrapper(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Email is required');
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();
  
  // Send password reset email
  await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'password_reset_requested',
    'warning',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset email sent',
  });
});

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 */
export const resetPassword = asyncWrapper(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    throw new BadRequestError('Token and password are required');
  }
  
  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user by reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });
  
  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  
  // Update user
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'password_reset_completed',
    'warning',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * Setup two-factor authentication
 * @route POST /api/v1/auth/setup-2fa
 */
export const setupTwoFactor = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  
  // Find user
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Generate 2FA secret
  const secret = user.generateTwoFactorSecret();
  await user.save();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'two_factor_enabled',
    'warning',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  // Send 2FA setup email
  await emailService.sendTwoFactorSetupEmail(user.email, user.name, secret);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Two-factor authentication setup initiated',
    secret,
  });
});

/**
 * Verify two-factor authentication
 * @route POST /api/v1/auth/verify-2fa
 */
export const verifyTwoFactor = asyncWrapper(async (req: Request, res: Response) => {
  const { email, token } = req.body;
  
  if (!email || !token) {
    throw new BadRequestError('Email and token are required');
  }
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (!user.twoFactorSecret) {
    throw new BadRequestError('Two-factor authentication not set up');
  }
  
  // Verify token
  const isValid = user.verifyTwoFactorToken(token);
  
  if (!isValid) {
    throw new UnauthenticatedError('Invalid two-factor token');
  }
  
  // If this is the first time verifying, enable 2FA
  if (!user.isTwoFactorEnabled) {
    user.isTwoFactorEnabled = true;
    await user.save();
    
    // Log audit event
    auditService.logAudit(
      user._id.toString(),
      'two_factor_enabled',
      'warning',
      req,
      { email: user.email },
      'success'
    ).catch(err => {
      console.error('Failed to log audit event:', err);
    });
  }
  
  // Log verification
  auditService.logAudit(
    user._id.toString(),
    'two_factor_verified',
    'info',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  // Generate token with 2FA verified
  const authToken = jwt.sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      isTwoFactorVerified: true,
      emailVerified: user.isEmailVerified,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Two-factor authentication verified',
    token: authToken,
  });
});

/**
 * Disable two-factor authentication
 * @route POST /api/v1/auth/disable-2fa
 */
export const disableTwoFactor = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { token } = req.body;
  
  if (!token) {
    throw new BadRequestError('Token is required');
  }
  
  // Find user
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (!user.isTwoFactorEnabled) {
    throw new BadRequestError('Two-factor authentication is not enabled');
  }
  
  // Verify token
  const isValid = user.verifyTwoFactorToken(token);
  
  if (!isValid) {
    throw new UnauthenticatedError('Invalid two-factor token');
  }
  
  // Disable 2FA
  user.isTwoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'two_factor_disabled',
    'warning',
    req,
    { email: user.email },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Two-factor authentication disabled',
  });
});

/**
 * Get current user
 * @route GET /api/v1/auth/me
 */
export const getCurrentUser = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  
  // Find user
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      lastLogin: user.lastLogin,
    },
  });
});

/**
 * Update user profile
 * @route PATCH /api/v1/auth/update-profile
 */
export const updateProfile = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { name, profile } = req.body;
  
  const updateData: any = {};
  
  if (name) {
    updateData.name = name;
  }
  
  if (profile) {
    // Only update provided profile fields
    Object.keys(profile).forEach((key) => {
      updateData[`profile.${key}`] = profile[key];
    });
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new BadRequestError('No update data provided');
  }
  
  // Find and update user
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      profile: user.profile,
    },
  });
});

/**
 * Update user preferences
 * @route PATCH /api/v1/auth/update-preferences
 */
export const updatePreferences = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { preferences } = req.body;
  
  if (!preferences || Object.keys(preferences).length === 0) {
    throw new BadRequestError('Preferences data is required');
  }
  
  const updateData: any = {};
  
  // Only update provided preference fields
  Object.keys(preferences).forEach((key) => {
    updateData[`preferences.${key}`] = preferences[key];
  });
  
  // Find and update user
  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Preferences updated successfully',
    preferences: user.preferences,
  });
});

/**
 * Change password
 * @route PATCH /api/v1/auth/change-password
 */
export const changePassword = asyncWrapper(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Current password and new password are required');
  }
  
  // Find user
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Check if current password is correct
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Log audit event
  auditService.logAudit(
    user._id.toString(),
    'password_changed',
    'warning',
    req,
    { userId: user._id.toString() },
    'success'
  ).catch(err => {
    console.error('Failed to log audit event:', err);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Refresh token
 * @route POST /api/v1/auth/refresh-token
 */
export const refreshToken = asyncWrapper(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }
  
  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, config.refreshTokenSecret) as { userId: string };
    
    // Find user
    const user = await User.findById(payload.userId);
    
    if (!user) {
      throw new UnauthenticatedError('Invalid refresh token');
    }
    
    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();
    
    res.status(StatusCodes.OK).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    throw new UnauthenticatedError('Invalid refresh token');
  }
});

/**
 * Google OAuth login
 * @route GET /api/v1/auth/google
 */
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * Google OAuth callback
 * @route GET /api/v1/auth/google/callback
 */
export const googleCallback = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, async (err: Error, user: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect(`${config.frontendUrl}/login?error=oauth-failed`);
    }
    
    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // Redirect to frontend with tokens
    return res.redirect(
      `${config.frontendUrl}/oauth-success?token=${token}&refreshToken=${refreshToken}`
    );
  })(req, res, next);
});

/**
 * GitHub OAuth login
 * @route GET /api/v1/auth/github
 */
export const githubLogin = passport.authenticate('github', {
  scope: ['user:email'],
});

/**
 * GitHub OAuth callback
 * @route GET /api/v1/auth/github/callback
 */
export const githubCallback = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('github', { session: false }, async (err: Error, user: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.redirect(`${config.frontendUrl}/login?error=oauth-failed`);
    }
    
    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // Redirect to frontend with tokens
    return res.redirect(
      `${config.frontendUrl}/oauth-success?token=${token}&refreshToken=${refreshToken}`
    );
  })(req, res, next);
});


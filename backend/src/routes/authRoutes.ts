import { Router, RequestHandler } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateEmail,
  validateResetPassword,
  validateChangePassword,
} from '../middleware/validation';
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRegister, register as RequestHandler);
router.post('/login', authLimiter, validateLogin, login as RequestHandler);
router.post('/refresh-token', refreshToken as RequestHandler);
router.get('/verify-email/:token', verifyEmail as RequestHandler);
router.post(
  '/resend-verification',
  emailVerificationLimiter,
  validateEmail,
  resendVerificationEmail as RequestHandler
);
router.post('/forgot-password', passwordResetLimiter, validateEmail, forgotPassword as RequestHandler);
router.post('/reset-password/:token', validateResetPassword, resetPassword as RequestHandler);

// Protected routes
router.post('/logout', authenticate as RequestHandler, logout as RequestHandler);
router.post('/change-password', authenticate as RequestHandler, validateChangePassword, changePassword as RequestHandler);

export default router;



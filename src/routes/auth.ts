import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  setupTwoFactor,
  verifyTwoFactor,
  disableTwoFactor,
  getCurrentUser,
  updateProfile,
  updatePreferences,
  changePassword,
  refreshToken,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
} from '../controllers/auth';
import authenticateUser from '../middleware/auth';
import rateLimiter from '../middleware/rate-limiter';

const router = express.Router();

// Public routes
router.post('/register', rateLimiter, register);
router.post('/login', rateLimiter, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', rateLimiter, resendVerification);
router.post('/forgot-password', rateLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-2fa', verifyTwoFactor);
router.post('/refresh-token', refreshToken);

// OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Protected routes
router.use(authenticateUser);
router.get('/me', getCurrentUser);
router.patch('/update-profile', updateProfile);
router.patch('/update-preferences', updatePreferences);
router.patch('/change-password', changePassword);
router.post('/setup-2fa', setupTwoFactor);
router.post('/disable-2fa', disableTwoFactor);

export default router;


import { Router, RequestHandler } from 'express';
import {
  getProfile,
  updateProfile,
  getActivity,
  deleteAccount,
} from '../controllers/userController';
import { authenticate, requireEmailVerification } from '../middleware/auth';
import { validateUpdateProfile } from '../middleware/validation';

const router = Router();

// User profile routes (require authentication)
router.get('/profile', authenticate as RequestHandler, getProfile as RequestHandler);
router.put('/profile', authenticate as RequestHandler, validateUpdateProfile, updateProfile as RequestHandler);

// User activity routes (require authentication)
router.get('/activity', authenticate as RequestHandler, getActivity as RequestHandler);

// Delete account (requires authentication and email verification)
router.delete('/account', authenticate as RequestHandler, requireEmailVerification as RequestHandler, deleteAccount as RequestHandler);

export default router;



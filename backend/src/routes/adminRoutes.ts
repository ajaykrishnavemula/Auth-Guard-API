import { Router, RequestHandler } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserLock,
  deleteUser,
  getUserActivity,
  getStatistics,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate as RequestHandler, requireAdmin as RequestHandler);

// User management routes
router.get('/users', getAllUsers as RequestHandler);
router.get('/users/:userId', getUserById as RequestHandler);
router.put('/users/:userId/role', updateUserRole as RequestHandler);
router.put('/users/:userId/lock', toggleUserLock as RequestHandler);
router.delete('/users/:userId', deleteUser as RequestHandler);
router.get('/users/:userId/activity', getUserActivity as RequestHandler);

// Statistics route
router.get('/statistics', getStatistics as RequestHandler);

export default router;



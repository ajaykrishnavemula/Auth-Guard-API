import express from 'express';
import {
  getAuditLogs,
  getSecurityEvents,
  resolveSecurityEvent,
  getUserSessions,
  invalidateUserSession,
  invalidateAllUserSessions,
  getUserActivity,
  getDashboardData,
} from '../controllers/admin';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateUser, authorizeRoles('admin'));

// Dashboard routes
router.get('/dashboard', getDashboardData);

// Audit log routes
router.get('/audit-logs', getAuditLogs);

// Security event routes
router.get('/security-events', getSecurityEvents);
router.patch('/security-events/:id/resolve', resolveSecurityEvent);

// User session routes
router.get('/user-sessions', getUserSessions);
router.delete('/user-sessions/:id', invalidateUserSession);
router.delete('/users/:userId/sessions', invalidateAllUserSessions);

// User activity routes
router.get('/users/:userId/activity', getUserActivity);

export default router;


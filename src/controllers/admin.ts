import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuditLog, SecurityEvent, UserSession } from '../models/AuditLog';
import User from '../models/User';
import asyncWrapper from '../middleware/async';
import { BadRequestError, NotFoundError, ForbiddenError } from '../errors';

/**
 * Get audit logs with pagination and filtering
 * @route GET /api/v1/admin/audit-logs
 */
export const getAuditLogs = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  // Parse query parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter
  const filter: any = {};
  
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  
  if (req.query.action) {
    filter.action = req.query.action;
  }
  
  if (req.query.severity) {
    filter.severity = req.query.severity;
  }
  
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  if (req.query.startDate && req.query.endDate) {
    filter.timestamp = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  } else if (req.query.startDate) {
    filter.timestamp = { $gte: new Date(req.query.startDate as string) };
  } else if (req.query.endDate) {
    filter.timestamp = { $lte: new Date(req.query.endDate as string) };
  }
  
  // Get total count for pagination
  const total = await AuditLog.countDocuments(filter);
  
  // Get audit logs
  const auditLogs = await AuditLog.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Get user details for user IDs
  const userIds = auditLogs
    .map(log => log.userId)
    .filter(id => id) as string[];
  
  const uniqueUserIds = [...new Set(userIds)];
  
  const users = await User.find({ _id: { $in: uniqueUserIds } })
    .select('name email')
    .lean();
  
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = { name: user.name, email: user.email };
    return map;
  }, {} as Record<string, { name: string; email: string }>);
  
  // Add user details to audit logs
  const enrichedLogs = auditLogs.map(log => {
    const userId = log.userId?.toString();
    return {
      ...log,
      user: userId ? userMap[userId] : null,
    };
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: enrichedLogs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    auditLogs: enrichedLogs,
  });
});

/**
 * Get security events with pagination and filtering
 * @route GET /api/v1/admin/security-events
 */
export const getSecurityEvents = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  // Parse query parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter
  const filter: any = {};
  
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  
  if (req.query.eventType) {
    filter.eventType = req.query.eventType;
  }
  
  if (req.query.severity) {
    filter.severity = req.query.severity;
  }
  
  if (req.query.resolved === 'true') {
    filter.resolved = true;
  } else if (req.query.resolved === 'false') {
    filter.resolved = false;
  }
  
  if (req.query.startDate && req.query.endDate) {
    filter.timestamp = {
      $gte: new Date(req.query.startDate as string),
      $lte: new Date(req.query.endDate as string),
    };
  } else if (req.query.startDate) {
    filter.timestamp = { $gte: new Date(req.query.startDate as string) };
  } else if (req.query.endDate) {
    filter.timestamp = { $lte: new Date(req.query.endDate as string) };
  }
  
  // Get total count for pagination
  const total = await SecurityEvent.countDocuments(filter);
  
  // Get security events
  const securityEvents = await SecurityEvent.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Get user details for user IDs
  const userIds = securityEvents
    .map(event => event.userId)
    .filter(id => id) as string[];
  
  const uniqueUserIds = [...new Set(userIds)];
  
  const users = await User.find({ _id: { $in: uniqueUserIds } })
    .select('name email')
    .lean();
  
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = { name: user.name, email: user.email };
    return map;
  }, {} as Record<string, { name: string; email: string }>);
  
  // Add user details to security events
  const enrichedEvents = securityEvents.map(event => {
    const userId = event.userId?.toString();
    return {
      ...event,
      user: userId ? userMap[userId] : null,
    };
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: enrichedEvents.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    securityEvents: enrichedEvents,
  });
});

/**
 * Resolve a security event
 * @route PATCH /api/v1/admin/security-events/:id/resolve
 */
export const resolveSecurityEvent = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;
  const { notes } = req.body;
  
  // Find and update security event
  const securityEvent = await SecurityEvent.findByIdAndUpdate(
    id,
    {
      resolved: true,
      resolvedBy: req.user?.userId,
      resolvedAt: new Date(),
      notes: notes || 'Resolved by admin',
    },
    { new: true, runValidators: true }
  );
  
  if (!securityEvent) {
    throw new NotFoundError(`No security event found with id ${id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Security event resolved',
    securityEvent,
  });
});

/**
 * Get active user sessions
 * @route GET /api/v1/admin/user-sessions
 */
export const getUserSessions = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  // Parse query parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  // Build filter
  const filter: any = {};
  
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  
  if (req.query.isActive === 'true') {
    filter.isActive = true;
  } else if (req.query.isActive === 'false') {
    filter.isActive = false;
  }
  
  // Get total count for pagination
  const total = await UserSession.countDocuments(filter);
  
  // Get user sessions
  const userSessions = await UserSession.find(filter)
    .sort({ lastActiveAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Get user details for user IDs
  const userIds = userSessions.map(session => session.userId);
  const uniqueUserIds = [...new Set(userIds)];
  
  const users = await User.find({ _id: { $in: uniqueUserIds } })
    .select('name email')
    .lean();
  
  const userMap = users.reduce((map, user) => {
    map[user._id.toString()] = { name: user.name, email: user.email };
    return map;
  }, {} as Record<string, { name: string; email: string }>);
  
  // Add user details to sessions
  const enrichedSessions = userSessions.map(session => {
    return {
      ...session,
      user: userMap[session.userId.toString()],
    };
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: enrichedSessions.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    sessions: enrichedSessions,
  });
});

/**
 * Invalidate a user session
 * @route DELETE /api/v1/admin/user-sessions/:id
 */
export const invalidateUserSession = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { id } = req.params;
  
  // Find and update session
  const session = await UserSession.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  
  if (!session) {
    throw new NotFoundError(`No session found with id ${id}`);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Session invalidated',
    session,
  });
});

/**
 * Invalidate all sessions for a user
 * @route DELETE /api/v1/admin/users/:userId/sessions
 */
export const invalidateAllUserSessions = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`No user found with id ${userId}`);
  }
  
  // Update all active sessions for the user
  const result = await UserSession.updateMany(
    { userId, isActive: true },
    { isActive: false }
  );
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'All sessions invalidated',
    count: result.modifiedCount,
  });
});

/**
 * Get user activity summary
 * @route GET /api/v1/admin/users/:userId/activity
 */
export const getUserActivity = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`No user found with id ${userId}`);
  }
  
  // Get recent audit logs
  const auditLogs = await AuditLog.find({ userId })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();
  
  // Get recent security events
  const securityEvents = await SecurityEvent.find({ userId })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();
  
  // Get active sessions
  const activeSessions = await UserSession.find({ userId, isActive: true })
    .sort({ lastActiveAt: -1 })
    .lean();
  
  // Get login statistics
  const loginCount = await AuditLog.countDocuments({ 
    userId, 
    action: 'user_login_success' 
  });
  
  const failedLoginCount = await AuditLog.countDocuments({ 
    userId, 
    action: 'user_login_failure' 
  });
  
  // Get last successful login
  const lastLogin = await AuditLog.findOne({ 
    userId, 
    action: 'user_login_success' 
  })
    .sort({ timestamp: -1 })
    .lean();
  
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
    activity: {
      loginCount,
      failedLoginCount,
      lastLogin: lastLogin?.timestamp,
      activeSessions: activeSessions.length,
      recentAuditLogs: auditLogs,
      recentSecurityEvents: securityEvents,
    },
  });
});

/**
 * Get system activity dashboard data
 * @route GET /api/v1/admin/dashboard
 */
export const getDashboardData = asyncWrapper(async (req: Request, res: Response) => {
  // Check if user is admin
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    throw new ForbiddenError('Not authorized to access this resource');
  }

  // Get date range (default: last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Get total users
  const totalUsers = await User.countDocuments();
  
  // Get new users in the last 30 days
  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });
  
  // Get active sessions
  const activeSessions = await UserSession.countDocuments({ isActive: true });
  
  // Get login statistics
  const successfulLogins = await AuditLog.countDocuments({
    action: 'user_login_success',
    timestamp: { $gte: startDate, $lte: endDate },
  });
  
  const failedLogins = await AuditLog.countDocuments({
    action: 'user_login_failure',
    timestamp: { $gte: startDate, $lte: endDate },
  });
  
  // Get security events
  const securityEvents = await SecurityEvent.countDocuments({
    timestamp: { $gte: startDate, $lte: endDate },
  });
  
  const unresolvedSecurityEvents = await SecurityEvent.countDocuments({
    resolved: false,
  });
  
  // Get high severity security events
  const highSeverityEvents = await SecurityEvent.countDocuments({
    severity: { $in: ['high', 'critical'] },
    resolved: false,
  });
  
  // Get daily login counts for the last 30 days
  const dailyLoginStats = await AuditLog.aggregate([
    {
      $match: {
        action: { $in: ['user_login_success', 'user_login_failure'] },
        timestamp: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          action: '$action',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ]);
  
  // Format daily login stats
  const dailyStats: Record<string, { success: number; failure: number }> = {};
  
  dailyLoginStats.forEach((stat) => {
    const date = stat._id.date;
    const action = stat._id.action;
    const count = stat.count;
    
    if (!dailyStats[date]) {
      dailyStats[date] = { success: 0, failure: 0 };
    }
    
    if (action === 'user_login_success') {
      dailyStats[date].success = count;
    } else if (action === 'user_login_failure') {
      dailyStats[date].failure = count;
    }
  });
  
  // Get recent security events
  const recentSecurityEvents = await SecurityEvent.find({
    resolved: false,
    severity: { $in: ['high', 'critical'] },
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .lean();
  
  res.status(StatusCodes.OK).json({
    success: true,
    stats: {
      users: {
        total: totalUsers,
        new: newUsers,
      },
      sessions: {
        active: activeSessions,
      },
      logins: {
        successful: successfulLogins,
        failed: failedLogins,
        ratio: successfulLogins / (successfulLogins + failedLogins || 1),
      },
      security: {
        total: securityEvents,
        unresolved: unresolvedSecurityEvents,
        highSeverity: highSeverityEvents,
      },
      dailyLoginStats: dailyStats,
      recentSecurityEvents,
    },
  });
});


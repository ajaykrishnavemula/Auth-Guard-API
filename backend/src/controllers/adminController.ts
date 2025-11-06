import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get all users (admin only)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(query)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin only)
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      '-password -refreshTokens -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.role = role;
    await user.save();

    // Log activity
    await Activity.create({
      userId: user._id,
      action: 'role_updated',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { newRole: role, updatedBy: req.user?.userId },
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lock/unlock user account (admin only)
export const toggleUserLock = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { lock } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (lock) {
      // Lock account for 24 hours
      user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Unlock account
      user.lockUntil = undefined;
      user.loginAttempts = 0;
    }

    await user.save();

    // Log activity
    await Activity.create({
      userId: user._id,
      action: lock ? 'account_locked' : 'account_unlocked',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { lockedBy: req.user?.userId },
    });

    res.json({
      success: true,
      message: `User account ${lock ? 'locked' : 'unlocked'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deleting own account
    if (userId === req.user?.userId) {
      throw new AppError('Cannot delete your own account', 400);
    }

    // Log activity before deletion
    await Activity.create({
      userId: user._id,
      action: 'account_deleted_by_admin',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      metadata: { deletedBy: req.user?.userId },
    });

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user activity logs (admin only)
export const getUserActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get system statistics (admin only)
export const getStatistics = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const lockedUsers = await User.countDocuments({
      lockUntil: { $gt: new Date() },
    });

    // Get recent activities
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email');

    // Get user registrations in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          verifiedUsers,
          adminUsers,
          lockedUsers,
          recentRegistrations,
        },
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};



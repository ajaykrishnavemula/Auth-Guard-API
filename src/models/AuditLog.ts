import mongoose, { Schema } from 'mongoose';
import { IAuditLog, ISecurityEvent, IUserSession } from '../interfaces/AuditLog';

// Audit log schema
const AuditLogSchema: Schema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication actions
      'user_registered',
      'user_login_success',
      'user_login_failed',
      'user_logout',
      'password_changed',
      'password_reset_requested',
      'password_reset_completed',
      'email_verification_requested',
      'email_verification_completed',
      'two_factor_enabled',
      'two_factor_disabled',
      'two_factor_verified',
      'account_locked',
      'account_unlocked',
      'account_deactivated',
      'account_reactivated',
      
      // OAuth actions
      'oauth_login',
      'oauth_link',
      'oauth_unlink',
      
      // Profile actions
      'profile_updated',
      'avatar_updated',
      'preferences_updated',
      
      // Admin actions
      'user_role_changed',
      'user_deleted',
      'user_created',
      'system_settings_updated',
    ],
  },
  severity: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  details: Schema.Types.Mixed,
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure'],
    default: 'success',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// Security event schema
const SecurityEventSchema: Schema = new Schema<ISecurityEvent>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'suspicious_login',
      'brute_force_attempt',
      'password_guessing',
      'session_hijacking',
      'unusual_location',
      'unusual_device',
    ],
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  details: Schema.Types.Mixed,
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster querying
SecurityEventSchema.index({ userId: 1, timestamp: -1 });
SecurityEventSchema.index({ eventType: 1, timestamp: -1 });
SecurityEventSchema.index({ severity: 1, timestamp: -1 });
SecurityEventSchema.index({ resolved: 1, timestamp: -1 });
SecurityEventSchema.index({ timestamp: -1 });

// User session schema
const UserSessionSchema: Schema = new Schema<IUserSession>({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  device: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'other'],
    },
    name: String,
    os: String,
    browser: String,
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes for faster querying
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ token: 1 });
UserSessionSchema.index({ refreshToken: 1 });
UserSessionSchema.index({ expiresAt: 1 });

// Create models
const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
const SecurityEvent = mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);

export { AuditLog, SecurityEvent, UserSession };


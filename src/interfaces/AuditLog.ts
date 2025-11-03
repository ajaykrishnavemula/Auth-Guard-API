import { Document } from 'mongoose';
import { Request } from 'express';

/**
 * Audit log severity levels
 */
export type AuditLogSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit log status
 */
export type AuditStatus = 'success' | 'failure' | 'pending';

/**
 * Audit log action types
 */
export type AuditLogActionType =
  | 'user_registered'
  | 'user_login_success'
  | 'user_login_failure'
  | 'user_logout'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verification_requested'
  | 'email_verification_completed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'two_factor_verified'
  | 'profile_updated'
  | 'oauth_login'
  | 'get'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete';

/**
 * Security event types
 */
export type SecurityEventType =
  | 'suspicious_login'
  | 'brute_force_attempt'
  | 'password_guessing'
  | 'session_hijacking'
  | 'unusual_location'
  | 'unusual_device';

/**
 * Security event severity
 */
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Geolocation data
 */
export interface GeoLocation {
  country?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Device information
 */
export interface DeviceInfo {
  type?: 'mobile' | 'tablet' | 'desktop' | 'other';
  name?: string;
  os?: string;
  browser?: string;
}

/**
 * Audit log interface
 */
export interface IAuditLog extends Document {
  userId?: string | null;
  action: AuditLogActionType;
  severity: AuditLogSeverity;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  status: 'success' | 'failure';
}

/**
 * Security event interface
 */
export interface ISecurityEvent extends Document {
  userId?: string | null;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  location?: GeoLocation;
  details?: any;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

/**
 * User session interface
 */
export interface IUserSession extends Document {
  userId: string;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  device?: DeviceInfo;
  location?: GeoLocation;
  expiresAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Request context for audit logging
 */
export interface RequestContext {
  ip: string;
  userAgent: string;
  geoLocation?: GeoLocation;
  deviceInfo?: DeviceInfo;
}

/**
 * Extract request context from Express request
 */
export function extractRequestContext(req: Request): RequestContext {
  return {
    ip: req.ip || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'] || '',
  };
}


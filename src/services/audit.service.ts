import { Request } from 'express';
import { AuditLog, SecurityEvent, UserSession } from '../models/AuditLog';
import { IAuditLog, AuditLogActionType, AuditLogSeverity } from '../interfaces/AuditLog';
import { logger } from '../utils/logger';
import config from '../config';
import geoip from 'geoip-lite';
import UAParser from 'ua-parser-js';

/**
 * Audit service for logging user actions and security events
 */
class AuditService {
  /**
   * Log an audit event
   * @param userId User ID (optional)
   * @param action Action type
   * @param severity Severity level
   * @param req Express request object (optional)
   * @param details Additional details (optional)
   * @param status Success or failure
   * @returns Promise<IAuditLog> Created audit log
   */
  async logAudit(
    userId: string | null,
    action: AuditLogActionType,
    severity: AuditLogSeverity = 'info',
    req?: Request,
    details?: any,
    status: 'success' | 'failure' = 'success'
  ): Promise<IAuditLog> {
    try {
      const ipAddress = req ? this.getIpAddress(req) : undefined;
      const userAgent = req ? req.headers['user-agent'] : undefined;

      const auditLog = await AuditLog.create({
        userId,
        action,
        severity,
        ipAddress,
        userAgent,
        details,
        status,
        timestamp: new Date(),
      });

      // Log critical events to application logs as well
      if (severity === 'critical' || severity === 'error') {
        logger.warn(`Audit event: ${action} | User: ${userId || 'anonymous'} | Status: ${status} | IP: ${ipAddress || 'unknown'}`);
      }

      return auditLog;
    } catch (error) {
      logger.error(`Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Log a security event
   * @param eventType Security event type
   * @param severity Severity level
   * @param userId User ID (optional)
   * @param req Express request object (optional)
   * @param details Additional details (optional)
   * @returns Promise<void>
   */
  async logSecurityEvent(
    eventType: 'suspicious_login' | 'brute_force_attempt' | 'password_guessing' | 'session_hijacking' | 'unusual_location' | 'unusual_device',
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId?: string,
    req?: Request,
    details?: any
  ): Promise<void> {
    try {
      const ipAddress = req ? this.getIpAddress(req) : undefined;
      const userAgent = req ? req.headers['user-agent'] : undefined;
      let location;

      if (ipAddress) {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          location = {
            country: geo.country,
            city: geo.city,
            coordinates: {
              latitude: geo.ll[0],
              longitude: geo.ll[1],
            },
          };
        }
      }

      await SecurityEvent.create({
        userId,
        eventType,
        severity,
        ipAddress,
        userAgent,
        location,
        details,
        resolved: false,
        timestamp: new Date(),
      });

      // Log security events to application logs
      logger.warn(`Security event: ${eventType} | Severity: ${severity} | User: ${userId || 'anonymous'} | IP: ${ipAddress || 'unknown'}`);

      // Implement additional security measures based on severity
      if (severity === 'high' || severity === 'critical') {
        // TODO: Implement real-time notifications for security team
        // TODO: Implement automatic countermeasures
      }
    } catch (error) {
      logger.error(`Failed to create security event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new user session
   * @param userId User ID
   * @param token JWT token
   * @param refreshToken Refresh token
   * @param req Express request object
   * @returns Promise<string> Session ID
   */
  async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    req: Request
  ): Promise<string> {
    try {
      const ipAddress = this.getIpAddress(req);
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Parse user agent
      const deviceInfo = this.parseUserAgent(userAgent);
      
      // Get location info
      let location;
      if (ipAddress) {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          location = {
            country: geo.country,
            city: geo.city,
            coordinates: {
              latitude: geo.ll[0],
              longitude: geo.ll[1],
            },
          };
        }
      }

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(config.jwtExpiresIn));

      const session = await UserSession.create({
        userId,
        token,
        refreshToken,
        ipAddress,
        userAgent,
        device: deviceInfo,
        location,
        expiresAt,
        lastActiveAt: new Date(),
        isActive: true,
      });

      return session._id.toString();
    } catch (error) {
      logger.error(`Failed to create user session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Update session activity
   * @param token JWT token
   * @returns Promise<void>
   */
  async updateSessionActivity(token: string): Promise<void> {
    try {
      await UserSession.updateOne(
        { token, isActive: true },
        { $set: { lastActiveAt: new Date() } }
      );
    } catch (error) {
      logger.error(`Failed to update session activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invalidate a user session
   * @param token JWT token
   * @returns Promise<void>
   */
  async invalidateSession(token: string): Promise<void> {
    try {
      await UserSession.updateOne(
        { token },
        { $set: { isActive: false } }
      );
    } catch (error) {
      logger.error(`Failed to invalidate session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Invalidate all sessions for a user
   * @param userId User ID
   * @param exceptToken Token to exclude (optional)
   * @returns Promise<void>
   */
  async invalidateAllSessions(userId: string, exceptToken?: string): Promise<void> {
    try {
      const query: any = { userId, isActive: true };
      if (exceptToken) {
        query.token = { $ne: exceptToken };
      }

      await UserSession.updateMany(
        query,
        { $set: { isActive: false } }
      );
    } catch (error) {
      logger.error(`Failed to invalidate all sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a session is valid
   * @param token JWT token
   * @returns Promise<boolean>
   */
  async isSessionValid(token: string): Promise<boolean> {
    try {
      const session = await UserSession.findOne({
        token,
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      return !!session;
    } catch (error) {
      logger.error(`Failed to check session validity: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Get active sessions for a user
   * @param userId User ID
   * @returns Promise<any[]> Active sessions
   */
  async getActiveSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await UserSession.find({
        userId,
        isActive: true,
      }).sort({ lastActiveAt: -1 });

      return sessions.map(session => ({
        id: session._id,
        device: session.device,
        location: session.location,
        ipAddress: session.ipAddress,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
      }));
    } catch (error) {
      logger.error(`Failed to get active sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  /**
   * Get IP address from request
   * @param req Express request object
   * @returns string IP address
   */
  private getIpAddress(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Parse user agent string
   * @param userAgent User agent string
   * @returns Device information
   */
  private parseUserAgent(userAgent: string): any {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    let deviceType = 'other';
    if (result.device.type === 'mobile') deviceType = 'mobile';
    else if (result.device.type === 'tablet') deviceType = 'tablet';
    else if (result.device.type === 'console') deviceType = 'other';
    else if (!result.device.type) deviceType = 'desktop';

    return {
      type: deviceType,
      name: result.device.model || result.device.vendor || 'unknown',
      os: `${result.os.name || 'unknown'} ${result.os.version || ''}`.trim(),
      browser: `${result.browser.name || 'unknown'} ${result.browser.version || ''}`.trim(),
    };
  }
}

export default new AuditService();


import { Request, Response, NextFunction } from 'express';
import auditService from '../services/audit.service';
import { logger } from '../utils/logger';

/**
 * Middleware to log API requests
 */
export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health check endpoints
  if (req.path === '/health' || req.path === '/api/v1/health') {
    return next();
  }

  const startTime = Date.now();
  const userId = req.user?.userId;

  // Log request
  logger.info(`${req.method} ${req.path} - User: ${userId || 'anonymous'}`);

  // Capture response data for logging
  const responseData = {
    startTime,
    method: req.method,
    path: req.path,
    userId: userId || null
  };

  // Intercept the response using on-finish
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response
    logger.info(`${responseData.method} ${responseData.path} - Status: ${statusCode} - ${responseTime}ms`);

    // Log to audit trail for important actions
    if (shouldAuditRequest(req)) {
      const action = determineAction(req);
      const severity = determineSeverity(req, statusCode);
      const status = statusCode >= 400 ? 'failure' : 'success';

      auditService.logAudit(
        responseData.userId,
        action,
        severity,
        req,
        {
          method: responseData.method,
          path: responseData.path,
          statusCode,
          responseTime,
          params: req.params,
          query: sanitizeQuery(req.query),
          body: sanitizeBody(req.body)
        },
        status
      ).catch(err => {
        logger.error(`Failed to log audit: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
    }
  });

  next();
};

/**
 * Middleware to detect and log suspicious activities
 */
export const securityMonitor = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  // Check for suspicious patterns
  const suspiciousPatterns = detectSuspiciousPatterns(req);
  
  if (suspiciousPatterns.length > 0) {
    // Log security event for each detected pattern
    suspiciousPatterns.forEach(pattern => {
      auditService.logSecurityEvent(
        pattern.type,
        pattern.severity,
        userId,
        req,
        pattern.details
      ).catch(err => {
        logger.error(`Failed to log security event: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
    });
  }

  next();
};

/**
 * Middleware to update session activity
 */
export const sessionActivity = (req: Request, res: Response, next: NextFunction) => {
  // Skip for non-authenticated requests
  if (!req.user?.userId) {
    return next();
  }

  // Get token from authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Update session activity
    auditService.updateSessionActivity(token).catch(err => {
      logger.error(`Failed to update session activity: ${err instanceof Error ? err.message : 'Unknown error'}`);
    });
  }

  next();
};

/**
 * Determine if a request should be audited
 */
function shouldAuditRequest(req: Request): boolean {
  // Audit all write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return true;
  }

  // Audit authentication and sensitive operations
  if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
    return true;
  }

  // Don't audit static content or health checks
  if (req.path.includes('/public/') || req.path.includes('/health')) {
    return false;
  }

  return false;
}

/**
 * Determine the audit action based on the request
 */
function determineAction(req: Request): any {
  // Authentication actions
  if (req.path.includes('/auth/register') && req.method === 'POST') {
    return 'user_registered';
  }
  if (req.path.includes('/auth/login') && req.method === 'POST') {
    return 'user_login_success';
  }
  if (req.path.includes('/auth/logout') && req.method === 'POST') {
    return 'user_logout';
  }
  if (req.path.includes('/auth/change-password') && req.method === 'PATCH') {
    return 'password_changed';
  }
  if (req.path.includes('/auth/forgot-password') && req.method === 'POST') {
    return 'password_reset_requested';
  }
  if (req.path.includes('/auth/reset-password') && req.method === 'POST') {
    return 'password_reset_completed';
  }
  if (req.path.includes('/auth/verify-email') && req.method === 'POST') {
    return 'email_verification_completed';
  }
  if (req.path.includes('/auth/resend-verification') && req.method === 'POST') {
    return 'email_verification_requested';
  }
  if (req.path.includes('/auth/setup-2fa') && req.method === 'POST') {
    return 'two_factor_enabled';
  }
  if (req.path.includes('/auth/disable-2fa') && req.method === 'POST') {
    return 'two_factor_disabled';
  }
  if (req.path.includes('/auth/verify-2fa') && req.method === 'POST') {
    return 'two_factor_verified';
  }
  if (req.path.includes('/auth/update-profile') && req.method === 'PATCH') {
    return 'profile_updated';
  }

  // OAuth actions
  if (req.path.includes('/auth/google/callback') || req.path.includes('/auth/github/callback')) {
    return 'oauth_login';
  }

  // Default to the HTTP method
  return req.method.toLowerCase();
}

/**
 * Determine the severity based on the request and response
 */
function determineSeverity(req: Request, statusCode: number): 'info' | 'warning' | 'error' | 'critical' {
  // Critical operations
  if (req.path.includes('/admin/') || req.path.includes('/auth/disable-2fa')) {
    return 'critical';
  }

  // Error responses
  if (statusCode >= 500) {
    return 'error';
  }
  if (statusCode >= 400) {
    return 'warning';
  }

  // Default
  return 'info';
}

/**
 * Sanitize query parameters for logging
 */
function sanitizeQuery(query: any): any {
  const sanitized = { ...query };
  
  // Remove sensitive fields
  const sensitiveFields = ['token', 'password', 'secret', 'key'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body: any): any {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token', 'secret', 'key'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Detect suspicious patterns in the request
 */
type SecurityEventType = 'suspicious_login' | 'brute_force_attempt' | 'password_guessing' | 'session_hijacking' | 'unusual_location' | 'unusual_device';
type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityPattern {
  type: SecurityEventType;
  severity: SecuritySeverity;
  details: any;
}

function detectSuspiciousPatterns(req: Request): Array<SecurityPattern> {
  const patterns = [];

  // Check for SQL injection attempts
  const sqlInjectionPattern = /('|"|;|--|\/\*|\*\/|xp_|sp_|exec|select|insert|update|delete|drop|union|into|load_file|outfile)/i;
  const hasSqlInjection = Object.values(req.query).some(value => 
    typeof value === 'string' && sqlInjectionPattern.test(value)
  ) || (
    req.body && typeof req.body === 'object' && Object.values(req.body).some(value => 
      typeof value === 'string' && sqlInjectionPattern.test(value)
    )
  );

  if (hasSqlInjection) {
    patterns.push({
      type: 'suspicious_login' as SecurityEventType,
      severity: 'high' as SecuritySeverity,
      details: {
        reason: 'Potential SQL injection attempt',
        path: req.path,
        method: req.method
      }
    });
  }

  // Check for XSS attempts
  const xssPattern = /(<script|javascript:|on\w+\s*=|alert\s*\(|eval\s*\()/i;
  const hasXss = Object.values(req.query).some(value => 
    typeof value === 'string' && xssPattern.test(value)
  ) || (
    req.body && typeof req.body === 'object' && Object.values(req.body).some(value => 
      typeof value === 'string' && xssPattern.test(value)
    )
  );

  if (hasXss) {
    patterns.push({
      type: 'suspicious_login' as SecurityEventType,
      severity: 'high' as SecuritySeverity,
      details: {
        reason: 'Potential XSS attempt',
        path: req.path,
        method: req.method
      }
    });
  }

  // Check for brute force login attempts
  if (req.path.includes('/auth/login') && req.method === 'POST') {
    // This would typically be handled by rate limiting middleware
    // But we can add additional detection here
  }

  return patterns;
}


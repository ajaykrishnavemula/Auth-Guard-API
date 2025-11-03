# Auth-Guard-API - Complete API Reference

> **Comprehensive API documentation for the Authentication & Authorization System**

**Base URL**: `http://localhost:5000/api/v1`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Responses](#error-responses)
- [Status Codes](#status-codes)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Structure

```json
{
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "user|admin",
  "isTwoFactorEnabled": boolean,
  "isTwoFactorVerified": boolean,
  "emailVerified": boolean
}
```

---

## 🌐 Public Endpoints

### 1. Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `name`: Required, 2-50 characters
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must include uppercase, lowercase, number, and special character

---

### 2. Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "isTwoFactorEnabled": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isTwoFactorRequired": false
}
```

**Rate Limit**: 5 requests per 15 minutes

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Account locked due to failed attempts

---

### 3. Verify Email

Verify user email address with token.

**Endpoint**: `POST /auth/verify-email`

**Request Body**:
```json
{
  "token": "verification-token-from-email"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 4. Resend Verification Email

Request a new verification email.

**Endpoint**: `POST /auth/resend-verification`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Rate Limit**: 3 requests per hour

---

### 5. Forgot Password

Request password reset email.

**Endpoint**: `POST /auth/forgot-password`

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limit**: 3 requests per hour

---

### 6. Reset Password

Reset password using token from email.

**Endpoint**: `POST /auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### 7. Verify Two-Factor Authentication

Verify 2FA token during login.

**Endpoint**: `POST /auth/verify-2fa`

**Request Body**:
```json
{
  "email": "john@example.com",
  "token": "123456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Two-factor authentication verified",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 8. Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh-token`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 9. Google OAuth Login

Initiate Google OAuth flow.

**Endpoint**: `GET /auth/google`

**Response**: Redirects to Google OAuth consent screen

---

### 10. Google OAuth Callback

Handle Google OAuth callback.

**Endpoint**: `GET /auth/google/callback`

**Response**: Redirects to frontend with tokens

---

### 11. GitHub OAuth Login

Initiate GitHub OAuth flow.

**Endpoint**: `GET /auth/github`

**Response**: Redirects to GitHub OAuth consent screen

---

### 12. GitHub OAuth Callback

Handle GitHub OAuth callback.

**Endpoint**: `GET /auth/github/callback`

**Response**: Redirects to frontend with tokens

---

## 🔒 Protected Endpoints

All endpoints below require authentication.

### 1. Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /auth/me`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "isTwoFactorEnabled": false,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Update Profile

Update user profile information.

**Endpoint**: `PATCH /auth/update-profile`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Updated",
  "profile": {
    "bio": "Software Developer",
    "location": "San Francisco",
    "website": "https://johndoe.com"
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true,
    "isTwoFactorEnabled": false,
    "profile": {
      "bio": "Software Developer",
      "location": "San Francisco",
      "website": "https://johndoe.com"
    }
  }
}
```

---

### 3. Update Preferences

Update user preferences.

**Endpoint**: `PATCH /auth/update-preferences`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": false,
    "theme": "dark",
    "language": "en"
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "emailNotifications": true,
    "pushNotifications": false,
    "theme": "dark",
    "language": "en"
  }
}
```

---

### 4. Change Password

Change user password.

**Endpoint**: `PATCH /auth/change-password`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5. Setup Two-Factor Authentication

Enable 2FA for account.

**Endpoint**: `POST /auth/setup-2fa`

**Headers**:
```http
Authorization: Bearer <token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Two-factor authentication setup initiated",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

---

### 6. Disable Two-Factor Authentication

Disable 2FA for account.

**Endpoint**: `POST /auth/disable-2fa`

**Headers**:
```http
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "token": "123456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Two-factor authentication disabled"
}
```

---

## 👨‍💼 Admin Endpoints

All endpoints below require admin role.

### 1. Get Dashboard Data

Get admin dashboard statistics.

**Endpoint**: `GET /admin/dashboard`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 890,
    "newUsersToday": 45,
    "totalSessions": 3420,
    "activeSessions": 234,
    "securityEvents": {
      "total": 12,
      "critical": 2,
      "high": 5,
      "medium": 3,
      "low": 2
    },
    "auditLogs": {
      "total": 15678,
      "today": 234
    }
  }
}
```

---

### 2. Get Audit Logs

Retrieve system audit logs.

**Endpoint**: `GET /admin/audit-logs`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "action": "user_login_success",
        "severity": "info",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "email": "john@example.com"
        },
        "status": "success",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 1000,
      "itemsPerPage": 20
    }
  }
}
```

---

### 3. Get Security Events

Retrieve security events.

**Endpoint**: `GET /admin/security-events`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `severity` (optional): Filter by severity (critical, high, medium, low)
- `resolved` (optional): Filter by resolution status

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "brute_force_attempt",
        "severity": "high",
        "userId": "507f1f77bcf86cd799439012",
        "ipAddress": "192.168.1.1",
        "details": {
          "attempts": 5,
          "email": "john@example.com"
        },
        "resolved": false,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

### 4. Resolve Security Event

Mark security event as resolved.

**Endpoint**: `PATCH /admin/security-events/:id/resolve`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Request Body**:
```json
{
  "resolution": "Investigated and confirmed false positive",
  "action": "no_action_required"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Security event resolved successfully"
}
```

---

### 5. Get User Sessions

Get all active user sessions.

**Endpoint**: `GET /admin/user-sessions`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `userId` (optional): Filter by user ID

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439012",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "expiresAt": "2024-01-16T10:30:00.000Z",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "itemsPerPage": 20
    }
  }
}
```

---

### 6. Invalidate User Session

Terminate a specific user session.

**Endpoint**: `DELETE /admin/user-sessions/:id`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Session invalidated successfully"
}
```

---

### 7. Invalidate All User Sessions

Terminate all sessions for a specific user.

**Endpoint**: `DELETE /admin/users/:userId/sessions`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "All user sessions invalidated successfully",
  "count": 5
}
```

---

### 8. Get User Activity

Get activity history for a specific user.

**Endpoint**: `GET /admin/users/:userId/activity`

**Headers**:
```http
Authorization: Bearer <admin-token>
```

**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "507f1f77bcf86cd799439011",
        "action": "user_login_success",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Validation Error Format

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## 🔒 Security Features

### Rate Limiting

- **Login**: 5 requests per 15 minutes
- **Registration**: 3 requests per hour
- **Password Reset**: 3 requests per hour
- **Email Verification**: 3 requests per hour

### Account Lockout

- Account locked after 5 failed login attempts
- Lockout duration: 30 minutes
- Automatic unlock after duration expires

### Token Expiration

- **Access Token**: 1 hour
- **Refresh Token**: 7 days
- **Verification Token**: 24 hours
- **Reset Token**: 1 hour

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All requests must include `Content-Type: application/json` header
3. Passwords must meet complexity requirements
4. Email verification is required for full account access
5. 2FA is optional but recommended for enhanced security

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Ajay Krishna (ajaykrishnatech@gmail.com)
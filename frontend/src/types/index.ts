// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin?: Date;
  profile?: UserProfile;
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  avatarUrl?: string;
  socialLinks?: SocialLink[];
  skills?: string[];
  interests?: string[];
  preferredLanguage?: string;
  timezone?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  theme: 'light' | 'dark' | 'system';
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
  isTwoFactorRequired?: boolean;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  secret: string;
  qrCode: string;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  browser?: string;
  isActive: boolean;
  isCurrent?: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

// Activity types
export interface Activity {
  id: string;
  userId: string;
  action: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress: string;
  userAgent: string;
  location?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure';
  timestamp: Date;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  failedLoginAttempts: number;
  twoFactorEnabled: number;
  emailVerified: number;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  isLocked?: boolean;
  lockUntil?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface PasswordResetData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  profile?: Partial<UserProfile>;
}

export interface UpdatePreferencesData {
  preferences: Partial<UserPreferences>;
}

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}



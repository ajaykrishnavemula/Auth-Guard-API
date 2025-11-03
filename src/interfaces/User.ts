import { Document } from 'mongoose';

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
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  skills?: string[];
  interests?: string[];
  preferredLanguage?: string;
  timezone?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  oauthProfiles: {
    provider: string;
    id: string;
    displayName?: string;
    emails?: { value: string; primary?: boolean }[];
    photos?: { value: string }[];
  }[];
  profile: UserProfile;
  preferences: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    twoFactorMethod?: 'app' | 'sms' | 'email';
    theme?: 'light' | 'dark' | 'system';
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  generateVerificationToken(): string;
  generatePasswordResetToken(): string;
  generateTwoFactorSecret(): string;
  verifyTwoFactorToken(token: string): boolean;
  incrementLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  isTwoFactorEnabled: boolean;
  isTwoFactorVerified?: boolean;
  emailVerified: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}


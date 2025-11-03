import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import { IUser, JwtPayload } from '../interfaces/User';
import config from '../config';

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in query results by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not supported',
      },
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorSecret: String,
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: Date,
    lastLogin: Date,
    oauthProfiles: [
      {
        provider: String,
        id: String,
        displayName: String,
        emails: [
          {
            value: String,
            primary: Boolean,
          },
        ],
        photos: [
          {
            value: String,
          },
        ],
      },
    ],
    profile: {
      firstName: String,
      lastName: String,
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot be more than 500 characters'],
      },
      location: String,
      website: {
        type: String,
        match: [
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
          'Please provide a valid URL',
        ],
      },
      company: String,
      jobTitle: String,
      phoneNumber: {
        type: String,
        match: [
          /^(\+\d{1,3}[- ]?)?\d{10}$/,
          'Please provide a valid phone number',
        ],
      },
      dateOfBirth: Date,
      avatarUrl: String,
      socialLinks: [
        {
          platform: String,
          url: {
            type: String,
            match: [
              /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
              'Please provide a valid URL',
            ],
          },
        },
      ],
      skills: [String],
      interests: [String],
      preferredLanguage: {
        type: String,
        default: 'en',
      },
      timezone: String,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      twoFactorMethod: {
        type: String,
        enum: ['app', 'sms', 'email'],
        default: 'app',
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function (): string {
  const payload: JwtPayload = {
    userId: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isTwoFactorEnabled: this.isTwoFactorEnabled,
    emailVerified: this.isEmailVerified,
  };
  
  return jwt.sign(
    payload,
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { userId: this._id, tokenVersion: Date.now() },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiresIn }
  );
};

// Generate email verification token
UserSchema.methods.generateVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Token expires in 24 hours
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  return verificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Token expires in 10 minutes
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  return resetToken;
};

// Generate two-factor authentication secret
UserSchema.methods.generateTwoFactorSecret = function (): string {
  const secret = speakeasy.generateSecret({ length: 20 });
  this.twoFactorSecret = secret.base32;
  return secret.base32;
};

// Verify two-factor token
UserSchema.methods.verifyTwoFactorToken = function (token: string): boolean {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token,
  });
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, reset the count and remove the lock
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    // Otherwise increment login attempts
    this.loginAttempts += 1;
    
    // Lock the account if we've reached max attempts and account is not already locked
    if (this.loginAttempts >= config.maxLoginAttempts && !this.isLocked()) {
      this.lockUntil = new Date(Date.now() + config.lockTime);
    }
  }
  
  await this.save();
};

// Check if user account is locked
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export default mongoose.model<IUser>('User', UserSchema);


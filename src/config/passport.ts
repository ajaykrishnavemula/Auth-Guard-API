import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import config from './index';
import { logger } from '../utils/logger';

// Define types for OAuth profiles
interface EmailObject {
  value: string;
  verified?: boolean;
  primary?: boolean;
}

interface PhotoObject {
  value: string;
}

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Check if 2FA is required but not verified
      if (payload.isTwoFactorEnabled && !payload.isTwoFactorVerified) {
        return done(null, false, { message: 'Two-factor authentication required' });
      }

      const user = await User.findById(payload.userId);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      return done(null, { 
        userId: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      });
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (config.googleClientId && config.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: `${config.frontendUrl}/api/v1/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            'oauthProfiles.provider': 'google',
            'oauthProfiles.id': profile.id,
          });

          if (user) {
            // Update user information
            const oauthProfileIndex = user.oauthProfiles.findIndex(
              (p) => p.provider === 'google' && p.id === profile.id
            );

            if (oauthProfileIndex !== -1) {
              user.oauthProfiles[oauthProfileIndex].displayName = profile.displayName;
              
              if (profile.emails && profile.emails.length > 0) {
                user.oauthProfiles[oauthProfileIndex].emails = profile.emails.map((email) => ({
                  value: email.value,
                  primary: !!email.verified,
                }));
              }
              
              if (profile.photos && profile.photos.length > 0) {
                user.oauthProfiles[oauthProfileIndex].photos = profile.photos.map((photo) => ({
                  value: photo.value,
                }));
              }
            }

            user.lastLogin = new Date();
            await user.save();
          } else {
            // Check if user exists with the same email
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
            
            if (email) {
              user = await User.findOne({ email });
              
              if (user) {
                // Add OAuth profile to existing user
                user.oauthProfiles.push({
                  provider: 'google',
                  id: profile.id,
                  displayName: profile.displayName,
                  emails: profile.emails?.map((email) => ({
                    value: email.value,
                    primary: !!email.verified,
                  })),
                  photos: profile.photos?.map((photo) => ({
                    value: photo.value,
                  })),
                });
                
                user.lastLogin = new Date();
                await user.save();
              } else {
                // Create new user
                user = await User.create({
                  name: profile.displayName,
                  email,
                  password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                  isEmailVerified: true, // Email is verified by Google
                  oauthProfiles: [
                    {
                      provider: 'google',
                      id: profile.id,
                      displayName: profile.displayName,
                      emails: profile.emails?.map((email) => ({
                        value: email.value,
                        primary: !!email.verified,
                      })),
                      photos: profile.photos?.map((photo) => ({
                        value: photo.value,
                      })),
                    },
                  ],
                  lastLogin: new Date(),
                });
              }
            } else {
              // Cannot create user without email
              return done(null, false, { message: 'No email provided by Google' });
            }
          }

          return done(null, user);
        } catch (error) {
          logger.error(`Google OAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return done(error as Error, false);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (config.githubClientId && config.githubClientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.githubClientId,
        clientSecret: config.githubClientSecret,
        callbackURL: `${config.frontendUrl}/api/v1/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: VerifyCallback) => {
        try {
          // Check if user already exists
          let user = await User.findOne({
            'oauthProfiles.provider': 'github',
            'oauthProfiles.id': profile.id,
          });

          if (user) {
            // Update user information
            const oauthProfileIndex = user.oauthProfiles.findIndex(
              (p) => p.provider === 'github' && p.id === profile.id
            );

            if (oauthProfileIndex !== -1) {
              user.oauthProfiles[oauthProfileIndex].displayName = profile.displayName || profile.username;
              
              if (profile.emails && profile.emails.length > 0) {
                user.oauthProfiles[oauthProfileIndex].emails = profile.emails.map((email: EmailObject) => ({
                  value: email.value,
                  primary: !!email.verified,
                }));
              }
              
              if (profile.photos && profile.photos.length > 0) {
                user.oauthProfiles[oauthProfileIndex].photos = profile.photos.map((photo: PhotoObject) => ({
                  value: photo.value,
                }));
              }
            }

            user.lastLogin = new Date();
            await user.save();
          } else {
            // Check if user exists with the same email
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
            
            if (email) {
              user = await User.findOne({ email });
              
              if (user) {
                // Add OAuth profile to existing user
                user.oauthProfiles.push({
                  provider: 'github',
                  id: profile.id,
                  displayName: profile.displayName || profile.username,
                  emails: profile.emails?.map((email: EmailObject) => ({
                    value: email.value,
                    primary: !!email.verified,
                  })),
                  photos: profile.photos?.map((photo: PhotoObject) => ({
                    value: photo.value,
                  })),
                });
                
                user.lastLogin = new Date();
                await user.save();
              } else {
                // Create new user
                user = await User.create({
                  name: profile.displayName || profile.username || '',
                  email,
                  password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
                  isEmailVerified: true, // Email is verified by GitHub
                  oauthProfiles: [
                    {
                      provider: 'github',
                      id: profile.id,
                      displayName: profile.displayName || profile.username,
                      emails: profile.emails?.map((email: EmailObject) => ({
                        value: email.value,
                        primary: !!email.verified,
                      })),
                      photos: profile.photos?.map((photo: PhotoObject) => ({
                        value: photo.value,
                      })),
                    },
                  ],
                  lastLogin: new Date(),
                });
              }
            } else {
              // Cannot create user without email
              return done(null, false, { message: 'No email provided by GitHub' });
            }
          }

          return done(null, user);
        } catch (error) {
          logger.error(`GitHub OAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return done(error as Error, false);
        }
      }
    )
  );
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, (user as any)._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;


import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { emailService } from './services/emailService';
import type { Express } from 'express';

export function setupAuth(app: Express) {
  // Passport configuration
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session - tolerant of missing users
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) return done(null, false); // <- do NOT throw, return false for missing users
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user
        const userData = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          username: profile.displayName || '',
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImage: profile.photos?.[0]?.value || '',
          authProvider: 'google' as const,
          emailVerified: true, // Google emails are pre-verified
          settings: {
            emergencyMode: false,
            locationTracking: true,
            darkMode: false,
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        };
        
        user = await storage.createUser(userData);
        
        // Send welcome email
        await emailService.sendWelcomeEmail(
          user.id, 
          user.email, 
          user.firstName
        );
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Facebook OAuth Strategy
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name', 'photos']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user
        const userData = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          username: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`,
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          profileImage: profile.photos?.[0]?.value || '',
          authProvider: 'facebook' as const,
          emailVerified: true, // Facebook emails are pre-verified
          settings: {
            emergencyMode: false,
            locationTracking: true,
            darkMode: false,
            notifications: {
              email: true,
              sms: false,
              push: true
            }
          }
        };
        
        user = await storage.createUser(userData);
        
        // Send welcome email
        await emailService.sendWelcomeEmail(
          user.id, 
          user.email, 
          user.firstName
        );
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Local Strategy for email/password
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (emailOrUsername, password, done) => {
    try {
      // Try to find user by email first, then by username
      let user = await storage.getUserByEmail(emailOrUsername);
      if (!user) {
        user = await storage.getUserByUsername(emailOrUsername);
      }
      
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      if (!user.passwordHash) {
        return done(null, false, { message: 'Please use social login' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

// Auth middleware
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Admin middleware
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}
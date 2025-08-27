import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import { generateWelcomeEmail, generateEmailVerificationEmail } from './emailTemplates';
import { storage } from '../storage';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SendGrid API key not found - email functionality will not work');
}

const FROM_EMAIL = 'noreply@vitalwatch.app';
const FROM_NAME = 'VitalWatch Team';

export class EmailService {
  // Generate email verification token
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send welcome email with verification
  async sendWelcomeEmail(userId: string, email: string, firstName: string): Promise<boolean> {
    console.log(`🚀 Starting welcome email process for ${email}...`);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ SendGrid not configured - would send welcome email to:', email);
      return false;
    }

    try {
      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      console.log(`🔑 Generated verification token for ${email}`);
      
      // Save token to database - Skip for test users
      if (!userId.startsWith('test-user-')) {
        await storage.updateUserVerificationToken(userId, verificationToken);
        console.log(`💾 Saved verification token to database for ${email}`);
      } else {
        console.log(`⚠️ Skipping database save for test user ${userId}`);
      }
      
      // Create verification link
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:5000';
      const verificationLink = `${baseUrl}/api/verify-email?token=${verificationToken}`;
      
      // Generate email content
      const emailContent = generateWelcomeEmail(firstName, verificationLink);
      
      // Send email
      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      };

      await sgMail.send(msg);
      
      // Mark welcome email as sent
      await storage.markWelcomeEmailSent(userId);
      
      console.log(`✅ Welcome email sent successfully to ${email}`);
      console.log(`📧 Subject: ${emailContent.subject}`);
      console.log(`📤 From: ${FROM_EMAIL} (${FROM_NAME})`);
      console.log(`📥 To: ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  // Send standalone email verification
  async sendVerificationEmail(userId: string, email: string, firstName: string): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured - would send verification email to:', email);
      return false;
    }

    try {
      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      
      // Save token to database
      await storage.updateUserVerificationToken(userId, verificationToken);
      
      // Create verification link
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:5000';
      const verificationLink = `${baseUrl}/api/verify-email?token=${verificationToken}`;
      
      // Generate email content
      const emailContent = generateEmailVerificationEmail(firstName, verificationLink);
      
      // Send email
      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      };

      await sgMail.send(msg);
      
      console.log(`Verification email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  // Verify email token
  async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; message: string }> {
    try {
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      // Mark email as verified
      await storage.markEmailVerified(user.id);
      
      return { 
        success: true, 
        userId: user.id, 
        message: 'Email verified successfully!' 
      };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { success: false, message: 'Verification failed' };
    }
  }
}

export const emailService = new EmailService();
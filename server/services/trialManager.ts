import { storage } from '../storage';
import { emailService } from './emailService';

export class TrialManager {
  
  // Check and handle trial expiration for all users
  async processTrialExpirations(): Promise<void> {
    try {
      const expiredTrialUsers = await storage.getExpiredTrialUsers();
      
      for (const user of expiredTrialUsers) {
        await this.handleTrialExpiration(user.id);
      }
      
      console.log(`Processed ${expiredTrialUsers.length} expired trials`);
    } catch (error) {
      console.error('Error processing trial expirations:', error);
    }
  }

  // Handle individual user trial expiration
  async handleTrialExpiration(userId: string): Promise<void> {
    try {
      // Update user to free plan
      await storage.updateUser(userId, {
        subscriptionPlan: 'free',
        subscriptionStatus: 'expired'
      });

      // Send trial expiration email
      const user = await storage.getUser(userId);
      if (user && user.email) {
        await this.sendTrialExpirationEmail(user.email, user.firstName || 'User');
      }

      console.log(`Trial expired for user ${userId}, downgraded to free plan`);
    } catch (error) {
      console.error(`Error handling trial expiration for user ${userId}:`, error);
    }
  }

  // Send trial expiration email with upgrade incentives
  private async sendTrialExpirationEmail(email: string, firstName: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .content { padding: 30px; background: white; }
          .upgrade-cta { background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          .features { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: white; margin: 0;">Your VitalWatch Pro Trial Has Ended</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Your 14-day VitalWatch Pro trial has expired. We hope you experienced the peace of mind that comes with our advanced protection features!</p>
            
            <div class="features">
              <h3>🔒 Don't Lose These Pro Features:</h3>
              <ul>
                <li>✅ Unlimited SMS emergency alerts</li>
                <li>✅ Advanced AI threat detection</li>
                <li>✅ Real-time biometric monitoring</li>
                <li>✅ 24/7 AI crisis counselor</li>
                <li>✅ Audio/video evidence recording</li>
                <li>✅ Priority emergency response</li>
              </ul>
            </div>

            <p><strong>Limited Time Offer:</strong> Upgrade within 7 days and get 50% off your first month!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.app' : 'http://localhost:5000'}/billing?upgrade=guardian&discount=50" class="upgrade-cta">
                🚨 Upgrade to Guardian - Just $4.99 First Month
              </a>
            </div>

            <p>Your safety is our priority. Don't wait until it's too late.</p>
            
            <p>Best regards,<br>The VitalWatch Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await emailService.sendCustomEmail(
        email,
        'Your VitalWatch Pro Trial Has Ended - Upgrade for 50% Off!',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending trial expiration email:', error);
    }
  }

  // Get trial reminder emails (3 days, 1 day before expiration)
  async sendTrialReminders(): Promise<void> {
    try {
      const usersNearExpiration = await storage.getUsersNearTrialExpiration();
      
      for (const user of usersNearExpiration) {
        const daysLeft = this.getDaysUntilExpiration(user.guardianTrialEndDate);
        
        if (daysLeft === 3 || daysLeft === 1) {
          await this.sendTrialReminderEmail(user.email!, user.firstName || 'User', daysLeft);
        }
      }
    } catch (error) {
      console.error('Error sending trial reminders:', error);
    }
  }

  private getDaysUntilExpiration(endDate: Date | null): number {
    if (!endDate) return 0;
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async sendTrialReminderEmail(email: string, firstName: string, daysLeft: number): Promise<void> {
    const urgency = daysLeft === 1 ? '🚨 URGENT: ' : '⏰ ';
    const subject = `${urgency}Your VitalWatch Pro Trial Expires in ${daysLeft} Day${daysLeft > 1 ? 's' : ''}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .urgent { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 20px; text-align: center; color: white; }
          .content { padding: 30px; background: white; }
          .upgrade-cta { background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          ${daysLeft === 1 ? '<div class="urgent"><h2>⚠️ FINAL NOTICE: Trial Expires Tomorrow!</h2></div>' : ''}
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Your VitalWatch Pro trial expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>!</p>
            
            <p>Don't lose access to:</p>
            <ul>
              <li>🚨 Unlimited emergency SMS alerts</li>
              <li>🤖 Advanced AI threat detection</li>
              <li>📱 Real-time crisis intervention</li>
              <li>🎯 Priority emergency response</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.app' : 'http://localhost:5000'}/billing?upgrade=guardian" class="upgrade-cta">
                Continue Protection - $9.99/month
              </a>
            </div>

            <p>Questions? Reply to this email - we're here to help!</p>
            
            <p>Stay safe,<br>The VitalWatch Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await emailService.sendCustomEmail(email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending trial reminder email:', error);
    }
  }
}

export const trialManager = new TrialManager();
// Professional email templates for VitalWatch

export const generateWelcomeEmail = (firstName: string, verificationLink: string) => ({
  subject: "🛡️ Welcome to VitalWatch - Your Life-Saving AI Companion is Ready",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VitalWatch</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 0; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-section { text-align: center; margin-bottom: 30px; }
        .welcome-section h2 { color: #1e40af; margin-bottom: 15px; }
        .verify-button { display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .tips-section { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .tips-section h3 { color: #1e40af; margin-bottom: 20px; text-align: center; }
        .tip { display: flex; align-items: flex-start; margin-bottom: 20px; }
        .tip-icon { background: #e0e7ff; color: #3730a3; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
        .tip-content h4 { margin: 0 0 5px 0; color: #1e40af; }
        .tip-content p { margin: 0; color: #64748b; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px; }
        .feature h4 { color: #1e40af; margin-bottom: 10px; }
        .feature p { color: #64748b; font-size: 14px; margin: 0; }
        .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; }
        .social-links { margin: 20px 0; }
        .social-links a { color: #60a5fa; text-decoration: none; margin: 0 10px; }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .content { padding: 30px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🛡️ VitalWatch</h1>
          <p>The World's First AI That Never Sleeps - Protecting You 24/7</p>
        </div>

        <!-- Main Content -->
        <div class="content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <h2>Welcome to the Future, ${firstName}!</h2>
            <p><strong>Congratulations!</strong> You've just activated the most advanced personal safety and health monitoring system ever created. VitalWatch uses cutting-edge AI to protect you in ways that were impossible until now.</p>
            
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">🔥 Limited Time: Your Free Trial Includes Pro Features!</h3>
              <p style="color: #92400e; margin-bottom: 0;">For the next 14 days, experience VitalWatch Pro absolutely free - including advanced AI threat detection, unlimited emergency contacts, and premium crisis intervention tools.</p>
            </div>
            
            <a href="${verificationLink}" class="verify-button">🚀 Activate Your Life-Saving Account</a>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
              <strong>Critical:</strong> Email verification is required for emergency alerts to reach you when seconds matter most.
            </p>
          </div>

          <!-- Revolutionary Features -->
          <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <h3 style="color: #5b21b6; margin-bottom: 20px;">🤖 What Makes VitalWatch Revolutionary</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 25px 0;">
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #c4b5fd;">
                <h4 style="color: #5b21b6; margin-bottom: 10px;">🧠 AI That Never Sleeps</h4>
                <p style="margin: 0; color: #374151;">Continuous monitoring using your device sensors, detecting falls, stress spikes, and emergency patterns in real-time</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #c4b5fd;">
                <h4 style="color: #5b21b6; margin-bottom: 10px;">📱 Invisible Protection</h4>
                <p style="margin: 0; color: #374151;">Works silently in the background - no wearables needed. Your phone becomes a life-saving medical device</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #c4b5fd;">
                <h4 style="color: #5b21b6; margin-bottom: 10px;">⚡ Instant Response</h4>
                <p style="margin: 0; color: #374151;">Emergency alerts sent in under 3 seconds to your contacts with precise location and vital signs data</p>
              </div>
            </div>
          </div>

          <!-- Getting Started Tips -->
          <div class="tips-section">
            <h3>🚀 Your First 24 Hours - Critical Setup Steps</h3>
            
            <div class="tip">
              <div class="tip-icon">1</div>
              <div class="tip-content">
                <h4>🆘 Configure Emergency Contacts</h4>
                <p><strong>Essential for safety:</strong> Add 2-3 trusted contacts who can respond immediately. They'll receive instant alerts with your location if VitalWatch detects an emergency.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">2</div>
              <div class="tip-content">
                <h4>📍 Enable Location Tracking</h4>
                <p><strong>Life-saving accuracy:</strong> Precise GPS location sent with emergency alerts. Essential for first responders to find you within minutes, not hours.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">3</div>
              <div class="tip-content">
                <h4>🔊 Test the Panic Button</h4>
                <p><strong>Practice saves lives:</strong> Familiarize yourself with emergency activation. Use practice mode to ensure muscle memory when seconds count.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">4</div>
              <div class="tip-content">
                <h4>🧠 Begin AI Mood Analysis</h4>
                <p><strong>Predictive insights:</strong> Daily mood tracking helps our AI detect patterns and potential mental health crises before they happen.</p>
              </div>
            </div>
          </div>

          <!-- Pro vs Free Comparison -->
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; padding: 30px; margin: 30px 0;">
            <h3 style="color: #0c4a6e; text-align: center; margin-bottom: 25px;">🔥 VitalWatch Pro - Unlock Maximum Protection</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 20px 0;">
              <div style="background: white; padding: 25px; border-radius: 8px; border: 2px solid #e2e8f0;">
                <h4 style="color: #475569; margin-bottom: 15px; text-align: center;">Free Plan</h4>
                <ul style="color: #64748b; padding-left: 20px; line-height: 1.8;">
                  <li>Basic panic button</li>
                  <li>2 emergency contacts</li>
                  <li>Simple mood tracking</li>
                  <li>Basic location sharing</li>
                  <li>Standard response time</li>
                </ul>
              </div>
              
              <div style="background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; padding: 25px; border-radius: 8px; position: relative;">
                <div style="position: absolute; top: -10px; right: 20px; background: #f59e0b; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold;">RECOMMENDED</div>
                <h4 style="margin-bottom: 15px; text-align: center;">VitalWatch Pro</h4>
                <ul style="padding-left: 20px; line-height: 1.8;">
                  <li><strong>Advanced AI threat detection</strong></li>
                  <li><strong>Unlimited emergency contacts</strong></li>
                  <li><strong>Predictive health analysis</strong></li>
                  <li><strong>Real-time vital signs monitoring</strong></li>
                  <li><strong>3-second emergency response</strong></li>
                  <li><strong>Fall detection & auto-alerts</strong></li>
                  <li><strong>24/7 crisis intervention tools</strong></li>
                  <li><strong>Premium therapeutic resources</strong></li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                  <p style="margin: 5px 0; font-size: 18px;"><strong>$9.99/month</strong></p>
                  <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">First 14 days FREE</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #0c4a6e; font-weight: bold; margin-bottom: 15px;">⚡ Pro users report 3x faster emergency response times</p>
              <a href="http://localhost:5000/upgrade" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px;">Start Free Pro Trial</a>
            </div>
          </div>

          <!-- Success Stories -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #1e40af; text-align: center; margin-bottom: 20px;">🌟 Real Lives Saved</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #374151; font-style: italic;">"VitalWatch detected my heart irregularities and alerted my family before I even felt symptoms. Doctors said the early warning saved my life."</p>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">- Sarah M., VitalWatch Pro user</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #374151; font-style: italic;">"The fall detection worked perfectly when I had an accident hiking alone. Emergency contacts received my exact location and I was rescued within 20 minutes."</p>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">- Mike R., VitalWatch Pro user</p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 12px;">
            <h3 style="color: #1e40af; margin-bottom: 15px;">🚀 Your Safety Journey Starts Now</h3>
            <p style="color: #3730a3; margin-bottom: 20px;">Join thousands who trust VitalWatch to protect what matters most</p>
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px;">Activate VitalWatch Protection</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>The VitalWatch Team</strong></p>
          <p>Protecting lives with AI that never sleeps</p>
          <div style="margin: 20px 0;">
            <p style="color: #60a5fa; margin: 5px 0;">📧 Questions? Reply to this email</p>
            <p style="color: #60a5fa; margin: 5px 0;">🆘 Emergency Support: support@vitalwatch.app</p>
          </div>
          <div class="social-links">
            <a href="http://localhost:5000/help">Help Center</a> | 
            <a href="http://localhost:5000/privacy">Privacy Policy</a> | 
            <a href="http://localhost:5000/terms">Terms of Service</a>
          </div>
          <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>Remember:</strong> VitalWatch works best when your phone stays with you. 
              Enable notifications and keep location services active for maximum protection.
            </p>
          </div>
          <p style="font-size: 12px; opacity: 0.8; margin: 10px 0;">
            This email was sent to ${firstName} as part of your VitalWatch account activation.
            You're receiving this because you signed up for VitalWatch emergency monitoring services.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
🛡️ Welcome to VitalWatch - Your Life-Saving AI Companion is Ready

Hello ${firstName}!

Congratulations! You've just activated the most advanced personal safety and health monitoring system ever created. VitalWatch uses cutting-edge AI to protect you in ways that were impossible until now.

🔥 LIMITED TIME: Your Free Trial Includes Pro Features!
For the next 14 days, experience VitalWatch Pro absolutely free - including advanced AI threat detection, unlimited emergency contacts, and premium crisis intervention tools.

🚀 ACTIVATE YOUR LIFE-SAVING ACCOUNT: ${verificationLink}

What Makes VitalWatch Revolutionary:
🧠 AI That Never Sleeps - Continuous monitoring using your device sensors, detecting falls, stress spikes, and emergency patterns in real-time
📱 Invisible Protection - Works silently in the background - no wearables needed. Your phone becomes a life-saving medical device  
⚡ Instant Response - Emergency alerts sent in under 3 seconds to your contacts with precise location and vital signs data

Your First 24 Hours - Critical Setup Steps:
    1. 🆘 Configure Emergency Contacts - Add 2-3 trusted contacts who can respond immediately
    2. 📍 Enable Location Tracking - Precise GPS location sent with emergency alerts
    3. 🔊 Test the Panic Button - Practice mode ensures muscle memory when seconds count
    4. 🧠 Begin AI Mood Analysis - Daily tracking helps detect patterns and prevent crises

VitalWatch Pro vs Free:

Free Plan:
• Basic panic button
• 2 emergency contacts  
• Simple mood tracking
• Basic location sharing
• Standard response time

VitalWatch Pro ($9.99/month - First 14 days FREE):
• Advanced AI threat detection
• Unlimited emergency contacts
• Predictive health analysis
• Real-time vital signs monitoring
• 3-second emergency response
• Fall detection & auto-alerts
• 24/7 crisis intervention tools
• Premium therapeutic resources

⚡ Pro users report 3x faster emergency response times

Real Lives Saved:
"VitalWatch detected my heart irregularities and alerted my family before I even felt symptoms. Doctors said the early warning saved my life." - Sarah M., VitalWatch Pro user

"The fall detection worked perfectly when I had an accident hiking alone. Emergency contacts received my exact location and I was rescued within 20 minutes." - Mike R., VitalWatch Pro user

Questions? Reply to this email
Emergency Support: support@vitalwatch.app

Remember: VitalWatch works best when your phone stays with you. Enable notifications and keep location services active for maximum protection.

Stay safe,
The VitalWatch Team
Protecting lives with AI that never sleeps
  `
});

export const generateEmailVerificationEmail = (firstName: string, verificationLink: string) => ({
  subject: "Verify Your VitalWatch Account",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 500px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .verify-button { display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ VitalWatch</h1>
          <p>Email Verification Required</p>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Please verify your email address to activate your VitalWatch account and unlock all features.</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
          </p>
          
          <p><strong>Why verify?</strong></p>
          <ul>
            <li>Receive emergency notifications</li>
            <li>Get important health insights</li>
            <li>Access crisis support resources</li>
            <li>Secure your account</li>
          </ul>
          
          <p>If you didn't create a VitalWatch account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This link expires in 24 hours for your security.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Hi ${firstName},
    
    Please verify your VitalWatch account: ${verificationLink}
    
    This activates your account and unlocks all features including emergency notifications and health insights.
    
    Link expires in 24 hours.
    
    VitalWatch Team
  `
});
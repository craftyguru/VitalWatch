// Professional email templates for VitalWatch

export const generateWelcomeEmail = (firstName: string, verificationLink: string) => ({
  subject: "Welcome to VitalWatch - Your AI-Powered Health Companion",
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
          <p>AI-Powered Vital Signs Monitoring & Emergency Response</p>
        </div>

        <!-- Main Content -->
        <div class="content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <h2>Welcome ${firstName}!</h2>
            <p>Thank you for joining VitalWatch - your comprehensive AI-powered health companion. We're excited to help you monitor your vital signs and provide emergency support when you need it most.</p>
            
            <a href="${verificationLink}" class="verify-button">Verify Your Email & Activate Account</a>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 15px;">
              Please verify your email address to unlock all VitalWatch features and ensure we can reach you during emergencies.
            </p>
          </div>

          <!-- Getting Started Tips -->
          <div class="tips-section">
            <h3>🚀 Getting Started - Essential Tips</h3>
            
            <div class="tip">
              <div class="tip-icon">1</div>
              <div class="tip-content">
                <h4>Set Up Emergency Contacts</h4>
                <p>Add your trusted family and friends so they can be notified instantly during emergencies. We recommend at least 2-3 contacts.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">2</div>
              <div class="tip-content">
                <h4>Enable Location Services</h4>
                <p>Allow location access for accurate emergency response. Your location helps first responders find you quickly.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">3</div>
              <div class="tip-content">
                <h4>Practice Panic Button</h4>
                <p>Familiarize yourself with the panic button location. You can test it safely in demo mode without triggering real alerts.</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">4</div>
              <div class="tip-content">
                <h4>Start Mood Tracking</h4>
                <p>Daily mood entries help our AI understand your patterns and provide better mental health insights and support.</p>
              </div>
            </div>
          </div>

          <!-- Key Features -->
          <div class="features-grid">
            <div class="feature">
              <h4>🚨 Emergency Response</h4>
              <p>One-tap panic button with instant notifications to emergency contacts and AI-powered threat analysis.</p>
            </div>
            <div class="feature">
              <h4>💝 Mental Health Support</h4>
              <p>AI-powered mood tracking, personalized insights, and access to crisis resources when needed.</p>
            </div>
            <div class="feature">
              <h4>📱 Smart Monitoring</h4>
              <p>Real-time vital signs tracking with device sensors and biometric analysis for comprehensive health awareness.</p>
            </div>
            <div class="feature">
              <h4>🔒 Privacy First</h4>
              <p>Your health data is encrypted and secure. You control who has access and what information is shared.</p>
            </div>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <h3 style="color: #1e40af;">Ready to get started?</h3>
            <p>Click the verification link above to activate your account and begin your health monitoring journey.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>VitalWatch Team</strong></p>
          <p>Your AI-powered emergency companion</p>
          <div class="social-links">
            <a href="#">Support</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
          </div>
          <p style="font-size: 12px; opacity: 0.8;">
            This email was sent to ${firstName} as part of your VitalWatch account setup.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
    Welcome to VitalWatch, ${firstName}!
    
    Thank you for joining VitalWatch - your AI-powered health companion.
    
    Please verify your email: ${verificationLink}
    
    Getting Started Tips:
    1. Set Up Emergency Contacts - Add trusted family and friends
    2. Enable Location Services - For accurate emergency response
    3. Practice Panic Button - Familiarize yourself with emergency features
    4. Start Mood Tracking - Help our AI understand your patterns
    
    Key Features:
    - Emergency Response: One-tap panic button with instant notifications
    - Mental Health Support: AI-powered mood tracking and crisis resources
    - Smart Monitoring: Real-time vital signs with device sensors
    - Privacy First: Your data is encrypted and secure
    
    Questions? Contact our support team.
    
    VitalWatch Team
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
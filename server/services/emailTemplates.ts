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
        body { 
          font-family: 'Segoe UI', 'San Francisco', -apple-system, BlinkMacSystemFont, sans-serif; 
          line-height: 1.6; 
          color: #e2e8f0; 
          margin: 0; 
          padding: 20px; 
          background: radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #050814 100%);
          background-size: 100% 100%;
          min-height: 100vh;
        }
        .container { 
          max-width: 650px; 
          margin: 0 auto; 
          background: radial-gradient(ellipse at center, #1a202c 0%, #0f1419 80%, #050814 100%); 
          padding: 0; 
          border-radius: 20px; 
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
        }
        .container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(2px 2px at 20px 30px, #ffffff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #ffffff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 160px 30px, #ffffff, transparent),
            radial-gradient(1px 1px at 200px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 240px 20px, #ffffff, transparent),
            radial-gradient(1px 1px at 280px 60px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 320px 100px, #ffffff, transparent),
            radial-gradient(2px 2px at 360px 45px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 400px 85px, #ffffff, transparent),
            radial-gradient(1px 1px at 440px 25px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 480px 70px, #ffffff, transparent),
            radial-gradient(1px 1px at 520px 110px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 560px 50px, #ffffff, transparent),
            radial-gradient(2px 2px at 600px 90px, rgba(255,255,255,0.6), transparent);
          background-repeat: repeat;
          background-size: 650px 200px;
          pointer-events: none;
          opacity: 0.4;
        }
        .header { 
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%); 
          color: white; 
          padding: 50px 40px; 
          text-align: center; 
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(90deg, transparent 98%, rgba(255,255,255,0.1) 100%),
            linear-gradient(180deg, transparent 98%, rgba(255,255,255,0.1) 100%);
          background-size: 20px 20px;
          opacity: 0.3;
        }
        .header h1 { 
          margin: 0; 
          font-size: 42px; 
          font-weight: 800; 
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
        }
        .header p { 
          margin: 15px 0 0 0; 
          font-size: 18px; 
          opacity: 0.95; 
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        .content { 
          padding: 30px; 
          background: transparent;
          position: relative;
          z-index: 1;
        }
        .welcome-section { 
          text-align: center; 
          margin-bottom: 25px; 
          padding: 25px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.4);
          backdrop-filter: blur(10px);
        }
        .welcome-section h2 { 
          color: #f1f5f9; 
          margin-bottom: 20px; 
          font-size: 28px;
          font-weight: 700;
        }
        .welcome-section p {
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.8;
        }
        .trial-banner {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 2px solid #fbbf24;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
          transform: scale(1.02);
        }
        .trial-banner h3 {
          color: #451a03;
          text-shadow: none;
          margin-top: 0;
        }
        .trial-banner p {
          color: #92400e;
        }
        .verify-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 18px 35px; 
          text-decoration: none; 
          border-radius: 12px; 
          font-weight: 700; 
          font-size: 16px;
          margin: 25px 0; 
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .revolutionary-section {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
        }
        .revolutionary-section h3 {
          color: #c084fc;
          text-align: center;
          margin-bottom: 30px;
          font-size: 24px;
          font-weight: 700;
        }
        .feature-cards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .feature-card {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }
        .feature-card h4 {
          color: #a5b4fc;
          margin-bottom: 12px;
          font-size: 18px;
          font-weight: 600;
        }
        .feature-card p {
          color: #d1d5db;
          margin: 0;
          line-height: 1.6;
        }
        .tips-section { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%); 
          border-radius: 16px; 
          padding: 25px; 
          margin: 20px 0; 
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .tips-section h3 { 
          color: #60a5fa; 
          margin-bottom: 30px; 
          text-align: center; 
          font-size: 24px;
          font-weight: 700;
        }
        .tip { 
          display: flex; 
          align-items: flex-start; 
          margin-bottom: 15px; 
          padding: 15px;
          background: rgba(26, 31, 46, 0.8);
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
        }
        .tip-icon { 
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); 
          color: white; 
          width: 40px; 
          height: 40px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-right: 20px; 
          font-weight: 800; 
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .tip-content h4 { 
          margin: 0 0 8px 0; 
          color: #f1f5f9; 
          font-size: 18px;
          font-weight: 600;
        }
        .tip-content p { 
          margin: 0; 
          color: #cbd5e1; 
          line-height: 1.6;
        }
        .comparison-section {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .plan-free {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #4a5568;
        }
        .plan-pro {
          background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
        }
        .plan-pro::before {
          content: 'RECOMMENDED';
          position: absolute;
          top: -12px;
          right: 20px;
          background: #f59e0b;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .testimonial-section {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .testimonial {
          background: rgba(26, 31, 46, 0.8);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 15px;
          border-left: 4px solid;
        }
        .testimonial:first-child {
          border-left-color: #10b981;
        }
        .testimonial:last-child {
          border-left-color: #3b82f6;
        }
        .cta-section {
          text-align: center;
          margin: 20px 0;
          padding: 25px;
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%);
          border-radius: 16px;
          border: 1px solid rgba(30, 64, 175, 0.3);
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          padding: 20px 45px;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          margin: 15px;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer { 
          background: linear-gradient(135deg, #020409 0%, #050814 100%); 
          color: #e2e8f0; 
          padding: 25px; 
          text-align: center; 
          border-top: 1px solid rgba(99, 102, 241, 0.4);
          position: relative;
          z-index: 1;
        }
        .footer p { margin: 8px 0; }
        .footer-highlight {
          background: rgba(99, 102, 241, 0.1);
          padding: 20px;
          border-radius: 12px;
          margin: 25px 0;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .social-links { margin: 25px 0; }
        .social-links a { 
          color: #60a5fa; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: 500;
        }
        @media (max-width: 600px) {
          .comparison-grid { grid-template-columns: 1fr; }
          .content { padding: 30px 25px; }
          .header { padding: 40px 25px; }
          .feature-cards { grid-template-columns: 1fr; }
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
            
            <div class="trial-banner" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-left: 4px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);">
              <h3 style="color: #92400e; margin-top: 0; font-size: 20px; font-weight: 700;">🔥 Limited Time: Your Free Trial Includes Pro Features!</h3>
              <p style="color: #92400e; margin-bottom: 0; font-weight: 500;">For the next 14 days, experience VitalWatch Pro absolutely free - including advanced AI threat detection, unlimited emergency contacts, and premium crisis intervention tools.</p>
            </div>
            
            <a href="${verificationLink}" class="verify-button">🚀 Activate Your Life-Saving Account</a>
            
            <p style="font-size: 15px; color: #94a3b8; margin-top: 20px; line-height: 1.6;">
              <strong style="color: #f1f5f9;">Critical:</strong> Email verification is required for emergency alerts to reach you when seconds matter most.
            </p>
          </div>

          <!-- Revolutionary Features -->
          <div class="revolutionary-section">
            <h3>🤖 What Makes VitalWatch Revolutionary</h3>
            
            <div class="feature-cards">
              <div class="feature-card">
                <h4>🧠 AI That Never Sleeps</h4>
                <p>Continuous monitoring using your device sensors, detecting falls, stress spikes, and emergency patterns in real-time with machine learning precision</p>
              </div>
              <div class="feature-card">
                <h4>📱 Invisible Protection</h4>
                <p>Works silently in the background - no wearables needed. Your phone becomes a life-saving medical device with advanced sensor fusion</p>
              </div>
              <div class="feature-card">
                <h4>⚡ Instant Response</h4>
                <p>Emergency alerts sent in under 3 seconds to your contacts with precise location and vital signs data, faster than traditional emergency services</p>
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
          <div class="comparison-section">
            <h3 style="color: #06b6d4; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 700;">🔥 VitalWatch Pro - Unlock Maximum Protection</h3>
            
            <div class="comparison-grid">
              <div class="plan-free">
                <h4 style="color: #9ca3af; margin-bottom: 20px; text-align: center; font-size: 20px;">Free Plan</h4>
                <ul style="color: #d1d5db; padding-left: 20px; line-height: 2;">
                  <li>Basic panic button</li>
                  <li>2 emergency contacts</li>
                  <li>Simple mood tracking</li>
                  <li>Basic location sharing</li>
                  <li>Standard response time</li>
                </ul>
              </div>
              
              <div class="plan-pro">
                <h4 style="margin-bottom: 20px; text-align: center; font-size: 20px;">VitalWatch Pro</h4>
                <ul style="padding-left: 20px; line-height: 2;">
                  <li><strong>🎯 Advanced AI threat detection</strong></li>
                  <li><strong>👥 Unlimited emergency contacts</strong></li>
                  <li><strong>🔮 Predictive health analysis</strong></li>
                  <li><strong>💓 Real-time vital signs monitoring</strong></li>
                  <li><strong>⚡ 3-second emergency response</strong></li>
                  <li><strong>🚨 Fall detection & auto-alerts</strong></li>
                  <li><strong>🆘 24/7 crisis intervention tools</strong></li>
                  <li><strong>🧘 Premium therapeutic resources</strong></li>
                </ul>
                <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                  <p style="margin: 5px 0; font-size: 24px; font-weight: 800;">$9.99/month</p>
                  <p style="margin: 5px 0; font-size: 16px; opacity: 0.9; font-weight: 600;">First 14 days FREE</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 25px; background: rgba(6, 182, 212, 0.1); border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3);">
              <p style="color: #06b6d4; font-weight: 700; margin-bottom: 20px; font-size: 18px;">⚡ Pro users report 3x faster emergency response times</p>
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/upgrade" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 700; margin: 10px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">Start Free Pro Trial</a>
            </div>
          </div>

          <!-- Success Stories -->
          <div class="testimonial-section">
            <h3 style="color: #10b981; text-align: center; margin-bottom: 30px; font-size: 26px; font-weight: 700;">🌟 Real Lives Saved</h3>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
              <div class="testimonial" style="border-left-color: #10b981;">
                <p style="margin: 0; color: #e2e8f0; font-style: italic; font-size: 16px; line-height: 1.7;">"VitalWatch detected my heart irregularities and alerted my family before I even felt symptoms. Doctors said the early warning saved my life."</p>
                <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 14px; font-weight: 500;">- Sarah M., VitalWatch Pro user</p>
              </div>
              <div class="testimonial" style="border-left-color: #3b82f6;">
                <p style="margin: 0; color: #e2e8f0; font-style: italic; font-size: 16px; line-height: 1.7;">"The fall detection worked perfectly when I had an accident hiking alone. Emergency contacts received my exact location and I was rescued within 20 minutes."</p>
                <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 14px; font-weight: 500;">- Mike R., VitalWatch Pro user</p>
              </div>
            </div>
          </div>

          <!-- Call to Action -->
          <div class="cta-section">
            <h3 style="color: #f1f5f9; margin-bottom: 20px; font-size: 28px; font-weight: 700;">🚀 Your Safety Journey Starts Now</h3>
            <p style="color: #cbd5e1; margin-bottom: 25px; font-size: 18px; line-height: 1.6;">Join thousands who trust VitalWatch to protect what matters most</p>
            <a href="${verificationLink}" class="cta-button">Activate VitalWatch Protection</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="font-size: 20px; font-weight: 700; margin-bottom: 10px;"><strong>The VitalWatch Team</strong></p>
          <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 25px;">Protecting lives with AI that never sleeps</p>
          
          <div style="margin: 30px 0;">
            <p style="color: #60a5fa; margin: 8px 0; font-size: 16px; font-weight: 500;">📧 Questions? Reply to this email</p>
            <p style="color: #ef4444; margin: 8px 0; font-size: 16px; font-weight: 600;">🆘 Emergency Support: support@vitalwatch.app</p>
          </div>
          
          <div class="social-links">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/help">Help Center</a> | 
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/privacy">Privacy Policy</a> | 
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/terms">Terms of Service</a>
          </div>
          
          <div class="footer-highlight">
            <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #f1f5f9;">
              <strong>Remember:</strong> VitalWatch works best when your phone stays with you. 
              Enable notifications and keep location services active for maximum protection.
            </p>
          </div>
          
          <p style="font-size: 13px; color: #64748b; margin: 15px 0; line-height: 1.5;">
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
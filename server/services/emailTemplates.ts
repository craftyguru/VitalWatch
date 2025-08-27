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
        .verify-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); 
          color: white; 
          padding: 20px 45px; 
          text-decoration: none; 
          border-radius: 12px; 
          font-weight: 700; 
          font-size: 18px;
          margin: 25px 0;
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }
        .verify-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.6);
        }
        .critical-note {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 15px;
          padding: 12px;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 8px;
          border-left: 4px solid #ef4444;
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
        .pro-trial-banner {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 25px;
          border-radius: 16px;
          text-align: center;
          margin: 25px 0;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
          position: relative;
          overflow: hidden;
        }
        .pro-trial-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 50%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.1) 50%, transparent 52%);
          background-size: 30px 30px;
          opacity: 0.3;
        }
        .pro-trial-banner h3 {
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }
        .pro-trial-banner p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
          position: relative;
          z-index: 1;
        }
        .footer { 
          background: linear-gradient(135deg, #020409 0%, #050814 100%); 
          color: #94a3b8; 
          padding: 25px 30px; 
          text-align: center; 
          border-top: 1px solid rgba(99, 102, 241, 0.3);
          margin-top: 20px;
        }
        .footer p { 
          margin: 8px 0; 
          font-size: 14px;
        }
        .social-links { 
          margin: 15px 0; 
          font-size: 12px;
        }
        .social-links a { 
          color: #60a5fa; 
          text-decoration: none; 
          margin: 0 8px;
        }
        .footer-highlight {
          color: #10b981;
          font-weight: 600;
          font-size: 16px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ VitalWatch</h1>
          <p>The World's First AI That Never Sleeps - Protecting You 24/7</p>
        </div>
        
        <div class="content">
          <div class="welcome-section">
            <h2>Welcome to the Future, ${firstName}!</h2>
            <p>Congratulations! You've joined the most advanced safety and health monitoring system ever created. VitalWatch uses cutting-edge AI to protect you in ways that seemed impossible until now.</p>
          </div>

          <div class="pro-trial-banner">
            <h3>🔥 Limited Time: Your Free Trial Includes Pro Features!</h3>
            <p>For the next 14 days, experience VitalWatch Pro absolutely free - including advanced AI threat detection, unlimited emergency contacts, and premium crisis intervention tools.</p>
          </div>

          <div style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">🚀 Activate Your Life-Saving Account</a>
            <div class="critical-note">
              <strong>Critical:</strong> Email verification is required for emergency alerts to reach you when seconds matter most.
            </div>
          </div>

          <div class="tips-section">
            <h3>⚡ What Makes VitalWatch Revolutionary</h3>
            
            <div class="tip">
              <div class="tip-icon">🤖</div>
              <div class="tip-content">
                <h4>AI That Never Sleeps</h4>
                <p>Continuously monitors patterns and detects threats before they escalate</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">🚨</div>
              <div class="tip-content">
                <h4>Instant Emergency Response</h4>
                <p>Alerts your contacts in under 3 seconds during crisis situations</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">💊</div>
              <div class="tip-content">
                <h4>Health Pattern Recognition</h4>
                <p>Identifies concerning health trends weeks before traditional methods</p>
              </div>
            </div>

            <div class="tip">
              <div class="tip-icon">🧠</div>
              <div class="tip-content">
                <h4>Mental Health Guardian</h4>
                <p>Advanced crisis intervention with professional therapeutic tools</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 25px; background: rgba(6, 182, 212, 0.1); border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3);">
            <p style="color: #06b6d4; font-weight: 700; margin-bottom: 20px; font-size: 18px;">⚡ Pro users report 3x faster emergency response times</p>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/upgrade" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 700; margin: 10px; box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">Start Free Pro Trial</a>
          </div>
        </div>

        <div class="footer">
          <p style="color: #60a5fa; margin: 8px 0; font-size: 16px; font-weight: 500;">📧 Questions? Reply to this email</p>
          <p style="color: #ef4444; margin: 8px 0; font-size: 16px; font-weight: 600;">🆘 Emergency Support: support@vitalwatch.app</p>
          
          <div class="social-links">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/help">Help Center</a> | 
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/privacy">Privacy Policy</a> | 
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/terms">Terms of Service</a>
          </div>
          
          <div class="footer-highlight">
            Your safety is our mission. Your privacy is our promise.
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
Welcome to VitalWatch, ${firstName}!

Your AI-powered life-saving companion is ready to protect you 24/7.

🔥 LIMITED TIME: Your Free Trial Includes Pro Features!
For the next 14 days, experience VitalWatch Pro absolutely free.

ACTIVATE YOUR ACCOUNT: ${verificationLink}

What makes VitalWatch revolutionary:
🤖 AI That Never Sleeps - Continuously monitors patterns
🚨 Instant Emergency Response - Alerts in under 3 seconds
💊 Health Pattern Recognition - Identifies trends early
🧠 Mental Health Guardian - Professional crisis tools

Questions? Reply to this email
Emergency Support: support@vitalwatch.app

Your safety is our mission. Your privacy is our promise.
  `
});

export const generateEmailVerificationEmail = (firstName: string, verificationLink: string) => ({
  subject: "🔒 Verify Your VitalWatch Account - Your Safety Depends On It",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your VitalWatch Account</title>
      <style>
        body { 
          font-family: 'Segoe UI', sans-serif; 
          background: #0f172a; 
          color: #e2e8f0; 
          margin: 0; 
          padding: 20px; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: #1a202c; 
          border-radius: 16px; 
          padding: 40px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
        }
        .verify-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #2563eb, #7c3aed); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Verify Your VitalWatch Account</h1>
          <p>Hi ${firstName}, please verify your email to complete your account setup.</p>
        </div>
        <div style="text-align: center;">
          <a href="${verificationLink}" class="verify-button">Verify Email Address</a>
        </div>
        <p style="margin-top: 30px; color: #94a3b8; font-size: 14px;">
          If you didn't create a VitalWatch account, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `,
  text: `
Verify Your VitalWatch Account

Hi ${firstName}, please verify your email to complete your account setup.

Verification Link: ${verificationLink}

If you didn't create a VitalWatch account, please ignore this email.
  `
});
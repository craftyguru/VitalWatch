// Professional email verification templates with dark starry night theme

export function generateVerificationSuccessEmail(firstName: string): { subject: string; text: string; html: string } {
  const subject = "🎉 Welcome to VitalWatch - Your AI Guardian is Active!";
  
  const text = `
Hi ${firstName}!

Welcome to VitalWatch! Your email has been verified and your account is now active.

Your VitalWatch Pro 14-day free trial has started! You now have access to:
- Advanced AI threat detection
- Unlimited emergency contacts  
- Real-time crisis intervention
- Professional therapeutic tools
- 24/7 emergency monitoring

Start exploring your life-saving features at: http://localhost:5000/dashboard

Need help? Reply to this email or contact support@vitalwatch.app

Stay protected,
The VitalWatch Team
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VitalWatch</title>
      <style>
        /* Dark starry night theme */
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #e2e8f0;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }
        
        /* Starry background effect */
        .email-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #fbbf24, transparent),
            radial-gradient(1px 1px at 40px 70px, #60a5fa, transparent),
            radial-gradient(1px 1px at 90px 40px, #a78bfa, transparent),
            radial-gradient(1px 1px at 130px 80px, #34d399, transparent),
            radial-gradient(2px 2px at 160px 30px, #fbbf24, transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: twinkle 4s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 1;
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
        
        .content {
          position: relative;
          z-index: 2;
          padding: 30px 25px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 25px;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 15px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .logo {
          font-size: 28px;
          font-weight: 800;
          color: #6366f1;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .welcome-title {
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
          margin: 20px 0;
          text-align: center;
        }
        
        .success-badge {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 14px;
          margin: 15px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .pro-trial-banner {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin: 25px 0;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
        
        .pro-trial-banner h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 800;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 25px 0;
        }
        
        .feature-item {
          background: rgba(30, 41, 59, 0.8);
          padding: 15px;
          border-radius: 10px;
          border: 1px solid rgba(99, 102, 241, 0.2);
          text-align: center;
        }
        
        .feature-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .feature-title {
          font-size: 14px;
          font-weight: 600;
          color: #a78bfa;
          margin-bottom: 5px;
        }
        
        .feature-desc {
          font-size: 12px;
          color: #cbd5e1;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 700;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 10px;
          border-top: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .footer-text {
          color: #94a3b8;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .support-text {
          color: #ef4444;
          font-weight: 600;
        }
        
        @media (max-width: 600px) {
          .content { padding: 20px 15px; }
          .features-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="content">
          <div class="header">
            <div class="logo">🛡️ VitalWatch</div>
            <div class="success-badge">✅ ACCOUNT ACTIVATED</div>
            <h1 class="welcome-title">Welcome ${firstName}!</h1>
            <p style="color: #cbd5e1; font-size: 16px; margin: 0;">Your AI guardian is now protecting you 24/7</p>
          </div>
          
          <div class="pro-trial-banner">
            <h3>🔥 VitalWatch Pro - 14 Days FREE</h3>
            <p style="margin: 0; font-size: 14px;">Experience premium emergency protection with advanced AI monitoring</p>
          </div>
          
          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">🤖</div>
              <div class="feature-title">AI Detection</div>
              <div class="feature-desc">Smart threat analysis</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-title">Instant Alerts</div>
              <div class="feature-desc">3-second response time</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <div class="feature-title">Unlimited Contacts</div>
              <div class="feature-desc">Pro feature unlocked</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-title">Crisis Tools</div>
              <div class="feature-desc">Professional support</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/dashboard" class="cta-button">
              Start Protecting Your Life
            </a>
          </div>
          
          <div class="footer">
            <p class="footer-text">Questions? Reply to this email</p>
            <p class="footer-text support-text">🆘 Emergency Support: support@vitalwatch.app</p>
            <p class="footer-text" style="margin-top: 15px;">
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/help" style="color: #60a5fa;">Help Center</a> | 
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/privacy" style="color: #60a5fa;">Privacy</a> | 
              <a href="${process.env.NODE_ENV === 'production' ? 'https://vitalwatch.replit.app' : 'http://localhost:5000'}/terms" style="color: #60a5fa;">Terms</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, text, html };
}
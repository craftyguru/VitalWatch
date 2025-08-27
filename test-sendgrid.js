// Welcome email test for VitalWatch
import sgMail from '@sendgrid/mail';

console.log('🧪 Testing VitalWatch welcome email to support@vitalwatch.app...');

// Check if API key exists
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.log('❌ SENDGRID_API_KEY not found');
  process.exit(1);
}

console.log('✅ SENDGRID_API_KEY found');

// Set API key
sgMail.setApiKey(apiKey);

// Welcome email template
const welcomeEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to VitalWatch</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .tips { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .tip { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Welcome to VitalWatch</h1>
            <p>Your AI-Powered Emergency Companion</p>
        </div>
        
        <div class="content">
            <h2>Hello VitalWatch Support! 👋</h2>
            
            <p>Welcome to VitalWatch - the world's first AI-powered vital signs monitoring that never sleeps. You're now protected by advanced emergency detection and comprehensive crisis management.</p>
            
            <div class="tips">
                <h3>🚀 Getting Started Tips:</h3>
                
                <div class="tip">
                    <strong>📱 Set up Emergency Contacts</strong><br>
                    Add your trusted contacts who will be notified during emergencies.
                </div>
                
                <div class="tip">
                    <strong>📍 Enable Location Services</strong><br>
                    Allow location access for accurate emergency response.
                </div>
                
                <div class="tip">
                    <strong>🆘 Practice the Panic Button</strong><br>
                    Familiarize yourself with the emergency alert system.
                </div>
                
                <div class="tip">
                    <strong>💭 Track Your Mood</strong><br>
                    Use daily mood tracking for mental health insights.
                </div>
            </div>
            
            <a href="http://localhost:5000/dashboard" class="button">Start Using VitalWatch</a>
            
            <p>Questions? Reply to this email or contact our support team.</p>
            
            <p>Stay safe,<br><strong>The VitalWatch Team</strong></p>
        </div>
    </div>
</body>
</html>
`;

const welcomeEmailText = `
Welcome to VitalWatch - Your AI-Powered Emergency Companion

Hello VitalWatch Support!

Welcome to VitalWatch - the world's first AI-powered vital signs monitoring that never sleeps. You're now protected by advanced emergency detection and comprehensive crisis management.

Getting Started Tips:
• Set up Emergency Contacts - Add trusted contacts for emergency notifications
• Enable Location Services - Allow location access for accurate emergency response  
• Practice the Panic Button - Familiarize yourself with the emergency alert system
• Track Your Mood - Use daily mood tracking for mental health insights

Start using VitalWatch: http://localhost:5000/dashboard

Questions? Reply to this email or contact our support team.

Stay safe,
The VitalWatch Team
`;

// Welcome email message
const msg = {
  to: 'support@vitalwatch.app',
  from: {
    email: 'noreply@vitalwatch.app',
    name: 'VitalWatch Team'
  },
  subject: '🛡️ Welcome to VitalWatch - Your AI Health Guardian',
  text: welcomeEmailText,
  html: welcomeEmailHTML,
};

// Send the email
sgMail.send(msg)
  .then(() => {
    console.log('✅ Welcome email sent successfully to support@vitalwatch.app');
    console.log('📧 Subject: 🛡️ Welcome to VitalWatch - Your AI Health Guardian');
    console.log('📤 From: noreply@vitalwatch.app (VitalWatch Team)');
    console.log('📥 To: support@vitalwatch.app');
    console.log('⏰ Email should arrive within 1-2 minutes');
    console.log('📬 Check both inbox and spam/junk folder');
  })
  .catch((error) => {
    console.log('❌ SendGrid error:', error.code || error.message);
    if (error.response && error.response.body && error.response.body.errors) {
      console.log('❌ Details:', error.response.body.errors);
    }
  });
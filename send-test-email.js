// Direct test of SendGrid welcome email
import sgMail from '@sendgrid/mail';
import { generateWelcomeEmail } from './server/services/emailTemplates.js';

console.log('🧪 Testing SendGrid welcome email directly...');

// Check environment
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.log('❌ SENDGRID_API_KEY not found');
  process.exit(1);
}

console.log('✅ SendGrid API key found');

// Configure SendGrid
sgMail.setApiKey(apiKey);

// Test email data
const email = 'support@vitalwatch.app';
const firstName = 'VitalWatch Support';
const verificationLink = 'http://localhost:5000/api/verify-email?token=test-token-123';

try {
  // Generate email content
  const emailContent = generateWelcomeEmail(firstName, verificationLink);
  
  console.log('📧 Email content generated:');
  console.log('Subject:', emailContent.subject);
  console.log('From: noreply@vitalwatch.app (VitalWatch Team)');
  console.log('To:', email);
  
  // Create message
  const msg = {
    to: email,
    from: {
      email: 'noreply@vitalwatch.app',
      name: 'VitalWatch Team'
    },
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  };

  // Send email
  console.log('🚀 Sending welcome email...');
  await sgMail.send(msg);
  
  console.log('✅ Welcome email sent successfully!');
  console.log('📬 Check support@vitalwatch.app inbox (including spam/junk folder)');
  console.log('⏰ Email should arrive within 1-2 minutes');
  
} catch (error) {
  console.error('❌ Error sending email:', error.message);
  if (error.response && error.response.body && error.response.body.errors) {
    console.error('Details:', error.response.body.errors);
  }
}
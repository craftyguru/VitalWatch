// Quick SendGrid test
import sgMail from '@sendgrid/mail';

// Check if API key exists
const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.log('❌ SENDGRID_API_KEY not found');
  process.exit(1);
}

console.log('✅ SENDGRID_API_KEY found (length:', apiKey.length, ')');

// Set API key
sgMail.setApiKey(apiKey);

// Simple test
const msg = {
  to: 'test@example.com',
  from: 'noreply@vitalwatch.app',
  subject: 'VitalWatch SendGrid Test',
  text: 'This is a test email from VitalWatch.',
  html: '<strong>This is a test email from VitalWatch.</strong>',
};

// Try to validate (won't actually send to test@example.com)
sgMail.send(msg, false)
  .then(() => {
    console.log('✅ SendGrid configuration is valid');
    console.log('✅ Email system ready to send messages');
  })
  .catch((error) => {
    console.log('❌ SendGrid error:', error.code || error.message);
    if (error.response && error.response.body && error.response.body.errors) {
      console.log('❌ Details:', error.response.body.errors);
    }
  });
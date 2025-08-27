// Test welcome email script
import { emailService } from './server/services/emailService.js';

async function testWelcomeEmail() {
  try {
    console.log('🧪 Testing welcome email to support@vitalwatch.app...');
    
    const success = await emailService.sendWelcomeEmail(
      'test-user-' + Date.now(),
      'support@vitalwatch.app',
      'VitalWatch Support'
    );
    
    if (success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📧 Check support@vitalwatch.app inbox (including spam/junk folder)');
      console.log('📤 From: noreply@vitalwatch.app');
      console.log('📝 Subject: Welcome to VitalWatch - Your AI Health Guardian');
    } else {
      console.log('❌ Failed to send welcome email');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testWelcomeEmail();
import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - email notifications will not work");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Cannot send email - SENDGRID_API_KEY not configured");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendEmergencyAlert(
  contactEmail: string,
  userName: string,
  location?: { lat: number; lng: number; address?: string },
  message?: string
): Promise<boolean> {
  const subject = `🚨 Emergency Alert from ${userName}`;
  
  const locationText = location 
    ? `Location: ${location.address || `${location.lat}, ${location.lng}`}\nMap: https://maps.google.com/?q=${location.lat},${location.lng}`
    : "Location not available";
  
  const text = `EMERGENCY ALERT

${userName} has activated their emergency alert through Emergency Friend app.

${message ? `Message: ${message}` : ""}

${locationText}

This is an automated alert. Please reach out to ${userName} immediately or contact emergency services if needed.

Time: ${new Date().toLocaleString()}

--
Emergency Friend App
24/7 Crisis Support`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #FF4757; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">${userName} needs help</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>${userName}</strong> has activated their emergency alert through the Emergency Friend app.</p>
        
        ${message ? `<div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Message:</strong><br>
          ${message}
        </div>` : ""}
        
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Location:</strong><br>
          ${location?.address || "Not available"}<br>
          ${location ? `<a href="https://maps.google.com/?q=${location.lat},${location.lng}" style="color: #4A90E2;">View on Map</a>` : ""}
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 5px;">
          <strong>Time:</strong> ${new Date().toLocaleString()}
        </div>
      </div>
      
      <div style="background: #FF6B6B; color: white; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="margin: 0;"><strong>Please reach out to ${userName} immediately or contact emergency services if needed.</strong></p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
        <p>This is an automated alert from Emergency Friend App<br>
        Providing 24/7 crisis support and safety</p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: contactEmail,
    from: process.env.FROM_EMAIL || "alerts@emergencyfriend.app",
    subject,
    text,
    html,
  });
}

export async function sendCrisisResourcesEmail(
  userEmail: string,
  userName: string,
  resources: string[]
): Promise<boolean> {
  const subject = "Crisis Support Resources - You're Not Alone";
  
  const text = `Hi ${userName},

Here are some crisis support resources that might help:

${resources.join('\n')}

Remember:
- You're not alone in this
- Help is available 24/7
- Crisis situations are temporary
- You deserve support and care

Emergency contacts:
- 988 Suicide & Crisis Lifeline: Call or text 988
- Crisis Text Line: Text HOME to 741741
- Emergency: Call 911

Take care of yourself.

--
Emergency Friend App`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #4A90E2; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">You're Not Alone</h1>
        <p style="margin: 10px 0 0 0;">Crisis Support Resources</p>
      </div>
      
      <p>Hi ${userName},</p>
      
      <p>Here are some crisis support resources that might help:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${resources.map(resource => `<p style="margin: 10px 0;">• ${resource}</p>`).join('')}
      </div>
      
      <div style="background: #51D88A; color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Remember:</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>You're not alone in this</li>
          <li>Help is available 24/7</li>
          <li>Crisis situations are temporary</li>
          <li>You deserve support and care</li>
        </ul>
      </div>
      
      <div style="background: #FF6B6B; color: white; padding: 15px; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0;">Emergency Contacts:</h3>
        <p style="margin: 5px 0;">📞 988 Suicide & Crisis Lifeline: Call or text 988</p>
        <p style="margin: 5px 0;">💬 Crisis Text Line: Text HOME to 741741</p>
        <p style="margin: 5px 0;">🚨 Emergency: Call 911</p>
      </div>
      
      <p style="text-align: center; margin-top: 20px; color: #666;">Take care of yourself ❤️</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || "support@emergencyfriend.app",
    subject,
    text,
    html,
  });
}

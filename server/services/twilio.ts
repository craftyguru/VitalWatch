import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("Twilio credentials not set - SMS notifications will not work");
}

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!client) {
    console.warn("Cannot send SMS - Twilio not configured");
    return false;
  }

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      to: to,
    });
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}

export async function sendEmergencyAlertSMS(
  contactPhone: string,
  userName: string,
  location?: { lat: number; lng: number; address?: string },
  message?: string
): Promise<boolean> {
  const locationText = location 
    ? `Location: ${location.address || `${location.lat}, ${location.lng}`} https://maps.google.com/?q=${location.lat},${location.lng}`
    : "Location not available";
  
  const smsMessage = `🚨 EMERGENCY ALERT: ${userName} needs help through Emergency Friend app. ${message ? `Message: ${message}. ` : ""}${locationText} Please reach out immediately or call 911 if needed. Time: ${new Date().toLocaleTimeString()}`;

  return await sendSMS(contactPhone, smsMessage);
}

export async function sendCrisisCheckInSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `Hi ${userName}, this is a gentle check-in from Emergency Friend. How are you feeling right now? Reply HELP for crisis resources, or STOP to opt out. You're not alone. 💙`;

  return await sendSMS(userPhone, message);
}

export async function sendCrisisResourcesSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `${userName}, here are immediate crisis resources:
🆘 988 Suicide & Crisis Lifeline (call/text)
💬 Text HOME to 741741 (Crisis Text Line)
🚨 Call 911 for emergencies
You matter and help is available 24/7. 💙`;

  return await sendSMS(userPhone, message);
}

export async function sendLocationRequestSMS(
  contactPhone: string,
  userName: string
): Promise<boolean> {
  const message = `${userName} has requested location sharing through Emergency Friend app. They may need support. Please reach out to check on them. 💙`;

  return await sendSMS(contactPhone, message);
}

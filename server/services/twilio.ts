import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("Twilio credentials not set - SMS notifications will not work");
}

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!client) {
    console.warn("Cannot send SMS - Twilio not configured");
    return false;
  }

  try {
    console.log(`Sending SMS to ${to} from ${process.env.TWILIO_PHONE_NUMBER}`);
    console.log(`Message: ${message}`);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      to: to,
    });
    
    console.log(`Twilio response: SID=${result.sid}, Status=${result.status}, To=${result.to}, From=${result.from}`);
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
  
  // Optimized for 160-character SMS to avoid multi-segment charges
  const smsMessage = `🚨 EMERGENCY: ${userName} needs help via VitalWatch. ${message || ""} ${locationText} Call them or 911 now. ${new Date().toLocaleTimeString()}`;

  return await sendSMS(contactPhone, smsMessage);
}

export async function sendCrisisCheckInSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `Hi ${userName}, VitalWatch check-in: How are you? Reply HELP for crisis resources or STOP to opt out. You're not alone 💙`;

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
  const message = `${userName} shared location via VitalWatch. They may need support. Please check on them 💙`;

  return await sendSMS(contactPhone, message);
}

// Export the base sendSMS function for testing
export { sendSMS };

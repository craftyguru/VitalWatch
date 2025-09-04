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
  
  // Emergency alerts to contacts don't need opt-out language (emergency exception)
  const smsMessage = `🚨 EMERGENCY: ${userName} needs help via VitalWatch. ${message || ""} ${locationText} Call them or 911 now. ${new Date().toLocaleTimeString()}`;

  return await sendSMS(contactPhone, smsMessage);
}

export async function sendCrisisCheckInSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `VitalWatch check-in: Hi ${userName}, how are you feeling? Reply 1 = Good, 2 = Need support. Reply STOP to unsubscribe or HELP for support. 💙`;

  return await sendSMS(userPhone, message);
}

export async function sendCrisisResourcesSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `VitalWatch: ${userName}, here are crisis resources: 988 Suicide & Crisis Lifeline, Text HOME to 741741, Call 911 for emergencies. Help is available 24/7. Reply STOP to unsubscribe or HELP for support. 💙`;

  return await sendSMS(userPhone, message);
}

export async function sendLocationRequestSMS(
  contactPhone: string,
  userName: string
): Promise<boolean> {
  const message = `VitalWatch: ${userName} shared location and may need support. Please check on them. 💙`;

  return await sendSMS(contactPhone, message);
}

/**
 * Send SMS opt-in confirmation message
 */
export async function sendOptInConfirmationSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `VitalWatch: Hi ${userName}! You are now opted in to receive account notifications and daily check-ins. Reply STOP to unsubscribe or HELP for support. 💙`;

  return await sendSMS(userPhone, message);
}

/**
 * Send welcome SMS after signup confirmation
 */
export async function sendWelcomeSMS(
  userPhone: string,
  userName: string
): Promise<boolean> {
  const message = `VitalWatch: Thanks for signing up, ${userName}! Reply YES to confirm SMS alerts. Reply STOP to unsubscribe or HELP for support. 💙`;

  return await sendSMS(userPhone, message);
}

/**
 * Handle SMS keyword responses (STOP, HELP, YES, START)
 */
export async function handleSMSKeyword(
  userPhone: string,
  keyword: string,
  userName?: string
): Promise<boolean> {
  const normalizedKeyword = keyword.toUpperCase().trim();
  let responseMessage = '';

  switch (normalizedKeyword) {
    case 'STOP':
    case 'UNSUBSCRIBE':
    case 'CANCEL':
    case 'END':
    case 'QUIT':
      responseMessage = 'VitalWatch: You have been unsubscribed from SMS notifications. Reply START to resubscribe. For emergency help, call 911.';
      break;
    
    case 'START':
    case 'YES':
    case 'SUBSCRIBE':
      responseMessage = `VitalWatch: You are now subscribed to receive account notifications and daily check-ins. Reply STOP to unsubscribe or HELP for support. 💙`;
      break;
    
    case 'HELP':
    case 'INFO':
      responseMessage = 'VitalWatch: AI-powered mental health monitoring. For crisis support: 988 Suicide & Crisis Lifeline. Reply STOP to unsubscribe or START to subscribe. 💙';
      break;
    
    default:
      // For numbered responses (1, 2, etc.) or other keywords
      if (['1', '2', '3'].includes(normalizedKeyword)) {
        if (normalizedKeyword === '1') {
          responseMessage = `VitalWatch: Thanks for confirming you're safe, ${userName || 'there'}! Your wellness matters. Reply STOP to unsubscribe or HELP for support. 💙`;
        } else if (normalizedKeyword === '2') {
          responseMessage = `VitalWatch: Thanks for letting us know you need support. Please check your app for resources or call 988 for immediate help. Reply STOP to unsubscribe or HELP for support. 💙`;
        } else if (normalizedKeyword === '3') {
          responseMessage = `VitalWatch: Connecting you with crisis resources. Call 911 if this is an emergency. Reply STOP to unsubscribe or HELP for support. 💙`;
        }
      } else {
        // Unknown keyword - send help message
        responseMessage = 'VitalWatch: Commands: Reply 1=Safe, 2=Need support, HELP=Info, STOP=Unsubscribe, START=Subscribe. For crisis help: 988 or 911. 💙';
      }
      break;
  }

  return await sendSMS(userPhone, responseMessage);
}

// Export the base sendSMS function for testing
export { sendSMS };

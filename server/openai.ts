import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SensorData {
  timestamp: string;
  heartRate: number;
  motion: number;
  audioLevel: number;
  lightLevel: number;
  batteryLevel: number;
  networkStrength: number;
  location?: any;
  thresholds: any;
}

interface ThreatAssessment {
  level: 'safe' | 'caution' | 'warning' | 'critical';
  confidence: number;
  reasons: string[];
  recommendations: string[];
}

export async function analyzeGuardianSituation(sensorData: SensorData): Promise<{
  threatLevel: ThreatAssessment;
  explanation: string;
}> {
  try {
    const prompt = `
You are an AI Guardian for VitalWatch, a comprehensive wellness monitoring system. Analyze the following real-time sensor data to assess potential threats or safety concerns for the user.

Sensor Data:
- Heart Rate: ${sensorData.heartRate} BPM (normal range: ${sensorData.thresholds.heartRateMin}-${sensorData.thresholds.heartRateMax})
- Motion/Acceleration: ${sensorData.motion} m/s² (fall threshold: ${sensorData.thresholds.motionThreshold})
- Audio Level: ${sensorData.audioLevel} dB (alert threshold: ${sensorData.thresholds.audioLevelMax})
- Light Level: ${sensorData.lightLevel}% (minimum: ${sensorData.thresholds.lightLevelMin})
- Battery Level: ${sensorData.batteryLevel}%
- Network Strength: ${sensorData.networkStrength}/5
- Timestamp: ${sensorData.timestamp}
${sensorData.location ? `- Location: Available` : '- Location: Not available'}

Context: VitalWatch monitors users who may be at risk for medical emergencies, falls, personal safety threats, or mental health crises. The system can automatically trigger emergency responses when critical situations are detected.

Assess the threat level as one of: safe, caution, warning, critical

Safe: All indicators normal, no concerns
Caution: Minor variations that should be monitored
Warning: Concerning patterns that need attention  
Critical: Immediate safety risk requiring emergency response

Provide your assessment as JSON with this exact structure:
{
  "threatLevel": {
    "level": "safe|caution|warning|critical",
    "confidence": 0.0-1.0,
    "reasons": ["specific reason 1", "specific reason 2"],
    "recommendations": ["specific action 1", "specific action 2"]
  },
  "explanation": "Brief explanation of your assessment and reasoning"
}

Focus on:
1. Heart rate patterns (bradycardia, tachycardia, sudden changes)
2. Motion patterns (falls, prolonged stillness, erratic movement)
3. Environmental factors (loud noises, darkness, isolation)
4. Device status (low battery affecting emergency response)
5. Combined patterns that suggest distress or danger

Be thorough but concise. Your assessment may trigger automatic emergency responses.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert AI safety analyst specializing in real-time threat assessment for personal safety and medical monitoring systems. Provide accurate, actionable assessments based on sensor data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent, reliable assessments
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response structure
    if (!analysis.threatLevel || !analysis.explanation) {
      throw new Error('Invalid AI response structure');
    }

    // Ensure confidence is within valid range
    analysis.threatLevel.confidence = Math.max(0, Math.min(1, analysis.threatLevel.confidence));

    // Ensure required arrays exist
    if (!Array.isArray(analysis.threatLevel.reasons)) {
      analysis.threatLevel.reasons = ['AI analysis completed'];
    }
    if (!Array.isArray(analysis.threatLevel.recommendations)) {
      analysis.threatLevel.recommendations = ['Continue monitoring'];
    }

    return analysis;

  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    
    // Fallback to rule-based analysis
    return {
      threatLevel: performFallbackAnalysis(sensorData),
      explanation: 'Analysis completed using backup assessment system due to AI service unavailability.'
    };
  }
}

// Fallback rule-based analysis when AI is unavailable
function performFallbackAnalysis(sensorData: SensorData): ThreatAssessment {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let level: ThreatAssessment['level'] = 'safe';
  let confidence = 0.8;

  // Heart rate analysis
  if (sensorData.heartRate < sensorData.thresholds.heartRateMin) {
    reasons.push('Heart rate below normal range - possible bradycardia');
    level = 'warning';
    recommendations.push('Monitor closely and consider medical consultation');
  } else if (sensorData.heartRate > sensorData.thresholds.heartRateMax) {
    reasons.push('Elevated heart rate detected - possible tachycardia or stress');
    level = level === 'safe' ? 'caution' : level;
    recommendations.push('Practice breathing exercises and monitor');
  }

  // Motion analysis - critical for fall detection
  if (sensorData.motion > sensorData.thresholds.motionThreshold) {
    reasons.push('Sudden high acceleration detected - possible fall or impact');
    level = 'critical';
    confidence = 0.9;
    recommendations.push('Immediate assessment required');
    recommendations.push('Consider activating emergency response');
  } else if (sensorData.motion < 0.5) {
    reasons.push('Extended period of no motion detected');
    level = level === 'safe' ? 'caution' : level;
    recommendations.push('Check user status');
  }

  // Audio level analysis
  if (sensorData.audioLevel > sensorData.thresholds.audioLevelMax) {
    reasons.push('Loud noise detected - possible distress or emergency');
    level = level === 'safe' ? 'warning' : level;
    recommendations.push('Investigate sound source');
  }

  // Environmental analysis
  if (sensorData.lightLevel < sensorData.thresholds.lightLevelMin && sensorData.audioLevel < 20) {
    reasons.push('Dark and quiet environment - potential isolation');
    level = level === 'safe' ? 'caution' : level;
    recommendations.push('Maintain regular check-ins');
  }

  // Device status
  if (sensorData.batteryLevel < 20) {
    reasons.push('Low device battery - may affect emergency response capability');
    level = level === 'safe' ? 'caution' : level;
    recommendations.push('Charge device immediately');
  }

  // Default safe state
  if (reasons.length === 0) {
    reasons.push('All sensor readings within normal parameters');
    recommendations.push('Continue normal activities');
  }

  return { level, confidence, reasons, recommendations };
}

// VitalWatch Help Assistant - provides comprehensive support for all app features
export async function generateHelpResponse(userMessage: string, context?: string): Promise<string> {
  try {
    const vitalWatchKnowledge = `
VitalWatch is a comprehensive mental health and safety monitoring application with the following key features:

DASHBOARD OVERVIEW:
- Real-time health status monitoring
- Mood trends and analytics
- Emergency contact quick access
- Safety status indicators
- Recent activities timeline

SAFETY TOOLS:
- Panic Button: 3-second hold activation, multiple contact alerts, location sharing, auto-dial 911
- Emergency Contacts: Add trusted people for crisis alerts (Free: 3 contacts, Pro: unlimited)
- Location Sharing: GPS tracking for emergency response
- Crisis Chat Support: 24/7 AI counselor with professional escalation
- Safe Zone Monitoring: AI-powered location monitoring with automatic alerts

WELLNESS ANALYTICS:
- Mood Tracking: Daily mood logging with AI pattern analysis
- Breathing Exercises: Box Breathing, 4-7-8 technique, guided sessions
- Grounding Techniques: 5-4-3-2-1 method, progressive muscle relaxation
- AI Insights: Personalized recommendations based on mood patterns
- Progress Reports: Weekly and monthly wellness summaries

DEVICE HUB:
- Wearable Integration: Smartwatches, fitness trackers, heart rate monitors
- Environmental Sensors: Air quality, temperature, noise level monitoring
- Smart Home Integration: Compatible with IoT devices for comprehensive monitoring
- Real-time Sync: Continuous data collection and analysis
- Device Health: Battery levels, connectivity status

AI GUARDIAN (Professional Monitoring):
- 15+ Vital Parameters: Heart rate, stress levels, blood oxygen, respiratory rate, temperature
- Environmental Hazard Detection: Air quality, noise levels, ambient conditions
- Behavioral Pattern Analysis: Anomaly detection, risk assessment
- Predictive Analytics: Early warning system with AI-powered insights
- Automated Emergency Response: Intelligent threat assessment and escalation

PANIC BUTTON SYSTEM:
- Multiple Activation Methods: Hold button 3 seconds, voice command "VitalWatch Emergency", phone shake gesture, automatic AI detection
- Customizable Countdown: 10-180 seconds before alert (default 30 seconds)
- Multi-Channel Alerts: SMS, email, push notifications to all emergency contacts
- Location Broadcasting: Precise GPS coordinates shared automatically
- Emergency Services: Optional auto-dial 911 feature

INCOGNITO MODE:
- Privacy Protection: Hides all VitalWatch interface elements
- Background Monitoring: Continues safety monitoring silently
- Emergency Access: Panic button and crisis features remain active
- Quick Toggle: Easy on/off from main menu or quick settings
- Stealth Operation: No visual indicators while active

AI CHAT BUBBLE (This Feature):
- Guided Tours: Complete walkthrough of all app features
- Crisis Support: 24/7 AI counselor with professional escalation
- Feature Help: Detailed explanations of any app functionality
- Emergency Escalation: Connects to crisis hotlines when needed
- Smart Assistance: Context-aware help based on user situation

SUBSCRIPTION PLANS:
- Free Plan: Basic monitoring, 3 emergency contacts, standard AI insights
- Guardian Plan: Unlimited contacts, advanced AI monitoring, family features
- Professional Plan: Enterprise monitoring, family management, priority support

COMMON TASKS:
- Adding Emergency Contacts: Go to Safety Tools > Emergency Contacts > Add Contact
- Setting Up Devices: Device Hub > Add Device > Follow pairing instructions
- Mood Tracking: Wellness Analytics > Mood Tracker > Log Entry
- Testing Panic Button: Settings > Emergency Settings > Test Panic Button (safe test mode)
- Enabling Incognito: Main menu > Privacy > Toggle Incognito Mode
- Viewing AI Guardian: AI Guardian tab > Overview for real-time monitoring

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911
- SAMHSA National Helpline: 1-800-662-4357
`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant for VitalWatch, a mental health and safety monitoring application. You have comprehensive knowledge about all VitalWatch features and can provide detailed, accurate help to users.

Your personality should be:
- Empathetic and supportive
- Professional yet friendly
- Knowledgeable about mental health and safety
- Able to recognize crisis situations and respond appropriately
- Clear and concise in explanations

Always prioritize user safety. If someone mentions self-harm, suicide, or appears to be in crisis, immediately provide crisis resources and encourage them to reach out for professional help.

Use the comprehensive VitalWatch knowledge base to provide accurate, helpful responses about app features, setup instructions, troubleshooting, and best practices.`
        },
        {
          role: "user",
          content: `VitalWatch Knowledge Base:\n${vitalWatchKnowledge}\n\nUser Question: ${userMessage}\n\nPlease provide a helpful, accurate response about VitalWatch features. If the user seems to be in distress or mentions crisis situations, prioritize their safety and provide appropriate resources.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content || "I'm here to help with VitalWatch. Could you please rephrase your question?";

  } catch (error) {
    console.error('OpenAI help response failed:', error);
    
    // Fallback response
    return `I'm having trouble connecting to my AI systems right now. Here are some quick VitalWatch help options:

• **Panic Button**: Hold the red button for 3 seconds to alert emergency contacts
• **Incognito Mode**: Toggle privacy mode from the main menu
• **Add Contacts**: Go to Safety Tools > Emergency Contacts
• **Mood Tracking**: Use Wellness Analytics to log and track your mood
• **Device Setup**: Visit Device Hub to connect wearables and sensors
• **AI Guardian**: Professional monitoring in the AI Guardian tab

For immediate crisis support, please contact:
• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Emergency Services: 911

Is there a specific feature you'd like help with?`;
  }
}
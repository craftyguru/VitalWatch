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
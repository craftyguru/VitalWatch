import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface MoodAnalysis {
  riskLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
  insights: string[];
  patterns: string[];
  recommendations: string[];
  triggerWarnings: string[];
}

async function analyzeMoodEntry(
  mood: string,
  moodScore: number,
  note?: string,
  recentEntries?: Array<{ mood: string; moodScore: number; note?: string; createdAt: Date }>
): Promise<MoodAnalysis> {
  try {
    const systemPrompt = `You are an AI mental health analyst specializing in crisis detection and pattern analysis. 
    Analyze the mood entry and provide insights about mental health patterns, risk assessment, and recommendations.
    
    Risk levels:
    - low: Normal fluctuations, no immediate concern
    - medium: Some concerning patterns, monitor closely
    - high: Significant distress, intervention recommended
    - critical: Immediate crisis risk, emergency intervention needed
    
    Focus on crisis indicators like suicidal ideation, self-harm mentions, severe depression patterns, isolation, hopelessness.
    Provide actionable insights and recommendations. Be compassionate but direct about risks.`;

    const userPrompt = `Current mood entry:
    Mood: ${mood} (score: ${moodScore}/5)
    Note: ${note || "No note provided"}
    
    ${recentEntries ? `Recent mood history (last 7 entries):
    ${recentEntries.map(entry => 
      `${entry.createdAt.toISOString()}: ${entry.mood} (${entry.moodScore}/5) - ${entry.note || "No note"}`
    ).join('\n')}` : ''}
    
    Provide analysis in JSON format: {
      "riskLevel": "low|medium|high|critical",
      "confidence": 0.0-1.0,
      "insights": ["insight1", "insight2"],
      "patterns": ["pattern1", "pattern2"],
      "recommendations": ["rec1", "rec2"],
      "triggerWarnings": ["warning1", "warning2"]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content!);
    
    return {
      riskLevel: analysis.riskLevel || "low",
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      insights: analysis.insights || [],
      patterns: analysis.patterns || [],
      recommendations: analysis.recommendations || [],
      triggerWarnings: analysis.triggerWarnings || [],
    };
  } catch (error) {
    console.error("OpenAI mood analysis failed:", error);
    // Return safe default analysis
    return {
      riskLevel: moodScore <= 2 ? "medium" : "low",
      confidence: 0.3,
      insights: ["Analysis temporarily unavailable"],
      patterns: [],
      recommendations: ["Consider talking to a trusted friend or professional"],
      triggerWarnings: [],
    };
  }
}

async function generatePersonalizedInsight(
  userId: string,
  moodHistory: Array<{ mood: string; moodScore: number; createdAt: Date; note?: string }>,
  copingToolsUsage?: Array<{ toolType: string; effectiveness?: number; createdAt: Date }>
): Promise<{ insight: string; confidence: number; isActionable: boolean }> {
  try {
    const systemPrompt = `You are a compassionate AI mental health advisor. Generate personalized insights based on user patterns.
    Focus on positive reinforcement, helpful patterns, and gentle recommendations for improvement.
    Keep insights encouraging and actionable. Avoid clinical language.`;

    const userPrompt = `User mood history (last 30 entries):
    ${moodHistory.map(entry => 
      `${entry.createdAt.toISOString().split('T')[0]}: ${entry.mood} (${entry.moodScore}/5) - ${entry.note || ""}`
    ).join('\n')}
    
    ${copingToolsUsage ? `Coping tools usage:
    ${copingToolsUsage.map(tool => 
      `${tool.createdAt.toISOString().split('T')[0]}: ${tool.toolType} (effectiveness: ${tool.effectiveness || "not rated"}/5)`
    ).join('\n')}` : ''}
    
    Generate a personalized insight in JSON format: {
      "insight": "encouraging and helpful insight text",
      "confidence": 0.0-1.0,
      "isActionable": boolean
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      insight: result.insight || "Keep taking care of yourself - you're doing great!",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.6)),
      isActionable: result.isActionable || false,
    };
  } catch (error) {
    console.error("OpenAI insight generation failed:", error);
    return {
      insight: "Your mental health journey is unique. Consider reflecting on what activities make you feel most at peace.",
      confidence: 0.4,
      isActionable: true,
    };
  }
}

async function assessCrisisRisk(
  moodEntries: Array<{ mood: string; moodScore: number; note?: string; createdAt: Date }>,
  emergencyHistory?: Array<{ type: string; createdAt: Date }>
): Promise<{ riskLevel: "low" | "medium" | "high" | "critical"; confidence: number; reasoning: string }> {
  try {
    const systemPrompt = `You are a crisis assessment AI trained to identify immediate mental health risks.
    Analyze patterns for crisis indicators: suicidal ideation, self-harm, severe depression, isolation, hopelessness.
    
    Critical indicators require immediate intervention. Be thorough but not alarmist.`;

    const userPrompt = `Recent mood entries:
    ${moodEntries.slice(0, 10).map(entry => 
      `${entry.createdAt.toISOString()}: ${entry.mood} (${entry.moodScore}/5) - "${entry.note || ""}"`
    ).join('\n')}
    
    ${emergencyHistory ? `Emergency history:
    ${emergencyHistory.map(incident => 
      `${incident.createdAt.toISOString()}: ${incident.type}`
    ).join('\n')}` : ''}
    
    Assess crisis risk in JSON format: {
      "riskLevel": "low|medium|high|critical",
      "confidence": 0.0-1.0,
      "reasoning": "explanation of assessment"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const assessment = JSON.parse(response.choices[0].message.content!);
    
    return {
      riskLevel: assessment.riskLevel || "low",
      confidence: Math.max(0, Math.min(1, assessment.confidence || 0.5)),
      reasoning: assessment.reasoning || "Assessment based on recent patterns",
    };
  } catch (error) {
    console.error("Crisis risk assessment failed:", error);
    return {
      riskLevel: "medium",
      confidence: 0.3,
      reasoning: "Assessment temporarily unavailable - monitoring recommended",
    };
  }
}

// Audio transcription using OpenAI Whisper
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], "audio.webm", { type: "audio/webm" }),
      model: "whisper-1",
      language: "en", 
      temperature: 0.2,
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription failed:", error);
    return "";
  }
}

// AI-powered threat level analysis
async function analyzeThreatLevel(transcription: string, location?: any) {
  if (!transcription.trim()) {
    return {
      threatLevel: 'low',
      confidence: 0.1,
      keywords: [],
      suggestedActions: []
    };
  }

  try {
    const systemPrompt = `You are an emergency response AI analyzing audio transcriptions for potential threats or dangerous situations. 

    Analyze the following transcription and respond with a JSON object containing:
    - threatLevel: "low", "medium", "high", or "critical"
    - confidence: 0.0-1.0 confidence score
    - keywords: array of concerning words/phrases detected
    - suggestedActions: array of recommended emergency actions

    CRITICAL threats (immediate danger): Violence, weapons, medical emergencies, "help", "call 911", screaming, fighting
    HIGH threats (potential danger): Arguments escalating, intoxication with aggression, stalking, breaking and entering
    MEDIUM threats (concerning): Domestic disputes, threats, harassment, suspicious activity
    LOW threats: Normal conversation, background noise, unclear audio

    Be conservative but accurate. False positives for critical threats are acceptable to ensure safety.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transcription: "${transcription}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content!);
    
    return {
      threatLevel: analysis.threatLevel || 'low',
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions : []
    };
  } catch (error) {
    console.error("Threat analysis failed:", error);
    return {
      threatLevel: 'low',
      confidence: 0.3,
      keywords: ['analysis-error'],
      suggestedActions: ['Review audio manually']
    };
  }
}

// Enhanced comprehensive threat analysis
async function analyzeComprehensiveThreat(transcription: string, context: any) {
  if (!transcription.trim()) {
    return {
      threatLevel: 'low',
      confidence: 0.1,
      keywords: [],
      suggestedActions: []
    };
  }

  try {
    const systemPrompt = `You are an advanced emergency response AI analyzing comprehensive data for potential threats. 

    Analyze the following data and respond with a JSON object containing:
    - threatLevel: "low", "medium", "high", or "critical"
    - confidence: 0.0-1.0 confidence score
    - keywords: array of concerning words/phrases detected
    - suggestedActions: array of recommended emergency actions
    - riskFactors: array of identified risk factors
    - contextualAnalysis: brief analysis of contributing factors

    Consider all available data:
    1. Audio transcription for verbal indicators
    2. Biometric data (heart rate, stress levels) for physiological indicators
    3. Environmental factors (noise, lighting) for situational context
    4. Location data for geographical risk assessment

    CRITICAL threats: Violence, weapons, medical emergencies, "help", "call 911", screaming, fighting, elevated heart rate with stress
    HIGH threats: Arguments escalating, intoxication with aggression, stalking, breaking and entering, high stress with concerning audio
    MEDIUM threats: Domestic disputes, threats, harassment, suspicious activity, elevated biometrics
    LOW threats: Normal conversation, background noise, normal biometrics

    Weight biometric and environmental data significantly in your analysis.`;

    const contextData = `
    Transcription: "${transcription}"
    ${context.biometrics ? `Biometrics: Heart Rate ${context.biometrics.heartRate}bpm, Stress Level ${context.biometrics.stressLevel}%` : ''}
    ${context.environmental ? `Environment: Noise ${context.environmental.noiseLevel}dB, Light ${context.environmental.lightLevel}%` : ''}
    ${context.location ? `Location: Available with ${context.location.accuracy}m accuracy` : 'Location: Not available'}
    ${context.settings ? `Detection Sensitivity: ${context.settings.sensitivity}%` : ''}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextData }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const analysis = JSON.parse(response.choices[0].message.content!);
    
    return {
      threatLevel: analysis.threatLevel || 'low',
      confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions : [],
      riskFactors: Array.isArray(analysis.riskFactors) ? analysis.riskFactors : [],
      contextualAnalysis: analysis.contextualAnalysis || 'Analysis based on available data'
    };
  } catch (error) {
    console.error("Comprehensive threat analysis failed:", error);
    return {
      threatLevel: 'low',
      confidence: 0.3,
      keywords: ['analysis-error'],
      suggestedActions: ['Review data manually'],
      riskFactors: ['System error'],
      contextualAnalysis: 'Analysis temporarily unavailable'
    };
  }
}

// Helper functions for additional analysis
function analyzeBiometrics(biometrics: any) {
  const { heartRate, stressLevel } = biometrics;
  
  let riskLevel = 'normal';
  if (heartRate > 100 || stressLevel > 70) riskLevel = 'elevated';
  if (heartRate > 120 || stressLevel > 85) riskLevel = 'high';
  
  return {
    riskLevel,
    heartRateStatus: heartRate > 100 ? 'elevated' : 'normal',
    stressLevelStatus: stressLevel > 70 ? 'high' : stressLevel > 40 ? 'moderate' : 'low',
    recommendations: riskLevel === 'high' ? ['Immediate attention recommended'] : ['Monitor closely']
  };
}

function analyzeEnvironmental(environmental: any) {
  const { noiseLevel, lightLevel, crowdDensity } = environmental;
  
  let riskAssessment = 'normal';
  const riskFactors = [];
  
  if (noiseLevel > 80) {
    riskAssessment = 'elevated';
    riskFactors.push('High noise level detected');
  }
  
  if (lightLevel < 20) {
    riskAssessment = 'elevated';
    riskFactors.push('Low light conditions');
  }
  
  if (crowdDensity === 'high') {
    riskFactors.push('High crowd density');
  }
  
  return {
    riskAssessment,
    riskFactors,
    noiseStatus: noiseLevel > 80 ? 'loud' : noiseLevel > 50 ? 'moderate' : 'quiet',
    lightingStatus: lightLevel < 20 ? 'dark' : lightLevel > 70 ? 'bright' : 'moderate',
    crowdStatus: crowdDensity
  };
}

async function generateCrisisChatResponse(
  userMessage: string,
  conversationHistory: Array<{ sender: string; content: string; timestamp: Date }>,
  crisisLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  userContext?: { recentMoods?: any[], emergencyHistory?: any[] }
): Promise<{ response: string; urgency: 'low' | 'medium' | 'high' | 'critical'; needsEscalation: boolean; resources?: any[] }> {
  try {
    const systemPrompt = `You are a compassionate AI crisis counselor trained in suicide prevention, mental health support, and crisis intervention. 
    Your role is to provide immediate emotional support, assess risk levels, and guide users to appropriate resources.
    
    Guidelines:
    - Always prioritize user safety and well-being
    - Validate feelings and provide hope
    - Use active listening techniques and empathetic responses
    - Ask clarifying questions to understand the situation better
    - If user mentions self-harm, suicidal thoughts, or harm to others, escalate immediately
    - Provide concrete coping strategies and grounding techniques
    - Encourage professional help when appropriate
    - Never provide medical diagnoses or treatment advice
    
    Current crisis level: ${crisisLevel}
    
    Respond naturally and compassionately. Include urgency level (low/medium/high/critical) and indicate if professional escalation is needed.
    
    Response format: JSON {
      "response": "your empathetic response",
      "urgency": "low|medium|high|critical", 
      "needsEscalation": boolean,
      "resources": [optional array of crisis resources if needed]
    }`;

    const conversationContext = conversationHistory.length > 0 ? 
      `Previous conversation:\n${conversationHistory.slice(-10).map(msg => 
        `${msg.sender}: ${msg.content}`
      ).join('\n')}\n\n` : '';

    const userPrompt = `${conversationContext}User: ${userMessage}
    
    Please provide a supportive, personalized response that addresses their specific needs and emotional state.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Slightly higher for more natural responses
    });

    const aiResponse = JSON.parse(response.choices[0].message.content!);
    
    return {
      response: aiResponse.response || "I'm here to support you. Can you tell me more about how you're feeling?",
      urgency: aiResponse.urgency || crisisLevel,
      needsEscalation: aiResponse.needsEscalation || false,
      resources: aiResponse.resources || []
    };
  } catch (error) {
    console.error("Crisis chat response failed:", error);
    // Fallback response for safety
    return {
      response: "I'm here to listen and support you. If you're in immediate danger, please call 911 or the National Suicide Prevention Lifeline at 988.",
      urgency: 'high',
      needsEscalation: userMessage.toLowerCase().includes('suicide') || userMessage.toLowerCase().includes('kill') || userMessage.toLowerCase().includes('harm'),
      resources: [
        { type: "call", label: "Call 988", action: "988" },
        { type: "emergency", label: "Emergency Services", action: "911" }
      ]
    };
  }
}

export { 
  generatePersonalizedInsight, 
  analyzeMoodEntry, 
  assessCrisisRisk, 
  transcribeAudio, 
  analyzeThreatLevel,
  analyzeComprehensiveThreat,
  analyzeBiometrics,
  analyzeEnvironmental,
  generateCrisisChatResponse
};

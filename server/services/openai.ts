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

export async function analyzeMoodEntry(
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

export async function generatePersonalizedInsight(
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

export async function assessCrisisRisk(
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

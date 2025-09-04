import OpenAI from "openai";
import { db } from "../db";
import { 
  moodEntries, 
  sensorData, 
  aiPredictions, 
  crisisPreventions, 
  checkInResponses,
  scheduledNotifications,
  emergencyIncidents,
  users 
} from "@shared/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { sendSMS } from "./twilio";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CrisisRiskAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0.00-1.00
  triggerFactors: string[];
  recommendedActions: string[];
  timeUntilIntervention: number; // minutes
  confidence: number; // 0.00-1.00
}

export class AICrisisPreventionService {
  
  /**
   * Analyze user's recent data for crisis risk patterns
   */
  async analyzeCrisisRisk(userId: string): Promise<CrisisRiskAnalysis> {
    try {
      // Get recent mood entries (last 14 days)
      const recentMoods = await db
        .select()
        .from(moodEntries)
        .where(and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.createdAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(moodEntries.createdAt))
        .limit(50);

      // Get recent sensor data (last 3 days)
      const recentSensorData = await db
        .select()
        .from(sensorData)
        .where(and(
          eq(sensorData.userId, userId),
          gte(sensorData.recordedAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(sensorData.recordedAt))
        .limit(100);

      // Get missed check-ins (last 7 days)
      const missedCheckIns = await db
        .select()
        .from(checkInResponses)
        .where(and(
          eq(checkInResponses.userId, userId),
          eq(checkInResponses.responseType, 'missed'),
          gte(checkInResponses.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(checkInResponses.createdAt));

      // Prepare data for AI analysis
      const analysisData = {
        moodTrend: this.calculateMoodTrend(recentMoods),
        sensorAnomalies: this.detectSensorAnomalies(recentSensorData),
        communicationPatterns: this.analyzeCheckInPatterns(missedCheckIns),
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      // AI analysis using OpenAI GPT-5
      const prompt = `
Analyze this mental health data for crisis risk. Return JSON only.

User Data:
- Mood trend (last 14 days): ${JSON.stringify(analysisData.moodTrend)}
- Sensor anomalies: ${JSON.stringify(analysisData.sensorAnomalies)}  
- Missed check-ins: ${missedCheckIns.length}
- Current time: ${analysisData.timeOfDay}:00, Day ${analysisData.dayOfWeek}

Analyze for crisis risk indicators:
1. Mood deterioration patterns
2. Sleep/heart rate disruptions  
3. Communication withdrawal
4. Time-based risk factors

Return this exact JSON structure:
{
  "riskLevel": "low|medium|high|critical",
  "riskScore": 0.00-1.00,
  "triggerFactors": ["factor1", "factor2"],
  "recommendedActions": ["action1", "action2"], 
  "timeUntilIntervention": minutes_integer,
  "confidence": 0.00-1.00,
  "reasoning": "brief explanation"
}
`;

      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = JSON.parse(response.choices[0].message.content!);
      
      // Store prediction for tracking accuracy
      await this.storePrediction(userId, analysis);
      
      // Trigger intervention if needed
      if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
        await this.triggerCrisisIntervention(userId, analysis);
      }

      return analysis;

    } catch (error) {
      console.error('Crisis risk analysis failed:', error);
      // Return safe fallback
      return {
        riskLevel: 'low',
        riskScore: 0.1,
        triggerFactors: ['analysis_error'],
        recommendedActions: ['check_in_manually'],
        timeUntilIntervention: 60,
        confidence: 0.5
      };
    }
  }

  /**
   * Calculate mood trend from recent entries
   */
  private calculateMoodTrend(moods: any[]): any {
    if (moods.length === 0) return { trend: 'stable', avgScore: 3 };
    
    const scores = moods.map(m => m.moodScore);
    const recent = scores.slice(0, 7); // Last 7 entries
    const older = scores.slice(7, 14); // Previous 7 entries
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    const trend = recentAvg < olderAvg - 0.5 ? 'declining' : 
                  recentAvg > olderAvg + 0.5 ? 'improving' : 'stable';
    
    return {
      trend,
      recentAvg: recentAvg.toFixed(2),
      olderAvg: olderAvg.toFixed(2),
      lowestRecent: Math.min(...recent),
      consecutiveLow: this.countConsecutiveLow(recent)
    };
  }

  /**
   * Detect anomalies in sensor data
   */
  private detectSensorAnomalies(sensorData: any[]): any {
    const heartRateData = sensorData.filter(s => s.sensorType === 'heart_rate');
    const sleepData = sensorData.filter(s => s.sensorType === 'sleep');
    const stressData = sensorData.filter(s => s.sensorType === 'stress');
    
    return {
      heartRateSpikes: this.detectHeartRateSpikes(heartRateData),
      sleepDisruption: this.detectSleepDisruption(sleepData),
      elevatedStress: this.detectElevatedStress(stressData),
      dataGaps: this.detectDataGaps(sensorData)
    };
  }

  /**
   * Trigger crisis intervention based on risk analysis
   */
  private async triggerCrisisIntervention(userId: string, analysis: CrisisRiskAnalysis): Promise<void> {
    try {
      // Get user info
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return;

      // Record the crisis prevention attempt
      const [prevention] = await db.insert(crisisPreventions).values({
        userId,
        triggerType: 'ai_analysis',
        triggerData: analysis,
        interventionType: analysis.riskLevel === 'critical' ? 'emergency_contact' : 'breathing_exercise',
        aiConfidence: analysis.confidence.toString(),
        followUpRequired: true
      }).returning();

      if (analysis.riskLevel === 'critical') {
        // Send immediate SMS check-in
        const userPhone = (user.settings as any)?.phone;
        if (userPhone) {
          const emergencyMessage = `Hi ${user.firstName || user.username}, VitalWatch detected you might need support. Reply 1 if you're safe, 2 if you need help. We're here for you. 💙`;
          await sendSMS(userPhone, emergencyMessage);
        }
        
        // Schedule follow-up if no response in 30 minutes
        await db.insert(scheduledNotifications).values({
          userId,
          notificationType: 'crisis_followup',
          scheduledFor: new Date(Date.now() + 30 * 60 * 1000),
          content: {
            message: 'Crisis follow-up check after AI detection',
            preventionId: prevention.id
          },
          deliveryMethod: 'sms',
          aiGenerated: true
        });

      } else if (analysis.riskLevel === 'high') {
        // Suggest immediate coping tools
        await db.insert(scheduledNotifications).values({
          userId,
          notificationType: 'wellness_tip',
          scheduledFor: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          content: {
            message: 'Take a moment for some deep breathing. Visit vitalwatch.app for guided exercises.',
            reason: 'AI detected elevated stress patterns'
          },
          deliveryMethod: 'sms',
          aiGenerated: true
        });
      }

      console.log(`🤖 Crisis intervention triggered for user ${userId}, risk level: ${analysis.riskLevel}`);

    } catch (error) {
      console.error('Crisis intervention failed:', error);
    }
  }

  /**
   * Store AI prediction for accuracy tracking
   */
  private async storePrediction(userId: string, analysis: CrisisRiskAnalysis): Promise<void> {
    await db.insert(aiPredictions).values({
      userId,
      predictionType: 'crisis_risk',
      forecastDate: new Date(Date.now() + analysis.timeUntilIntervention * 60 * 1000),
      prediction: {
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        triggerFactors: analysis.triggerFactors,
        recommendedActions: analysis.recommendedActions
      },
      confidence: analysis.confidence.toString(),
      basedOnData: {
        moodEntries: 'last_14_days',
        sensorData: 'last_3_days',
        checkInPatterns: 'last_7_days'
      }
    });
  }

  /**
   * Count consecutive low mood entries
   */
  private countConsecutiveLow(scores: number[]): number {
    let count = 0;
    for (const score of scores) {
      if (score <= 2) count++;
      else break;
    }
    return count;
  }

  /**
   * Detect heart rate spikes (potential panic/anxiety)
   */
  private detectHeartRateSpikes(heartRateData: any[]): boolean {
    if (heartRateData.length === 0) return false;
    const avgHR = heartRateData.reduce((sum, d) => sum + parseFloat(d.value), 0) / heartRateData.length;
    return heartRateData.some(d => parseFloat(d.value) > avgHR * 1.3); // 30% above average
  }

  /**
   * Detect sleep disruption patterns
   */
  private detectSleepDisruption(sleepData: any[]): boolean {
    if (sleepData.length === 0) return false;
    const avgSleep = sleepData.reduce((sum, d) => sum + parseFloat(d.value), 0) / sleepData.length;
    return avgSleep < 6 || sleepData.some(d => parseFloat(d.value) < 4); // Less than 6h avg or any night < 4h
  }

  /**
   * Detect elevated stress levels
   */
  private detectElevatedStress(stressData: any[]): boolean {
    if (stressData.length === 0) return false;
    const avgStress = stressData.reduce((sum, d) => sum + parseFloat(d.value), 0) / stressData.length;
    return avgStress > 70; // Stress percentage > 70%
  }

  /**
   * Detect gaps in data collection (could indicate disengagement)
   */
  private detectDataGaps(sensorData: any[]): boolean {
    if (sensorData.length === 0) return true;
    const lastRecord = new Date(sensorData[0].recordedAt);
    const hoursAgo = (Date.now() - lastRecord.getTime()) / (1000 * 60 * 60);
    return hoursAgo > 24; // No data for 24+ hours
  }

  /**
   * Analyze check-in response patterns
   */
  private analyzeCheckInPatterns(missedCheckIns: any[]): any {
    return {
      totalMissed: missedCheckIns.length,
      consecutiveMissed: this.countConsecutiveMissed(missedCheckIns),
      recentlyIncreasing: missedCheckIns.length > 3
    };
  }

  /**
   * Count consecutive missed check-ins
   */
  private countConsecutiveMissed(missedCheckIns: any[]): number {
    // This would need more complex logic to check actual consecutiveness
    // For now, return count of recent misses
    return missedCheckIns.filter(m => 
      new Date(m.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    ).length;
  }

  /**
   * Run continuous monitoring for all users (called by scheduler)
   */
  async runContinuousMonitoring(): Promise<void> {
    try {
      console.log('🔍 Starting continuous crisis monitoring...');
      
      // Get all active users (users who've had activity in last 30 days)
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));

      for (const user of activeUsers) {
        // Run crisis analysis for each user
        const analysis = await this.analyzeCrisisRisk(user.id);
        
        console.log(`👤 User ${user.id}: Risk ${analysis.riskLevel} (${analysis.riskScore})`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Continuous monitoring completed for ${activeUsers.length} users`);
      
    } catch (error) {
      console.error('Continuous monitoring failed:', error);
    }
  }
}

export const aiCrisisPreventionService = new AICrisisPreventionService();
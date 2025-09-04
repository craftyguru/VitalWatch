import OpenAI from "openai";
import { db } from "../db";
import { 
  aiPredictions, 
  moodEntries, 
  sensorData, 
  checkInResponses,
  copingToolsUsage,
  emergencyIncidents,
  users,
  aiInsights,
  scheduledNotifications
} from "@shared/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PredictionInput {
  moodTrends: any[];
  sensorPatterns: any[];
  checkInHistory: any[];
  copingUsage: any[];
  crisisHistory: any[];
  timeContext: {
    currentWeek: number;
    season: string;
    dayOfWeek: number;
    timeOfDay: number;
  };
}

interface WeeklyForecast {
  weekStart: Date;
  weekEnd: Date;
  overallMoodPrediction: {
    averageMood: number;
    confidence: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  dailyPredictions: DailyPrediction[];
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  confidenceScore: number;
}

interface DailyPrediction {
  date: Date;
  predictedMood: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedActivities: string[];
  optimalCheckInTime: string;
}

interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  probability: number;
  description: string;
  mitigation: string[];
}

interface Recommendation {
  type: 'preventive' | 'reactive' | 'wellness';
  priority: 'low' | 'medium' | 'high';
  action: string;
  timing: string;
  expectedOutcome: string;
}

export class PredictiveAnalyticsService {

  /**
   * Generate comprehensive weekly mental health forecast
   */
  async generateWeeklyForecast(userId: string): Promise<WeeklyForecast> {
    try {
      // Gather comprehensive user data
      const predictionInput = await this.gatherPredictionData(userId);
      
      // Generate AI-powered forecast
      const forecast = await this.createAIForecast(userId, predictionInput);
      
      // Store prediction for accuracy tracking
      await this.storeForecastPrediction(userId, forecast);
      
      // Schedule proactive interventions based on forecast
      await this.scheduleProactiveInterventions(userId, forecast);
      
      console.log(`🔮 Generated weekly forecast for user ${userId} with ${forecast.confidenceScore}% confidence`);
      
      return forecast;

    } catch (error) {
      console.error('Weekly forecast generation failed:', error);
      return this.generateFallbackForecast();
    }
  }

  /**
   * Analyze long-term trends and patterns
   */
  async analyzeLongTermTrends(userId: string): Promise<any> {
    try {
      // Get 3 months of data for trend analysis
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      const [moodTrends, sensorTrends, predictionAccuracy] = await Promise.all([
        this.analyzeMoodTrends(userId, threeMonthsAgo),
        this.analyzeSensorTrends(userId, threeMonthsAgo),
        this.calculatePredictionAccuracy(userId, threeMonthsAgo)
      ]);

      const trends = {
        timeRange: '3_months',
        moodTrends,
        sensorTrends,
        predictionAccuracy,
        seasonalPatterns: await this.detectSeasonalPatterns(userId),
        triggerPatterns: await this.identifyTriggerPatterns(userId, threeMonthsAgo),
        copingEffectiveness: await this.analyzeCopingEffectiveness(userId, threeMonthsAgo),
        overallDirection: this.calculateOverallTrend(moodTrends),
        keyInsights: await this.generateTrendInsights(userId, moodTrends, sensorTrends)
      };

      // Store insights
      await this.storeAnalyticsInsights(userId, trends);
      
      return trends;

    } catch (error) {
      console.error('Long-term trend analysis failed:', error);
      return { error: 'Analysis unavailable' };
    }
  }

  /**
   * Generate personalized wellness recommendations
   */
  async generatePersonalizedRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      const forecast = await this.generateWeeklyForecast(userId);
      const trends = await this.analyzeLongTermTrends(userId);
      
      const recommendations: Recommendation[] = [];

      // Analyze forecast for proactive recommendations
      if (forecast.overallMoodPrediction.trend === 'declining') {
        recommendations.push({
          type: 'preventive',
          priority: 'high',
          action: 'Increase daily mindfulness practice to 10 minutes',
          timing: 'next_3_days',
          expectedOutcome: 'Reduce predicted mood decline by 15-20%'
        });
      }

      // High-risk days recommendations
      const highRiskDays = forecast.dailyPredictions.filter(d => d.riskLevel === 'high' || d.riskLevel === 'critical');
      if (highRiskDays.length > 0) {
        recommendations.push({
          type: 'preventive',
          priority: 'high',
          action: `Schedule extra support for ${highRiskDays.length} high-risk days`,
          timing: 'before_risk_periods',
          expectedOutcome: 'Provide additional safety net during vulnerable times'
        });
      }

      // Sensor-based recommendations
      if (trends.sensorTrends?.sleepTrend === 'declining') {
        recommendations.push({
          type: 'wellness',
          priority: 'medium',
          action: 'Implement consistent sleep hygiene routine',
          timing: 'starting_tonight',
          expectedOutcome: 'Improve sleep quality and mood stability'
        });
      }

      // Coping effectiveness recommendations
      if (trends.copingEffectiveness?.lowEffectiveness) {
        recommendations.push({
          type: 'reactive',
          priority: 'medium',
          action: 'Try alternative coping strategies (nature walks, journaling)',
          timing: 'when_stressed',
          expectedOutcome: 'Discover more effective personal coping methods'
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [];
    }
  }

  /**
   * Create predictive dashboard data
   */
  async generateDashboardData(userId: string): Promise<any> {
    try {
      const [forecast, trends, recommendations, riskCalendar] = await Promise.all([
        this.generateWeeklyForecast(userId),
        this.analyzeLongTermTrends(userId),
        this.generatePersonalizedRecommendations(userId),
        this.generateRiskCalendar(userId)
      ]);

      return {
        forecast,
        trends,
        recommendations,
        riskCalendar,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        accuracy: trends.predictionAccuracy || 0.75
      };

    } catch (error) {
      console.error('Dashboard data generation failed:', error);
      return { error: 'Dashboard unavailable' };
    }
  }

  /**
   * Private helper methods
   */

  private async gatherPredictionData(userId: string): Promise<PredictionInput> {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [moodTrends, sensorPatterns, checkInHistory, copingUsage, crisisHistory] = await Promise.all([
      db.select().from(moodEntries)
        .where(and(eq(moodEntries.userId, userId), gte(moodEntries.createdAt, sixtyDaysAgo)))
        .orderBy(desc(moodEntries.createdAt)),
      
      db.select().from(sensorData)
        .where(and(eq(sensorData.userId, userId), gte(sensorData.recordedAt, sixtyDaysAgo)))
        .orderBy(desc(sensorData.recordedAt)),
      
      db.select().from(checkInResponses)
        .where(and(eq(checkInResponses.userId, userId), gte(checkInResponses.createdAt, sixtyDaysAgo)))
        .orderBy(desc(checkInResponses.createdAt)),
      
      db.select().from(copingToolsUsage)
        .where(and(eq(copingToolsUsage.userId, userId), gte(copingToolsUsage.createdAt, sixtyDaysAgo)))
        .orderBy(desc(copingToolsUsage.createdAt)),
      
      db.select().from(emergencyIncidents)
        .where(and(eq(emergencyIncidents.userId, userId), gte(emergencyIncidents.createdAt, sixtyDaysAgo)))
        .orderBy(desc(emergencyIncidents.createdAt))
    ]);

    const now = new Date();
    return {
      moodTrends,
      sensorPatterns,
      checkInHistory,
      copingUsage,
      crisisHistory,
      timeContext: {
        currentWeek: this.getWeekNumber(now),
        season: this.getSeason(now),
        dayOfWeek: now.getDay(),
        timeOfDay: now.getHours()
      }
    };
  }

  private async createAIForecast(userId: string, input: PredictionInput): Promise<WeeklyForecast> {
    const prompt = `
Analyze this comprehensive mental health data and predict the next week's patterns. Return JSON only.

User Data Summary:
- Mood entries (60 days): ${input.moodTrends.length} entries
- Recent mood average: ${this.calculateAverageMood(input.moodTrends)}
- Sensor data points: ${input.sensorPatterns.length}
- Check-in responses: ${input.checkInHistory.length}
- Coping tool usage: ${input.copingUsage.length}
- Crisis incidents: ${input.crisisHistory.length}
- Current context: Week ${input.timeContext.currentWeek}, ${input.timeContext.season}, Day ${input.timeContext.dayOfWeek}

Create a detailed 7-day forecast considering:
1. Historical mood patterns and trends
2. Seasonal/weekly cycles
3. Stress indicators from sensor data
4. Response patterns to interventions
5. Environmental factors (season, day of week)

Return this exact JSON structure:
{
  "overallMoodPrediction": {
    "averageMood": 1-5_float,
    "confidence": 0.0-1.0,
    "trend": "improving|stable|declining"
  },
  "dailyPredictions": [
    {
      "dayOffset": 0-6,
      "predictedMood": 1-5_float,
      "confidence": 0.0-1.0,
      "riskLevel": "low|medium|high|critical",
      "suggestedActivities": ["activity1", "activity2"],
      "optimalCheckInTime": "HH:MM"
    }
  ],
  "riskFactors": [
    {
      "factor": "description",
      "impact": "low|medium|high",
      "probability": 0.0-1.0,
      "description": "explanation",
      "mitigation": ["action1", "action2"]
    }
  ],
  "recommendations": [
    {
      "type": "preventive|reactive|wellness",
      "priority": "low|medium|high",
      "action": "specific_action",
      "timing": "when_to_do",
      "expectedOutcome": "expected_result"
    }
  ],
  "confidenceScore": 0-100_integer
}
`;

    try {
      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1500
      });

      const aiResult = JSON.parse(response.choices[0].message.content!);
      
      // Convert to WeeklyForecast format
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week

      return {
        weekStart,
        weekEnd,
        overallMoodPrediction: aiResult.overallMoodPrediction,
        dailyPredictions: aiResult.dailyPredictions.map((daily: any) => ({
          date: new Date(now.getTime() + daily.dayOffset * 24 * 60 * 60 * 1000),
          predictedMood: daily.predictedMood,
          confidence: daily.confidence,
          riskLevel: daily.riskLevel,
          suggestedActivities: daily.suggestedActivities,
          optimalCheckInTime: daily.optimalCheckInTime
        })),
        riskFactors: aiResult.riskFactors,
        recommendations: aiResult.recommendations,
        confidenceScore: aiResult.confidenceScore / 100
      };

    } catch (error) {
      console.error('AI forecast creation failed:', error);
      return this.generateFallbackForecast();
    }
  }

  private async storeForecastPrediction(userId: string, forecast: WeeklyForecast): Promise<void> {
    await db.insert(aiPredictions).values({
      userId,
      predictionType: 'weekly_forecast',
      forecastDate: forecast.weekEnd,
      prediction: {
        overallMood: forecast.overallMoodPrediction,
        dailyPredictions: forecast.dailyPredictions,
        riskFactors: forecast.riskFactors,
        recommendations: forecast.recommendations
      },
      confidence: forecast.confidenceScore.toString(),
      basedOnData: {
        moodEntries: 'last_60_days',
        sensorData: 'last_60_days',
        checkIns: 'last_60_days',
        copingUsage: 'last_60_days'
      }
    });
  }

  private async scheduleProactiveInterventions(userId: string, forecast: WeeklyForecast): Promise<void> {
    // Schedule interventions for high-risk days
    for (const daily of forecast.dailyPredictions) {
      if (daily.riskLevel === 'high' || daily.riskLevel === 'critical') {
        
        // Schedule pre-emptive check-in
        const checkInTime = new Date(daily.date);
        const [hour, minute] = daily.optimalCheckInTime.split(':').map(Number);
        checkInTime.setHours(hour, minute, 0, 0);

        await db.insert(scheduledNotifications).values({
          userId,
          notificationType: 'wellness_check',
          scheduledFor: checkInTime,
          content: {
            message: 'AI forecast suggests today might be challenging. How are you feeling? Reply 1 = Good, 2 = Struggling.',
            reason: `Proactive check-in for predicted ${daily.riskLevel} risk day`,
            predictedMood: daily.predictedMood,
            suggestedActivities: daily.suggestedActivities
          },
          deliveryMethod: 'sms',
          aiGenerated: true
        });

        // Schedule evening support if critical risk
        if (daily.riskLevel === 'critical') {
          const eveningCheck = new Date(daily.date);
          eveningCheck.setHours(19, 0, 0, 0); // 7 PM

          await db.insert(scheduledNotifications).values({
            userId,
            notificationType: 'crisis_prevention',
            scheduledFor: eveningCheck,
            content: {
              message: 'Checking in on your evening. You matter and support is available. Text HELP if you need resources.',
              reason: 'Critical risk day - evening wellness check',
              urgency: 'high'
            },
            deliveryMethod: 'sms',
            aiGenerated: true
          });
        }
      }
    }

    // Schedule wellness activity reminders
    for (const recommendation of forecast.recommendations) {
      if (recommendation.type === 'preventive' && recommendation.priority === 'high') {
        await db.insert(scheduledNotifications).values({
          userId,
          notificationType: 'wellness_tip',
          scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          content: {
            message: `AI recommendation: ${recommendation.action}`,
            expectedOutcome: recommendation.expectedOutcome,
            priority: recommendation.priority
          },
          deliveryMethod: 'push',
          aiGenerated: true
        });
      }
    }
  }

  private async analyzeMoodTrends(userId: string, since: Date): Promise<any> {
    const moods = await db
      .select()
      .from(moodEntries)
      .where(and(eq(moodEntries.userId, userId), gte(moodEntries.createdAt, since)))
      .orderBy(desc(moodEntries.createdAt));

    if (moods.length === 0) return { trend: 'no_data' };

    const scores = moods.map(m => m.moodScore);
    const recentAvg = scores.slice(0, 14).reduce((a, b) => a + b, 0) / Math.min(scores.length, 14);
    const olderAvg = scores.slice(14, 28).reduce((a, b) => a + b, 0) / Math.max(scores.slice(14, 28).length, 1);

    return {
      trend: recentAvg > olderAvg + 0.3 ? 'improving' : recentAvg < olderAvg - 0.3 ? 'declining' : 'stable',
      recentAverage: Math.round(recentAvg * 100) / 100,
      olderAverage: Math.round(olderAvg * 100) / 100,
      totalEntries: moods.length,
      lowestPeriod: this.findLowestMoodPeriod(moods),
      highestPeriod: this.findHighestMoodPeriod(moods)
    };
  }

  private async analyzeSensorTrends(userId: string, since: Date): Promise<any> {
    const sensorReadings = await db
      .select()
      .from(sensorData)
      .where(and(eq(sensorData.userId, userId), gte(sensorData.recordedAt, since)))
      .orderBy(desc(sensorData.recordedAt));

    const byType = sensorReadings.reduce((acc, reading) => {
      if (!acc[reading.sensorType]) acc[reading.sensorType] = [];
      acc[reading.sensorType].push(parseFloat(reading.value));
      return acc;
    }, {} as any);

    const trends = {};
    for (const [type, values] of Object.entries(byType) as any) {
      if (values.length >= 7) {
        const recent = values.slice(0, Math.floor(values.length / 2));
        const older = values.slice(Math.floor(values.length / 2));
        const recentAvg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a: number, b: number) => a + b, 0) / older.length;
        
        trends[`${type}Trend`] = recentAvg > olderAvg * 1.1 ? 'increasing' : 
                                recentAvg < olderAvg * 0.9 ? 'declining' : 'stable';
        trends[`${type}Average`] = Math.round(recentAvg * 100) / 100;
      }
    }

    return trends;
  }

  private async calculatePredictionAccuracy(userId: string, since: Date): Promise<number> {
    const predictions = await db
      .select()
      .from(aiPredictions)
      .where(and(
        eq(aiPredictions.userId, userId),
        gte(aiPredictions.createdAt, since)
      ));

    if (predictions.length === 0) return 0.75; // Default assumption

    // Compare predictions with actual outcomes
    let totalAccuracy = 0;
    let count = 0;

    for (const prediction of predictions) {
      if (prediction.accuracy) {
        totalAccuracy += parseFloat(prediction.accuracy);
        count++;
      }
    }

    return count > 0 ? totalAccuracy / count : 0.75;
  }

  private async detectSeasonalPatterns(userId: string): Promise<any> {
    // Simplified seasonal analysis - would be enhanced with more data
    const currentSeason = this.getSeason(new Date());
    return {
      currentSeason,
      seasonalAffect: currentSeason === 'winter' ? 'potential_sad' : 'minimal',
      recommendations: currentSeason === 'winter' ? 
        ['Light therapy', 'Vitamin D', 'Exercise indoors'] : 
        ['Outdoor activities', 'Sun exposure', 'Nature connection']
    };
  }

  private async identifyTriggerPatterns(userId: string, since: Date): Promise<any> {
    const incidents = await db
      .select()
      .from(emergencyIncidents)
      .where(and(eq(emergencyIncidents.userId, userId), gte(emergencyIncidents.createdAt, since)));

    const triggers = incidents.map(i => {
      const hour = new Date(i.createdAt).getHours();
      const day = new Date(i.createdAt).getDay();
      return { hour, day, type: i.type };
    });

    return {
      commonTimes: this.findCommonTriggerTimes(triggers),
      commonDays: this.findCommonTriggerDays(triggers),
      patterns: triggers.length > 3 ? 'patterns_detected' : 'insufficient_data'
    };
  }

  private async analyzeCopingEffectiveness(userId: string, since: Date): Promise<any> {
    const copingUsage = await db
      .select()
      .from(copingToolsUsage)
      .where(and(eq(copingToolsUsage.userId, userId), gte(copingToolsUsage.createdAt, since)));

    if (copingUsage.length === 0) return { effectiveness: 'no_data' };

    const avgEffectiveness = copingUsage
      .filter(c => c.effectiveness !== null)
      .reduce((sum, c) => sum + (c.effectiveness || 0), 0) / copingUsage.length;

    return {
      effectiveness: avgEffectiveness > 3.5 ? 'high' : avgEffectiveness > 2.5 ? 'medium' : 'low',
      avgRating: Math.round(avgEffectiveness * 100) / 100,
      mostUsedTool: this.findMostUsedCopingTool(copingUsage),
      completionRate: copingUsage.filter(c => c.completed).length / copingUsage.length
    };
  }

  private calculateOverallTrend(moodTrends: any): 'improving' | 'stable' | 'declining' {
    return moodTrends.trend || 'stable';
  }

  private async generateTrendInsights(userId: string, moodTrends: any, sensorTrends: any): Promise<string[]> {
    const insights = [];

    if (moodTrends.trend === 'improving') {
      insights.push('Mood trends show positive improvement over the past 3 months');
    } else if (moodTrends.trend === 'declining') {
      insights.push('Mood patterns indicate a need for increased support');
    }

    if (sensorTrends.sleepTrend === 'declining') {
      insights.push('Sleep quality may be impacting overall wellness');
    }

    if (sensorTrends.stressTrend === 'increasing') {
      insights.push('Stress levels are trending upward - consider stress management techniques');
    }

    return insights;
  }

  private async storeAnalyticsInsights(userId: string, trends: any): Promise<void> {
    if (trends.keyInsights && trends.keyInsights.length > 0) {
      for (const insight of trends.keyInsights) {
        await db.insert(aiInsights).values({
          userId,
          type: 'trend_analysis',
          insight,
          confidence: '0.8',
          isActionable: true,
          metadata: {
            analysisType: 'long_term_trends',
            timeRange: trends.timeRange,
            overallDirection: trends.overallDirection
          }
        });
      }
    }
  }

  private async generateRiskCalendar(userId: string): Promise<any> {
    const forecast = await this.generateWeeklyForecast(userId);
    
    const calendar = {};
    for (const daily of forecast.dailyPredictions) {
      const dateKey = daily.date.toISOString().split('T')[0];
      calendar[dateKey] = {
        riskLevel: daily.riskLevel,
        predictedMood: daily.predictedMood,
        confidence: daily.confidence,
        activities: daily.suggestedActivities
      };
    }

    return calendar;
  }

  private generateFallbackForecast(): WeeklyForecast {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const dailyPredictions: DailyPrediction[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      dailyPredictions.push({
        date,
        predictedMood: 3.0, // Neutral
        confidence: 0.5,
        riskLevel: 'low',
        suggestedActivities: ['mindfulness', 'gentle exercise'],
        optimalCheckInTime: '14:00'
      });
    }

    return {
      weekStart,
      weekEnd,
      overallMoodPrediction: {
        averageMood: 3.0,
        confidence: 0.5,
        trend: 'stable'
      },
      dailyPredictions,
      riskFactors: [],
      recommendations: [],
      confidenceScore: 0.5
    };
  }

  // Utility methods
  private calculateAverageMood(moods: any[]): number {
    if (moods.length === 0) return 3.0;
    return moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private findLowestMoodPeriod(moods: any[]): any {
    // Find 7-day period with lowest average mood
    let lowestAvg = 5;
    let lowestPeriod = null;

    for (let i = 0; i <= moods.length - 7; i++) {
      const period = moods.slice(i, i + 7);
      const avg = period.reduce((sum, m) => sum + m.moodScore, 0) / 7;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestPeriod = {
          start: period[6].createdAt,
          end: period[0].createdAt,
          averageMood: Math.round(avg * 100) / 100
        };
      }
    }

    return lowestPeriod;
  }

  private findHighestMoodPeriod(moods: any[]): any {
    // Find 7-day period with highest average mood
    let highestAvg = 1;
    let highestPeriod = null;

    for (let i = 0; i <= moods.length - 7; i++) {
      const period = moods.slice(i, i + 7);
      const avg = period.reduce((sum, m) => sum + m.moodScore, 0) / 7;
      if (avg > highestAvg) {
        highestAvg = avg;
        highestPeriod = {
          start: period[6].createdAt,
          end: period[0].createdAt,
          averageMood: Math.round(avg * 100) / 100
        };
      }
    }

    return highestPeriod;
  }

  private findCommonTriggerTimes(triggers: any[]): number[] {
    const hourCounts = triggers.reduce((acc, t) => {
      acc[t.hour] = (acc[t.hour] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(hourCounts)
      .filter(([hour, count]) => count > 1)
      .map(([hour, count]) => parseInt(hour));
  }

  private findCommonTriggerDays(triggers: any[]): number[] {
    const dayCounts = triggers.reduce((acc, t) => {
      acc[t.day] = (acc[t.day] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dayCounts)
      .filter(([day, count]) => count > 1)
      .map(([day, count]) => parseInt(day));
  }

  private findMostUsedCopingTool(copingUsage: any[]): string {
    const toolCounts = copingUsage.reduce((acc, c) => {
      acc[c.toolType] = (acc[c.toolType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(toolCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'breathing';
  }

  /**
   * Run predictive analytics for all users (called by scheduler)
   */
  async runPredictiveAnalytics(): Promise<void> {
    try {
      console.log('🔮 Running predictive analytics for all users...');
      
      // Get active users (updated in last 30 days)
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));

      for (const user of activeUsers) {
        try {
          // Generate weekly forecast
          const forecast = await this.generateWeeklyForecast(user.id);
          
          // Generate trend analysis
          const trends = await this.analyzeLongTermTrends(user.id);
          
          console.log(`📊 Analytics for user ${user.id}: ${forecast.overallMoodPrediction.trend} trend, ${forecast.confidenceScore} confidence`);
          
          // Delay between users to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Analytics failed for user ${user.id}:`, error);
        }
      }
      
      console.log(`✅ Predictive analytics completed for ${activeUsers.length} users`);
      
    } catch (error) {
      console.error('Predictive analytics run failed:', error);
    }
  }
}

export const predictiveAnalyticsService = new PredictiveAnalyticsService();
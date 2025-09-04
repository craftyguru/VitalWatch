import { db } from "../db";
import { 
  dailyCheckIns, 
  checkInResponses, 
  users, 
  scheduledNotifications,
  moodEntries,
  emergencyContacts,
  sensorData
} from "@shared/schema";
import { eq, desc, gte, and, lt } from "drizzle-orm";
import { sendSMS } from "./twilio";
import { aiCrisisPreventionService } from "./aiCrisisPreventionService";

interface CheckInSchedule {
  userId: string;
  optimalTime: string; // HH:MM format
  timezone: string;
  confidence: number;
  reasoning: string[];
}

export class SmartCheckInService {

  /**
   * Initialize daily check-ins for a new user
   */
  async initializeUserCheckIns(userId: string, preferredTime?: string): Promise<void> {
    try {
      // Check if user already has check-ins set up
      const existing = await db
        .select()
        .from(dailyCheckIns)
        .where(eq(dailyCheckIns.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        console.log(`User ${userId} already has check-ins configured`);
        return;
      }

      // Create initial check-in schedule
      const scheduledTime = preferredTime || '14:00'; // Default to 2 PM
      await db.insert(dailyCheckIns).values({
        userId,
        scheduledTime,
        timezone: 'UTC', // Will be updated based on user's location
        isActive: true,
        aiOptimized: false
      });

      console.log(`✅ Initialized daily check-ins for user ${userId} at ${scheduledTime}`);

    } catch (error) {
      console.error('Failed to initialize check-ins:', error);
    }
  }

  /**
   * AI-optimize check-in timing based on user patterns
   */
  async optimizeCheckInTiming(userId: string): Promise<CheckInSchedule | null> {
    try {
      // Get user's historical data
      const recentMoods = await db
        .select()
        .from(moodEntries)
        .where(and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(moodEntries.createdAt));

      const checkInHistory = await db
        .select()
        .from(checkInResponses)
        .where(and(
          eq(checkInResponses.userId, userId),
          gte(checkInResponses.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(checkInResponses.createdAt));

      const sensorActivity = await db
        .select()
        .from(sensorData)
        .where(and(
          eq(sensorData.userId, userId),
          gte(sensorData.recordedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ))
        .orderBy(desc(sensorData.recordedAt));

      // Analyze patterns
      const moodPatterns = this.analyzeMoodPatterns(recentMoods);
      const responsePatterns = this.analyzeResponsePatterns(checkInHistory);
      const activityPatterns = this.analyzeActivityPatterns(sensorActivity);

      // Calculate optimal time
      const optimalTime = this.calculateOptimalTime(moodPatterns, responsePatterns, activityPatterns);

      // Update user's check-in schedule
      await db
        .update(dailyCheckIns)
        .set({
          scheduledTime: optimalTime.optimalTime,
          aiOptimized: true
        })
        .where(eq(dailyCheckIns.userId, userId));

      console.log(`🤖 AI optimized check-in time for user ${userId}: ${optimalTime.optimalTime}`);
      return optimalTime;

    } catch (error) {
      console.error('Check-in optimization failed:', error);
      return null;
    }
  }

  /**
   * Send daily check-in to user
   */
  async sendDailyCheckIn(userId: string): Promise<void> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user || !user.settings?.phone) {
        console.log(`No phone number for user ${userId}, skipping SMS check-in`);
        return;
      }

      // Update last sent timestamp
      await db
        .update(dailyCheckIns)
        .set({ lastSent: new Date() })
        .where(eq(dailyCheckIns.userId, userId));

      // Send personalized check-in message
      const checkInMessage = await this.generatePersonalizedCheckIn(userId);
      await sendSMS(user.settings.phone, checkInMessage);

      // Schedule escalation if no response in 4 hours
      await db.insert(scheduledNotifications).values({
        userId,
        notificationType: 'checkin_reminder',
        scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
        content: {
          message: 'Gentle reminder: How are you feeling today? Reply 1 for safe, 2 for support.',
          type: 'first_reminder'
        },
        deliveryMethod: 'sms'
      });

      console.log(`📱 Daily check-in sent to user ${userId}`);

    } catch (error) {
      console.error('Failed to send daily check-in:', error);
    }
  }

  /**
   * Process check-in response
   */
  async processCheckInResponse(userId: string, response: string, responseTime?: Date): Promise<void> {
    try {
      const responseTimeStamp = responseTime || new Date();
      const lowerResponse = response.toLowerCase().trim();

      // Get current check-in schedule
      const [checkIn] = await db
        .select()
        .from(dailyCheckIns)
        .where(eq(dailyCheckIns.userId, userId))
        .limit(1);

      if (!checkIn) return;

      // Determine response type and risk score
      let responseType: string;
      let escalated = false;
      let escalationReason: string | null = null;
      let aiRiskScore = 0.1;

      if (lowerResponse === '1' || lowerResponse === 'safe' || lowerResponse === 'ok') {
        responseType = 'safe';
        aiRiskScore = 0.1;
      } else if (lowerResponse === '2' || lowerResponse === 'help' || lowerResponse === 'support') {
        responseType = 'help_requested';
        aiRiskScore = 0.8;
        escalated = true;
        escalationReason = 'user_requested_help';
      } else if (lowerResponse.includes('sad') || lowerResponse.includes('bad') || lowerResponse.includes('terrible')) {
        responseType = 'negative_mood';
        aiRiskScore = 0.6;
        escalated = true;
        escalationReason = 'negative_mood_reported';
      } else {
        responseType = 'custom';
        // Use AI to analyze the custom response
        aiRiskScore = await this.analyzeCustomResponse(response);
        if (aiRiskScore > 0.7) {
          escalated = true;
          escalationReason = 'ai_detected_concern';
        }
      }

      // Record the response
      await db.insert(checkInResponses).values({
        userId,
        checkInId: checkIn.id,
        responseType,
        response,
        responseTime: responseTimeStamp,
        escalated,
        escalationReason,
        aiRiskScore
      });

      // Update check-in record
      await db
        .update(dailyCheckIns)
        .set({ 
          lastResponse: responseTimeStamp,
          missedCount: 0 // Reset missed count on response
        })
        .where(eq(dailyCheckIns.userId, userId));

      // Handle escalation if needed
      if (escalated) {
        await this.handleCheckInEscalation(userId, responseType, response);
      } else {
        // Send positive reinforcement
        await this.sendPositiveReinforcement(userId, responseType);
      }

      console.log(`✅ Processed check-in response for user ${userId}: ${responseType} (risk: ${aiRiskScore})`);

    } catch (error) {
      console.error('Failed to process check-in response:', error);
    }
  }

  /**
   * Handle missed check-ins
   */
  async handleMissedCheckIn(userId: string): Promise<void> {
    try {
      // Get current check-in data
      const [checkIn] = await db
        .select()
        .from(dailyCheckIns)
        .where(eq(dailyCheckIns.userId, userId))
        .limit(1);

      if (!checkIn) return;

      // Increment missed count
      const newMissedCount = checkIn.missedCount + 1;
      await db
        .update(dailyCheckIns)
        .set({ missedCount: newMissedCount })
        .where(eq(dailyCheckIns.userId, userId));

      // Record missed response
      await db.insert(checkInResponses).values({
        userId,
        checkInId: checkIn.id,
        responseType: 'missed',
        escalated: newMissedCount >= 2, // Escalate after 2 misses
        escalationReason: newMissedCount >= 2 ? 'multiple_missed_checkins' : null,
        aiRiskScore: Math.min(0.3 + (newMissedCount * 0.2), 0.9)
      });

      // Send escalating reminders
      if (newMissedCount === 1) {
        // First miss - gentle reminder
        await this.sendGentleReminder(userId);
      } else if (newMissedCount === 2) {
        // Second miss - more urgent
        await this.sendUrgentReminder(userId);
      } else if (newMissedCount >= 3) {
        // Multiple misses - potential crisis, notify emergency contacts
        await this.notifyEmergencyContacts(userId, 'missed_checkins');
        // Trigger AI crisis analysis
        await aiCrisisPreventionService.analyzeCrisisRisk(userId);
      }

      console.log(`⚠️ User ${userId} missed check-in (count: ${newMissedCount})`);

    } catch (error) {
      console.error('Failed to handle missed check-in:', error);
    }
  }

  /**
   * Generate personalized check-in message
   */
  private async generatePersonalizedCheckIn(userId: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const firstName = user?.firstName || user?.username || 'there';

    // Get recent mood for personalization
    const [recentMood] = await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(1);

    const messages = [
      `Hi ${firstName}! Daily check-in: How are you feeling today? Reply 1 = Safe, 2 = Need support.`,
      `Morning ${firstName}! VitalWatch check-in time. Reply 1 if you're doing well, 2 if you need help.`,
      `Hello ${firstName}! Time for your wellness check. 1 = I'm good, 2 = Could use support.`,
      `Hi ${firstName}! Quick check: How's your day going? 1 = All good, 2 = Send resources.`
    ];

    // Personalize based on recent mood
    if (recentMood && recentMood.moodScore <= 2) {
      return `Hi ${firstName}, thinking of you today. How are you feeling? Reply 1 = Better, 2 = Still struggling. 💙`;
    }

    // Random selection for variety
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Analyze mood patterns for timing optimization
   */
  private analyzeMoodPatterns(moods: any[]): any {
    const hourlyMoods: { [hour: number]: number[] } = {};
    
    moods.forEach(mood => {
      const hour = new Date(mood.createdAt).getHours();
      if (!hourlyMoods[hour]) hourlyMoods[hour] = [];
      hourlyMoods[hour].push(mood.moodScore);
    });

    // Find hours with lowest average mood (when intervention might be most needed)
    const hourlyAverages = Object.entries(hourlyMoods).map(([hour, scores]) => ({
      hour: parseInt(hour),
      avgMood: scores.reduce((a, b) => a + b, 0) / scores.length,
      entryCount: scores.length
    }));

    return {
      hourlyAverages,
      lowestMoodHours: hourlyAverages
        .filter(h => h.entryCount >= 2)
        .sort((a, b) => a.avgMood - b.avgMood)
        .slice(0, 3)
    };
  }

  /**
   * Analyze response patterns for timing optimization
   */
  private analyzeResponsePatterns(responses: any[]): any {
    const responseByHour: { [hour: number]: any[] } = {};
    
    responses.forEach(response => {
      if (response.responseTime) {
        const hour = new Date(response.responseTime).getHours();
        if (!responseByHour[hour]) responseByHour[hour] = [];
        responseByHour[hour].push(response);
      }
    });

    // Find hours with highest response rate
    const hourlyStats = Object.entries(responseByHour).map(([hour, resps]) => ({
      hour: parseInt(hour),
      responseCount: resps.length,
      avgResponseTime: resps.reduce((sum, r) => {
        const responseTime = new Date(r.responseTime).getTime();
        const sentTime = new Date(r.createdAt).getTime();
        return sum + (responseTime - sentTime);
      }, 0) / resps.length / (1000 * 60) // minutes
    }));

    return {
      hourlyStats,
      bestResponseHours: hourlyStats
        .filter(h => h.responseCount >= 2)
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 3)
    };
  }

  /**
   * Analyze activity patterns from sensor data
   */
  private analyzeActivityPatterns(sensorData: any[]): any {
    const activityByHour: { [hour: number]: any[] } = {};
    
    sensorData.forEach(data => {
      const hour = new Date(data.recordedAt).getHours();
      if (!activityByHour[hour]) activityByHour[hour] = [];
      activityByHour[hour].push(data);
    });

    // Find hours with consistent activity (user is awake and active)
    const hourlyActivity = Object.entries(activityByHour).map(([hour, data]) => ({
      hour: parseInt(hour),
      activityLevel: data.length,
      hasHeartRate: data.some(d => d.sensorType === 'heart_rate'),
      hasSteps: data.some(d => d.sensorType === 'steps')
    }));

    return {
      hourlyActivity,
      activeHours: hourlyActivity
        .filter(h => h.activityLevel >= 5 && (h.hasHeartRate || h.hasSteps))
        .sort((a, b) => b.activityLevel - a.activityLevel)
    };
  }

  /**
   * Calculate optimal check-in time
   */
  private calculateOptimalTime(moodPatterns: any, responsePatterns: any, activityPatterns: any): CheckInSchedule {
    // Score each hour based on multiple factors
    const hourScores: { [hour: number]: number } = {};
    
    // Initialize all hours
    for (let hour = 6; hour <= 22; hour++) { // Only consider 6 AM to 10 PM
      hourScores[hour] = 0;
    }

    // Factor 1: Response history (higher score for hours with good responses)
    responsePatterns.bestResponseHours.forEach((hourData: any, index: number) => {
      hourScores[hourData.hour] += (3 - index) * 10; // 30, 20, 10 points
    });

    // Factor 2: Activity level (prefer hours when user is active)
    activityPatterns.activeHours.slice(0, 5).forEach((hourData: any, index: number) => {
      hourScores[hourData.hour] += (5 - index) * 5; // 25, 20, 15, 10, 5 points
    });

    // Factor 3: Avoid very early/late hours
    Object.keys(hourScores).forEach(hour => {
      const h = parseInt(hour);
      if (h < 8 || h > 20) hourScores[h] -= 20; // Penalty for early/late
      if (h >= 12 && h <= 16) hourScores[h] += 10; // Bonus for afternoon
    });

    // Find optimal hour
    const optimalHour = Object.entries(hourScores)
      .sort(([,a], [,b]) => b - a)[0][0];

    const optimalTime = `${optimalHour.padStart(2, '0')}:00`;

    return {
      userId: '', // Will be set by caller
      optimalTime,
      timezone: 'UTC',
      confidence: 0.8,
      reasoning: [
        `Selected ${optimalTime} based on response patterns`,
        `Activity level analysis`,
        `Mood pattern consideration`
      ]
    };
  }

  /**
   * Analyze custom response with AI
   */
  private async analyzeCustomResponse(response: string): Promise<number> {
    // Simplified analysis - in production this would use OpenAI
    const concernWords = ['sad', 'depressed', 'anxious', 'hopeless', 'tired', 'alone', 'scared', 'hurt'];
    const lowerResponse = response.toLowerCase();
    
    const concernCount = concernWords.filter(word => lowerResponse.includes(word)).length;
    return Math.min(0.2 + (concernCount * 0.2), 0.9);
  }

  /**
   * Handle check-in escalation
   */
  private async handleCheckInEscalation(userId: string, responseType: string, response: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.settings?.phone) return;

    if (responseType === 'help_requested') {
      const supportMessage = `${user.firstName || user.username}, here are immediate resources:
• Call/Text 988 (Crisis Lifeline)
• Text HOME to 741741 (Crisis Text Line)
• Visit vitalwatch.app for breathing exercises
You're not alone. 💙`;
      
      await sendSMS(user.settings.phone, supportMessage);
    } else {
      const checkInMessage = `Thank you for sharing. Would you like some coping resources? Reply YES for breathing exercises or HELP for crisis support.`;
      await sendSMS(user.settings.phone, checkInMessage);
    }
  }

  /**
   * Send positive reinforcement
   */
  private async sendPositiveReinforcement(userId: string, responseType: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.settings?.phone) return;

    const messages = [
      `Thanks ${user.firstName || user.username}! Glad you're doing well. 😊`,
      `Great to hear you're safe! Keep up the good work. 💪`,
      `Thanks for checking in! VitalWatch is here if you need support. 💙`
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    await sendSMS(user.settings.phone, message);
  }

  /**
   * Send gentle reminder for first missed check-in
   */
  private async sendGentleReminder(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.settings?.phone) return;

    const message = `Hi ${user.firstName || user.username}, just checking in. How are you feeling today? Reply 1 = Good, 2 = Need support.`;
    await sendSMS(user.settings.phone, message);
  }

  /**
   * Send urgent reminder for second missed check-in
   */
  private async sendUrgentReminder(userId: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || !user.settings?.phone) return;

    const message = `${user.firstName || user.username}, we want to make sure you're okay. Please respond: 1 = I'm safe, 2 = I need help. VitalWatch cares about you. 💙`;
    await sendSMS(user.settings.phone, message);
  }

  /**
   * Notify emergency contacts about missed check-ins
   */
  private async notifyEmergencyContacts(userId: string, reason: string): Promise<void> {
    const contacts = await db
      .select()
      .from(emergencyContacts)
      .where(and(eq(emergencyContacts.userId, userId), eq(emergencyContacts.isActive, true)))
      .orderBy(emergencyContacts.priority);

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    for (const contact of contacts.slice(0, 2)) { // Only notify top 2 contacts
      if (contact.phone) {
        const message = `VitalWatch Alert: ${user.firstName || user.username} has missed multiple wellness check-ins. You're listed as their emergency contact. Please reach out to check on them.`;
        await sendSMS(contact.phone, message);
      }
    }
  }

  /**
   * Run daily check-in scheduler (called by cron job)
   */
  async runDailyScheduler(): Promise<void> {
    try {
      console.log('📅 Running daily check-in scheduler...');
      
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes();
      
      // Find users who should receive check-ins in this time window (±5 minutes)
      const schedules = await db
        .select()
        .from(dailyCheckIns)
        .where(eq(dailyCheckIns.isActive, true));

      for (const schedule of schedules) {
        const [scheduleHour, scheduleMinute] = schedule.scheduledTime.split(':').map(Number);
        
        // Check if current time matches scheduled time (±5 minutes)
        const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (scheduleHour * 60 + scheduleMinute));
        
        if (timeDiff <= 5) {
          // Check if already sent today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const alreadySent = schedule.lastSent && new Date(schedule.lastSent) > today;
          
          if (!alreadySent) {
            await this.sendDailyCheckIn(schedule.userId);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        }
      }
      
      console.log(`✅ Daily check-in scheduler completed`);
      
    } catch (error) {
      console.error('Daily scheduler failed:', error);
    }
  }
}

export const smartCheckInService = new SmartCheckInService();
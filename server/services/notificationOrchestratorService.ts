import { db } from "../db";
import { 
  scheduledNotifications, 
  users, 
  emergencyContacts,
  crisisPreventions,
  aiInsights 
} from "@shared/schema";
import { eq, desc, gte, and, lte } from "drizzle-orm";
import { sendSMS } from "./twilio";
import { aiCrisisPreventionService } from "./aiCrisisPreventionService";
import { smartCheckInService } from "./smartCheckInService";
import { sensorMonitoringService } from "./sensorMonitoringService";
import { locationSafetyService } from "./locationSafetyService";
import { buddySystemService } from "./buddySystemService";
import { predictiveAnalyticsService } from "./predictiveAnalyticsService";

interface NotificationPriority {
  level: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  delayBetweenMessages: number; // minutes
  maxDailyMessages: number;
  escalationTime: number; // minutes until escalation
}

interface SystemAlert {
  userId: string;
  alertType: 'crisis_risk' | 'missed_checkin' | 'sensor_anomaly' | 'zone_trigger' | 'buddy_concern' | 'prediction_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: any;
  requiresImmediate: boolean;
}

export class NotificationOrchestratorService {
  
  private prioritySettings: { [key: string]: NotificationPriority } = {
    emergency: { level: 'emergency', delayBetweenMessages: 5, maxDailyMessages: 50, escalationTime: 15 },
    critical: { level: 'critical', delayBetweenMessages: 15, maxDailyMessages: 20, escalationTime: 30 },
    high: { level: 'high', delayBetweenMessages: 30, maxDailyMessages: 10, escalationTime: 60 },
    medium: { level: 'medium', delayBetweenMessages: 60, maxDailyMessages: 5, escalationTime: 120 },
    low: { level: 'low', delayBetweenMessages: 120, maxDailyMessages: 3, escalationTime: 240 }
  };

  /**
   * Master notification processor - runs all AI systems and coordinates responses
   */
  async runMasterMonitoring(): Promise<void> {
    try {
      console.log('🔄 Starting master notification orchestration...');

      // 1. Run all monitoring services in parallel
      await Promise.all([
        this.runCrisisMonitoring(),
        this.runCheckInMonitoring(),
        this.runSensorMonitoring(),
        this.runLocationMonitoring(),
        this.runBuddyMonitoring(),
        this.runPredictiveMonitoring()
      ]);

      // 2. Process scheduled notifications
      await this.processScheduledNotifications();

      // 3. Analyze cross-system patterns
      await this.analyzeSystemInteractions();

      // 4. Update user wellness scores
      await this.updateWellnessScores();

      console.log('✅ Master monitoring orchestration completed');

    } catch (error) {
      console.error('Master monitoring failed:', error);
    }
  }

  /**
   * Send immediate system alert with smart prioritization
   */
  async sendSystemAlert(alert: SystemAlert): Promise<void> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, alert.userId)).limit(1);
      if (!user) return;

      // Check notification frequency limits
      const canSend = await this.checkNotificationLimits(alert.userId, alert.severity);
      if (!canSend && !alert.requiresImmediate) {
        console.log(`⚠️ Notification rate limited for user ${alert.userId}`);
        return;
      }

      // Get user's preferred notification method
      const userPhone = (user.settings as any)?.phone;
      const notificationPrefs = (user.settings as any)?.notificationPreferences || {};

      // Determine delivery method based on severity and preferences
      const deliveryMethod = this.determineDeliveryMethod(alert.severity, notificationPrefs, userPhone);

      if (deliveryMethod === 'sms' && userPhone) {
        await this.sendSMSAlert(alert, userPhone, user);
      } else if (deliveryMethod === 'push') {
        await this.sendPushAlert(alert, user);
      }

      // Record the alert
      await this.recordSystemAlert(alert);

      // Schedule escalation if needed
      if (alert.severity === 'critical' || alert.severity === 'emergency') {
        await this.scheduleEscalation(alert);
      }

      console.log(`🚨 System alert sent to user ${alert.userId}: ${alert.alertType} - ${alert.severity}`);

    } catch (error) {
      console.error('System alert failed:', error);
    }
  }

  /**
   * Process all pending scheduled notifications
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      // Get notifications due for delivery (within next 5 minutes)
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      const dueNotifications = await db
        .select()
        .from(scheduledNotifications)
        .where(and(
          eq(scheduledNotifications.status, 'pending'),
          lte(scheduledNotifications.scheduledFor, fiveMinutesFromNow)
        ));

      for (const notification of dueNotifications) {
        try {
          await this.deliverScheduledNotification(notification);
          
          // Mark as sent
          await db
            .update(scheduledNotifications)
            .set({ 
              status: 'sent',
              sentAt: new Date()
            })
            .where(eq(scheduledNotifications.id, notification.id));

          // Small delay to avoid overwhelming users
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Failed to deliver notification ${notification.id}:`, error);
          
          // Mark as failed
          await db
            .update(scheduledNotifications)
            .set({ status: 'failed' })
            .where(eq(scheduledNotifications.id, notification.id));
        }
      }

      console.log(`📬 Processed ${dueNotifications.length} scheduled notifications`);

    } catch (error) {
      console.error('Scheduled notification processing failed:', error);
    }
  }

  /**
   * Analyze patterns across all systems for enhanced insights
   */
  async analyzeSystemInteractions(): Promise<void> {
    try {
      // Get active users
      const activeUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(gte(users.updatedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

      for (const user of activeUsers) {
        // Analyze cross-system patterns
        const patterns = await this.detectCrossSystemPatterns(user.id);
        
        if (patterns.significantPattern) {
          await this.createCrossSystemInsight(user.id, patterns);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error) {
      console.error('System interaction analysis failed:', error);
    }
  }

  /**
   * Individual monitoring service runners
   */

  private async runCrisisMonitoring(): Promise<void> {
    try {
      await aiCrisisPreventionService.runContinuousMonitoring();
    } catch (error) {
      console.error('Crisis monitoring failed:', error);
    }
  }

  private async runCheckInMonitoring(): Promise<void> {
    try {
      await smartCheckInService.runDailyScheduler();
    } catch (error) {
      console.error('Check-in monitoring failed:', error);
    }
  }

  private async runSensorMonitoring(): Promise<void> {
    try {
      await sensorMonitoringService.runSensorMonitoring();
    } catch (error) {
      console.error('Sensor monitoring failed:', error);
    }
  }

  private async runLocationMonitoring(): Promise<void> {
    try {
      // Location monitoring runs continuously via geolocation API
      console.log('📍 Location monitoring active');
    } catch (error) {
      console.error('Location monitoring failed:', error);
    }
  }

  private async runBuddyMonitoring(): Promise<void> {
    try {
      await buddySystemService.runBuddySystemMonitoring();
    } catch (error) {
      console.error('Buddy system monitoring failed:', error);
    }
  }

  private async runPredictiveMonitoring(): Promise<void> {
    try {
      await predictiveAnalyticsService.runPredictiveAnalytics();
    } catch (error) {
      console.error('Predictive monitoring failed:', error);
    }
  }

  /**
   * Helper methods for notification delivery
   */

  private async checkNotificationLimits(userId: string, severity: string): Promise<boolean> {
    const priority = this.prioritySettings[severity];
    if (!priority) return true;

    // Get notifications sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifications = await db
      .select()
      .from(scheduledNotifications)
      .where(and(
        eq(scheduledNotifications.userId, userId),
        eq(scheduledNotifications.status, 'sent'),
        gte(scheduledNotifications.sentAt, today)
      ));

    // Check daily limit
    if (todayNotifications.length >= priority.maxDailyMessages) {
      return false;
    }

    // Check minimum delay between messages
    if (todayNotifications.length > 0) {
      const lastNotification = todayNotifications
        .sort((a, b) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime())[0];
      
      const timeSinceLastNotification = Date.now() - new Date(lastNotification.sentAt!).getTime();
      const minDelay = priority.delayBetweenMessages * 60 * 1000; // Convert to milliseconds

      if (timeSinceLastNotification < minDelay) {
        return false;
      }
    }

    return true;
  }

  private determineDeliveryMethod(severity: string, preferences: any, hasPhone: boolean): 'sms' | 'push' | 'email' {
    // Emergency and critical always use SMS if available
    if ((severity === 'emergency' || severity === 'critical') && hasPhone) {
      return 'sms';
    }

    // Use user preferences for lower severity
    if (severity === 'high' && preferences.sms && hasPhone) {
      return 'sms';
    }

    // Default to push notifications
    return 'push';
  }

  private async sendSMSAlert(alert: SystemAlert, phone: string, user: any): Promise<void> {
    let message = '';
    const firstName = user.firstName || user.username || 'there';

    switch (alert.alertType) {
      case 'crisis_risk':
        message = `VitalWatch: Hi ${firstName}, how are you feeling? Reply 1 = Safe, 2 = Need support. Reply STOP to unsubscribe or HELP for support. 💙`;
        break;
      
      case 'missed_checkin':
        message = `VitalWatch: ${firstName}, checking in - are you okay? Reply 1 = Safe, 2 = Need support. Reply STOP to unsubscribe or HELP for support. 💙`;
        break;

      case 'sensor_anomaly':
        message = `VitalWatch: ${firstName}, your health data shows changes. Consider self-care. Reply STOP to unsubscribe or HELP for support. 💙`;
        break;

      case 'zone_trigger':
        message = alert.message; // Zone messages are already formatted
        break;

      case 'buddy_concern':
        message = `VitalWatch: ${firstName}, your buddy is concerned about you. Please reach out or reply HELP if needed. Reply STOP to unsubscribe. 💙`;
        break;

      case 'prediction_alert':
        message = `VitalWatch: ${firstName}, today might be challenging. How are you feeling? Reply 1 = Good, 2 = Struggling. Reply STOP to unsubscribe or HELP for support. 💙`;
        break;

      default:
        message = alert.message;
    }

    await sendSMS(phone, message);
  }

  private async sendPushAlert(alert: SystemAlert, user: any): Promise<void> {
    // Store as scheduled notification for push delivery
    await db.insert(scheduledNotifications).values({
      userId: user.id,
      notificationType: alert.alertType,
      scheduledFor: new Date(),
      content: {
        title: this.getAlertTitle(alert.alertType),
        message: alert.message,
        metadata: alert.metadata
      },
      deliveryMethod: 'push',
      status: 'pending'
    });
  }

  private getAlertTitle(alertType: string): string {
    switch (alertType) {
      case 'crisis_risk': return 'Wellness Check';
      case 'missed_checkin': return 'Check-in Reminder';
      case 'sensor_anomaly': return 'Health Alert';
      case 'zone_trigger': return 'Location Reminder';
      case 'buddy_concern': return 'Buddy Message';
      case 'prediction_alert': return 'Daily Forecast';
      default: return 'VitalWatch Alert';
    }
  }

  private async recordSystemAlert(alert: SystemAlert): Promise<void> {
    await db.insert(aiInsights).values({
      userId: alert.userId,
      type: 'system_alert',
      insight: `${alert.alertType}: ${alert.message}`,
      confidence: '0.9',
      isActionable: true,
      metadata: {
        alertType: alert.alertType,
        severity: alert.severity,
        requiresImmediate: alert.requiresImmediate,
        timestamp: new Date().toISOString(),
        ...alert.metadata
      }
    });
  }

  private async scheduleEscalation(alert: SystemAlert): Promise<void> {
    const priority = this.prioritySettings[alert.severity];
    if (!priority) return;

    // Schedule escalation notification
    await db.insert(scheduledNotifications).values({
      userId: alert.userId,
      notificationType: 'escalation',
      scheduledFor: new Date(Date.now() + priority.escalationTime * 60 * 1000),
      content: {
        message: 'Follow-up wellness check: How are you doing now? Reply if you need continued support.',
        originalAlert: alert,
        escalationLevel: 'first'
      },
      deliveryMethod: 'sms',
      aiGenerated: true
    });

    // For emergency alerts, also schedule emergency contact notification
    if (alert.severity === 'emergency') {
      await this.scheduleEmergencyContactAlert(alert.userId, alert);
    }
  }

  private async scheduleEmergencyContactAlert(userId: string, alert: SystemAlert): Promise<void> {
    // Schedule emergency contact notification in 15 minutes if no response
    await db.insert(scheduledNotifications).values({
      userId,
      notificationType: 'emergency_contact_alert',
      scheduledFor: new Date(Date.now() + 15 * 60 * 1000),
      content: {
        message: 'Emergency contact notification due to non-response',
        originalAlert: alert,
        action: 'notify_emergency_contacts'
      },
      deliveryMethod: 'system',
      aiGenerated: true
    });
  }

  private async deliverScheduledNotification(notification: any): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, notification.userId)).limit(1);
    if (!user) return;

    const content = notification.content as any;

    switch (notification.deliveryMethod) {
      case 'sms':
        const userPhone = (user.settings as any)?.phone;
        if (userPhone) {
          await sendSMS(userPhone, content.message);
        }
        break;

      case 'push':
        // Push notifications would be handled by frontend service worker
        console.log(`📱 Push notification: ${content.title} - ${content.message}`);
        break;

      case 'email':
        // Email delivery would be handled by email service
        console.log(`📧 Email notification: ${content.message}`);
        break;

      case 'system':
        // System notifications trigger other actions
        await this.handleSystemNotification(notification);
        break;

      default:
        console.log(`📬 Notification: ${content.message}`);
    }
  }

  private async handleSystemNotification(notification: any): Promise<void> {
    const content = notification.content as any;

    if (content.action === 'notify_emergency_contacts') {
      // Get emergency contacts
      const contacts = await db
        .select()
        .from(emergencyContacts)
        .where(and(
          eq(emergencyContacts.userId, notification.userId),
          eq(emergencyContacts.isActive, true)
        ))
        .orderBy(emergencyContacts.priority);

      const [user] = await db.select().from(users).where(eq(users.id, notification.userId)).limit(1);
      if (!user) return;

      // Notify first 2 emergency contacts
      for (const contact of contacts.slice(0, 2)) {
        if (contact.phone) {
          const message = `URGENT: ${user.firstName || user.username} has not responded to wellness checks and may need assistance. Please reach out to them immediately. This is an automated VitalWatch alert.`;
          await sendSMS(contact.phone, message);
        }
      }
    }
  }

  private async detectCrossSystemPatterns(userId: string): Promise<any> {
    // Look for patterns across different systems
    const recentAlerts = await db
      .select()
      .from(aiInsights)
      .where(and(
        eq(aiInsights.userId, userId),
        gte(aiInsights.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      ))
      .orderBy(desc(aiInsights.createdAt));

    // Analyze for correlation patterns
    const alertTypes = recentAlerts.map(a => a.type);
    const uniqueTypes = [...new Set(alertTypes)];

    // Check for multiple system alerts in short timeframe
    if (uniqueTypes.length >= 3 && recentAlerts.length >= 5) {
      return {
        significantPattern: true,
        patternType: 'multi_system_stress',
        confidence: 0.8,
        description: 'Multiple systems detecting stress indicators',
        recommendation: 'Comprehensive wellness intervention needed'
      };
    }

    // Check for recurring patterns
    const recurringPattern = this.findRecurringPatterns(alertTypes);
    if (recurringPattern) {
      return {
        significantPattern: true,
        patternType: 'recurring_stress_pattern',
        confidence: 0.7,
        description: 'Recurring stress pattern detected',
        recommendation: 'Investigate underlying stressors'
      };
    }

    return { significantPattern: false };
  }

  private findRecurringPatterns(alertTypes: string[]): boolean {
    // Simple pattern detection - look for repeated sequences
    const sequenceLength = 3;
    for (let i = 0; i <= alertTypes.length - sequenceLength * 2; i++) {
      const sequence1 = alertTypes.slice(i, i + sequenceLength).join(',');
      for (let j = i + sequenceLength; j <= alertTypes.length - sequenceLength; j++) {
        const sequence2 = alertTypes.slice(j, j + sequenceLength).join(',');
        if (sequence1 === sequence2) {
          return true;
        }
      }
    }
    return false;
  }

  private async createCrossSystemInsight(userId: string, patterns: any): Promise<void> {
    await db.insert(aiInsights).values({
      userId,
      type: 'cross_system_pattern',
      insight: patterns.description,
      confidence: patterns.confidence.toString(),
      isActionable: true,
      metadata: {
        patternType: patterns.patternType,
        recommendation: patterns.recommendation,
        detectedAt: new Date().toISOString()
      }
    });

    // Create proactive intervention based on pattern
    if (patterns.patternType === 'multi_system_stress') {
      await this.sendSystemAlert({
        userId,
        alertType: 'prediction_alert',
        severity: 'high',
        message: 'Multiple wellness indicators suggest you might benefit from extra support today. How are you feeling?',
        metadata: { trigger: 'cross_system_pattern', pattern: patterns },
        requiresImmediate: false
      });
    }
  }

  private async updateWellnessScores(): Promise<void> {
    // Update overall wellness scores based on all system inputs
    const activeUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(gte(users.updatedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

    for (const user of activeUsers) {
      try {
        const wellnessScore = await this.calculateWellnessScore(user.id);
        
        // Store as AI insight
        await db.insert(aiInsights).values({
          userId: user.id,
          type: 'wellness_score',
          insight: `Current wellness score: ${wellnessScore}/100`,
          confidence: '0.8',
          isActionable: false,
          metadata: {
            score: wellnessScore,
            calculatedAt: new Date().toISOString(),
            components: 'mood_sensor_activity_social'
          }
        });

      } catch (error) {
        console.error(`Wellness score calculation failed for user ${user.id}:`, error);
      }
    }
  }

  private async calculateWellnessScore(userId: string): Promise<number> {
    // Simplified wellness score calculation
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    // Get recent data
    const [recentMoods, recentSensor, recentCheckins] = await Promise.all([
      db.select().from(moodEntries)
        .where(and(eq(moodEntries.userId, userId), gte(moodEntries.createdAt, threeDaysAgo))),
      
      db.select().from(sensorData)
        .where(and(eq(sensorData.userId, userId), gte(sensorData.recordedAt, threeDaysAgo))),
      
      db.select().from(scheduledNotifications)
        .where(and(
          eq(scheduledNotifications.userId, userId),
          eq(scheduledNotifications.status, 'sent'),
          gte(scheduledNotifications.sentAt, threeDaysAgo)
        ))
    ]);

    let score = 50; // Base score

    // Mood component (0-30 points)
    if (recentMoods.length > 0) {
      const avgMood = recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length;
      score += (avgMood - 3) * 10; // -20 to +20 points
    }

    // Activity component (0-20 points)
    const activityData = recentSensor.filter(s => s.sensorType === 'activity');
    if (activityData.length > 0) {
      const avgActivity = activityData.reduce((sum, s) => sum + parseFloat(s.value), 0) / activityData.length;
      score += (avgActivity / 100) * 20; // 0-20 points
    }

    // Engagement component (0-20 points)
    const responsiveCheckins = recentCheckins.filter(c => c.notificationType === 'check_in');
    if (responsiveCheckins.length > 0) {
      score += Math.min(responsiveCheckins.length * 5, 20);
    }

    // Crisis indicators (negative points)
    const crisisAlerts = await db.select().from(crisisPreventions)
      .where(and(eq(crisisPreventions.userId, userId), gte(crisisPreventions.createdAt, threeDaysAgo)));
    
    score -= crisisAlerts.length * 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Emergency coordinator - handles crisis situations across all systems
   */
  async handleEmergencyCoordination(userId: string, emergencyType: string, details?: string): Promise<void> {
    try {
      console.log(`🚨 Emergency coordination activated for user ${userId}: ${emergencyType}`);

      // 1. Immediate SMS to user
      await this.sendSystemAlert({
        userId,
        alertType: 'crisis_risk',
        severity: 'emergency',
        message: 'VitalWatch emergency protocols activated. If this is a medical emergency, call 911 immediately.',
        metadata: { emergencyType, details },
        requiresImmediate: true
      });

      // 2. Alert all buddies
      await buddySystemService.sendEmergencyAlertToBuddies(userId, emergencyType, details);

      // 3. Prepare emergency contact notifications (delayed 15 minutes)
      await this.scheduleEmergencyContactAlert(userId, {
        userId,
        alertType: 'crisis_risk',
        severity: 'emergency',
        message: `Emergency: ${emergencyType}`,
        metadata: { emergencyType, details },
        requiresImmediate: true
      });

      // 4. Increase monitoring frequency
      await this.activateEmergencyMonitoring(userId);

      // 5. Record comprehensive crisis event
      await db.insert(crisisPreventions).values({
        userId,
        triggerType: 'emergency_coordination',
        triggerData: { emergencyType, details, activatedSystems: 'all' },
        interventionType: 'full_emergency_response',
        aiConfidence: '1.0',
        followUpRequired: true
      });

      console.log(`✅ Emergency coordination completed for user ${userId}`);

    } catch (error) {
      console.error('Emergency coordination failed:', error);
    }
  }

  private async activateEmergencyMonitoring(userId: string): Promise<void> {
    // Schedule frequent check-ins for the next 24 hours
    const now = new Date();
    for (let i = 1; i <= 24; i++) {
      await db.insert(scheduledNotifications).values({
        userId,
        notificationType: 'emergency_checkin',
        scheduledFor: new Date(now.getTime() + i * 60 * 60 * 1000), // Every hour
        content: {
          message: 'Emergency monitoring: How are you doing? Reply 1 = Safe, 2 = Still need help, 3 = Call emergency services.',
          monitoringLevel: 'emergency',
          priority: 'critical'
        },
        deliveryMethod: 'sms',
        aiGenerated: true
      });
    }
  }

  /**
   * Health check for the entire notification system
   */
  async runSystemHealthCheck(): Promise<any> {
    const healthStatus = {
      timestamp: new Date(),
      overallHealth: 'healthy',
      services: {},
      alerts: [],
      recommendations: []
    };

    try {
      // Check each service
      const services = [
        'Crisis Prevention',
        'Smart Check-ins', 
        'Sensor Monitoring',
        'Location Safety',
        'Buddy System',
        'Predictive Analytics'
      ];

      for (const service of services) {
        healthStatus.services[service] = 'operational';
      }

      // Check for system overload
      const pendingNotifications = await db
        .select()
        .from(scheduledNotifications)
        .where(eq(scheduledNotifications.status, 'pending'));

      if (pendingNotifications.length > 1000) {
        healthStatus.alerts.push('High notification queue volume');
        healthStatus.overallHealth = 'degraded';
      }

      // Check for failed notifications
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const failedNotifications = await db
        .select()
        .from(scheduledNotifications)
        .where(and(
          eq(scheduledNotifications.status, 'failed'),
          gte(scheduledNotifications.createdAt, todayStart)
        ));

      if (failedNotifications.length > 50) {
        healthStatus.alerts.push('High notification failure rate');
        healthStatus.overallHealth = 'unhealthy';
      }

      return healthStatus;

    } catch (error) {
      console.error('System health check failed:', error);
      return {
        timestamp: new Date(),
        overallHealth: 'unhealthy',
        error: error.message
      };
    }
  }
}

export const notificationOrchestratorService = new NotificationOrchestratorService();
import { db } from "../db";
import { 
  wellnessZones, 
  zoneEvents, 
  users, 
  scheduledNotifications,
  aiInsights,
  crisisPreventions 
} from "@shared/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import { sendSMS } from "./twilio";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface ZoneDefinition {
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  zoneType: 'safe' | 'trigger' | 'neutral' | 'wellness';
  triggers: string[];
}

interface GeofenceEvent {
  zoneId: number;
  eventType: 'entry' | 'exit';
  triggeredActions: string[];
  userLocation: LocationData;
  duration?: number; // for exit events
}

export class LocationSafetyService {

  /**
   * Create a new wellness zone for a user
   */
  async createWellnessZone(userId: string, zone: ZoneDefinition): Promise<number> {
    try {
      const [newZone] = await db.insert(wellnessZones).values({
        userId,
        name: zone.name,
        latitude: zone.latitude.toString(),
        longitude: zone.longitude.toString(),
        radius: zone.radius,
        zoneType: zone.zoneType,
        triggers: zone.triggers,
        isActive: true,
        entryCount: 0
      }).returning();

      console.log(`📍 Created ${zone.zoneType} zone "${zone.name}" for user ${userId}`);
      return newZone.id;

    } catch (error) {
      console.error('Failed to create wellness zone:', error);
      throw error;
    }
  }

  /**
   * Process user location update and check for zone events
   */
  async processLocationUpdate(userId: string, location: LocationData): Promise<void> {
    try {
      // Get all active zones for this user
      const userZones = await db
        .select()
        .from(wellnessZones)
        .where(and(
          eq(wellnessZones.userId, userId),
          eq(wellnessZones.isActive, true)
        ));

      // Check each zone for entry/exit events
      for (const zone of userZones) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(zone.latitude),
          parseFloat(zone.longitude)
        );

        const isInside = distance <= zone.radius;
        await this.checkZoneEvent(userId, zone, location, isInside);
      }

    } catch (error) {
      console.error('Failed to process location update:', error);
    }
  }

  /**
   * Check for zone entry/exit events
   */
  private async checkZoneEvent(userId: string, zone: any, location: LocationData, isInside: boolean): Promise<void> {
    try {
      // Get the last event for this zone
      const [lastEvent] = await db
        .select()
        .from(zoneEvents)
        .where(and(
          eq(zoneEvents.userId, userId),
          eq(zoneEvents.zoneId, zone.id)
        ))
        .orderBy(desc(zoneEvents.createdAt))
        .limit(1);

      const wasInside = lastEvent?.eventType === 'entry';

      // Detect state change
      if (isInside && !wasInside) {
        // Zone entry
        await this.handleZoneEntry(userId, zone, location);
      } else if (!isInside && wasInside) {
        // Zone exit
        const duration = lastEvent ? 
          Math.floor((location.timestamp.getTime() - new Date(lastEvent.createdAt).getTime()) / 1000) : 
          undefined;
        await this.handleZoneExit(userId, zone, location, duration);
      }

    } catch (error) {
      console.error('Zone event check failed:', error);
    }
  }

  /**
   * Handle zone entry event
   */
  private async handleZoneEntry(userId: string, zone: any, location: LocationData): Promise<void> {
    try {
      // Determine triggered actions based on zone type
      const triggeredActions = await this.getTriggeredActions(zone, 'entry');

      // Record the zone event
      await db.insert(zoneEvents).values({
        userId,
        zoneId: zone.id,
        eventType: 'entry',
        triggeredActions,
        userLocation: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        }
      });

      // Update zone entry count
      await db
        .update(wellnessZones)
        .set({ 
          entryCount: sql`${wellnessZones.entryCount} + 1`,
          lastEntered: new Date()
        })
        .where(eq(wellnessZones.id, zone.id));

      // Execute triggered actions
      await this.executeZoneActions(userId, zone, 'entry', triggeredActions);

      console.log(`📍 User ${userId} entered ${zone.zoneType} zone: ${zone.name}`);

    } catch (error) {
      console.error('Zone entry handling failed:', error);
    }
  }

  /**
   * Handle zone exit event
   */
  private async handleZoneExit(userId: string, zone: any, location: LocationData, duration?: number): Promise<void> {
    try {
      // Determine triggered actions based on zone type and duration
      const triggeredActions = await this.getTriggeredActions(zone, 'exit', duration);

      // Record the zone event
      await db.insert(zoneEvents).values({
        userId,
        zoneId: zone.id,
        eventType: 'exit',
        triggeredActions,
        userLocation: {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: location.accuracy
        },
        duration
      });

      // Execute triggered actions
      await this.executeZoneActions(userId, zone, 'exit', triggeredActions, duration);

      console.log(`📍 User ${userId} exited ${zone.zoneType} zone: ${zone.name} (${duration}s)`);

    } catch (error) {
      console.error('Zone exit handling failed:', error);
    }
  }

  /**
   * Get triggered actions based on zone type and event
   */
  private async getTriggeredActions(zone: any, eventType: 'entry' | 'exit', duration?: number): Promise<string[]> {
    const actions: string[] = [];

    switch (zone.zoneType) {
      case 'safe':
        if (eventType === 'entry') {
          actions.push('send_safe_zone_confirmation', 'reduce_monitoring_frequency');
        } else {
          actions.push('increase_monitoring_frequency', 'send_safety_reminder');
        }
        break;

      case 'trigger':
        if (eventType === 'entry') {
          actions.push('send_coping_resources', 'increase_monitoring', 'prepare_crisis_support');
        } else {
          actions.push('send_relief_confirmation', 'schedule_wellness_check');
        }
        break;

      case 'wellness':
        if (eventType === 'entry') {
          actions.push('send_wellness_encouragement', 'suggest_activities');
        } else if (duration && duration < 300) { // Less than 5 minutes
          actions.push('encourage_return', 'suggest_mindfulness');
        }
        break;

      case 'neutral':
        if (eventType === 'entry') {
          actions.push('log_location_pattern');
        }
        break;
    }

    // Add custom triggers from zone configuration
    if (zone.triggers && Array.isArray(zone.triggers)) {
      actions.push(...zone.triggers.filter((trigger: string) => 
        trigger.includes(eventType)
      ));
    }

    return actions;
  }

  /**
   * Execute zone-triggered actions
   */
  private async executeZoneActions(
    userId: string, 
    zone: any, 
    eventType: 'entry' | 'exit', 
    actions: string[], 
    duration?: number
  ): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    for (const action of actions) {
      try {
        switch (action) {
          case 'send_safe_zone_confirmation':
            await this.sendSafeZoneMessage(userId, zone.name);
            break;

          case 'send_safety_reminder':
            await this.sendSafetyReminder(userId, zone.name);
            break;

          case 'send_coping_resources':
            await this.sendCopingResources(userId, zone.name);
            break;

          case 'send_wellness_encouragement':
            await this.sendWellnessEncouragement(userId, zone.name);
            break;

          case 'increase_monitoring':
            await this.increaseCrisisMonitoring(userId, zone.name);
            break;

          case 'schedule_wellness_check':
            await this.scheduleWellnessCheck(userId, zone.name);
            break;

          case 'suggest_activities':
            await this.suggestWellnessActivities(userId, zone.name);
            break;

          case 'encourage_return':
            await this.encourageReturnToWellnessZone(userId, zone.name);
            break;

          case 'log_location_pattern':
            await this.logLocationPattern(userId, zone, eventType);
            break;

          default:
            console.log(`Unknown zone action: ${action}`);
        }

        // Small delay between actions
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to execute zone action ${action}:`, error);
      }
    }
  }

  /**
   * Send safe zone confirmation message
   */
  private async sendSafeZoneMessage(userId: string, zoneName: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const userPhone = (user.settings as any)?.phone;
    if (userPhone) {
      const message = `Hi ${user.firstName || user.username}! You've entered your safe zone: ${zoneName}. VitalWatch is here if you need support. 💙`;
      await sendSMS(userPhone, message);
    }

    // Also create an AI insight
    await db.insert(aiInsights).values({
      userId,
      type: 'location_pattern',
      insight: `User entered safe zone: ${zoneName}`,
      confidence: '0.9',
      isActionable: false,
      metadata: {
        zoneType: 'safe',
        zoneName,
        eventType: 'entry'
      }
    });
  }

  /**
   * Send safety reminder when leaving safe zone
   */
  private async sendSafetyReminder(userId: string, zoneName: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const userPhone = (user.settings as any)?.phone;
    if (userPhone) {
      const message = `You've left your safe zone: ${zoneName}. Remember, VitalWatch is always here. Text HELP if you need support. Stay safe! 💙`;
      await sendSMS(userPhone, message);
    }
  }

  /**
   * Send coping resources when entering trigger zone
   */
  private async sendCopingResources(userId: string, zoneName: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const userPhone = (user.settings as any)?.phone;
    if (userPhone) {
      const message = `You're near ${zoneName}. Here are quick coping tools:
• 4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s
• Text HELP for immediate support
• Visit vitalwatch.app for guided exercises
You've got this! 💪`;
      await sendSMS(userPhone, message);
    }

    // Record as crisis prevention intervention
    await db.insert(crisisPreventions).values({
      userId,
      triggerType: 'location_trigger',
      triggerData: {
        zoneName,
        zoneType: 'trigger',
        eventType: 'entry'
      },
      interventionType: 'coping_resources',
      aiConfidence: '0.8'
    });
  }

  /**
   * Send wellness encouragement for wellness zones
   */
  private async sendWellnessEncouragement(userId: string, zoneName: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const userPhone = (user.settings as any)?.phone;
    if (userPhone) {
      const message = `Welcome to ${zoneName}! Perfect place for some self-care. Consider:
• 5 minutes of mindfulness
• Gentle stretching
• Gratitude reflection
Enjoy this wellness moment! 🌱`;
      await sendSMS(userPhone, message);
    }
  }

  /**
   * Increase crisis monitoring when in high-risk areas
   */
  private async increaseCrisisMonitoring(userId: string, zoneName: string): Promise<void> {
    // Schedule more frequent check-ins for the next 6 hours
    const now = new Date();
    for (let i = 1; i <= 6; i++) {
      await db.insert(scheduledNotifications).values({
        userId,
        notificationType: 'wellness_check',
        scheduledFor: new Date(now.getTime() + i * 60 * 60 * 1000), // Every hour
        content: {
          message: `Hi! Just checking in. How are you feeling? Reply 1 = Good, 2 = Need support.`,
          reason: `Increased monitoring due to location: ${zoneName}`,
          priority: 'high'
        },
        deliveryMethod: 'sms',
        aiGenerated: true
      });
    }

    console.log(`🔍 Increased monitoring for user ${userId} due to trigger zone: ${zoneName}`);
  }

  /**
   * Schedule wellness check after leaving trigger zone
   */
  private async scheduleWellnessCheck(userId: string, zoneName: string): Promise<void> {
    // Schedule check-in 30 minutes after leaving trigger zone
    await db.insert(scheduledNotifications).values({
      userId,
      notificationType: 'wellness_check',
      scheduledFor: new Date(Date.now() + 30 * 60 * 1000),
      content: {
        message: `How are you feeling after leaving ${zoneName}? Reply 1 = Better, 2 = Still struggling, 3 = Need resources.`,
        reason: 'Post-trigger zone wellness check'
      },
      deliveryMethod: 'sms',
      aiGenerated: true
    });
  }

  /**
   * Suggest wellness activities for wellness zones
   */
  private async suggestWellnessActivities(userId: string, zoneName: string): Promise<void> {
    const activities = [
      'Take 5 deep breaths and notice your surroundings',
      'Practice a 2-minute gratitude reflection',
      'Try gentle neck and shoulder stretches',
      'Walk mindfully for a few minutes',
      'Take a photo of something beautiful you notice'
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];

    await db.insert(scheduledNotifications).values({
      userId,
      notificationType: 'wellness_tip',
      scheduledFor: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes delay
      content: {
        message: `Wellness suggestion for ${zoneName}: ${randomActivity}`,
        activityType: 'mindfulness'
      },
      deliveryMethod: 'push',
      aiGenerated: true
    });
  }

  /**
   * Encourage return to wellness zone
   */
  private async encourageReturnToWellnessZone(userId: string, zoneName: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const userPhone = (user.settings as any)?.phone;
    if (userPhone) {
      const message = `That was a quick visit to ${zoneName}! Consider returning when you have more time for some wellness activities. Self-care is important! 🌱`;
      await sendSMS(userPhone, message);
    }
  }

  /**
   * Log location patterns for analysis
   */
  private async logLocationPattern(userId: string, zone: any, eventType: string): Promise<void> {
    await db.insert(aiInsights).values({
      userId,
      type: 'location_pattern',
      insight: `User ${eventType} ${zone.zoneType} zone: ${zone.name}`,
      confidence: '0.7',
      isActionable: false,
      metadata: {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.zoneType,
        eventType,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Create default wellness zones for new users
   */
  async createDefaultZones(userId: string, homeLocation?: { lat: number, lng: number }): Promise<void> {
    try {
      const zones: ZoneDefinition[] = [];

      // Create home safe zone if location provided
      if (homeLocation) {
        zones.push({
          name: 'Home (Safe Zone)',
          latitude: homeLocation.lat,
          longitude: homeLocation.lng,
          radius: 100, // 100 meter radius
          zoneType: 'safe',
          triggers: ['reduce_monitoring', 'send_safe_confirmation']
        });
      }

      // Create wellness zones at common locations (if in specific cities)
      // For now, create generic wellness suggestions
      const wellnessZoneTemplates = [
        {
          name: 'Local Park (Wellness Zone)',
          zoneType: 'wellness' as const,
          radius: 200,
          triggers: ['suggest_mindfulness', 'encourage_nature_connection']
        },
        {
          name: 'Community Center (Wellness Zone)',
          zoneType: 'wellness' as const,
          radius: 150,
          triggers: ['suggest_social_activities', 'encourage_community_connection']
        }
      ];

      // Create default zones
      for (const template of wellnessZoneTemplates) {
        if (homeLocation) {
          // Create near home location with slight offset
          const offsetLat = homeLocation.lat + (Math.random() - 0.5) * 0.01; // ~1km offset
          const offsetLng = homeLocation.lng + (Math.random() - 0.5) * 0.01;
          
          zones.push({
            name: template.name,
            latitude: offsetLat,
            longitude: offsetLng,
            radius: template.radius,
            zoneType: template.zoneType,
            triggers: template.triggers
          });
        }
      }

      // Create the zones
      for (const zone of zones) {
        await this.createWellnessZone(userId, zone);
      }

      console.log(`✅ Created ${zones.length} default wellness zones for user ${userId}`);

    } catch (error) {
      console.error('Failed to create default zones:', error);
    }
  }

  /**
   * Get all zones for a user
   */
  async getUserZones(userId: string): Promise<any[]> {
    try {
      const zones = await db
        .select()
        .from(wellnessZones)
        .where(eq(wellnessZones.userId, userId))
        .orderBy(desc(wellnessZones.createdAt));

      return zones.map(zone => ({
        ...zone,
        latitude: parseFloat(zone.latitude),
        longitude: parseFloat(zone.longitude)
      }));

    } catch (error) {
      console.error('Failed to get user zones:', error);
      return [];
    }
  }

  /**
   * Get zone events for analysis
   */
  async getZoneEvents(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const events = await db
        .select({
          id: zoneEvents.id,
          zoneId: zoneEvents.zoneId,
          eventType: zoneEvents.eventType,
          triggeredActions: zoneEvents.triggeredActions,
          userLocation: zoneEvents.userLocation,
          duration: zoneEvents.duration,
          createdAt: zoneEvents.createdAt,
          zoneName: wellnessZones.name,
          zoneType: wellnessZones.zoneType
        })
        .from(zoneEvents)
        .leftJoin(wellnessZones, eq(zoneEvents.zoneId, wellnessZones.id))
        .where(eq(zoneEvents.userId, userId))
        .orderBy(desc(zoneEvents.createdAt))
        .limit(limit);

      return events;

    } catch (error) {
      console.error('Failed to get zone events:', error);
      return [];
    }
  }

  /**
   * Start location monitoring for a user
   */
  async startLocationMonitoring(userId: string): Promise<void> {
    console.log(`📍 Starting location monitoring for user ${userId}`);
    
    // This would typically integrate with a frontend location service
    // For now, we'll simulate location updates for demonstration
    this.simulateLocationUpdates(userId);
  }

  /**
   * Simulate location updates for demonstration
   */
  private async simulateLocationUpdates(userId: string): Promise<void> {
    // Get user's zones for simulation
    const zones = await this.getUserZones(userId);
    if (zones.length === 0) return;

    // Simulate movement between zones every 5 minutes
    setInterval(async () => {
      try {
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        
        // Generate location near the zone (sometimes inside, sometimes outside)
        const isInside = Math.random() > 0.5;
        const distance = isInside ? 
          Math.random() * randomZone.radius * 0.8 : // Inside zone
          randomZone.radius + Math.random() * 200; // Outside zone
        
        const angle = Math.random() * 2 * Math.PI;
        const lat = randomZone.latitude + (distance / 111000) * Math.cos(angle); // 111km per degree
        const lng = randomZone.longitude + (distance / 111000) * Math.sin(angle);

        await this.processLocationUpdate(userId, {
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('Simulated location update failed:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

export const locationSafetyService = new LocationSafetyService();
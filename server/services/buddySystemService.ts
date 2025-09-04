import { db } from "../db";
import { 
  buddyConnections, 
  buddyCheckIns, 
  users, 
  scheduledNotifications,
  emergencyContacts,
  aiInsights,
  crisisPreventions
} from "@shared/schema";
import { eq, desc, gte, and, or, ne } from "drizzle-orm";
import { sendSMS } from "./twilio";

interface BuddyRequest {
  fromUserId: string;
  toUserId: string;
  connectionType: 'mutual_support' | 'crisis_buddy' | 'accountability';
  message?: string;
}

interface BuddyCheckInRequest {
  fromUserId: string;
  toUserId: string;
  message: string;
  urgencyLevel: 'normal' | 'high' | 'emergency';
}

interface BuddyMatch {
  userId: string;
  score: number;
  sharedInterests: string[];
  complementaryStrengths: string[];
  geographicCompatibility: boolean;
}

export class BuddySystemService {

  /**
   * Send buddy connection request
   */
  async sendBuddyRequest(request: BuddyRequest): Promise<void> {
    try {
      // Check if connection already exists
      const existingConnection = await db
        .select()
        .from(buddyConnections)
        .where(or(
          and(
            eq(buddyConnections.userId, request.fromUserId),
            eq(buddyConnections.buddyUserId, request.toUserId)
          ),
          and(
            eq(buddyConnections.userId, request.toUserId),
            eq(buddyConnections.buddyUserId, request.fromUserId)
          )
        ))
        .limit(1);

      if (existingConnection.length > 0) {
        throw new Error('Buddy connection already exists');
      }

      // Create pending connection
      await db.insert(buddyConnections).values({
        userId: request.fromUserId,
        buddyUserId: request.toUserId,
        status: 'pending',
        connectionType: request.connectionType,
        mutualConsent: false,
        settings: {
          notificationPreferences: {
            dailyCheckIns: true,
            emergencyAlerts: true,
            wellnessUpdates: true
          },
          privacyLevel: 'standard',
          sharedData: ['mood_trends', 'wellness_goals']
        }
      });

      // Send notification to the recipient
      await this.sendBuddyRequestNotification(request);

      console.log(`🤝 Buddy request sent from ${request.fromUserId} to ${request.toUserId}`);

    } catch (error) {
      console.error('Failed to send buddy request:', error);
      throw error;
    }
  }

  /**
   * Accept buddy connection request
   */
  async acceptBuddyRequest(userId: string, requesterId: string): Promise<void> {
    try {
      // Update connection status
      await db
        .update(buddyConnections)
        .set({
          status: 'active',
          mutualConsent: true,
          lastInteraction: new Date()
        })
        .where(and(
          eq(buddyConnections.userId, requesterId),
          eq(buddyConnections.buddyUserId, userId),
          eq(buddyConnections.status, 'pending')
        ));

      // Send confirmation notifications
      await this.sendBuddyAcceptanceNotifications(userId, requesterId);

      // Schedule initial buddy check-in
      await this.scheduleInitialBuddyCheckIn(userId, requesterId);

      console.log(`✅ Buddy connection accepted between ${userId} and ${requesterId}`);

    } catch (error) {
      console.error('Failed to accept buddy request:', error);
      throw error;
    }
  }

  /**
   * Send buddy check-in
   */
  async sendBuddyCheckIn(checkInRequest: BuddyCheckInRequest): Promise<void> {
    try {
      // Verify buddy connection exists and is active
      const connection = await this.verifyBuddyConnection(checkInRequest.fromUserId, checkInRequest.toUserId);
      if (!connection) {
        throw new Error('No active buddy connection found');
      }

      // Create check-in record
      const [checkIn] = await db.insert(buddyCheckIns).values({
        connectionId: connection.id,
        initiatorUserId: checkInRequest.fromUserId,
        receiverUserId: checkInRequest.toUserId,
        message: checkInRequest.message,
        urgencyLevel: checkInRequest.urgencyLevel,
        responseReceived: false
      }).returning();

      // Update connection last interaction
      await db
        .update(buddyConnections)
        .set({ lastInteraction: new Date() })
        .where(eq(buddyConnections.id, connection.id));

      // Send notification to buddy
      await this.sendBuddyCheckInNotification(checkInRequest, checkIn.id);

      // Schedule reminder if no response in 4 hours
      if (checkInRequest.urgencyLevel !== 'emergency') {
        await db.insert(scheduledNotifications).values({
          userId: checkInRequest.toUserId,
          notificationType: 'buddy_reminder',
          scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
          content: {
            message: 'Your buddy is checking in on you. Please respond when you can.',
            checkInId: checkIn.id,
            buddyName: await this.getBuddyName(checkInRequest.fromUserId)
          },
          deliveryMethod: 'sms',
          aiGenerated: false
        });
      }

      console.log(`💬 Buddy check-in sent from ${checkInRequest.fromUserId} to ${checkInRequest.toUserId}`);

    } catch (error) {
      console.error('Failed to send buddy check-in:', error);
      throw error;
    }
  }

  /**
   * Respond to buddy check-in
   */
  async respondToBuddyCheckIn(checkInId: number, response: string): Promise<void> {
    try {
      // Update check-in with response
      await db
        .update(buddyCheckIns)
        .set({
          responseReceived: true,
          responseMessage: response,
          responseTime: new Date()
        })
        .where(eq(buddyCheckIns.id, checkInId));

      // Get check-in details for notification
      const [checkIn] = await db
        .select()
        .from(buddyCheckIns)
        .where(eq(buddyCheckIns.id, checkInId))
        .limit(1);

      if (checkIn) {
        // Notify the initiator
        await this.sendBuddyResponseNotification(checkIn, response);

        // Analyze response for concerning content
        await this.analyzeBuddyResponse(checkIn, response);
      }

      console.log(`✅ Buddy check-in response received for check-in ${checkInId}`);

    } catch (error) {
      console.error('Failed to respond to buddy check-in:', error);
      throw error;
    }
  }

  /**
   * Find potential buddy matches for a user
   */
  async findBuddyMatches(userId: string): Promise<BuddyMatch[]> {
    try {
      // Get user profile and preferences
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return [];

      // Get all other users (excluding existing buddies)
      const existingBuddyIds = await this.getExistingBuddyIds(userId);
      
      const potentialBuddies = await db
        .select()
        .from(users)
        .where(and(
          ne(users.id, userId),
          ...(existingBuddyIds.length > 0 ? 
            existingBuddyIds.map(id => ne(users.id, id)) : []
          )
        ));

      // Calculate compatibility scores
      const matches: BuddyMatch[] = [];
      for (const buddy of potentialBuddies) {
        const score = await this.calculateCompatibilityScore(user, buddy);
        if (score > 0.5) { // Only show good matches
          matches.push({
            userId: buddy.id,
            score,
            sharedInterests: await this.getSharedInterests(user, buddy),
            complementaryStrengths: await this.getComplementaryStrengths(user, buddy),
            geographicCompatibility: await this.checkGeographicCompatibility(user, buddy)
          });
        }
      }

      // Sort by compatibility score
      matches.sort((a, b) => b.score - a.score);
      
      return matches.slice(0, 10); // Return top 10 matches

    } catch (error) {
      console.error('Failed to find buddy matches:', error);
      return [];
    }
  }

  /**
   * Get user's active buddy connections
   */
  async getUserBuddies(userId: string): Promise<any[]> {
    try {
      const connections = await db
        .select({
          connectionId: buddyConnections.id,
          buddyUserId: buddyConnections.buddyUserId,
          otherUserId: buddyConnections.userId,
          status: buddyConnections.status,
          connectionType: buddyConnections.connectionType,
          lastInteraction: buddyConnections.lastInteraction,
          settings: buddyConnections.settings,
          createdAt: buddyConnections.createdAt
        })
        .from(buddyConnections)
        .where(and(
          or(
            eq(buddyConnections.userId, userId),
            eq(buddyConnections.buddyUserId, userId)
          ),
          eq(buddyConnections.status, 'active')
        ))
        .orderBy(desc(buddyConnections.lastInteraction));

      // Get buddy user details
      const buddies = [];
      for (const connection of connections) {
        const buddyId = connection.buddyUserId === userId ? connection.otherUserId : connection.buddyUserId;
        const [buddy] = await db.select().from(users).where(eq(users.id, buddyId)).limit(1);
        
        if (buddy) {
          buddies.push({
            ...connection,
            buddy: {
              id: buddy.id,
              username: buddy.username,
              firstName: buddy.firstName,
              lastName: buddy.lastName,
              profileImage: buddy.profileImage
            },
            recentCheckIns: await this.getRecentBuddyCheckIns(connection.connectionId, 5)
          });
        }
      }

      return buddies;

    } catch (error) {
      console.error('Failed to get user buddies:', error);
      return [];
    }
  }

  /**
   * Send emergency alert to all active buddies
   */
  async sendEmergencyAlertToBuddies(userId: string, emergencyType: string, details?: string): Promise<void> {
    try {
      const buddies = await this.getUserBuddies(userId);
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user) return;

      for (const buddy of buddies) {
        // Check if emergency alerts are enabled for this buddy
        const settings = buddy.settings as any;
        if (settings?.notificationPreferences?.emergencyAlerts !== false) {
          
          // Send SMS alert
          const buddyPhone = (buddy.buddy.settings as any)?.phone;
          if (buddyPhone) {
            const alertMessage = `🚨 BUDDY ALERT: ${user.firstName || user.username} needs support (${emergencyType}). ${details || ''} Please reach out immediately or call emergency services if needed.`;
            await sendSMS(buddyPhone, alertMessage);
          }

          // Create urgent buddy check-in
          await db.insert(buddyCheckIns).values({
            connectionId: buddy.connectionId,
            initiatorUserId: userId,
            receiverUserId: buddy.buddy.id,
            message: `Emergency alert: ${emergencyType}. ${details || 'Please check on me.'}`,
            urgencyLevel: 'emergency',
            responseReceived: false
          });

          // Record as crisis prevention intervention
          await db.insert(crisisPreventions).values({
            userId,
            triggerType: 'emergency_alert',
            triggerData: {
              emergencyType,
              details,
              buddyNotified: buddy.buddy.id
            },
            interventionType: 'buddy_alert',
            aiConfidence: '1.0'
          });
        }
      }

      console.log(`🚨 Emergency alert sent to ${buddies.length} buddies for user ${userId}`);

    } catch (error) {
      console.error('Failed to send emergency alert to buddies:', error);
    }
  }

  /**
   * Monitor buddy system health and send proactive check-ins
   */
  async runBuddySystemMonitoring(): Promise<void> {
    try {
      console.log('🤝 Running buddy system monitoring...');

      // Find connections with no recent interaction (>7 days)
      const staleConnections = await db
        .select()
        .from(buddyConnections)
        .where(and(
          eq(buddyConnections.status, 'active'),
          gte(buddyConnections.lastInteraction, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        ));

      for (const connection of staleConnections) {
        // Send reconnection suggestion
        await this.suggestBuddyReconnection(connection);
      }

      // Find users who might benefit from buddy connections
      const isolatedUsers = await this.findIsolatedUsers();
      for (const user of isolatedUsers) {
        await this.suggestBuddyConnections(user.id);
      }

      console.log(`✅ Buddy system monitoring completed`);

    } catch (error) {
      console.error('Buddy system monitoring failed:', error);
    }
  }

  /**
   * Private helper methods
   */

  private async verifyBuddyConnection(userId1: string, userId2: string): Promise<any | null> {
    const [connection] = await db
      .select()
      .from(buddyConnections)
      .where(and(
        or(
          and(eq(buddyConnections.userId, userId1), eq(buddyConnections.buddyUserId, userId2)),
          and(eq(buddyConnections.userId, userId2), eq(buddyConnections.buddyUserId, userId1))
        ),
        eq(buddyConnections.status, 'active')
      ))
      .limit(1);

    return connection || null;
  }

  private async sendBuddyRequestNotification(request: BuddyRequest): Promise<void> {
    const [fromUser] = await db.select().from(users).where(eq(users.id, request.fromUserId)).limit(1);
    const [toUser] = await db.select().from(users).where(eq(users.id, request.toUserId)).limit(1);
    
    if (!fromUser || !toUser) return;

    const toUserPhone = (toUser.settings as any)?.phone;
    if (toUserPhone) {
      const message = `${fromUser.firstName || fromUser.username} wants to be your wellness buddy on VitalWatch! This means you'll check in on each other for support. Reply YES to accept or visit the app to respond.`;
      await sendSMS(toUserPhone, message);
    }
  }

  private async sendBuddyAcceptanceNotifications(accepterId: string, requesterId: string): Promise<void> {
    const [accepter] = await db.select().from(users).where(eq(users.id, accepterId)).limit(1);
    const [requester] = await db.select().from(users).where(eq(users.id, requesterId)).limit(1);
    
    if (!accepter || !requester) return;

    // Notify the requester
    const requesterPhone = (requester.settings as any)?.phone;
    if (requesterPhone) {
      const message = `Great news! ${accepter.firstName || accepter.username} accepted your buddy request. You can now support each other through VitalWatch. 🤝`;
      await sendSMS(requesterPhone, message);
    }

    // Notify the accepter
    const accepterPhone = (accepter.settings as any)?.phone;
    if (accepterPhone) {
      const message = `You're now wellness buddies with ${requester.firstName || requester.username}! Check in with each other regularly for mutual support. 💙`;
      await sendSMS(accepterPhone, message);
    }
  }

  private async sendBuddyCheckInNotification(request: BuddyCheckInRequest, checkInId: number): Promise<void> {
    const [fromUser] = await db.select().from(users).where(eq(users.id, request.fromUserId)).limit(1);
    const [toUser] = await db.select().from(users).where(eq(users.id, request.toUserId)).limit(1);
    
    if (!fromUser || !toUser) return;

    const toUserPhone = (toUser.settings as any)?.phone;
    if (toUserPhone) {
      let urgencyEmoji = '';
      if (request.urgencyLevel === 'high') urgencyEmoji = '⚠️ ';
      if (request.urgencyLevel === 'emergency') urgencyEmoji = '🚨 ';

      const message = `${urgencyEmoji}Buddy check-in from ${fromUser.firstName || fromUser.username}: "${request.message}" Reply to let them know you're okay.`;
      await sendSMS(toUserPhone, message);
    }
  }

  private async sendBuddyResponseNotification(checkIn: any, response: string): Promise<void> {
    const [initiator] = await db.select().from(users).where(eq(users.id, checkIn.initiatorUserId)).limit(1);
    const [receiver] = await db.select().from(users).where(eq(users.id, checkIn.receiverUserId)).limit(1);
    
    if (!initiator || !receiver) return;

    const initiatorPhone = (initiator.settings as any)?.phone;
    if (initiatorPhone) {
      const message = `${receiver.firstName || receiver.username} responded to your check-in: "${response}" Thanks for being a caring buddy! 💙`;
      await sendSMS(initiatorPhone, message);
    }
  }

  private async analyzeBuddyResponse(checkIn: any, response: string): Promise<void> {
    // Simple keyword analysis for concerning responses
    const concerningWords = ['terrible', 'horrible', 'suicidal', 'hopeless', 'can\'t', 'help', 'emergency'];
    const lowerResponse = response.toLowerCase();
    
    const concernLevel = concerningWords.filter(word => lowerResponse.includes(word)).length;
    
    if (concernLevel >= 2) {
      // High concern - alert the buddy and create crisis prevention record
      await db.insert(crisisPreventions).values({
        userId: checkIn.receiverUserId,
        triggerType: 'buddy_concern',
        triggerData: {
          response,
          checkInId: checkIn.id,
          concernLevel,
          buddyUserId: checkIn.initiatorUserId
        },
        interventionType: 'buddy_alert',
        aiConfidence: '0.7',
        followUpRequired: true
      });

      // Alert the concerned buddy
      const [buddy] = await db.select().from(users).where(eq(users.id, checkIn.initiatorUserId)).limit(1);
      if (buddy) {
        const buddyPhone = (buddy.settings as any)?.phone;
        if (buddyPhone) {
          const alertMessage = `Your buddy's response seems concerning. Consider reaching out with additional support or encourage them to contact crisis resources: 988 (Crisis Lifeline) or visit vitalwatch.app.`;
          await sendSMS(buddyPhone, alertMessage);
        }
      }
    }
  }

  private async calculateCompatibilityScore(user1: any, user2: any): Promise<number> {
    let score = 0.5; // Base score
    
    // Age compatibility (within 10 years)
    const user1Age = user1.settings?.age || 25;
    const user2Age = user2.settings?.age || 25;
    if (Math.abs(user1Age - user2Age) <= 10) score += 0.1;
    
    // Timezone compatibility
    const user1Timezone = user1.settings?.timezone || 'UTC';
    const user2Timezone = user2.settings?.timezone || 'UTC';
    if (user1Timezone === user2Timezone) score += 0.2;
    
    // Subscription level (similar commitment levels)
    if (user1.subscriptionPlan === user2.subscriptionPlan) score += 0.1;
    
    // Recent activity (both active users)
    const recentlyActive = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (user1.updatedAt > recentlyActive && user2.updatedAt > recentlyActive) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private async getSharedInterests(user1: any, user2: any): Promise<string[]> {
    // Simplified interest matching - in real implementation would analyze user data
    const commonInterests = ['wellness', 'mental health', 'mindfulness'];
    return commonInterests;
  }

  private async getComplementaryStrengths(user1: any, user2: any): Promise<string[]> {
    // Analyze user patterns to find complementary strengths
    return ['emotional support', 'practical advice', 'motivation'];
  }

  private async checkGeographicCompatibility(user1: any, user2: any): Promise<boolean> {
    // Simple timezone check - could be enhanced with actual location data
    const user1Timezone = user1.settings?.timezone || 'UTC';
    const user2Timezone = user2.settings?.timezone || 'UTC';
    return user1Timezone === user2Timezone;
  }

  private async getExistingBuddyIds(userId: string): Promise<string[]> {
    const connections = await db
      .select()
      .from(buddyConnections)
      .where(or(
        eq(buddyConnections.userId, userId),
        eq(buddyConnections.buddyUserId, userId)
      ));

    return connections.map(conn => 
      conn.userId === userId ? conn.buddyUserId : conn.userId
    );
  }

  private async getBuddyName(userId: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ? (user.firstName || user.username || 'Your buddy') : 'Your buddy';
  }

  private async getRecentBuddyCheckIns(connectionId: number, limit: number): Promise<any[]> {
    return await db
      .select()
      .from(buddyCheckIns)
      .where(eq(buddyCheckIns.connectionId, connectionId))
      .orderBy(desc(buddyCheckIns.createdAt))
      .limit(limit);
  }

  private async scheduleInitialBuddyCheckIn(userId1: string, userId2: string): Promise<void> {
    // Schedule initial check-in for tomorrow
    await db.insert(scheduledNotifications).values({
      userId: userId1,
      notificationType: 'buddy_reminder',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
      content: {
        message: 'Time for your first buddy check-in! Send a message to see how your new buddy is doing.',
        buddyId: userId2,
        type: 'initial_checkin'
      },
      deliveryMethod: 'push',
      aiGenerated: true
    });
  }

  private async suggestBuddyReconnection(connection: any): Promise<void> {
    // Send gentle reminder to reconnect
    const reconnectionMessage = 'It\'s been a while since you connected with your buddy. Consider sending a check-in to see how they\'re doing!';
    
    await db.insert(scheduledNotifications).values({
      userId: connection.userId,
      notificationType: 'buddy_reminder',
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      content: {
        message: reconnectionMessage,
        connectionId: connection.id,
        type: 'reconnection_suggestion'
      },
      deliveryMethod: 'push',
      aiGenerated: true
    });
  }

  private async findIsolatedUsers(): Promise<any[]> {
    // Find users with no buddy connections
    const allUsers = await db.select().from(users);
    const usersWithBuddies = await db
      .select({ userId: buddyConnections.userId })
      .from(buddyConnections)
      .where(eq(buddyConnections.status, 'active'));

    const userIdsWithBuddies = new Set(usersWithBuddies.map(u => u.userId));
    
    return allUsers.filter(user => !userIdsWithBuddies.has(user.id));
  }

  private async suggestBuddyConnections(userId: string): Promise<void> {
    const matches = await this.findBuddyMatches(userId);
    
    if (matches.length > 0) {
      await db.insert(scheduledNotifications).values({
        userId,
        notificationType: 'buddy_suggestion',
        scheduledFor: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        content: {
          message: 'Connect with a wellness buddy for mutual support! Check out suggested matches in your VitalWatch app.',
          matchCount: matches.length,
          type: 'buddy_suggestion'
        },
        deliveryMethod: 'push',
        aiGenerated: true
      });
    }
  }
}

export const buddySystemService = new BuddySystemService();
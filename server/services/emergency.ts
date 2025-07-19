import { storage } from "../storage";
import { sendEmergencyAlert } from "./sendgrid";
import { sendEmergencyAlertSMS } from "./twilio";
import { analyzeMoodEntry, assessCrisisRisk } from "./openai";
import { WebSocket } from "ws";

export interface EmergencyAlert {
  userId: string;
  type: "panic_button" | "auto_detected" | "manual" | "countdown_expired";
  severity: "low" | "medium" | "high" | "critical";
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  message?: string;
  metadata?: any;
}

export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export class EmergencyService {
  private activeWebSockets: Map<string, WebSocket> = new Map();

  registerWebSocket(userId: string, ws: WebSocket) {
    this.activeWebSockets.set(userId, ws);
    
    ws.on('close', () => {
      this.activeWebSockets.delete(userId);
    });
  }

  async triggerEmergencyAlert(alert: EmergencyAlert): Promise<{ success: boolean; incidentId?: number; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Create emergency incident record
      const incident = await storage.createEmergencyIncident(alert.userId, {
        type: alert.type,
        severity: alert.severity,
        location: alert.location,
        description: alert.message,
      });

      // Get user's emergency contacts
      const contacts = await storage.getEmergencyContacts(alert.userId);
      if (contacts.length === 0) {
        errors.push("No emergency contacts configured");
      }

      // Get user info for notifications
      const user = await storage.getUser(alert.userId);
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Emergency Friend User" : "Emergency Friend User";

      // Get user notification preferences
      const settings = await storage.getUserSettings(alert.userId);
      const notificationPrefs: NotificationPreferences = settings?.notificationPreferences as NotificationPreferences || {
        sms: true,
        email: true,
        push: true,
      };

      // Send notifications to emergency contacts
      const notificationPromises: Promise<any>[] = [];
      const contactsNotified: number[] = [];

      for (const contact of contacts) {
        // Send SMS if phone number available and enabled
        if (contact.phone && notificationPrefs.sms) {
          notificationPromises.push(
            sendEmergencyAlertSMS(contact.phone, userName, alert.location, alert.message)
              .then(success => {
                if (success) contactsNotified.push(contact.id);
                return { type: 'sms', contactId: contact.id, success };
              })
              .catch(error => {
                errors.push(`SMS to ${contact.name} failed: ${error.message}`);
                return { type: 'sms', contactId: contact.id, success: false, error };
              })
          );
        }

        // Send email if email available and enabled
        if (contact.email && notificationPrefs.email) {
          notificationPromises.push(
            sendEmergencyAlert(contact.email, userName, alert.location, alert.message)
              .then(success => {
                if (success) contactsNotified.push(contact.id);
                return { type: 'email', contactId: contact.id, success };
              })
              .catch(error => {
                errors.push(`Email to ${contact.name} failed: ${error.message}`);
                return { type: 'email', contactId: contact.id, success: false, error };
              })
          );
        }
      }

      // Send real-time notification via WebSocket
      const ws = this.activeWebSockets.get(alert.userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'emergency_alert_sent',
          incidentId: incident.id,
          contactsNotified: contacts.length,
          timestamp: new Date().toISOString(),
        }));
      }

      // Wait for all notifications to complete
      await Promise.allSettled(notificationPromises);

      // Update incident with contacts notified
      await storage.updateEmergencyIncident(incident.id, {
        contactsNotified,
      });

      return {
        success: true,
        incidentId: incident.id,
        errors,
      };

    } catch (error) {
      console.error("Emergency alert failed:", error);
      errors.push(`Emergency alert system error: ${error.message}`);
      
      return {
        success: false,
        errors,
      };
    }
  }

  async resolveEmergencyIncident(incidentId: number, userId: string): Promise<boolean> {
    try {
      await storage.updateEmergencyIncident(incidentId, {
        status: "resolved",
        resolvedAt: new Date(),
      });

      // Notify via WebSocket
      const ws = this.activeWebSockets.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'emergency_resolved',
          incidentId,
          timestamp: new Date().toISOString(),
        }));
      }

      return true;
    } catch (error) {
      console.error("Failed to resolve emergency incident:", error);
      return false;
    }
  }

  async cancelEmergencyIncident(incidentId: number, userId: string): Promise<boolean> {
    try {
      await storage.updateEmergencyIncident(incidentId, {
        status: "cancelled",
        resolvedAt: new Date(),
      });

      // Notify via WebSocket
      const ws = this.activeWebSockets.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'emergency_cancelled',
          incidentId,
          timestamp: new Date().toISOString(),
        }));
      }

      return true;
    } catch (error) {
      console.error("Failed to cancel emergency incident:", error);
      return false;
    }
  }

  async checkForCrisisPatterns(userId: string): Promise<void> {
    try {
      // Get recent mood entries
      const recentMoods = await storage.getMoodEntries(userId, 10);
      
      if (recentMoods.length < 3) return; // Need at least 3 entries for pattern analysis

      // Get emergency history
      const emergencyHistory = await storage.getEmergencyIncidents(userId);

      // Assess crisis risk using AI
      const riskAssessment = await assessCrisisRisk(recentMoods, emergencyHistory);

      // If high or critical risk detected, create AI insight and potentially alert
      if (riskAssessment.riskLevel === "high" || riskAssessment.riskLevel === "critical") {
        await storage.createAIInsight(userId, {
          type: "crisis_warning",
          insight: `Crisis risk detected: ${riskAssessment.reasoning}`,
          confidence: riskAssessment.confidence,
          isActionable: true,
          isRead: false,
          metadata: {
            riskLevel: riskAssessment.riskLevel,
            assessment: riskAssessment,
          },
        });

        // Send real-time alert to user if critical
        if (riskAssessment.riskLevel === "critical") {
          const ws = this.activeWebSockets.get(userId);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'crisis_risk_detected',
              riskLevel: riskAssessment.riskLevel,
              message: "We've detected concerning patterns. Consider reaching out for support.",
              resources: [
                { type: "call", label: "Call 988", action: "988" },
                { type: "chat", label: "Crisis Chat", action: "crisis_chat" },
                { type: "emergency", label: "Emergency Alert", action: "emergency_alert" },
              ],
              timestamp: new Date().toISOString(),
            }));
          }
        }
      }
    } catch (error) {
      console.error("Crisis pattern check failed:", error);
    }
  }

  async processMoodEntry(userId: string, mood: string, moodScore: number, note?: string, location?: any): Promise<any> {
    try {
      // Get recent mood history for context
      const recentMoods = await storage.getMoodEntries(userId, 7);

      // Analyze mood with AI
      const analysis = await analyzeMoodEntry(mood, moodScore, note, recentMoods);

      // Create mood entry with AI analysis
      const moodEntry = await storage.createMoodEntry(userId, {
        mood,
        moodScore,
        note,
        location,
        aiAnalysis: analysis,
        riskLevel: analysis.riskLevel,
      });

      // Check for crisis patterns after adding new entry
      await this.checkForCrisisPatterns(userId);

      // If critical risk, trigger automatic support
      if (analysis.riskLevel === "critical") {
        const ws = this.activeWebSockets.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'immediate_support_needed',
            message: "Your recent entry indicates you might need immediate support. You're not alone.",
            analysis: analysis,
            resources: [
              { type: "call", label: "Call 988 Crisis Lifeline", action: "call:988" },
              { type: "chat", label: "Start Crisis Chat", action: "crisis_chat" },
              { type: "emergency", label: "Alert Emergency Contacts", action: "emergency_alert" },
            ],
            timestamp: new Date().toISOString(),
          }));
        }
      }

      return moodEntry;
    } catch (error) {
      console.error("Mood entry processing failed:", error);
      // Still create the basic mood entry even if AI analysis fails
      return await storage.createMoodEntry(userId, {
        mood,
        moodScore,
        note,
        location,
      });
    }
  }
}

export const emergencyService = new EmergencyService();

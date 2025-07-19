import {
  users,
  emergencyContacts,
  moodEntries,
  emergencyIncidents,
  copingToolsUsage,
  aiInsights,
  crisisChatSessions,
  userSettings,
  type User,
  type UpsertUser,
  type EmergencyContact,
  type InsertEmergencyContact,
  type MoodEntry,
  type InsertMoodEntry,
  type EmergencyIncident,
  type InsertEmergencyIncident,
  type CopingToolsUsage,
  type InsertCopingToolsUsage,
  type AIInsight,
  type CrisisChatSession,
  type UserSettings,
  type UpdateUserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Emergency contacts
  getEmergencyContacts(userId: string): Promise<EmergencyContact[]>;
  createEmergencyContact(userId: string, contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact>;
  deleteEmergencyContact(id: number): Promise<void>;

  // Mood tracking
  getMoodEntries(userId: string, limit?: number): Promise<MoodEntry[]>;
  createMoodEntry(userId: string, entry: InsertMoodEntry & { location?: any }): Promise<MoodEntry>;
  getMoodEntriesInRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]>;

  // Emergency incidents
  getEmergencyIncidents(userId: string): Promise<EmergencyIncident[]>;
  createEmergencyIncident(userId: string, incident: InsertEmergencyIncident & { location?: any }): Promise<EmergencyIncident>;
  updateEmergencyIncident(id: number, updates: Partial<EmergencyIncident>): Promise<EmergencyIncident>;
  getActiveEmergencyIncident(userId: string): Promise<EmergencyIncident | undefined>;

  // Coping tools
  getCopingToolsUsage(userId: string, limit?: number): Promise<CopingToolsUsage[]>;
  createCopingToolsUsage(userId: string, usage: InsertCopingToolsUsage): Promise<CopingToolsUsage>;

  // AI insights
  getAIInsights(userId: string, unreadOnly?: boolean): Promise<AIInsight[]>;
  createAIInsight(userId: string, insight: Omit<AIInsight, 'id' | 'userId' | 'createdAt'>): Promise<AIInsight>;
  markInsightAsRead(id: number): Promise<void>;

  // Crisis chat
  createCrisisChatSession(userId: string): Promise<CrisisChatSession>;
  updateCrisisChatSession(sessionId: string, updates: Partial<CrisisChatSession>): Promise<CrisisChatSession>;
  getCrisisChatSession(sessionId: string): Promise<CrisisChatSession | undefined>;

  // User settings
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(userId: string, settings: UpdateUserSettings): Promise<UserSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return await db
      .select()
      .from(emergencyContacts)
      .where(and(eq(emergencyContacts.userId, userId), eq(emergencyContacts.isActive, true)))
      .orderBy(emergencyContacts.priority);
  }

  async createEmergencyContact(userId: string, contact: InsertEmergencyContact): Promise<EmergencyContact> {
    const [newContact] = await db
      .insert(emergencyContacts)
      .values({ ...contact, userId })
      .returning();
    return newContact;
  }

  async updateEmergencyContact(id: number, contact: Partial<InsertEmergencyContact>): Promise<EmergencyContact> {
    const [updated] = await db
      .update(emergencyContacts)
      .set(contact)
      .where(eq(emergencyContacts.id, id))
      .returning();
    return updated;
  }

  async deleteEmergencyContact(id: number): Promise<void> {
    await db
      .update(emergencyContacts)
      .set({ isActive: false })
      .where(eq(emergencyContacts.id, id));
  }

  async getMoodEntries(userId: string, limit: number = 30): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt))
      .limit(limit);
  }

  async createMoodEntry(userId: string, entry: InsertMoodEntry & { location?: any }): Promise<MoodEntry> {
    const [newEntry] = await db
      .insert(moodEntries)
      .values({ ...entry, userId })
      .returning();
    return newEntry;
  }

  async getMoodEntriesInRange(userId: string, startDate: Date, endDate: Date): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.createdAt, startDate),
          lte(moodEntries.createdAt, endDate)
        )
      )
      .orderBy(desc(moodEntries.createdAt));
  }

  async getEmergencyIncidents(userId: string): Promise<EmergencyIncident[]> {
    return await db
      .select()
      .from(emergencyIncidents)
      .where(eq(emergencyIncidents.userId, userId))
      .orderBy(desc(emergencyIncidents.createdAt));
  }

  async createEmergencyIncident(userId: string, incident: InsertEmergencyIncident & { location?: any }): Promise<EmergencyIncident> {
    const [newIncident] = await db
      .insert(emergencyIncidents)
      .values({ ...incident, userId })
      .returning();
    return newIncident;
  }

  async updateEmergencyIncident(id: number, updates: Partial<EmergencyIncident>): Promise<EmergencyIncident> {
    const [updated] = await db
      .update(emergencyIncidents)
      .set(updates)
      .where(eq(emergencyIncidents.id, id))
      .returning();
    return updated;
  }

  async getActiveEmergencyIncident(userId: string): Promise<EmergencyIncident | undefined> {
    const [incident] = await db
      .select()
      .from(emergencyIncidents)
      .where(and(eq(emergencyIncidents.userId, userId), eq(emergencyIncidents.status, "active")))
      .orderBy(desc(emergencyIncidents.createdAt))
      .limit(1);
    return incident;
  }

  async getCopingToolsUsage(userId: string, limit: number = 50): Promise<CopingToolsUsage[]> {
    return await db
      .select()
      .from(copingToolsUsage)
      .where(eq(copingToolsUsage.userId, userId))
      .orderBy(desc(copingToolsUsage.createdAt))
      .limit(limit);
  }

  async createCopingToolsUsage(userId: string, usage: InsertCopingToolsUsage): Promise<CopingToolsUsage> {
    const [newUsage] = await db
      .insert(copingToolsUsage)
      .values({ ...usage, userId })
      .returning();
    return newUsage;
  }

  async getAIInsights(userId: string, unreadOnly: boolean = false): Promise<AIInsight[]> {
    const conditions = [eq(aiInsights.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(aiInsights.isRead, false));
    }

    return await db
      .select()
      .from(aiInsights)
      .where(and(...conditions))
      .orderBy(desc(aiInsights.createdAt));
  }

  async createAIInsight(userId: string, insight: Omit<AIInsight, 'id' | 'userId' | 'createdAt'>): Promise<AIInsight> {
    const [newInsight] = await db
      .insert(aiInsights)
      .values({ ...insight, userId })
      .returning();
    return newInsight;
  }

  async markInsightAsRead(id: number): Promise<void> {
    await db
      .update(aiInsights)
      .set({ isRead: true })
      .where(eq(aiInsights.id, id));
  }

  async createCrisisChatSession(userId: string): Promise<CrisisChatSession> {
    const sessionId = `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [session] = await db
      .insert(crisisChatSessions)
      .values({ userId, sessionId })
      .returning();
    return session;
  }

  async updateCrisisChatSession(sessionId: string, updates: Partial<CrisisChatSession>): Promise<CrisisChatSession> {
    const [updated] = await db
      .update(crisisChatSessions)
      .set(updates)
      .where(eq(crisisChatSessions.sessionId, sessionId))
      .returning();
    return updated;
  }

  async getCrisisChatSession(sessionId: string): Promise<CrisisChatSession | undefined> {
    const [session] = await db
      .select()
      .from(crisisChatSessions)
      .where(eq(crisisChatSessions.sessionId, sessionId));
    return session;
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(userId: string, settings: UpdateUserSettings): Promise<UserSettings> {
    const [upserted] = await db
      .insert(userSettings)
      .values({ ...settings, userId })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }
}

export const storage = new DatabaseStorage();

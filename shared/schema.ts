import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImage: varchar("profile_image"),
  passwordHash: varchar("password_hash"),
  authProvider: varchar("auth_provider").default("local"), // local, google, facebook
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  welcomeEmailSent: boolean("welcome_email_sent").default(false),
  isAdmin: boolean("is_admin").default(false),
  // Subscription fields
  subscriptionPlan: varchar("subscription_plan").default("free"), // free, guardian, professional
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired, trial
  guardianTrialStarted: boolean("guardian_trial_started").default(false),
  guardianTrialStartDate: timestamp("guardian_trial_start_date"),
  guardianTrialEndDate: timestamp("guardian_trial_end_date"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  // SMS usage tracking for $9.99 Guardian plan
  monthlyAlertUsage: integer("monthly_alert_usage").default(0), // SMS alerts sent this month
  lastUsageReset: timestamp("last_usage_reset").defaultNow(), // when counter was last reset
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency contacts for crisis situations
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  relationship: text("relationship").notNull(),
  priority: integer("priority").notNull().default(1), // 1 = primary, 2 = secondary, etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mood tracking entries with AI analysis
export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(), // terrible, bad, okay, good, great
  moodScore: integer("mood_score").notNull(), // 1-5
  note: text("note"),
  aiAnalysis: jsonb("ai_analysis"), // AI insights and pattern detection
  riskLevel: text("risk_level"), // low, medium, high, critical
  location: jsonb("location"), // { lat, lng, address }
  createdAt: timestamp("created_at").defaultNow(),
});

// Emergency incidents and alerts
export const emergencyIncidents = pgTable("emergency_incidents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // panic_button, auto_detected, manual
  status: text("status").notNull().default("active"), // active, resolved, cancelled
  location: jsonb("location"), // GPS coordinates and address
  severity: text("severity").notNull(), // low, medium, high, critical
  description: text("description"),
  contactsNotified: jsonb("contacts_notified").array(), // array of contact IDs notified
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coping tools usage tracking
export const copingToolsUsage = pgTable("coping_tools_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toolType: text("tool_type").notNull(), // breathing, grounding, meditation, distraction
  duration: integer("duration"), // in seconds
  completed: boolean("completed").notNull().default(false),
  effectiveness: integer("effectiveness"), // 1-5 rating by user
  createdAt: timestamp("created_at").defaultNow(),
});

// AI insights and patterns
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // pattern_detected, crisis_warning, recommendation
  insight: text("insight").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  isActionable: boolean("is_actionable").notNull().default(false),
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"), // additional context data
  createdAt: timestamp("created_at").defaultNow(),
});

// Crisis chat sessions
export const crisisChatSessions = pgTable("crisis_chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().unique(),
  counselorId: text("counselor_id"),
  status: text("status").notNull().default("waiting"), // waiting, active, ended
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Chat messages for crisis support
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id").notNull().references(() => crisisChatSessions.sessionId, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // 'user' | 'ai' | 'system'
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // 'text' | 'suggestion' | 'resource' | 'escalation'
  urgency: text("urgency"), // 'low' | 'medium' | 'high' | 'critical'
  metadata: jsonb("metadata"), // Additional data like crisis level, resources, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences and settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emergencyCountdown: integer("emergency_countdown").notNull().default(180), // seconds
  autoDetectionEnabled: boolean("auto_detection_enabled").notNull().default(true),
  voiceCommandsEnabled: boolean("voice_commands_enabled").notNull().default(false),
  locationSharingEnabled: boolean("location_sharing_enabled").notNull().default(true),
  notificationPreferences: jsonb("notification_preferences").notNull().default('{"sms": true, "email": true, "push": true}'),
  privacyLevel: text("privacy_level").notNull().default("standard"), // minimal, standard, full
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types for API validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts).pick({
  name: true,
  phone: true,
  email: true,
  relationship: true,
  priority: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  mood: true,
  moodScore: true,
  note: true,
});

export const insertEmergencyIncidentSchema = createInsertSchema(emergencyIncidents).pick({
  type: true,
  severity: true,
  description: true,
});

export const insertCopingToolsUsageSchema = createInsertSchema(copingToolsUsage).pick({
  toolType: true,
  duration: true,
  completed: true,
  effectiveness: true,
});

export const updateUserSettingsSchema = createInsertSchema(userSettings).pick({
  emergencyCountdown: true,
  autoDetectionEnabled: true,
  voiceCommandsEnabled: true,
  locationSharingEnabled: true,
  notificationPreferences: true,
  privacyLevel: true,
});

export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

export type InsertEmergencyIncident = z.infer<typeof insertEmergencyIncidentSchema>;
export type EmergencyIncident = typeof emergencyIncidents.$inferSelect;

export type InsertCopingToolsUsage = z.infer<typeof insertCopingToolsUsageSchema>;
export type CopingToolsUsage = typeof copingToolsUsage.$inferSelect;

export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type AIInsight = typeof aiInsights.$inferSelect;
export type CrisisChatSession = typeof crisisChatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  sender: true,
  content: true,
  messageType: true,
  urgency: true,
  metadata: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

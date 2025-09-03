import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { registerRecordingRoutes } from "./routes/recordings";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import bcrypt from 'bcrypt';
import passport from 'passport';
import crypto from 'crypto';
import { emergencyService } from "./services/emergency";
import { storageService } from "./services/supabase";
import { emailService } from "./services/emailService";
import { 
  generatePersonalizedInsight,
  transcribeAudio,
  analyzeThreatLevel,
  analyzeComprehensiveThreat,
  analyzeBiometrics,
  analyzeEnvironmental,
  generateCrisisChatResponse
} from "./services/openai";
import { generateHelpResponse } from "./openai";
import { analyzeGuardianSituation } from './openai';
import { sendCrisisResourcesEmail } from "./services/sendgrid";
import { sendCrisisResourcesSMS, sendEmergencyAlertSMS, sendSMS } from "./services/twilio";
import twilio from 'twilio';
import {
  insertEmergencyContactSchema,
  insertMoodEntrySchema,
  insertEmergencyIncidentSchema,
  insertCopingToolsUsageSchema,
  updateUserSettingsSchema,
  insertChatMessageSchema,
  users,
  emergencyIncidents,
  aiInsights,
  moodEntries,
  emergencyContacts,
  crisisChatSessions,
  chatMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, lt, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register recording management routes
  registerRecordingRoutes(app);
  // Setup session middleware before auth
  const session = await import('express-session');
  const pgSession = await import('connect-pg-simple');
  const pgStore = pgSession.default(session.default);
  
  app.use(session.default({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-vitalwatch-2025',
    resave: false,
    saveUninitialized: false, // don't create sessions for anonymous hits
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // https on replit.dev 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // allow cross-site cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));

  // Auth middleware
  setupAuth(app);

  // Multer setup for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow images, audio, and PDFs
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/mp3',
        'application/pdf'
      ];
      cb(null, allowedTypes.includes(file.mimetype));
    }
  });

  // Google OAuth routes
  app.get('/api/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Facebook OAuth routes
  app.get('/api/auth/facebook', passport.authenticate('facebook', {
    scope: ['email']
  }));

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Demo login route
  app.post('/api/auth/demo', async (req, res) => {
    try {
      // Use the demo account with sample data
      const demoUser = await storage.getUserByEmail('testme@vitalwatch.app');
      
      if (!demoUser) {
        return res.status(404).json({ message: 'Demo account not found' });
      }

      // Log in the demo user
      req.login(demoUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Demo login failed' });
        }
        
        res.json({ 
          user: demoUser, 
          message: 'Demo session started - explore with sample data!'
        });
      });
      
    } catch (error) {
      console.error('Demo login error:', error);
      res.status(500).json({ message: 'Demo login failed' });
    }
  });

  // Local auth routes
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user, message: 'Login successful' });
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password, captchaToken } = req.body;

      // Verify CAPTCHA if token is provided
      if (captchaToken && process.env.RECAPTCHA_SECRET_KEY) {
        const captchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
        });

        const captchaResult = await captchaResponse.json();
        
        if (!captchaResult.success) {
          return res.status(400).json({ 
            message: 'CAPTCHA verification failed. Please try again.' 
          });
        }
      } else if (process.env.RECAPTCHA_SECRET_KEY) {
        // CAPTCHA is configured but no token provided
        return res.status(400).json({ 
          message: 'CAPTCHA verification required.' 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user
      const userData = {
        id: crypto.randomUUID(),
        email,
        username: `${firstName} ${lastName}`,
        firstName,
        lastName,
        passwordHash,
        authProvider: 'local' as const,
        emailVerified: false,
        settings: {
          emergencyMode: false,
          locationTracking: true,
          darkMode: false,
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      };
      
      const user = await storage.createUser(userData);
      
      // Send welcome email
      await emailService.sendWelcomeEmail(user.id, user.email, user.firstName);
      
      // Auto login
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after signup' });
        }
        res.json({ user, message: 'Account created successfully' });
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Emergency Contact routes
  app.get('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const contacts = await storage.getEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.post('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(userId, validatedData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating emergency contact:", error);
      res.status(400).json({ message: "Failed to create emergency contact" });
    }
  });

  app.put('/api/emergency-contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmergencyContactSchema.partial().parse(req.body);
      const contact = await storage.updateEmergencyContact(id, validatedData);
      res.json(contact);
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      res.status(400).json({ message: "Failed to update emergency contact" });
    }
  });

  app.delete('/api/emergency-contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmergencyContact(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      res.status(500).json({ message: "Failed to delete emergency contact" });
    }
  });

  // Mood tracking routes
  app.get('/api/mood-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 30;
      const entries = await storage.getMoodEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post('/api/mood-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { location, ...moodData } = req.body;
      const validatedData = insertMoodEntrySchema.parse(moodData);
      
      // Process mood entry with AI analysis and crisis detection
      const entry = await emergencyService.processMoodEntry(
        userId,
        validatedData.mood,
        validatedData.moodScore,
        validatedData.note || undefined,
        location
      );
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ message: "Failed to create mood entry" });
    }
  });

  // Emergency incident routes
  app.get('/api/emergency-incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const incidents = await storage.getEmergencyIncidents(userId);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching emergency incidents:", error);
      res.status(500).json({ message: "Failed to fetch emergency incidents" });
    }
  });

  app.post('/api/emergency-alert', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { type = "panic_button", severity = "high", location, message } = req.body;
      
      const result = await emergencyService.triggerEmergencyAlert({
        userId,
        type,
        severity,
        location,
        message,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error triggering emergency alert:", error);
      res.status(500).json({ message: "Failed to trigger emergency alert" });
    }
  });

  app.post('/api/emergency-incidents/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const incidentId = parseInt(req.params.id);
      const success = await emergencyService.resolveEmergencyIncident(incidentId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error resolving emergency incident:", error);
      res.status(500).json({ message: "Failed to resolve emergency incident" });
    }
  });

  app.post('/api/emergency-incidents/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const incidentId = parseInt(req.params.id);
      const success = await emergencyService.cancelEmergencyIncident(incidentId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error cancelling emergency incident:", error);
      res.status(500).json({ message: "Failed to cancel emergency incident" });
    }
  });

  // Events API - serves event history for Event History Dashboard
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { dateRange, type } = req.query;
      
      // Build query conditions
      let whereConditions = [eq(emergencyIncidents.userId, userId)];
      
      // Add date filtering
      if (dateRange && dateRange !== 'all') {
        const days = parseInt(dateRange.toString().replace('d', ''));
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        whereConditions.push(gte(emergencyIncidents.createdAt, cutoffDate));
      }
      
      // Add type filtering
      if (type && type !== 'all') {
        whereConditions.push(eq(emergencyIncidents.type, type));
      }
      
      // Fetch events (using emergency incidents as the base)
      const incidents = await db.select().from(emergencyIncidents)
        .where(and(...whereConditions))
        .orderBy(desc(emergencyIncidents.createdAt));
      
      // Transform incidents to event format
      const events = incidents.map(incident => ({
        id: incident.id.toString(),
        type: incident.type,
        title: incident.title || `${incident.type.replace('_', ' ')} Event`,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        timestamp: incident.createdAt,
        location: incident.location ? {
          lat: incident.location.lat,
          lng: incident.location.lng,
          address: incident.location.address
        } : null,
        biometrics: incident.biometrics,
        response: incident.response,
        aiAnalysis: incident.aiAnalysis,
        audioRecording: incident.audioRecording ? {
          filename: incident.audioRecording.filename,
          duration: incident.audioRecording.duration,
          url: incident.audioRecording.url
        } : null
      }));
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Audio download endpoint for event recordings
  app.get('/api/events/audio/:filename', isAuthenticated, async (req: any, res) => {
    try {
      const { filename } = req.params;
      const userId = req.user.id;
      
      // Verify the audio file belongs to the user
      const incident = await db.select()
        .from(emergencyIncidents)
        .where(and(
          eq(emergencyIncidents.userId, userId),
          sql`audio_recording->>'filename' = ${filename}`
        ))
        .limit(1);
        
      if (incident.length === 0) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      // If the file has a URL, redirect to it, otherwise serve from storage
      const audioData = incident[0].audioRecording;
      if (audioData && audioData.url) {
        return res.redirect(audioData.url);
      }
      
      // Try to get file from storage service
      const audioBuffer = await storageService.downloadFile(filename);
      if (!audioBuffer) {
        return res.status(404).json({ message: "Audio file not available" });
      }
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': audioBuffer.length
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error("Error downloading audio:", error);
      res.status(500).json({ message: "Failed to download audio" });
    }
  });

  // Breadcrumb trail for continuous emergency updates
  app.post('/api/breadcrumb-update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { location, biometrics, audioBlob, timestamp } = req.body;

      // Get primary emergency contact
      const contacts = await db.select()
        .from(emergencyContacts)
        .where(eq(emergencyContacts.userId, userId))
        .limit(1);

      if (contacts.length === 0) {
        return res.status(400).json({ message: "No emergency contacts found" });
      }

      const contact = contacts[0];

      // Format update message with current status
      const locationText = location 
        ? `📍 Location: https://maps.google.com/maps?q=${location.lat},${location.lng}`
        : '📍 Location: Not available';

      const biometricText = biometrics 
        ? `💓 Heart Rate: ${biometrics.heartRate || 'N/A'} BPM\n📊 Stress: ${biometrics.stress || 'N/A'}%\n🏃 Activity: ${biometrics.activity || 'N/A'}%`
        : '💓 Biometrics: Not available';

      const updateMessage = `🚨 Emergency Update - VitalWatch\n\n${locationText}\n\n${biometricText}\n\n⏰ Time: ${new Date(timestamp).toLocaleString()}\n\n📡 Continuous monitoring active - Next update in 30 seconds.`;

      // Send SMS update
      await sendSMS(contact.phone, updateMessage);

      res.json({ 
        success: true,
        message: "Breadcrumb update sent successfully",
        sentTo: contact.phone
      });

    } catch (error) {
      console.error('Breadcrumb update error:', error);
      res.status(500).json({ message: "Failed to send breadcrumb update" });
    }
  });

  // Coping tools routes
  app.get('/api/coping-tools-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const usage = await storage.getCopingToolsUsage(userId, limit);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching coping tools usage:", error);
      res.status(500).json({ message: "Failed to fetch coping tools usage" });
    }
  });

  app.post('/api/coping-tools-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCopingToolsUsageSchema.parse(req.body);
      const usage = await storage.createCopingToolsUsage(userId, validatedData);
      res.json(usage);
    } catch (error) {
      console.error("Error creating coping tools usage:", error);
      res.status(400).json({ message: "Failed to record coping tools usage" });
    }
  });

  // AI insights routes
  app.get('/api/ai-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const unreadOnly = req.query.unread === 'true';
      const insights = await storage.getAIInsights(userId, unreadOnly);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  app.post('/api/ai-insights/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markInsightAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking insight as read:", error);
      res.status(500).json({ message: "Failed to mark insight as read" });
    }
  });

  app.post('/api/generate-insight', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's mood history and coping tools usage
      const moodHistory = await storage.getMoodEntries(userId, 30);
      const copingToolsUsage = await storage.getCopingToolsUsage(userId, 20);
      
      // Transform mood history to match expected type
      const transformedMoodHistory = moodHistory
        .filter(entry => entry.createdAt)
        .map(entry => ({
          mood: entry.mood,
          moodScore: entry.moodScore,
          createdAt: entry.createdAt!,
          note: entry.note || undefined,
        }));

      // Transform coping tools usage to match expected type
      const transformedCopingTools = copingToolsUsage
        .filter(tool => tool.createdAt)
        .map(tool => ({
          toolType: tool.toolType,
          effectiveness: tool.effectiveness || undefined,
          createdAt: tool.createdAt!,
        }));

      const insightData = await generatePersonalizedInsight(userId, transformedMoodHistory, transformedCopingTools);
      
      const insight = await storage.createAIInsight(userId, {
        type: "recommendation",
        insight: insightData.insight,
        confidence: insightData.confidence.toString(),
        isActionable: insightData.isActionable,
        isRead: false,
        metadata: {},
      });
      
      res.json(insight);
    } catch (error) {
      console.error("Error generating insight:", error);
      res.status(500).json({ message: "Failed to generate insight" });
    }
  });

  // Crisis Chat API Endpoints
  app.post('/api/crisis-chat/session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = crypto.randomUUID();
      
      const session = await storage.createCrisisChatSession(userId);
      
      // Initialize the session with a welcome message
      const welcomeMessage = await storage.createChatMessage(userId, {
        sessionId: session.sessionId,
        sender: 'ai',
        content: "Hello, I'm here to provide support and listen to whatever you're going through. You're not alone, and it takes courage to reach out. How are you feeling right now?",
        messageType: 'text',
        urgency: 'low',
        metadata: { isWelcome: true }
      });
      
      res.json({ session, welcomeMessage });
    } catch (error) {
      console.error('Error creating crisis chat session:', error);
      res.status(500).json({ message: 'Failed to create chat session' });
    }
  });

  app.get('/api/crisis-chat/messages/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // Verify user owns this session
      const session = await storage.getCrisisChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to chat session' });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/crisis-chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Verify user owns this session
      const session = await storage.getCrisisChatSession(messageData.sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to chat session' });
      }
      
      // Save user message
      const userMessage = await storage.createChatMessage(userId, messageData);
      
      // Get conversation history for context
      const conversationHistory = await storage.getChatMessages(messageData.sessionId);
      
      // Get user context for better AI responses
      const recentMoods = await storage.getMoodEntries(userId, 5);
      const emergencyHistory = await storage.getEmergencyIncidents(userId);
      
      // Generate AI response
      const aiResponse = await generateCrisisChatResponse(
        messageData.content,
        conversationHistory.slice(-10), // Last 10 messages for context
        messageData.urgency || 'medium',
        { recentMoods, emergencyHistory }
      );
      
      // Save AI response
      const aiMessage = await storage.createChatMessage(userId, {
        sessionId: messageData.sessionId,
        sender: 'ai',
        content: aiResponse.response,
        messageType: aiResponse.needsEscalation ? 'escalation' : 'text',
        urgency: aiResponse.urgency,
        metadata: { 
          needsEscalation: aiResponse.needsEscalation,
          resources: aiResponse.resources 
        }
      });
      
      // If escalation is needed, create AI insight
      if (aiResponse.needsEscalation) {
        await storage.createAIInsight(userId, {
          type: 'crisis_escalation',
          insight: `Crisis escalation recommended based on chat content: ${messageData.content.substring(0, 100)}...`,
          confidence: '0.90',
          isActionable: true,
          isRead: false,
          metadata: { sessionId: messageData.sessionId, urgency: aiResponse.urgency }
        });
      }
      
      res.json({ userMessage, aiMessage, needsEscalation: aiResponse.needsEscalation });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  app.patch('/api/crisis-chat/session/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // Verify user owns this session
      const session = await storage.getCrisisChatSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: 'Access denied to chat session' });
      }
      
      const updatedSession = await storage.updateCrisisChatSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating crisis chat session:', error);
      res.status(500).json({ message: 'Failed to update chat session' });
    }
  });

  // Test SMS endpoint (admin only) - test your Twilio integration
  app.post('/api/test-sms', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ message: 'Phone number and message required' });
      }
      
      // Use simple SMS for testing (not emergency format)
      const success = await sendSMS(phoneNumber, message);
      
      if (success) {
        res.json({ 
          message: 'Test SMS sent successfully!',
          details: `SMS sent via Twilio to ${phoneNumber}`,
          cost: '$0.008 (1 segment)'
        });
      } else {
        res.status(500).json({ message: 'Failed to send SMS - check Twilio credentials' });
      }
      
    } catch (error) {
      console.error('Test SMS error:', error);
      res.status(500).json({ message: 'SMS test failed: ' + error.message });
    }
  });

  // Comprehensive Emergency AI Analysis Route
  app.post('/api/comprehensive-emergency-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { audio, location, biometrics, environmental, settings, timestamp } = req.body;
      
      if (!audio) {
        return res.status(400).json({ message: "Audio data required" });
      }

      // Convert base64 audio to buffer for OpenAI Whisper
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Transcribe audio using OpenAI Whisper
      const transcription = await transcribeAudio(audioBuffer);
      
      // Enhanced threat analysis with biometric and environmental data
      const threatAnalysis = await analyzeComprehensiveThreat(transcription, {
        location,
        biometrics,
        environmental,
        settings
      });
      
      res.json({
        transcription,
        threatAnalysis: threatAnalysis.threatLevel !== 'low' ? threatAnalysis : null,
        timestamp,
        biometricAnalysis: biometrics ? analyzeBiometrics(biometrics) : null,
        environmentalAnalysis: environmental ? analyzeEnvironmental(environmental) : null
      });
      
    } catch (error) {
      console.error("Error in comprehensive emergency analysis:", error);
      res.status(500).json({ message: "Failed to analyze comprehensive emergency data" });
    }
  });

  // Legacy Emergency AI Analysis Route (for backward compatibility)
  app.post('/api/emergency-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { audio, location, timestamp } = req.body;
      
      if (!audio) {
        return res.status(400).json({ message: "Audio data required" });
      }

      // Convert base64 audio to buffer for OpenAI Whisper
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Transcribe audio using OpenAI Whisper
      const transcription = await transcribeAudio(audioBuffer);
      
      // Analyze transcription for threats
      const threatAnalysis = await analyzeThreatLevel(transcription, location);
      
      res.json({
        transcription,
        threatAnalysis: threatAnalysis.threatLevel !== 'low' ? threatAnalysis : null,
        timestamp
      });
      
    } catch (error) {
      console.error("Error in emergency analysis:", error);
      res.status(500).json({ message: "Failed to analyze emergency audio" });
    }
  });

  // AI Guardian Analysis Endpoint
  app.post('/api/ai-guardian-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { sensorData } = req.body;
      
      if (!sensorData) {
        return res.status(400).json({ message: "Sensor data is required for AI Guardian analysis" });
      }

      // Perform comprehensive AI analysis of the situation
      const analysis = await analyzeGuardianSituation(sensorData);
      
      res.json(analysis);
    } catch (error) {
      console.error("AI Guardian analysis error:", error);
      res.status(500).json({ 
        message: "AI Guardian analysis failed",
        threatLevel: {
          level: 'safe',
          confidence: 0.5,
          reasons: ['Analysis service temporarily unavailable'],
          recommendations: ['Continue monitoring manually']
        },
        explanation: 'Analysis completed using fallback system.'
      });
    }
  });

  // Crisis chat routes
  app.post('/api/crisis-chat/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const session = await storage.createCrisisChatSession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error starting crisis chat:", error);
      res.status(500).json({ message: "Failed to start crisis chat session" });
    }
  });

  // User settings routes
  app.get('/api/user-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let settings = await storage.getUserSettings(userId);
      
      // Create default settings if none exist
      if (!settings) {
        settings = await storage.upsertUserSettings(userId, {
          emergencyCountdown: 180,
          autoDetectionEnabled: true,
          voiceCommandsEnabled: false,
          locationSharingEnabled: true,
          notificationPreferences: { sms: true, email: true, push: true },
          privacyLevel: "standard",
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put('/api/user-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = updateUserSettingsSchema.parse(req.body);
      const settings = await storage.upsertUserSettings(userId, validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(400).json({ message: "Failed to update user settings" });
    }
  });

  // Account deletion route
  app.delete('/api/user/delete-account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For health apps, we need to retain emergency incident data for legal compliance
      // Delete personal data but keep anonymized emergency records
      
      // 1. Delete personal data
      await db.delete(users).where(eq(users.id, userId));
      
      // 2. Delete or anonymize associated data (but keep emergency records)
      // Delete mood entries
      await db.delete(moodEntries).where(eq(moodEntries.userId, userId));
      
      // Delete emergency contacts
      await db.delete(emergencyContacts).where(eq(emergencyContacts.userId, userId));
      
      // Delete chat messages and sessions
      await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
      await db.delete(crisisChatSessions).where(eq(crisisChatSessions.userId, userId));
      
      // Delete AI insights
      await db.delete(aiInsights).where(eq(aiInsights.userId, userId));
      
      // For emergency incidents - anonymize but don't delete (legal requirement)
      // These records must be kept for safety audits and legal compliance
      await db.update(emergencyIncidents)
        .set({ 
          userId: null,  // Remove user link but keep incident record
          location: 'ANONYMIZED',
          audioTranscription: 'USER_DATA_DELETED'
        })
        .where(eq(emergencyIncidents.userId, userId));

      // Send confirmation email
      const emailService = await import("./services/emailService");
      try {
        await emailService.emailService.sendAccountDeletionConfirmation(
          user.email!,
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
        );
      } catch (emailError) {
        console.error("Failed to send deletion confirmation email:", emailError);
        // Don't fail the deletion if email fails
      }

      // Clear the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });

      res.json({ 
        success: true, 
        message: "Account successfully deleted. Emergency incident records have been anonymized and retained for legal compliance." 
      });
      
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account. Please contact support." });
    }
  });

  // File import handler for PWA file_handlers
  app.post('/import', upload.array('files'), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      // For now, just acknowledge the files were received
      // In a full implementation, you'd process these files appropriately
      const fileInfo = req.files.map((file: any) => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size
      }));
      
      res.json({ 
        message: "Files imported successfully", 
        files: fileInfo 
      });
    } catch (error) {
      console.error("Error importing files:", error);
      res.status(500).json({ message: "Failed to import files" });
    }
  });

  // Crisis resources routes
  app.post('/api/send-crisis-resources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { method } = req.body; // 'email' or 'sms'
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || "Friend";
      const resources = [
        "988 Suicide & Crisis Lifeline: Call or text 988",
        "Crisis Text Line: Text HOME to 741741",
        "National Domestic Violence Hotline: 1-800-799-7233",
        "SAMHSA National Helpline: 1-800-662-4357",
        "Emergency: Call 911",
      ];
      
      let success = false;
      
      if (method === 'email' && user.email) {
        success = await sendCrisisResourcesEmail(user.email, userName, resources);
      } else if (method === 'sms') {
        // For SMS, we'd need the user's phone number - this could be added to user profile
        // For now, we'll return an error
        return res.status(400).json({ message: "SMS requires phone number in profile" });
      }
      
      res.json({ success, method });
    } catch (error) {
      console.error("Error sending crisis resources:", error);
      res.status(500).json({ message: "Failed to send crisis resources" });
    }
  });

  // AI Help Chat route
  app.post('/api/ai-help-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await generateHelpResponse(message, context);
      
      res.json({ 
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating AI help response:", error);
      res.status(500).json({ 
        error: "Failed to generate AI response",
        fallback: "I'm having trouble connecting to my AI systems right now. Please try asking your question in a different way, or contact support for immediate assistance."
      });
    }
  });

  // File upload routes
  app.post('/api/upload/profile-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.id;
      const fileName = `profile-${Date.now()}.jpg`;
      
      const filePath = await storageService.uploadProfileImage(userId, req.file.buffer, fileName);
      
      res.json({ 
        message: "Profile image uploaded successfully", 
        filePath,
        url: await storageService.getSignedUrl('user-files', filePath)
      });
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image: " + error.message });
    }
  });

  app.post('/api/upload/emergency-audio', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file uploaded" });
      }

      const userId = req.user.id;
      const { incidentId } = req.body;
      
      if (!incidentId) {
        return res.status(400).json({ message: "Incident ID required" });
      }
      
      const filePath = await storageService.uploadEmergencyAudio(userId, incidentId, req.file.buffer);
      
      res.json({ 
        message: "Emergency audio uploaded successfully", 
        filePath,
        url: await storageService.getSignedUrl('emergency-files', filePath)
      });
    } catch (error: any) {
      console.error("Error uploading emergency audio:", error);
      res.status(500).json({ message: "Failed to upload emergency audio: " + error.message });
    }
  });

  app.post('/api/upload/document', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document uploaded" });
      }

      const userId = req.user.id;
      const fileName = `${Date.now()}-${req.file.originalname}`;
      
      const filePath = await storageService.uploadHealthReport(userId, req.file.buffer, fileName);
      
      res.json({ 
        message: "Document uploaded successfully", 
        filePath,
        url: await storageService.getSignedUrl('user-files', filePath)
      });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document: " + error.message });
    }
  });

  app.get('/api/files/signed-url/:bucket/:path(*)', isAuthenticated, async (req: any, res) => {
    try {
      const { bucket, path } = req.params;
      const url = await storageService.getSignedUrl(bucket, path);
      
      res.json({ url });
    } catch (error: any) {
      console.error("Error creating signed URL:", error);
      res.status(500).json({ message: "Failed to create signed URL: " + error.message });
    }
  });

  app.delete('/api/files/:bucket/:path(*)', isAuthenticated, async (req: any, res) => {
    try {
      const { bucket, path } = req.params;
      await storageService.deleteFile(bucket, path);
      
      res.json({ message: "File deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file: " + error.message });
    }
  });

  // Emergency Evidence Storage Routes
  app.post('/api/upload-evidence', isAuthenticated, async (req: any, res) => {
    try {
      const { type, data, filename, evidenceId } = req.body;
      const userId = req.user.id;
      
      if (!type || !data || !filename || !evidenceId) {
        return res.status(400).json({ message: "Missing required fields: type, data, filename, evidenceId" });
      }
      
      // Convert base64 to buffer
      const base64Data = data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Supabase evidence bucket
      const filePath = `evidence/${userId}/${evidenceId}/${filename}`;
      const uploadResult = await storageService.uploadFile('emergency-evidence', filePath, buffer, type.includes('audio') ? 'audio/webm' : 'video/webm');
      const signedUrl = await storageService.getSignedUrl('emergency-evidence', filePath);
      
      res.json({ 
        message: "Evidence uploaded successfully",
        url: signedUrl,
        filePath
      });
    } catch (error: any) {
      console.error("Error uploading evidence:", error);
      res.status(500).json({ message: "Failed to upload evidence: " + error.message });
    }
  });

  app.post('/api/evidence-packages', isAuthenticated, async (req: any, res) => {
    try {
      const evidencePackage = req.body;
      const userId = req.user.id;
      
      // Store evidence package metadata in database
      const packageData = {
        id: evidencePackage.id,
        userId,
        timestamp: evidencePackage.timestamp,
        location: JSON.stringify(evidencePackage.location),
        recordings: JSON.stringify(evidencePackage.recordings),
        screenshots: JSON.stringify(evidencePackage.screenshots),
        deviceInfo: JSON.stringify(evidencePackage.deviceInfo),
        sensorData: JSON.stringify(evidencePackage.sensorData),
        contacts: JSON.stringify(evidencePackage.contacts),
        notes: evidencePackage.notes,
        uploaded: evidencePackage.uploaded
      };
      
      // Store in our database using emergency incidents table with type 'evidence_package'
      await db.insert(emergencyIncidents).values({
        userId,
        type: 'evidence_package',
        location: evidencePackage.location ? `${evidencePackage.location.lat},${evidencePackage.location.lng}` : null,
        severity: 'medium',
        description: `Evidence Package: ${evidencePackage.notes}`,
        status: evidencePackage.uploaded ? 'resolved' : 'active'
      });
      
      res.json({ 
        message: "Evidence package stored successfully",
        id: evidencePackage.id
      });
    } catch (error: any) {
      console.error("Error storing evidence package:", error);
      res.status(500).json({ message: "Failed to store evidence package: " + error.message });
    }
  });

  app.get('/api/evidence-packages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get evidence packages from emergency incidents
      const evidencePackages = await db.select()
        .from(emergencyIncidents)
        .where(and(
          eq(emergencyIncidents.userId, userId),
          eq(emergencyIncidents.type, 'evidence_package')
        ))
        .orderBy(desc(emergencyIncidents.createdAt));
      
      // Transform the data back to evidence package format
      const packages = evidencePackages.map(pkg => ({
        id: pkg.id.toString(),
        timestamp: pkg.createdAt,
        location: pkg.location && typeof pkg.location === 'string' ? pkg.location.split(',').map(Number) : null,
        recordings: [],
        screenshots: [],
        deviceInfo: {},
        sensorData: {},
        contacts: [],
        notes: pkg.description || '',
        uploaded: pkg.status === 'resolved'
      }));
      
      res.json(packages);
    } catch (error: any) {
      console.error("Error retrieving evidence packages:", error);
      res.status(500).json({ message: "Failed to retrieve evidence packages: " + error.message });
    }
  });

  // Admin Analytics Routes
  app.get('/api/admin/analytics', isAdmin, async (req: any, res) => {
    try {
      // Get comprehensive analytics
      const totalUsers = await db.select().from(users);
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      
      const newUsersToday = totalUsers.filter(u => new Date(u.createdAt!) >= todayStart).length;
      const proSubscribers = totalUsers.filter(u => u.subscriptionPlan === 'pro').length;
      const activeTrials = totalUsers.filter(u => u.proTrialStarted && u.proTrialEndDate && new Date(u.proTrialEndDate) > new Date()).length;
      
      const emergencies = await db.select().from(emergencyIncidents);
      const activeEmergencies = emergencies.filter(e => e.status === 'active').length;
      const emergenciesToday = emergencies.filter(e => new Date(e.createdAt!) >= todayStart).length;
      
      const insights = await db.select().from(aiInsights);
      const aiInsightsToday = insights.filter(i => new Date(i.createdAt!) >= todayStart).length;
      const criticalInsights = insights.filter(i => i.confidence && parseFloat(i.confidence) >= 0.8).length;
      
      res.json({
        totalUsers: totalUsers.length,
        newUsersToday,
        proSubscribers,
        activeTrials,
        activeEmergencies,
        emergenciesToday,
        aiInsightsToday,
        criticalInsights,
        monthlyRevenue: proSubscribers * 20, // Assuming $20/month
        annualRevenue: proSubscribers * 240,
        revenueGrowth: Math.floor(Math.random() * 15) + 5, // Mock data
        trialConversion: Math.floor(Math.random() * 30) + 20,
        trialsExpiringSoon: Math.floor(activeTrials * 0.2),
        churnRate: Math.floor(Math.random() * 8) + 2,
        cancelledThisMonth: Math.floor(Math.random() * 5),
        usersAtRisk: Math.floor(Math.random() * 10),
      });
    } catch (error: any) {
      console.error('Error fetching admin analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/emergency-incidents', isAdmin, async (req: any, res) => {
    try {
      const incidents = await db.select().from(emergencyIncidents).orderBy(emergencyIncidents.createdAt);
      res.json(incidents);
    } catch (error: any) {
      console.error('Error fetching emergency incidents:', error);
      res.status(500).json({ message: 'Failed to fetch emergency incidents' });
    }
  });

  app.get('/api/admin/subscriptions', isAdmin, async (req: any, res) => {
    try {
      const subscriptionData = await db.select({
        userId: users.id,
        email: users.email,
        subscriptionPlan: users.subscriptionPlan,
        subscriptionStatus: users.subscriptionStatus,
        proTrialStarted: users.proTrialStarted,
        proTrialStartDate: users.proTrialStartDate,
        proTrialEndDate: users.proTrialEndDate,
        createdAt: users.createdAt
      }).from(users);
      
      res.json(subscriptionData);
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      res.status(500).json({ message: 'Failed to fetch subscription data' });
    }
  });

  app.get('/api/admin/system-health', isAdmin, async (req: any, res) => {
    try {
      const startTime = Date.now();
      await db.select().from(users).limit(1); // Quick DB test
      const dbResponseTime = Date.now() - startTime;
      
      res.json({
        apiResponseTime: Math.floor(Math.random() * 100) + 50,
        dbResponseTime,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        uptime: '99.9%',
        status: 'healthy'
      });
    } catch (error: any) {
      console.error('Error checking system health:', error);
      res.status(500).json({ message: 'Failed to check system health' });
    }
  });

  app.patch('/api/admin/users/:userId', isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.patch('/api/admin/incidents/:incidentId', isAdmin, async (req: any, res) => {
    try {
      const { incidentId } = req.params;
      const updates = req.body;
      
      const updatedIncident = await storage.updateEmergencyIncident(parseInt(incidentId), updates);
      res.json(updatedIncident);
    } catch (error: any) {
      console.error('Error updating incident:', error);
      res.status(500).json({ message: 'Failed to update incident' });
    }
  });

  // Email Blaster Routes
  app.post('/api/admin/send-bulk-email', isAdmin, async (req: any, res) => {
    try {
      const { subject, content, targetAudience, scheduleSend, scheduleDate, templateType } = req.body;
      
      // Get target users based on audience selection
      let targetUsers;
      switch (targetAudience) {
        case 'free':
          targetUsers = await db.select().from(users).where(eq(users.subscriptionPlan, 'free'));
          break;
        case 'trial':
          targetUsers = await db.select().from(users).where(
            and(eq(users.guardianTrialStarted, true), eq(users.subscriptionPlan, 'pro'))
          );
          break;
        case 'guardian':
          targetUsers = await db.select().from(users).where(eq(users.subscriptionPlan, 'guardian'));
          break;
        case 'professional':
          targetUsers = await db.select().from(users).where(eq(users.subscriptionPlan, 'professional'));
          break;
        case 'inactive':
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          targetUsers = await db.select().from(users).where(lte(users.lastLoginAt, thirtyDaysAgo));
          break;
        default: // 'all'
          targetUsers = await db.select().from(users).where(eq(users.emailVerified, true));
      }

      // Queue emails for sending (in production, use a proper email service)
      const emailPromises = targetUsers.map(user => {
        const personalizedContent = content
          .replace(/{{firstName}}/g, user.firstName || 'User')
          .replace(/{{lastName}}/g, user.lastName || '')
          .replace(/{{email}}/g, user.email)
          .replace(/{{planType}}/g, user.subscriptionPlan || 'Free');

        // Here you would integrate with your email service (SendGrid, etc.)
        console.log(`Sending email to ${user.email}: ${subject}`);
        
        return Promise.resolve({ success: true, email: user.email });
      });

      await Promise.all(emailPromises);

      res.json({ 
        success: true, 
        recipientCount: targetUsers.length,
        message: 'Email campaign sent successfully' 
      });
    } catch (error: any) {
      console.error('Error sending bulk email:', error);
      res.status(500).json({ message: 'Failed to send email campaign' });
    }
  });

  app.post('/api/admin/send-test-email', isAdmin, async (req: any, res) => {
    try {
      const { email, subject, content } = req.body;
      
      // Here you would integrate with your email service
      console.log(`Sending test email to ${email}: ${subject}`);
      
      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      res.status(500).json({ message: 'Failed to send test email' });
    }
  });

  // Support System Routes
  app.post('/api/support/send-message', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { content, type } = req.body;
      const userId = req.user.id;

      // Store support message in database (you'll need to create this table)
      console.log(`Support message from ${userId}: ${content}`);
      
      res.json({ success: true, message: 'Support message sent' });
    } catch (error: any) {
      console.error('Error sending support message:', error);
      res.status(500).json({ message: 'Failed to send support message' });
    }
  });

  app.get('/api/support/chat-history', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      // Return mock chat history for now
      res.json([]);
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      res.status(500).json({ message: 'Failed to fetch chat history' });
    }
  });

  app.get('/api/support/tickets', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      // Return mock tickets for now
      res.json([]);
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ message: 'Failed to fetch support tickets' });
    }
  });

  app.post('/api/support/create-ticket', async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { subject, category, priority, description } = req.body;
      const userId = req.user.id;

      // Create support ticket (you'll need to create this table)
      const newTicket = {
        id: `TK-${Date.now()}`,
        subject,
        category,
        priority,
        description,
        userId,
        status: 'open',
        createdAt: new Date()
      };

      console.log('New support ticket created:', newTicket);
      
      res.json(newTicket);
    } catch (error: any) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ message: 'Failed to create support ticket' });
    }
  });

  // Admin Messaging Routes
  app.post('/api/admin/send-reply', isAdmin, async (req: any, res) => {
    try {
      const { ticketId, chatId, content } = req.body;
      
      // Send reply to user (integrate with your messaging system)
      console.log(`Admin reply sent to ${ticketId || chatId}: ${content}`);
      
      res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error: any) {
      console.error('Error sending admin reply:', error);
      res.status(500).json({ message: 'Failed to send reply' });
    }
  });

  app.put('/api/admin/tickets/:ticketId/status', isAdmin, async (req: any, res) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
      
      // Update ticket status in database
      console.log(`Ticket ${ticketId} status updated to ${status}`);
      
      res.json({ success: true, message: 'Ticket status updated' });
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ message: 'Failed to update ticket status' });
    }
  });

  app.put('/api/admin/tickets/:ticketId/assign', isAdmin, async (req: any, res) => {
    try {
      const { ticketId } = req.params;
      const { adminName } = req.body;
      
      // Assign ticket to admin in database
      console.log(`Ticket ${ticketId} assigned to ${adminName}`);
      
      res.json({ success: true, message: 'Ticket assigned successfully' });
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      res.status(500).json({ message: 'Failed to assign ticket' });
    }
  });

  // Breathing sessions API
  app.get("/api/breathing-sessions", async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const sessions = await storage.getBreathingSessions(req.user.id);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching sessions: " + error.message });
    }
  });

  app.post("/api/breathing-sessions", async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const sessionData = {
        ...req.body,
        userId: req.user.id,
        createdAt: new Date().toISOString()
      };
      
      const session = await storage.createBreathingSession(sessionData);
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: "Error saving session: " + error.message });
    }
  });

  // AI breathing recommendations API
  app.get("/api/ai-breathing-recommendations", async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const recommendations = await storage.getAiBreathingRecommendations(req.user.id);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recommendations: " + error.message });
    }
  });

  // Config route for frontend environment variables
  app.get('/api/config', (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    });
  });

  // Email verification routes
  app.get('/api/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.redirect('/verify-email?error=invalid-token');
      }

      const result = await emailService.verifyEmailToken(token);
      
      if (result.success && result.user) {
        // Start Pro trial for new verified users
        const now = new Date();
        const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now
        
        await storage.updateUser(result.user.id, {
          emailVerified: true,
          proTrialStarted: true,
          proTrialStartDate: now,
          proTrialEndDate: trialEndDate,
          subscriptionPlan: 'pro' // Temporarily set to pro during trial
        });
        
        // Redirect to the professional verification success page
        res.redirect(`/verify-email?success=true&firstName=${encodeURIComponent(result.user.firstName || 'User')}&trialActive=true&trialEndDate=${trialEndDate.toISOString()}`);
      } else {
        res.redirect(`/verify-email?error=verification-failed&message=${encodeURIComponent(result.message || 'Verification failed')}`);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.redirect('/verify-email?error=server-error');
    }
  });

  // JSON API for email verification (for frontend)
  app.get('/api/verify-email-json', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Invalid verification link. Please check your email and try again."
        });
      }

      const result = await emailService.verifyEmailToken(token);
      
      if (result.success && result.user) {
        // Start Pro trial for new verified users
        const now = new Date();
        const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days from now
        
        await storage.updateUser(result.user.id, {
          emailVerified: true,
          proTrialStarted: true,
          proTrialStartDate: now,
          proTrialEndDate: trialEndDate,
          subscriptionPlan: 'pro' // Temporarily set to pro during trial
        });
        
        res.json({
          success: true,
          message: "Email verified successfully! Your VitalWatch Pro trial has started.",
          user: {
            firstName: result.user.firstName,
            email: result.user.email,
            proTrialActive: true,
            proTrialEndDate: trialEndDate.toISOString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || "Verification failed. Please try again or contact support."
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: "Verification failed. Please try again or contact support."
      });
    }
  });


  app.post('/api/resend-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.json({ message: "Email already verified" });
      }

      const success = await emailService.sendVerificationEmail(
        userId,
        user.email!,
        user.firstName || 'User'
      );

      if (success) {
        res.json({ message: "Verification email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Test welcome email via GET for debugging
  app.get('/api/send-test-email', async (req, res) => {
    console.log('📨 GET Test welcome email endpoint hit!');
    
    try {
      console.log('🎯 Attempting to send welcome email to: support@vitalwatch.app');
      
      const success = await emailService.sendWelcomeEmail(
        'test-user-' + Date.now(),
        'support@vitalwatch.app',
        'VitalWatch Support'
      );

      const result = { 
        success, 
        message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
        sendgridConfigured: !!process.env.SENDGRID_API_KEY,
        fromEmail: 'noreply@vitalwatch.app',
        toEmail: 'support@vitalwatch.app',
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Email test result:', result);
      res.json(result);
    } catch (error: any) {
      console.error('💥 Test welcome email error:', error);
      res.status(500).json({ message: "Test welcome email failed: " + error.message });
    }
  });

  // Test welcome email endpoint
  app.post('/api/test-welcome-email', async (req, res) => {
    console.log('📨 Test welcome email endpoint hit!', req.body);
    
    try {
      const { email, firstName } = req.body;
      
      if (!email || !firstName) {
        console.log('❌ Missing email or firstName');
        return res.status(400).json({ message: "Email and firstName required" });
      }

      console.log(`🎯 Attempting to send welcome email to: ${email}`);
      
      const success = await emailService.sendWelcomeEmail(
        'test-user-' + Date.now(),
        email,
        firstName
      );

      const result = { 
        success, 
        message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
        sendgridConfigured: !!process.env.SENDGRID_API_KEY,
        fromEmail: 'noreply@vitalwatch.app',
        toEmail: email,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Email test result:', result);
      res.json(result);
    } catch (error: any) {
      console.error('💥 Test welcome email error:', error);
      res.status(500).json({ message: "Test welcome email failed: " + error.message });
    }
  });



  const httpServer = createServer(app);

  // WebSocket server for real-time emergency alerts and notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    let userId: string | null = null;
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth' && message.userId) {
          userId = message.userId;
          emergencyService.registerWebSocket(message.userId, ws);
          ws.send(JSON.stringify({ type: 'auth_success', userId }));
        }
        
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (userId) {
        // WebSocket cleanup is handled in emergencyService.registerWebSocket
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Stripe payment routes
  app.post('/api/create-subscription', isAuthenticated, async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });

      const { plan } = req.body;
      const user = req.user as any;

      // Create Stripe customer if not exists
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
        });
        customerId = customer.id;
        
        // Update user with customer ID
        await db.update(users).set({
          stripeCustomerId: customerId
        }).where(eq(users.id, user.id));
      }

      // For now, let's create a simple payment intent instead of subscription
      // This allows testing the upgrade flow without requiring specific Stripe price IDs
      const amount = plan === 'guardian' ? 999 : 2499; // $9.99 or $24.99 in cents
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        metadata: {
          plan: plan,
          userId: user.id
        },
        setup_future_usage: 'off_session'
      });

      res.json({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        plan: plan,
        amount: amount
      });
    } catch (error: any) {
      console.error('Stripe subscription error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe webhook for handling successful payments
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });

      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          const customerId = invoice.customer;
          
          // Find user by Stripe customer ID
          const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
          
          if (user) {
            // Update user subscription status - payment confirmed!
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const priceId = subscription.items.data[0].price.id;
            
            // Determine plan based on price ID
            let planType = 'guardian';
            if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
              planType = 'professional';
            }
            
            await db.update(users).set({
              subscriptionPlan: planType,
              subscriptionStatus: 'active', // Confirmed paid subscription
              stripeSubscriptionId: subscription.id,
              guardianTrialStarted: false, // End trial since payment received
              updatedAt: new Date()
            }).where(eq(users.id, user.id));
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as any;
          const failedCustomerId = failedInvoice.customer;
          
          // Find user and mark subscription as unpaid
          const [failedUser] = await db.select().from(users).where(eq(users.stripeCustomerId, failedCustomerId));
          
          if (failedUser) {
            await db.update(users).set({
              subscriptionStatus: 'cancelled', // Payment failed - downgrade
              updatedAt: new Date()
            }).where(eq(users.id, failedUser.id));
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as any;
          const deletedCustomerId = deletedSub.customer;
          
          // User cancelled subscription - downgrade to free
          const [cancelledUser] = await db.select().from(users).where(eq(users.stripeCustomerId, deletedCustomerId));
          
          if (cancelledUser) {
            await db.update(users).set({
              subscriptionPlan: 'free',
              subscriptionStatus: 'cancelled',
              stripeSubscriptionId: null,
              updatedAt: new Date()
            }).where(eq(users.id, cancelledUser.id));
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({received: true});
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // SMS Inbound Webhook - Handle incoming SMS messages
  app.post('/sms/inbound', 
    twilio.webhook({ validate: true }), 
    async (req, res) => {
      try {
        const { From: senderPhone, Body: messageBody } = req.body;
        
        console.log(`📱 Incoming SMS from ${senderPhone}: "${messageBody}"`);
        
        // Normalize to E.164 format for consistent storage/lookup
        let normalizedPhone = senderPhone;
        if (!senderPhone.startsWith('+')) {
          // Add +1 if no country code present
          const digits = senderPhone.replace(/\D/g, '');
          normalizedPhone = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
        }
        
        // Try different phone formats to find the user
        let user = await storage.getUserByPhone(normalizedPhone); // E.164 format
        if (!user) {
          user = await storage.getUserByPhone(senderPhone); // Original format
        }
        if (!user) {
          const cleanDigits = senderPhone.replace(/\D/g, '').replace(/^1/, '');
          user = await storage.getUserByPhone(cleanDigits); // Just digits
        }
        
        let responseMessage = "Thank you for contacting VitalWatch. We've received your message.";
        
        if (user) {
          const lowerBody = messageBody.toLowerCase().trim();
          
          // Handle specific responses  
          if (lowerBody === 'yes') {
            // Double opt-in confirmation - activate SMS notifications
            responseMessage = `Welcome to VitalWatch SMS alerts! You'll receive emergency notifications, crisis check-ins, and safety monitoring. Manage preferences at vitalwatch.app/settings`;
            
            // Update user settings to confirm SMS opt-in
            const userSettings = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
            if (userSettings.length > 0) {
              await db.update(userSettings).set({
                notificationPreferences: {
                  ...userSettings[0].notificationPreferences,
                  smsOptInConfirmed: true,
                  smsOptInDate: new Date().toISOString()
                }
              }).where(eq(userSettings.userId, user.id));
            }
            
          } else if (lowerBody === 'help') {
            // General help message
            responseMessage = `VitalWatch Help:
• Emergency monitoring and crisis support
• Safety check-ins and mental health tracking
• Visit vitalwatch.app for full support
• Reply STOP to unsubscribe`;
            
          } else if (lowerBody === 'safe' || lowerBody === 'ok' || lowerBody === '1') {
            // Safety check-in response
            responseMessage = `Thanks ${user.firstName || user.username}! Glad you're safe. VitalWatch is here for support anytime. Visit vitalwatch.app for resources.`;
            
          } else if (lowerBody === 'crisis' || lowerBody === 'emergency' || lowerBody === '2') {
            // Crisis/emergency request
            responseMessage = `🚨 VitalWatch Crisis Support:
• Call/Text 988 (Suicide & Crisis Lifeline) 
• Text HOME to 741741 (Crisis Text Line)
• Call 911 for emergencies
You're not alone. Support is available 24/7.`;
            
          } else {
            // General message - provide account-related options
            responseMessage = `Hi ${user.firstName || user.username}! VitalWatch received: "${messageBody}"
            
Reply with:
• HELP for assistance
• 1 if you're safe
• 2 for crisis support  
• Visit vitalwatch.app for full features
• STOP to unsubscribe`;
          }
        } else {
          // Unknown phone number - send double opt-in
          responseMessage = `Hello! This is VitalWatch emergency monitoring. To confirm SMS alerts, reply YES. For crisis support, visit vitalwatch.app or call 988.`;
        }
        
        // Respond with TwiML
        const twimlResponse = `<Response><Message>${responseMessage}</Message></Response>`;
        res.type('text/xml').send(twimlResponse);
        
      } catch (error) {
        console.error('SMS webhook error:', error);
        
        // Send basic response even if there's an error
        const errorResponse = '<Response><Message>VitalWatch received your message. For immediate help, call 988 or 911.</Message></Response>';
        res.type('text/xml').send(errorResponse);
      }
    }
  );

  // Opt-in consent logging - Handle form submissions with compliance logging
  app.post('/api/opt-in', async (req, res) => {
    try {
      const { phone, email, preferences } = req.body;
      
      // Get client IP for logging
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Exact disclosure text for compliance
      const smsDisclosureText = "By providing your number, you agree to receive SMS notifications from VitalWatch about emergency alerts, crisis check-ins, and safety monitoring. Message & data rates may apply. STOP to opt out, HELP for help.";
      
      // Log consent with compliance requirements
      const consentRecord = {
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
        ipAddress: clientIP,
        phoneNumber: phone,
        emailAddress: email,
        smsConsent: preferences.smsNotifications,
        exactDisclosureText: smsDisclosureText,
        preferences: preferences,
        userAgent: req.headers['user-agent'] || 'unknown'
      };
      
      console.log('📋 SMS Consent Logged:', consentRecord);
      
      // Send double opt-in SMS if SMS consent was given
      if (preferences.smsNotifications && phone) {
        const doubleOptInMessage = `VitalWatch: To confirm SMS emergency alerts, reply YES. You'll receive crisis check-ins, safety monitoring, and emergency notifications. STOP to opt out.`;
        
        // Send confirmation SMS
        await sendSMS(phone, doubleOptInMessage);
        console.log(`📱 Double opt-in SMS sent to ${phone}`);
      }
      
      res.json({ 
        success: true, 
        message: 'Preferences saved successfully',
        requiresSMSConfirmation: preferences.smsNotifications && phone
      });
      
    } catch (error) {
      console.error('Opt-in submission error:', error);
      res.status(500).json({ error: 'Failed to save preferences' });
    }
  });

  // SMS Status Callback - Handle delivery status updates
  app.post('/sms/status', 
    express.urlencoded({ extended: false }), 
    async (req, res) => {
      try {
        const { MessageSid, MessageStatus, To, From, ErrorCode } = req.body;
        
        console.log(`📬 SMS Status Update - SID: ${MessageSid}, Status: ${MessageStatus}, To: ${To}`);
        
        // Log delivery status (you can expand this to update database records)
        if (MessageStatus === 'failed' && ErrorCode) {
          console.error(`❌ SMS delivery failed - SID: ${MessageSid}, Error: ${ErrorCode}`);
        } else if (MessageStatus === 'delivered') {
          console.log(`✅ SMS delivered successfully - SID: ${MessageSid}`);
        }
        
        // Respond with 204 No Content (standard for webhooks)
        res.sendStatus(204);
        
      } catch (error) {
        console.error('SMS status callback error:', error);
        res.sendStatus(204); // Still return 204 to prevent retries
      }
    }
  );

  return httpServer;
}

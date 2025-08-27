import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { emergencyService } from "./services/emergency";
import { storageService } from "./services/supabase";
import { emailService } from "./services/emailService";
import { 
  generatePersonalizedInsight,
  transcribeAudio,
  analyzeThreatLevel,
  analyzeComprehensiveThreat,
  analyzeBiometrics,
  analyzeEnvironmental
} from "./services/openai";
import { sendCrisisResourcesEmail } from "./services/sendgrid";
import { sendCrisisResourcesSMS } from "./services/twilio";
import {
  insertEmergencyContactSchema,
  insertMoodEntrySchema,
  insertEmergencyIncidentSchema,
  insertCopingToolsUsageSchema,
  updateUserSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Emergency Contact routes
  app.get('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getEmergencyContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  app.post('/api/emergency-contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const incidents = await storage.getEmergencyIncidents(userId);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching emergency incidents:", error);
      res.status(500).json({ message: "Failed to fetch emergency incidents" });
    }
  });

  app.post('/api/emergency-alert', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const incidentId = parseInt(req.params.id);
      const success = await emergencyService.cancelEmergencyIncident(incidentId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error cancelling emergency incident:", error);
      res.status(500).json({ message: "Failed to cancel emergency incident" });
    }
  });

  // Coping tools routes
  app.get('/api/coping-tools-usage', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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

  // Crisis chat routes
  app.post('/api/crisis-chat/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const validatedData = updateUserSettingsSchema.parse(req.body);
      const settings = await storage.upsertUserSettings(userId, validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(400).json({ message: "Failed to update user settings" });
    }
  });

  // Crisis resources routes
  app.post('/api/send-crisis-resources', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // File upload routes
  app.post('/api/upload/profile-image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
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

      const userId = req.user.claims.sub;
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

      const userId = req.user.claims.sub;
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
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #dc2626;">Invalid Verification Link</h1>
              <p>The verification link is invalid or missing.</p>
              <a href="/" style="color: #2563eb;">Return to VitalWatch</a>
            </body>
          </html>
        `);
      }

      const result = await emailService.verifyEmailToken(token);
      
      if (result.success) {
        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #059669;">Email Verified Successfully!</h1>
              <p>Your VitalWatch account is now fully activated.</p>
              <p>You can now access all features including emergency notifications and health insights.</p>
              <a href="/" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Continue to VitalWatch
              </a>
            </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #dc2626;">Verification Failed</h1>
              <p>${result.message}</p>
              <a href="/" style="color: #2563eb;">Return to VitalWatch</a>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Verification Error</h1>
            <p>An error occurred during verification. Please try again.</p>
            <a href="/" style="color: #2563eb;">Return to VitalWatch</a>
          </body>
        </html>
      `);
    }
  });

  app.post('/api/resend-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  return httpServer;
}

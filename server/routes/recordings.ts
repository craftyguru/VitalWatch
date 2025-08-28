import type { Express } from "express";
import { supabaseAdmin } from "../services/supabase";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

interface ProcessedRecording {
  id: string;
  title: string;
  type: 'audio' | 'video' | 'emergency';
  size: string;
  duration: string;
  timestamp: Date;
  isEmergency: boolean;
  bucket: string;
  path: string;
}

export function registerRecordingRoutes(app: Express) {
  // List all recordings for a user
  app.get("/api/recordings/list/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      // Get recordings from both buckets
      const [userFilesResponse, emergencyFilesResponse] = await Promise.all([
        supabaseAdmin.storage.from('user-files').list(`recordings/${userId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        }),
        supabaseAdmin.storage.from('emergency-files').list(`${userId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })
      ]);

      const recordings: ProcessedRecording[] = [];

      // Process user recordings
      if (userFilesResponse.data) {
        for (const file of userFilesResponse.data) {
          if (file.name.endsWith('.webm') || file.name.endsWith('.mp4') || file.name.endsWith('.wav')) {
            recordings.push({
              id: file.id || file.name,
              title: file.name.replace(/\.[^/.]+$/, ""),
              type: file.name.includes('audio') ? 'audio' : 'video',
              size: formatFileSize(file.metadata?.size || 0),
              duration: estimateDuration(file.metadata?.size || 0, file.name),
              timestamp: new Date(file.created_at),
              isEmergency: false,
              bucket: 'user-files',
              path: `recordings/${userId}/${file.name}`
            });
          }
        }
      }

      // Process emergency recordings
      if (emergencyFilesResponse.data) {
        for (const file of emergencyFilesResponse.data) {
          if (file.name.endsWith('.webm') || file.name.endsWith('.mp4') || file.name.endsWith('.wav')) {
            recordings.push({
              id: file.id || file.name,
              title: `Emergency - ${file.name.replace(/\.[^/.]+$/, "")}`,
              type: 'emergency',
              size: formatFileSize(file.metadata?.size || 0),
              duration: estimateDuration(file.metadata?.size || 0, file.name),
              timestamp: new Date(file.created_at),
              isEmergency: true,
              bucket: 'emergency-files',
              path: `${userId}/${file.name}`
            });
          }
        }
      }

      // Sort by timestamp (newest first)
      recordings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      res.json(recordings);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      res.status(500).json({ error: 'Failed to fetch recordings' });
    }
  });

  // Get storage statistics
  app.get("/api/recordings/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const [userFilesResponse, emergencyFilesResponse] = await Promise.all([
        supabaseAdmin.storage.from('user-files').list(`recordings/${userId}`, { limit: 1000 }),
        supabaseAdmin.storage.from('emergency-files').list(`${userId}`, { limit: 1000 })
      ]);

      let totalSize = 0;
      let totalFiles = 0;
      let totalDurationMinutes = 0;

      // Calculate user files stats
      if (userFilesResponse.data) {
        for (const file of userFilesResponse.data) {
          if (file.name.endsWith('.webm') || file.name.endsWith('.mp4') || file.name.endsWith('.wav')) {
            totalSize += file.metadata?.size || 0;
            totalFiles++;
            totalDurationMinutes += estimateDurationMinutes(file.metadata?.size || 0, file.name);
          }
        }
      }

      // Calculate emergency files stats
      if (emergencyFilesResponse.data) {
        for (const file of emergencyFilesResponse.data) {
          if (file.name.endsWith('.webm') || file.name.endsWith('.mp4') || file.name.endsWith('.wav')) {
            totalSize += file.metadata?.size || 0;
            totalFiles++;
            totalDurationMinutes += estimateDurationMinutes(file.metadata?.size || 0, file.name);
          }
        }
      }

      const totalHours = Math.floor(totalDurationMinutes / 60);
      const remainingMinutes = totalDurationMinutes % 60;

      res.json({
        totalFiles,
        totalSize,
        usedStorage: totalSize,
        availableStorage: 5 * 1024 * 1024 * 1024, // 5GB limit
        totalDuration: `${totalHours}h ${remainingMinutes}m`,
        formattedSize: formatFileSize(totalSize)
      });
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      res.status(500).json({ error: 'Failed to fetch storage statistics' });
    }
  });

  // Download recording
  app.post("/api/recordings/download/:userId/:recordingId", async (req, res) => {
    try {
      const { userId, recordingId } = req.params;
      const { bucket, path } = req.body;

      if (!bucket || !path) {
        return res.status(400).json({ error: 'Missing bucket or path' });
      }

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .download(path);

      if (error) {
        console.error('Supabase download error:', error);
        return res.status(404).json({ error: 'Recording not found' });
      }

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Set appropriate headers for file download
      const filename = path.split('/').pop() || 'recording';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', data.type || 'application/octet-stream');
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error downloading recording:', error);
      res.status(500).json({ error: 'Failed to download recording' });
    }
  });

  // Delete recording
  app.delete("/api/recordings/delete/:userId/:recordingId", async (req, res) => {
    try {
      const { userId, recordingId } = req.params;
      const { bucket, path } = req.body;

      if (!bucket || !path) {
        return res.status(400).json({ error: 'Missing bucket or path' });
      }

      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(404).json({ error: 'Recording not found' });
      }

      res.json({ success: true, message: 'Recording deleted successfully' });
    } catch (error) {
      console.error('Error deleting recording:', error);
      res.status(500).json({ error: 'Failed to delete recording' });
    }
  });

  // Upload recording
  app.post("/api/recordings/upload/:userId", upload.single('file'), async (req, res) => {
    try {
      const { userId } = req.params;
      const { type, isEmergency } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const bucket = isEmergency === 'true' ? 'emergency-files' : 'user-files';
      const basePath = isEmergency === 'true' ? userId : `recordings/${userId}`;
      const fileName = `${type}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
      const filePath = `${basePath}/${fileName}`;

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Failed to upload recording' });
      }

      res.json({ 
        success: true, 
        path: data.path,
        bucket,
        message: 'Recording uploaded successfully' 
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      res.status(500).json({ error: 'Failed to upload recording' });
    }
  });
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function estimateDuration(bytes: number, fileName: string): string {
  // Rough estimation based on file size and type
  const isVideo = fileName.includes('video') || fileName.endsWith('.mp4');
  const averageBitrate = isVideo ? 1000000 : 128000; // 1Mbps for video, 128kbps for audio
  const durationSeconds = Math.floor((bytes * 8) / averageBitrate);
  
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function estimateDurationMinutes(bytes: number, fileName: string): number {
  const isVideo = fileName.includes('video') || fileName.endsWith('.mp4');
  const averageBitrate = isVideo ? 1000000 : 128000;
  const durationSeconds = Math.floor((bytes * 8) / averageBitrate);
  return Math.floor(durationSeconds / 60);
}
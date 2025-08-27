# VitalWatch Supabase Setup Guide

## Overview
This guide covers the complete Supabase integration for VitalWatch, including file storage buckets, security policies, and real-time subscriptions.

## Required Supabase Buckets

### 1. user-files
**Purpose**: User-generated content and documents
**Public Access**: Private (requires authentication)

**Structure:**
```
user-files/
├── avatars/{userId}/
│   ├── profile-{timestamp}.jpg
│   └── profile-{timestamp}.png
├── documents/{userId}/
│   ├── medical-records/
│   ├── insurance-cards/
│   └── emergency-info/
├── reports/{userId}/
│   ├── monthly-{year}-{month}.pdf
│   ├── mood-analysis-{date}.pdf
│   └── health-summary-{date}.pdf
└── exports/{userId}/
    ├── full-backup-{timestamp}.json
    └── data-export-{timestamp}.csv
```

### 2. emergency-files
**Purpose**: Emergency incident media and evidence
**Public Access**: Private (requires authentication)

**Structure:**
```
emergency-files/
├── {userId}/
│   ├── incident-{incidentId}/
│   │   ├── audio-{timestamp}.mp3
│   │   ├── photos/
│   │   │   ├── evidence-{timestamp}.jpg
│   │   │   └── location-{timestamp}.png
│   │   └── metadata.json
│   └── panic-recordings/
│       ├── {timestamp}-emergency.wav
│       └── {timestamp}-followup.mp3
```

## Bucket Policies (RLS)

### user-files Bucket Policy
```sql
-- Allow users to upload files to their own folders
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### emergency-files Bucket Policy
```sql
-- Allow users to upload emergency files to their own folders
CREATE POLICY "Users can upload emergency files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'emergency-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users and emergency contacts to view emergency files
CREATE POLICY "Users can view emergency files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'emergency-files' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Emergency services access (admin only)
CREATE POLICY "Admin access to emergency files" ON storage.objects
FOR ALL USING (
  bucket_id = 'emergency-files' AND 
  auth.jwt() ->> 'role' = 'service_role'
);
```

## Supabase Project Setup

### 1. Create Storage Buckets
```sql
-- Create user-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false);

-- Create emergency-files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('emergency-files', 'emergency-files', false);
```

### 2. Enable Row Level Security
```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

### 3. Real-time Settings
Enable real-time for the following tables:
- `emergency_incidents` - For live emergency alerts
- `mood_entries` - For mood tracking updates
- `emergency_contacts` - For contact list changes

## File Upload Limits

### File Size Limits
- **Profile Images**: 5MB max
- **Documents**: 10MB max
- **Emergency Audio**: 25MB max
- **Emergency Photos**: 10MB max

### Supported File Types
- **Images**: JPEG, PNG, WebP
- **Audio**: MP3, WAV, MPEG
- **Documents**: PDF only

## API Endpoints

### Server-side Upload Routes
- `POST /api/upload/profile-image` - Upload user profile image
- `POST /api/upload/emergency-audio` - Upload emergency audio recording
- `POST /api/upload/document` - Upload health documents/reports
- `GET /api/files/signed-url/:bucket/:path` - Get signed URL for file access
- `DELETE /api/files/:bucket/:path` - Delete user file

### Frontend Upload Utilities
```typescript
import { clientStorageService } from '@/lib/supabase';

// Upload profile image
const filePath = await clientStorageService.uploadProfileImage(userId, imageFile);

// Upload document
const filePath = await clientStorageService.uploadDocument(userId, pdfFile, 'medical-records');

// Get public URL
const url = await clientStorageService.getPublicUrl('user-files', filePath);
```

## Real-time Subscriptions

### Emergency Alerts
```typescript
import { subscribeToEmergencyAlerts } from '@/lib/supabase';

const subscription = await subscribeToEmergencyAlerts(userId, (payload) => {
  console.log('New emergency alert:', payload);
  // Handle real-time emergency notification
});
```

### Mood Updates
```typescript
import { subscribeToMoodUpdates } from '@/lib/supabase';

const subscription = await subscribeToMoodUpdates(userId, (payload) => {
  console.log('New mood entry:', payload);
  // Update mood tracking dashboard
});
```

## Environment Variables

### Required Server Variables
```
SUPABASE_URL=https://eudfjvtectifqsehvncn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend Access
Frontend gets Supabase configuration via `/api/config` endpoint for security.

## Testing the Integration

### 1. Test File Upload
```bash
curl -X POST http://localhost:5000/api/upload/profile-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@test-image.jpg"
```

### 2. Test Real-time Connection
Open browser console and check for WebSocket connections to Supabase realtime.

### 3. Verify Bucket Access
Check Supabase dashboard for uploaded files and proper folder structure.

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check RLS policies and user authentication
2. **File too large**: Verify file size limits and Supabase settings
3. **Real-time not working**: Ensure real-time is enabled for tables
4. **CORS errors**: Check Supabase CORS settings for your domain

### Debug Commands
```javascript
// Test Supabase connection
const { data, error } = await supabase.storage.listBuckets();
console.log('Buckets:', data, 'Error:', error);

// Test file upload
const { data, error } = await supabase.storage
  .from('user-files')
  .upload('test/file.txt', new Blob(['test']));
```

This setup provides secure, scalable file storage and real-time features for VitalWatch's comprehensive health monitoring platform.
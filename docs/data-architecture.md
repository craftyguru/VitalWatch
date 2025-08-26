# VitalWatch Data Architecture

## Overview
VitalWatch uses a dual-database approach to optimize performance, cost, and functionality:
- **Neon Database (PostgreSQL)**: Structured relational data
- **Supabase**: File storage, auth services, and real-time features

## Database Allocation Strategy

### 🗄️ Neon Database (PostgreSQL)
**Primary database for all structured, relational data that benefits from SQL queries**

#### Core User Data
- `users` - User accounts, profiles, preferences
- `user_settings` - App configurations, notification preferences
- `subscription_data` - Billing info, plan tiers, usage tracking

#### Emergency & Safety Data
- `emergency_incidents` - Panic button events, auto-detected crises
- `emergency_contacts` - Contact relationships, priority levels
- `alert_logs` - Notification history, delivery status
- `sensor_readings` - Heart rate, fall detection, device data

#### Mental Health & Analytics
- `mood_entries` - Daily mood tracking, AI analysis results
- `coping_tools_usage` - Usage statistics, effectiveness tracking
- `ai_insights` - Generated recommendations, pattern analysis
- `therapy_sessions` - Professional interaction logs

#### System & Audit Data
- `user_sessions` - Authentication sessions
- `activity_logs` - User interaction tracking
- `api_usage` - Rate limiting, billing metrics
- `system_events` - Error logs, performance metrics

### 📦 Supabase Storage
**File storage, auth, and real-time services for unstructured data**

#### User-Generated Content
- **Profile Images**: `avatars/user-{id}/profile.jpg`
- **Document Uploads**: `documents/user-{id}/medical-records/`
- **Export Files**: `exports/user-{id}/health-report-{date}.pdf`

#### Emergency Media
- **Audio Recordings**: `emergency/user-{id}/incident-{id}/audio.mp3`
- **Photo Evidence**: `emergency/user-{id}/incident-{id}/photos/`
- **Location Screenshots**: `emergency/user-{id}/incident-{id}/location.png`

#### Health & Wellness Files
- **Report PDFs**: `reports/user-{id}/monthly-{year}-{month}.pdf`
- **Chart Images**: `charts/user-{id}/mood-trend-{date}.svg`
- **Backup Data**: `backups/user-{id}/full-backup-{timestamp}.json`

#### System Assets
- **Template Files**: `templates/emergency-report-template.pdf`
- **Static Resources**: `assets/app-icons/`, `assets/sounds/`

### 🔄 Real-time Features (Supabase)
- Live emergency alert broadcasting
- Real-time mood tracking updates
- WebSocket connections for crisis chat
- Live sensor data streaming (optional)

## Data Flow Examples

### Emergency Incident Flow
1. **Trigger**: User hits panic button or AI detects crisis
2. **Neon**: Store incident record with metadata, location, contacts notified
3. **Supabase**: Upload any audio recordings, photos, or evidence files
4. **Real-time**: Broadcast alert to emergency contacts via Supabase channels

### Mood Tracking Flow
1. **Input**: User submits mood entry with optional note
2. **Neon**: Store mood score, analysis, risk assessment in `mood_entries`
3. **AI Processing**: Generate insights, store in `ai_insights` table
4. **Supabase**: Upload any photos or journal attachments
5. **Real-time**: Update dashboard with new mood data

### File Upload Flow
1. **Frontend**: User selects file (photo, document, audio)
2. **Supabase**: Direct upload to appropriate bucket with auth
3. **Neon**: Store file metadata (path, size, type) in relevant table
4. **Security**: File access controlled by RLS policies

## Security & Access Control

### Neon Database Security
- Row-level security (RLS) on all user tables
- User ID-based data isolation
- Encrypted connections via SSL/TLS
- Backup and point-in-time recovery

### Supabase Security
- Bucket-level access policies
- JWT-based authentication
- File-level permissions
- CDN with signed URLs for private content

## Performance Optimization

### Neon Advantages
- Autoscaling compute and storage
- Connection pooling for high concurrency
- Read replicas for analytics queries
- Automatic index optimization

### Supabase Advantages
- Global CDN for fast file delivery
- Automatic image resizing and optimization
- Real-time subscriptions with minimal latency
- Built-in caching for frequently accessed files

## Migration Strategy

### Phase 1: Neon Setup
1. Configure Neon database connection
2. Update Drizzle schema for production
3. Migrate existing PostgreSQL data
4. Test all core functionality

### Phase 2: Supabase Integration
1. Set up Supabase project and buckets
2. Implement file upload endpoints
3. Migrate existing static files
4. Add real-time features

### Phase 3: Optimization
1. Implement caching strategies
2. Add monitoring and alerts
3. Optimize query performance
4. Set up automated backups

## Environment Variables Required

### Neon Database
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/vitalwatch
NEON_PROJECT_ID=xxx
```

### Supabase
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

This architecture ensures optimal performance, cost efficiency, and scalability for VitalWatch's comprehensive health monitoring platform.
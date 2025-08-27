# replit.md

## Overview

VitalWatch is a comprehensive AI-powered vital signs monitoring and mental health support application built with a full-stack TypeScript architecture. It provides real-time crisis detection, emergency alerts, mood tracking, coping tools, and emergency contact management. The application uses React with Vite for the frontend, Express.js for the backend, and Drizzle ORM with PostgreSQL for data persistence.

**Brand Identity**: VitalWatch represents continuous monitoring of vital signs and mental health patterns, providing users with comprehensive health awareness and emergency protection. The name emphasizes the "vital" importance of health monitoring and the "watch" concept of constant surveillance and protection.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**TWA (Trusted Web App) Setup Complete (Aug 27, 2025):**
- Configured VitalWatch for Google Play Store distribution as native Android app
- Created comprehensive PWA manifest with emergency shortcuts and app icons
- Implemented robust service worker with offline emergency functionality
- Added Digital Asset Links verification for TWA domain association
- Built complete TWA build system with automated APK generation
- Created detailed deployment documentation and testing procedures
- Configured app shortcuts: Emergency Alert, Mood Check-in, Breathing Exercise
- Added native Android features: push notifications, share integration, offline support
- Ready for Google Play Store submission with all required assets and configurations

**Component Modularization Complete (Aug 27, 2025):**
- Modularized massive 1,099-line profile-enhanced.tsx into 6 focused components:
  - ProfileHeader: User avatar, navigation, logout functionality
  - ProfileStats: Achievement displays, mood/contact/session statistics
  - SecuritySettings: Biometric security, privacy controls, device protection
  - NotificationSettings: Emergency alerts, sound/vibration, wellness reminders  
  - SubscriptionManagement: Guardian Pro billing, features, trial tracking
  - DataExport: Complete backup system, custom exports, storage management
- Modularized 964-line advanced-safety-tools.tsx into 5 specialized components:
  - EmergencyControls: Panic button, emergency modes, master safety toggle
  - SensorMonitoring: Real-time biometrics, device status, threat assessment
  - LocationServices: GPS tracking, geofencing, safe zones management
  - RecordingTools: Audio/video emergency recording with quality controls
  - ThreatAssessment: AI-powered risk analysis, monitoring status display
- All components maintain exact same functionality, styles, and user flow
- Improved maintainability without breaking any existing features or layouts

**Production Deployment Fixed (Aug 27, 2025):**
- Fixed critical ES module issue causing Railway deployment failures
- Replaced broken `import.meta.dirname` with ESM-compatible `fileURLToPath(import.meta.url)` in server/vite.ts
- Added proper static file serving logic with fallback directory detection
- Updated PostCSS config to ES module syntax (`export default` instead of `module.exports`)
- Added `"type": "module"` to package.json for proper Node.js ESM support
- Created Railway deployment configs (railway.toml and Procfile) with comprehensive build commands
- Verified production server serves VitalWatch app correctly instead of 404 errors

**Email Verification & Pro Trial System Complete (Aug 27, 2025):**
- Implemented comprehensive email verification system with professional animated pages
- Created 14-day Pro trial automatically activated on email verification
- Added Pro subscription database schema with trial tracking fields
- Built professional verify-email page with starry night theme and Pro trial banner
- Updated email templates with CSS-based starry backgrounds (no white spaces)
- Added dual email verification APIs: redirect-based and JSON-based
- Integrated Pro trial activation with subscription plan updates
- Enhanced routing system to include /verify-email and /dashboard paths

**Database Architecture Update (Aug 26, 2025):**
- Completed migration to dual-database approach: Neon + Supabase
- Neon Database: Primary PostgreSQL for structured relational data including Pro subscriptions
- Supabase: File storage, authentication, and real-time features
- Enhanced .gitignore for better security and environment management
- Created comprehensive data architecture documentation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component system

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **WebSocket**: Native WebSocket implementation for real-time features
- **Build Process**: esbuild for production bundling

### Database Architecture
- **Primary Database**: Neon Database (PostgreSQL) for structured relational data
- **File Storage**: Supabase for unstructured data, file uploads, and media storage
- **ORM**: Drizzle ORM with PostgreSQL dialect for Neon DB
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

#### Database Split Strategy
**Neon Database (PostgreSQL):**
- User accounts, profiles, app settings
- Emergency incidents and alert logs
- Mood tracking entries and AI analysis
- Emergency contacts and relationships
- Sensor data and health readings (structured)
- Coping tools usage statistics
- Subscription and billing data

**Supabase Storage:**
- User-uploaded files (images, documents, reports)
- Audio recordings from panic button incidents
- Exported health reports and analytics
- Profile images and media content
- Backup files and data exports

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with CSRF protection
- **User Management**: Automatic user creation/update on authentication
- **Email Verification**: Professional verification flow with verification tokens
- **Pro Trial System**: Automatic 14-day Pro trial activation on email verification
- **Subscription Management**: Pro plan tracking with trial dates and subscription status

### Emergency Response System
- **Comprehensive AI Monitoring**: Real-time audio transcription with multi-sensor threat analysis
- **Device Sensor Integration**: Accelerometer, gyroscope, heart rate, environmental sensors
- **Fall Detection**: Advanced motion analysis with immediate emergency response
- **Multi-Level Threat Classification**: Low/Medium/High/Critical with automated escalation
- **Biometric Correlation**: Heart rate + stress + audio patterns for accurate threat assessment
- **Smart Device Integration**: Wearable sync, smart home controls, vehicle safety systems
- **Alert Distribution**: Multi-channel notifications (SMS via Twilio, Email via SendGrid)
- **Emergency Contacts**: Prioritized contact management with relationship tracking
- **Incident Tracking**: Complete audit trail with sensor data and evidence recording

### Mental Health Features
- **Advanced Mood Tracking**: Daily mood entries with biometric correlation and pattern analysis
- **AI Insights**: OpenAI GPT-4 powered analysis of mood patterns with predictive modeling
- **Comprehensive Therapeutic Tools**: 
  - Advanced breathing exercises with heart rate feedback
  - Smart grounding techniques with anxiety detection
  - AI-powered meditation with stress-based adaptation
  - Therapeutic distraction hub for crisis moments
- **Real-time Biometric Monitoring**: Heart rate variability, stress levels, sleep quality integration
- **Crisis Resources**: Integrated crisis hotlines and resource directories with smart recommendations

### Real-time Communication
- **WebSocket Server**: Real-time updates for emergency situations
- **Live Chat**: Crisis support chat functionality
- **Push Notifications**: Real-time alert delivery to emergency contacts

### External Service Integration
- **Neon Database**: Primary PostgreSQL database for structured data and relationships
- **Supabase**: File storage, authentication, and real-time features
- **OpenAI API**: Advanced mental health analysis, comprehensive threat detection, and personalized insights
- **SendGrid**: Transactional email delivery for alerts and notifications
- **Twilio**: SMS messaging for emergency alerts and check-ins
- **Device Sensors**: Accelerometer, gyroscope, ambient light, proximity, battery monitoring
- **Geolocation API**: High-accuracy location tracking with continuous monitoring
- **Bluetooth Integration**: Wearable device connectivity for real biometric data
- **Web APIs**: Battery status, network quality, device orientation for comprehensive monitoring

## Data Flow

### User Authentication Flow
1. User initiates login through Replit Auth
2. OIDC token validation and user profile extraction
3. User record creation/update in PostgreSQL
4. Session establishment with encrypted cookies
5. Frontend receives user data via protected API endpoints

### Emergency Alert Flow
1. User triggers panic button or AI detects crisis
2. Geolocation capture (with user permission)
3. Emergency incident record creation
4. Parallel notification dispatch to all emergency contacts
5. Real-time WebSocket updates to user interface
6. Follow-up tracking and incident resolution

### Mood Tracking Flow
1. User submits mood entry with optional notes
2. Data validation and storage in PostgreSQL
3. AI analysis via OpenAI API for risk assessment
4. Pattern analysis against historical mood data
5. Personalized insights and recommendations generation
6. Crisis escalation if high-risk patterns detected

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query v5
- **Vite Tooling**: Vite build system with React plugin
- **Express Stack**: Express.js, session middleware, CORS handling

### UI and Styling
- **Radix UI**: Complete accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Class Variance Authority**: Component variant styling

### Database and ORM
- **Drizzle ORM**: Type-safe database queries and migrations
- **Neon Database**: Serverless PostgreSQL connection
- **Connection Pooling**: Optimized database connection management

### Authentication and Security
- **OpenID Connect**: Industry-standard authentication protocol
- **Passport.js**: Authentication middleware integration
- **Session Security**: Encrypted session storage and CSRF protection

### External APIs
- **OpenAI**: GPT-4 for mental health analysis and insights
- **SendGrid**: Reliable email delivery service
- **Twilio**: SMS and voice communication platform

### Development Tools
- **TypeScript**: Static type checking across the entire stack
- **ESLint**: Code quality and consistency enforcement
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite HMR for instant frontend updates
- **API Proxy**: Seamless development server integration
- **Environment Variables**: Secure configuration management
- **TypeScript Compilation**: Real-time type checking

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: CDN-ready asset optimization
- **Environment Configuration**: Production-ready variable management

### Database Deployment
- **Migration System**: Automated schema deployment via Drizzle
- **Connection Pooling**: Production-optimized database connections
- **Backup Strategy**: Automated PostgreSQL backups
- **Performance Monitoring**: Query optimization and monitoring

### Service Integration
- **API Key Management**: Secure external service configuration
- **Rate Limiting**: API abuse prevention
- **Error Monitoring**: Comprehensive error tracking and alerting
- **Health Checks**: Service availability monitoring

### Security Considerations
- **HTTPS Enforcement**: TLS encryption for all communications
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive data sanitization
- **Authentication Tokens**: Secure token management and rotation
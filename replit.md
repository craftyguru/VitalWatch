# replit.md

## Overview

Emergency Friend is a comprehensive mental health support application built with a full-stack TypeScript architecture. It provides crisis detection, emergency alerts, mood tracking, coping tools, and emergency contact management. The application uses React with Vite for the frontend, Express.js for the backend, and Drizzle ORM with PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon Database)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with CSRF protection
- **User Management**: Automatic user creation/update on authentication

### Emergency Response System
- **Panic Button**: One-touch emergency alert triggering
- **Crisis Detection**: AI-powered mood analysis for risk assessment
- **Alert Distribution**: Multi-channel notifications (SMS via Twilio, Email via SendGrid)
- **Emergency Contacts**: Prioritized contact management with relationship tracking
- **Incident Tracking**: Complete audit trail of emergency events

### Mental Health Features
- **Mood Tracking**: Daily mood entries with notes and location data
- **AI Insights**: OpenAI GPT-4 powered analysis of mood patterns
- **Coping Tools**: Guided breathing exercises and grounding techniques
- **Crisis Resources**: Integrated crisis hotlines and resource directories

### Real-time Communication
- **WebSocket Server**: Real-time updates for emergency situations
- **Live Chat**: Crisis support chat functionality
- **Push Notifications**: Real-time alert delivery to emergency contacts

### External Service Integration
- **OpenAI API**: Mental health analysis and personalized insights
- **SendGrid**: Transactional email delivery for alerts and notifications
- **Twilio**: SMS messaging for emergency alerts and check-ins
- **Geolocation API**: Location tracking for emergency response

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
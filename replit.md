# replit.md

## Overview
VitalWatch is a comprehensive AI-powered vital signs monitoring and mental health support application. It provides real-time crisis detection, emergency alerts, mood tracking, coping tools, and emergency contact management. Built with a full-stack TypeScript architecture, it uses React with Vite for the frontend, Express.js for the backend, and Drizzle ORM with PostgreSQL for data persistence. The name "VitalWatch" emphasizes continuous, vital health monitoring and protection.

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
- **Branding**: VitalWatch logo integrated throughout, representing protection and care. Configured as a Trusted Web App (TWA) for Google Play Store distribution, including PWA manifest, service worker, and app shortcuts.

### Backend Architecture
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **WebSocket**: Native WebSocket implementation for real-time features
- **Build Process**: esbuild for production bundling

### Database Architecture
- **Primary Database**: Neon Database (PostgreSQL) for structured relational data (user accounts, emergency logs, mood entries, contacts, sensor data, subscriptions).
- **File Storage**: Supabase for unstructured data, file uploads, and media storage (images, audio recordings, reports).
- **ORM**: Drizzle ORM with PostgreSQL dialect for Neon DB, using Drizzle Kit for schema management.
- **Connection**: Connection pooling with `@neondatabase/serverless`.

### Key Features and Implementations
- **Authentication System**: Replit Auth with OIDC, PostgreSQL-backed sessions, HTTP-only cookies, CSRF protection, comprehensive email verification, and an automatic 14-day Pro trial on email verification.
- **Emergency Response System**: Real-time AI monitoring with audio transcription, multi-sensor threat analysis (accelerometer, gyroscope, heart rate), fall detection, multi-level threat classification, biometric correlation, smart device integration, multi-channel alert distribution (SMS, Email), and incident tracking.
- **Mental Health Features**: Advanced mood tracking with biometric correlation and AI insights (OpenAI GPT-4), comprehensive therapeutic tools (breathing exercises, grounding techniques, AI-powered meditation), real-time biometric monitoring, and integrated crisis resources.
- **Real-time Communication**: WebSocket server for emergency updates, live chat for crisis support, and push notifications.
- **Component Modularization**: Large components are broken down into smaller, focused modules for maintainability (e.g., Profile and Safety Tools sections).
- **Subscription Management**: Comprehensive system including subscription hooks, trial banners, automated trial management service with email campaigns, feature restrictions, and trial expiration handling.

## External Dependencies

- **Neon Database**: Primary PostgreSQL database.
- **Supabase**: File storage and authentication features.
- **OpenAI API**: For advanced mental health analysis, threat detection, and personalized insights (GPT-4).
- **SendGrid**: Transactional email delivery.
- **Twilio**: SMS messaging for emergency alerts.
- **Replit Auth**: Authentication provider.
- **Device Sensors**: Accelerometer, gyroscope, ambient light, proximity, battery monitoring (integrated via Web APIs).
- **Geolocation API**: For high-accuracy location tracking.
- **Bluetooth Integration**: For wearable device connectivity.
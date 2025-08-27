# VitalWatch TWA (Trusted Web App) for Google Play Store

This directory contains the Android Studio project files needed to package VitalWatch as a native Android app for Google Play Store distribution.

## What is a TWA?

Trusted Web Apps (TWAs) allow you to publish your Progressive Web App (PWA) on Google Play Store as a native Android app. Users get the full app experience with:
- Native app icon in launcher
- No browser UI visible
- Full-screen immersive experience
- Android navigation gestures
- Integration with Android share menu
- App shortcuts on home screen

## Setup Process

### 1. Install Android Studio
Download and install [Android Studio](https://developer.android.com/studio)

### 2. Install TWA Tools
```bash
npm install -g @bubblewrap/cli
```

### 3. Initialize TWA Project
```bash
# Run this from the root of your VitalWatch project
bubblewrap init --manifest https://www.vitalwatch.app/manifest.json
```

### 4. Configure App Details
Update the generated files with VitalWatch-specific information:

**android-app/app/src/main/res/values/strings.xml:**
```xml
<resources>
    <string name="app_name">VitalWatch</string>
    <string name="launcherName">VitalWatch</string>
    <string name="twa_url">https://www.vitalwatch.app</string>
    <string name="twa_url_host">www.vitalwatch.app</string>
</resources>
```

**android-app/app/build.gradle:**
```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "app.vitalwatch.emergency"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

### 5. Generate Digital Asset Links
```bash
# Generate the digital asset links verification file
bubblewrap validate --url https://www.vitalwatch.app
```

Add this file to your web server at:
`https://www.vitalwatch.app/.well-known/assetlinks.json`

### 6. Build APK
```bash
cd android-app
./gradlew assembleDebug
```

### 7. Test on Device
```bash
# Install on connected Android device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 8. Generate Signed APK for Play Store
1. Create a keystore in Android Studio
2. Build signed APK/Bundle
3. Upload to Google Play Console

## Required Files for Play Store

### App Icons
- **Adaptive Icon**: 512x512 PNG with safety padding
- **Legacy Icon**: 192x192 PNG for older devices
- **Feature Graphic**: 1024x500 banner for Play Store listing

### Screenshots
- **Phone Screenshots**: Minimum 2, maximum 8 (16:9 or 9:16 ratio)
- **Tablet Screenshots**: Optional but recommended
- **Feature Screenshots**: Show VitalWatch emergency features

### Store Listing Content
- **Title**: "VitalWatch - Emergency Protection" (max 50 chars)
- **Short Description**: AI-powered emergency monitoring (max 80 chars)
- **Full Description**: Detailed feature list and benefits (max 4000 chars)
- **Keywords**: emergency, safety, health, monitoring, AI, crisis

## VitalWatch TWA Features

### Emergency Shortcuts
- Quick emergency alert from home screen
- Instant access to panic button
- One-tap access to emergency contacts

### Offline Functionality
- Core emergency features work offline
- Cached emergency contact information
- Local storage of critical settings

### Device Integration
- Android back button navigation
- Share functionality for crisis resources
- Notification integration for alerts
- Location services for emergency response

### Privacy & Security
- All TWA-specific permissions clearly listed
- No unnecessary data collection
- Secure communication with VitalWatch servers
- User control over all emergency settings

## Testing Checklist

### Functionality Testing
- [ ] Emergency alert button works
- [ ] Mood tracking interface loads correctly
- [ ] Profile settings save properly
- [ ] Offline emergency features function
- [ ] Location services request permission properly
- [ ] SMS/email alerts send successfully

### UI/UX Testing
- [ ] App launches in fullscreen mode
- [ ] Navigation flows smoothly
- [ ] Back button behavior is correct
- [ ] App shortcuts work from launcher
- [ ] Loading states display properly
- [ ] Error states handle gracefully

### Performance Testing
- [ ] App starts in under 3 seconds
- [ ] Smooth scrolling on all screens
- [ ] No memory leaks during extended use
- [ ] Battery usage is reasonable
- [ ] Network requests don't timeout

### Security Testing
- [ ] HTTPS communication only
- [ ] No sensitive data in logs
- [ ] Proper permission requests
- [ ] Secure credential storage

## Deployment Steps

1. **Build Release APK**: Create production-signed APK
2. **Upload to Play Console**: Submit for review
3. **Store Listing**: Complete app description and screenshots
4. **Release Management**: Configure rollout percentage
5. **Monitor**: Track crash reports and user feedback

## Maintenance

### Updates
- Automatically syncs with web app updates
- Play Store updates only needed for TWA wrapper changes
- Content updates happen through web deployment

### Monitoring
- Play Console for crash reports
- Google Analytics for usage metrics
- User reviews for feedback
- Server logs for emergency system performance

VitalWatch TWA provides users with native Android app experience while maintaining all the powerful emergency protection features of the web platform.
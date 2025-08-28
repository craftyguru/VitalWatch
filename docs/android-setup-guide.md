# Android Development Setup for VitalWatch Deployment

## Step-by-Step Setup Guide

### 1. Install Android Studio

#### Windows:
1. Go to https://developer.android.com/studio
2. Click "Download Android Studio"
3. Run the installer (.exe file)
4. Follow installation wizard:
   - Accept license agreements
   - Choose installation location
   - Select components (keep defaults)
   - Let it download SDK components

#### Mac:
1. Download Android Studio from https://developer.android.com/studio
2. Open the .dmg file
3. Drag Android Studio to Applications folder
4. Launch and complete setup wizard

#### Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk
wget https://dl.google.com/dl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz
tar -xzf android-studio-*.tar.gz
cd android-studio/bin
./studio.sh
```

### 2. Configure Android Studio

#### First Launch Setup:
1. **Welcome Screen**: Choose "Standard" installation
2. **SDK Components**: Accept license agreements
3. **Emulator**: Choose to install Android Virtual Device
4. **Finish**: Let it download required components (2-3 GB)

#### Set Environment Variables:

**Windows:**
1. Open System Properties → Advanced → Environment Variables
2. Add new system variables:
   ```
   ANDROID_HOME = C:\Users\[USERNAME]\AppData\Local\Android\Sdk
   ```
3. Add to PATH:
   ```
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\platform-tools
   ```

**Mac/Linux:**
Add to your `.bashrc` or `.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
# export ANDROID_HOME=$HOME/Android/Sdk        # Linux
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Then reload: `source ~/.bashrc` or `source ~/.zshrc`

### 3. Install Bubblewrap CLI

Bubblewrap converts your web app into an Android TWA:

```bash
# Install globally using npm
npm install -g @bubblewrap/cli

# Verify installation
bubblewrap --version
```

### 4. Generate App Signing Key

This is crucial for Google Play Store - you need the same key for all future updates:

```bash
# Navigate to your VitalWatch project directory
cd /path/to/vitalwatch

# Generate release keystore (replace with your actual information)
keytool -genkey -v -keystore vitalwatch-release.keystore \
  -alias vitalwatch \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**You'll be prompted for:**
- Keystore password (remember this!)
- Key password (can be same as keystore)
- First/Last name: "VitalWatch Inc"
- Organization: "VitalWatch"
- City/State/Country: Your information

**CRITICAL:** Save these details securely:
```
Keystore file: vitalwatch-release.keystore
Keystore password: [YOUR_PASSWORD]
Key alias: vitalwatch
Key password: [YOUR_KEY_PASSWORD]
```

### 5. Test Your Setup

Verify everything works:

```bash
# Check Android SDK
android --version

# Check ADB (Android Debug Bridge)
adb version

# Check Bubblewrap
bubblewrap --version

# Check Java (required for keytool)
java -version
```

All commands should return version numbers without errors.

### 6. Get SHA256 Fingerprint

You need this for Digital Asset Links:

```bash
# Get SHA256 fingerprint from your keystore
keytool -list -v -keystore vitalwatch-release.keystore -alias vitalwatch

# Look for "SHA256:" in the output - copy this value
# Example: 12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD
```

### 7. Quick Setup Verification Script

Save this as `verify-android-setup.sh`:

```bash
#!/bin/bash

echo "🔍 Verifying Android Development Setup..."

# Check ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set"
    exit 1
else
    echo "✅ ANDROID_HOME: $ANDROID_HOME"
fi

# Check Android SDK
if command -v android &> /dev/null; then
    echo "✅ Android SDK found"
else
    echo "❌ Android SDK not found in PATH"
fi

# Check ADB
if command -v adb &> /dev/null; then
    echo "✅ ADB found: $(adb version | head -1)"
else
    echo "❌ ADB not found in PATH"
fi

# Check Bubblewrap
if command -v bubblewrap &> /dev/null; then
    echo "✅ Bubblewrap found: $(bubblewrap --version)"
else
    echo "❌ Bubblewrap not installed"
fi

# Check Java
if command -v java &> /dev/null; then
    echo "✅ Java found: $(java -version 2>&1 | head -1)"
else
    echo "❌ Java not found"
fi

# Check keytool
if command -v keytool &> /dev/null; then
    echo "✅ Keytool found"
else
    echo "❌ Keytool not found"
fi

echo ""
echo "🎯 Setup verification complete!"
echo "If all items show ✅, you're ready to build your VitalWatch Android app!"
```

Run it: `chmod +x verify-android-setup.sh && ./verify-android-setup.sh`

## Next Steps After Setup

Once you have everything installed:

1. **Test the Build Process**:
   ```bash
   # In your VitalWatch directory
   ./build-twa.sh
   ```

2. **Create Digital Asset Links**:
   - Use your SHA256 fingerprint
   - Upload to your domain's `.well-known/assetlinks.json`

3. **Build Production APK**:
   ```bash
   # This creates the signed APK for Google Play Store
   bubblewrap build --keystore vitalwatch-release.keystore
   ```

## Common Issues & Solutions

### Issue: "ANDROID_HOME not found"
**Solution**: Restart terminal/command prompt after setting environment variables

### Issue: "Command not found: android"
**Solution**: Make sure Android SDK tools are in your PATH

### Issue: "Bubblewrap command not found"
**Solution**: Install Node.js first, then reinstall Bubblewrap

### Issue: "Keystore error"
**Solution**: Make sure you're in the correct directory and using the right passwords

## File Locations Reference

**Windows:**
- Android SDK: `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`
- Keystore: Your VitalWatch project directory

**Mac:**
- Android SDK: `~/Library/Android/sdk`
- Keystore: Your VitalWatch project directory

**Linux:**
- Android SDK: `~/Android/Sdk`
- Keystore: Your VitalWatch project directory

## Time Required

- **Android Studio Installation**: 30-60 minutes (depending on download speed)
- **Environment Setup**: 10-15 minutes
- **Bubblewrap Installation**: 2-3 minutes
- **Signing Key Generation**: 5 minutes
- **Testing**: 10 minutes

**Total Setup Time**: 1-2 hours for first-time setup

After this one-time setup, building Android apps takes just a few minutes!
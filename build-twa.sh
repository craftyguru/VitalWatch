#!/bin/bash

# VitalWatch TWA Build Script
# This script builds the VitalWatch web app as a Trusted Web App for Google Play Store

echo "🚀 Building VitalWatch TWA for Google Play Store..."

# Check if bubblewrap is installed
if ! command -v bubblewrap &> /dev/null; then
    echo "❌ Bubblewrap CLI not found. Installing..."
    npm install -g @bubblewrap/cli
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Please install Android Studio and set ANDROID_HOME"
    echo "   Download: https://developer.android.com/studio"
    exit 1
fi

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the VitalWatch root directory"
    exit 1
fi

# Build the web app for production
echo "📦 Building web app for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Web app build failed"
    exit 1
fi

# Create android-app directory if it doesn't exist
mkdir -p android-app

# Check if TWA project already exists
if [ ! -f "android-app/twa-manifest.json" ]; then
    echo "🔧 Initializing TWA project..."
    
    # Copy our TWA manifest
    cp twa-manifest.json android-app/
    
    # Initialize bubblewrap project
    cd android-app
    bubblewrap init --manifest https://www.vitalwatch.app/manifest.json
    cd ..
else
    echo "✅ TWA project already initialized"
fi

# Update TWA project with latest web app
echo "🔄 Updating TWA with latest web build..."
cd android-app

# Update the web app assets
bubblewrap update

# Build the APK
echo "🏗️  Building Android APK..."
bubblewrap build

if [ $? -eq 0 ]; then
    echo "✅ VitalWatch TWA build completed successfully!"
    echo ""
    echo "📱 APK Location: android-app/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "🔧 Next Steps:"
    echo "1. Test the APK on an Android device:"
    echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "2. For Play Store release:"
    echo "   - Generate signed APK with your keystore"
    echo "   - Create Play Store listing with screenshots"
    echo "   - Upload AAB (Android App Bundle) for better optimization"
    echo ""
    echo "3. Verify Digital Asset Links:"
    echo "   - Ensure https://www.vitalwatch.app/.well-known/assetlinks.json is accessible"
    echo "   - Update the SHA256 fingerprint in assetlinks.json with your signing key"
    echo ""
    echo "🌟 VitalWatch Emergency Protection is ready for Google Play Store!"
else
    echo "❌ TWA build failed. Please check the errors above."
    exit 1
fi

cd ..

# Create a quick test script
cat > test-twa.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing VitalWatch TWA..."

if command -v adb &> /dev/null; then
    echo "📱 Installing APK on connected device..."
    adb install android-app/app/build/outputs/apk/debug/app-debug.apk
    
    if [ $? -eq 0 ]; then
        echo "✅ APK installed successfully!"
        echo "🚀 Launch VitalWatch from your device to test"
    else
        echo "❌ APK installation failed. Make sure device is connected and USB debugging is enabled"
    fi
else
    echo "⚠️  ADB not found. Please install Android SDK Platform Tools"
    echo "   Or manually copy the APK to your device and install"
fi
EOF

chmod +x test-twa.sh

echo ""
echo "💡 Run './test-twa.sh' to install and test the TWA on a connected Android device"
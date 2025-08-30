#!/bin/bash

# VitalWatch APK Build Script
# This script builds the APK and copies it to the web server's download directory

set -e

echo "🔨 Building VitalWatch APK..."

# Navigate to mobile directory
cd mobile

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing mobile dependencies..."
    npm install
fi

# Build the APK using EAS
echo "🚀 Building APK with EAS..."
npx eas build --platform android --profile preview --local

# Find the built APK
APK_PATH=$(find . -name "*.apk" -type f | head -1)

if [ -z "$APK_PATH" ]; then
    echo "❌ APK build failed - no APK file found"
    exit 1
fi

# Copy APK to server downloads directory
echo "📁 Copying APK to downloads directory..."
mkdir -p ../server/public/downloads
cp "$APK_PATH" ../server/public/downloads/vitalwatch-latest.apk

echo "✅ APK build complete! Available at: /downloads/vitalwatch-latest.apk"
echo "📱 Users can now download the native app with Health Connect support"
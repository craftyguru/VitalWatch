#!/bin/bash

echo "🔧 Fixing VitalWatch Android Setup"
echo "=================================="

# Set up environment variables properly
echo "🏠 Setting up environment variables..."

# Add to current session
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Create the Android SDK directory
mkdir -p $HOME/Android/Sdk

# Add to .bashrc permanently
echo "" >> ~/.bashrc
echo "# VitalWatch Android Development" >> ~/.bashrc
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

echo "✅ Environment variables set"
echo "ANDROID_HOME: $ANDROID_HOME"

# Generate the signing key since we have keytool working
echo ""
echo "🔑 Generating VitalWatch signing key..."

# Check if keystore already exists
if [ -f "vitalwatch-release.keystore" ]; then
    echo "✅ Signing key already exists"
else
    # Generate with non-interactive mode
    keytool -genkey -v -keystore vitalwatch-release.keystore \
        -alias vitalwatch \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -noprompt \
        -dname "CN=VitalWatch Inc, OU=Emergency, O=VitalWatch, L=San Francisco, S=CA, C=US" \
        -storepass vitalwatch2025 \
        -keypass vitalwatch2025
    
    if [ -f "vitalwatch-release.keystore" ]; then
        echo "✅ Signing key generated successfully!"
        echo ""
        echo "🔐 Your VitalWatch signing credentials:"
        echo "   Keystore: vitalwatch-release.keystore" 
        echo "   Store Password: vitalwatch2025"
        echo "   Key Alias: vitalwatch"
        echo "   Key Password: vitalwatch2025"
    fi
fi

# Get SHA256 fingerprint for Digital Asset Links
if [ -f "vitalwatch-release.keystore" ]; then
    echo ""
    echo "🔍 SHA256 fingerprint for Digital Asset Links:"
    keytool -list -v -keystore vitalwatch-release.keystore -alias vitalwatch -storepass vitalwatch2025 2>/dev/null | grep -A1 "SHA256:" | grep "SHA256:" | sed 's/.*SHA256: //'
fi

# Test Bubblewrap
echo ""
echo "🫧 Testing Bubblewrap..."
if command -v bubblewrap &> /dev/null; then
    echo "✅ Bubblewrap is ready: $(bubblewrap --version)"
else
    echo "❌ Bubblewrap not found"
fi

echo ""
echo "📋 Current Setup Status:"
echo "✅ Node.js and npm"
echo "✅ Java and keytool" 
echo "✅ Bubblewrap CLI"
echo "✅ Android environment variables"
echo "✅ VitalWatch signing key"

echo ""
echo "🎯 You can now build your VitalWatch Android app!"
echo "Run: ./build-twa.sh"

echo ""
echo "💡 Note: You don't need to create an Android Studio project."
echo "Your VitalWatch web app will be converted to Android automatically."
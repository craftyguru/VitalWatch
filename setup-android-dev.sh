#!/bin/bash

# VitalWatch Android Development Setup Script
# This script helps automate the Android development environment setup

echo "🚀 VitalWatch Android Development Setup"
echo "======================================="

# Check operating system
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "🔍 Detected OS: $MACHINE"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo ""
echo "📦 Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm."
    exit 1
fi

# Install Bubblewrap CLI
echo ""
echo "🫧 Installing Bubblewrap CLI..."
if command_exists bubblewrap; then
    BUBBLEWRAP_VERSION=$(bubblewrap --version)
    echo "✅ Bubblewrap already installed: $BUBBLEWRAP_VERSION"
else
    echo "📥 Installing Bubblewrap CLI globally..."
    npm install -g @bubblewrap/cli
    
    if command_exists bubblewrap; then
        echo "✅ Bubblewrap installed successfully"
    else
        echo "❌ Bubblewrap installation failed"
        exit 1
    fi
fi

# Check Java
echo ""
echo "☕ Checking Java..."
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo "✅ Java found: $JAVA_VERSION"
else
    echo "❌ Java not found. Installing OpenJDK..."
    
    case $MACHINE in
        Linux)
            echo "📥 Installing OpenJDK on Linux..."
            if command_exists apt; then
                sudo apt update
                sudo apt install -y openjdk-11-jdk
            elif command_exists yum; then
                sudo yum install -y java-11-openjdk-devel
            else
                echo "⚠️  Please install Java manually"
            fi
            ;;
        Mac)
            echo "📥 Installing OpenJDK on Mac..."
            if command_exists brew; then
                brew install openjdk@11
            else
                echo "⚠️  Please install Homebrew first, then run: brew install openjdk@11"
            fi
            ;;
        *)
            echo "⚠️  Please install Java manually for your OS"
            ;;
    esac
fi

# Check keytool
echo ""
echo "🔑 Checking keytool..."
if command_exists keytool; then
    echo "✅ keytool found"
else
    echo "❌ keytool not found (usually comes with Java)"
fi

# Android Studio detection
echo ""
echo "📱 Checking Android Studio..."
ANDROID_STUDIO_FOUND=false

case $MACHINE in
    Linux)
        if [ -d "$HOME/android-studio" ] || [ -d "/opt/android-studio" ]; then
            ANDROID_STUDIO_FOUND=true
        fi
        ;;
    Mac)
        if [ -d "/Applications/Android Studio.app" ]; then
            ANDROID_STUDIO_FOUND=true
        fi
        ;;
    *)
        # Windows check would go here
        ;;
esac

if [ "$ANDROID_STUDIO_FOUND" = true ]; then
    echo "✅ Android Studio installation detected"
else
    echo "⚠️  Android Studio not found. Please install it:"
    echo "   Download from: https://developer.android.com/studio"
fi

# Check ANDROID_HOME
echo ""
echo "🏠 Checking ANDROID_HOME..."
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Please set it to your Android SDK path:"
    case $MACHINE in
        Linux)
            echo "   export ANDROID_HOME=\$HOME/Android/Sdk"
            ;;
        Mac)
            echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
            ;;
        *)
            echo "   export ANDROID_HOME=C:\\Users\\[USERNAME]\\AppData\\Local\\Android\\Sdk"
            ;;
    esac
    echo "   Add this to your ~/.bashrc or ~/.zshrc file"
else
    echo "✅ ANDROID_HOME set: $ANDROID_HOME"
    
    # Check if SDK exists
    if [ -d "$ANDROID_HOME" ]; then
        echo "✅ Android SDK directory found"
    else
        echo "❌ Android SDK directory not found at $ANDROID_HOME"
    fi
fi

# Check ADB
echo ""
echo "🔧 Checking ADB..."
if command_exists adb; then
    ADB_VERSION=$(adb version | head -1)
    echo "✅ ADB found: $ADB_VERSION"
else
    echo "⚠️  ADB not found. Make sure Android SDK platform-tools are in your PATH"
fi

# Generate signing key if it doesn't exist
echo ""
echo "🔐 Checking signing key..."
if [ -f "vitalwatch-release.keystore" ]; then
    echo "✅ Signing keystore already exists"
else
    echo "🔑 Generating new signing key for VitalWatch..."
    echo "You'll be prompted for keystore information..."
    
    keytool -genkey -v -keystore vitalwatch-release.keystore \
        -alias vitalwatch \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=VitalWatch Inc, OU=VitalWatch, O=VitalWatch, L=City, S=State, C=US" \
        -storepass vitalwatch123 \
        -keypass vitalwatch123
    
    if [ -f "vitalwatch-release.keystore" ]; then
        echo "✅ Signing key generated successfully"
        echo ""
        echo "🔐 IMPORTANT: Save these credentials securely!"
        echo "   Keystore file: vitalwatch-release.keystore"
        echo "   Keystore password: vitalwatch123"
        echo "   Key alias: vitalwatch"
        echo "   Key password: vitalwatch123"
        echo ""
        echo "⚠️  For production, change these default passwords!"
    else
        echo "❌ Failed to generate signing key"
    fi
fi

# Get SHA256 fingerprint if keystore exists
if [ -f "vitalwatch-release.keystore" ]; then
    echo ""
    echo "🔍 Getting SHA256 fingerprint for Digital Asset Links..."
    echo "Keystore password: vitalwatch123"
    keytool -list -v -keystore vitalwatch-release.keystore -alias vitalwatch -storepass vitalwatch123 | grep -A1 "SHA256:"
fi

# Final summary
echo ""
echo "📋 Setup Summary"
echo "================"

READY_COUNT=0
TOTAL_CHECKS=6

if command_exists node; then
    echo "✅ Node.js"
    ((READY_COUNT++))
else
    echo "❌ Node.js"
fi

if command_exists bubblewrap; then
    echo "✅ Bubblewrap CLI"
    ((READY_COUNT++))
else
    echo "❌ Bubblewrap CLI"
fi

if command_exists java; then
    echo "✅ Java"
    ((READY_COUNT++))
else
    echo "❌ Java"
fi

if [ "$ANDROID_STUDIO_FOUND" = true ]; then
    echo "✅ Android Studio"
    ((READY_COUNT++))
else
    echo "❌ Android Studio"
fi

if [ ! -z "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    echo "✅ Android SDK"
    ((READY_COUNT++))
else
    echo "❌ Android SDK"
fi

if [ -f "vitalwatch-release.keystore" ]; then
    echo "✅ Signing Key"
    ((READY_COUNT++))
else
    echo "❌ Signing Key"
fi

echo ""
echo "🎯 Setup Progress: $READY_COUNT/$TOTAL_CHECKS components ready"

if [ $READY_COUNT -eq $TOTAL_CHECKS ]; then
    echo "🎉 Your Android development environment is ready!"
    echo "Next step: Run './build-twa.sh' to build your VitalWatch Android app"
else
    echo "⚠️  Please complete the missing components above"
    echo "📖 See docs/android-setup-guide.md for detailed instructions"
fi

echo ""
echo "🔗 Useful links:"
echo "   Android Studio: https://developer.android.com/studio"
echo "   Node.js: https://nodejs.org/"
echo "   Setup Guide: docs/android-setup-guide.md"
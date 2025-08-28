#!/bin/bash

echo "🚀 Completing VitalWatch Android Setup - Phase 2"
echo "==============================================="

# Download and install Android Studio for Linux
echo "📱 Installing Android Studio..."

# Create directory for Android Studio
mkdir -p ~/android-tools
cd ~/android-tools

# Download Android Studio (latest stable version)
echo "📥 Downloading Android Studio..."
wget -O android-studio.tar.gz "https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz"

# Extract Android Studio
echo "📦 Extracting Android Studio..."
tar -xzf android-studio.tar.gz

# Create desktop entry
echo "🖥️ Creating desktop entry..."
cat > ~/.local/share/applications/android-studio.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Type=Application
Name=Android Studio
Comment=Android Studio IDE
Exec=/home/$USER/android-tools/android-studio/bin/studio.sh
Icon=/home/$USER/android-tools/android-studio/bin/studio.png
Categories=Development;IDE;
Terminal=false
StartupWMClass=jetbrains-studio
EOF

# Make desktop entry executable
chmod +x ~/.local/share/applications/android-studio.desktop

# Set up environment variables
echo "🏠 Setting up environment variables..."

# Add to .bashrc
echo "" >> ~/.bashrc
echo "# Android Development Environment" >> ~/.bashrc
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools" >> ~/.bashrc

# Also add to .profile for login shells
echo "" >> ~/.profile
echo "# Android Development Environment" >> ~/.profile
echo "export ANDROID_HOME=\$HOME/Android/Sdk" >> ~/.profile
echo "export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools" >> ~/.profile

# Create Android SDK directory
mkdir -p ~/Android/Sdk

echo "✅ Android Studio installation complete!"
echo ""
echo "🔧 Next Steps:"
echo "1. Launch Android Studio:"
echo "   ~/android-tools/android-studio/bin/studio.sh"
echo ""
echo "2. During Android Studio setup:"
echo "   - Choose 'Standard' installation"
echo "   - Accept all license agreements"
echo "   - Let it download SDK components"
echo ""
echo "3. After setup, restart your terminal and run:"
echo "   source ~/.bashrc"
echo "   ./setup-android-dev.sh"
echo ""
echo "4. Then build your VitalWatch Android app:"
echo "   ./build-twa.sh"

# Make Android Studio executable
chmod +x ~/android-tools/android-studio/bin/studio.sh

echo ""
echo "🎯 Quick Launch Command:"
echo "   ~/android-tools/android-studio/bin/studio.sh &"
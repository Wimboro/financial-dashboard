#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking Android Development Setup...${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Check Java
echo -e "${YELLOW}Checking Java...${NC}"
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "  Found: $JAVA_VERSION"
    print_status 0 "Java is installed"
else
    print_status 1 "Java is not installed"
    echo -e "  ${RED}Install Java 17: sudo apt install openjdk-17-jdk${NC}"
fi

# Check JAVA_HOME
echo -e "\n${YELLOW}Checking JAVA_HOME...${NC}"
if [ -n "$JAVA_HOME" ]; then
    echo "  JAVA_HOME: $JAVA_HOME"
    print_status 0 "JAVA_HOME is set"
else
    print_status 1 "JAVA_HOME is not set"
    echo -e "  ${RED}Add to ~/.bashrc: export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64${NC}"
fi

# Check Android SDK
echo -e "\n${YELLOW}Checking Android SDK...${NC}"
if [ -n "$ANDROID_HOME" ]; then
    echo "  ANDROID_HOME: $ANDROID_HOME"
    if [ -d "$ANDROID_HOME" ]; then
        print_status 0 "ANDROID_HOME directory exists"
    else
        print_status 1 "ANDROID_HOME directory does not exist"
    fi
else
    print_status 1 "ANDROID_HOME is not set"
    echo -e "  ${RED}Add to ~/.bashrc: export ANDROID_HOME=\$HOME/Android/Sdk${NC}"
fi

# Check Android tools
echo -e "\n${YELLOW}Checking Android Tools...${NC}"
if command_exists adb; then
    ADB_VERSION=$(adb version | head -n 1)
    echo "  Found: $ADB_VERSION"
    print_status 0 "ADB is available"
else
    print_status 1 "ADB is not available"
    echo -e "  ${RED}Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/platform-tools${NC}"
fi

if command_exists emulator; then
    print_status 0 "Android Emulator is available"
else
    print_status 1 "Android Emulator is not available"
    echo -e "  ${RED}Add to PATH: export PATH=\$PATH:\$ANDROID_HOME/emulator${NC}"
fi

# Check Gradle
echo -e "\n${YELLOW}Checking Gradle...${NC}"
if [ -f "android/gradlew" ]; then
    print_status 0 "Gradle wrapper found in android directory"
else
    print_status 1 "Gradle wrapper not found"
fi

# Check Node.js and npm
echo -e "\n${YELLOW}Checking Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "  Found: Node.js $NODE_VERSION"
    print_status 0 "Node.js is installed"
else
    print_status 1 "Node.js is not installed"
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "  Found: npm $NPM_VERSION"
    print_status 0 "npm is installed"
else
    print_status 1 "npm is not installed"
fi

# Check Capacitor
echo -e "\n${YELLOW}Checking Capacitor...${NC}"
if [ -f "capacitor.config.ts" ]; then
    print_status 0 "Capacitor config found"
else
    print_status 1 "Capacitor config not found"
fi

if [ -d "android" ]; then
    print_status 0 "Android platform added"
else
    print_status 1 "Android platform not added"
    echo -e "  ${RED}Run: npx cap add android${NC}"
fi

# Check Android Studio
echo -e "\n${YELLOW}Checking Android Studio...${NC}"
if [ -d "/opt/android-studio" ] || [ -d "$HOME/android-studio" ] || command_exists studio; then
    print_status 0 "Android Studio appears to be installed"
else
    print_status 1 "Android Studio not found"
    echo -e "  ${RED}Download from: https://developer.android.com/studio${NC}"
fi

# Summary
echo -e "\n${BLUE}📋 Setup Summary:${NC}"
echo -e "1. Install missing components above"
echo -e "2. Restart terminal after setting environment variables"
echo -e "3. Run: ${GREEN}npm run android:build${NC}"
echo -e "4. Run: ${GREEN}npm run android:open${NC}"
echo -e "5. Build APK in Android Studio\n"

echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo -e "  Build: ${GREEN}npm run android:build${NC}"
echo -e "  Open:  ${GREEN}npm run android:open${NC}"
echo -e "  Run:   ${GREEN}npm run android:run${NC}"
echo -e "  Dev:   ${GREEN}npm run android:dev${NC}"

echo -e "\n${BLUE}📱 For first-time setup:${NC}"
echo -e "1. Install Android Studio"
echo -e "2. Open Android Studio → SDK Manager"
echo -e "3. Install latest Android SDK and build tools"
echo -e "4. Create virtual device (AVD) for testing"
echo -e "5. Set environment variables in ~/.bashrc"
echo -e "6. Restart terminal and run this script again" 
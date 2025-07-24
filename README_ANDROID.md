# Financial Dashboard - Android App

Transform your Financial Dashboard web app into a native Android application using Capacitor.

## Quick Start

### 1. Check Prerequisites
```bash
npm run android:check
```

### 2. Install Missing Components
Follow the output from the check script to install:
- Java 17 JDK
- Android Studio
- Android SDK
- Set environment variables

### 3. Build Android App
```bash
npm run android:build
npm run android:open
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run android:check` | Check if all prerequisites are installed |
| `npm run android:build` | Build web app and sync to Android |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:run` | Build and run on device/emulator |
| `npm run android:dev` | Development mode with live reload |

## App Details

- **App Name**: Financial Dashboard
- **Package ID**: com.hiddenglam.financialdashboard
- **Platform**: Android (API 24+)
- **Architecture**: Hybrid (Web + Native)

## Features

✅ **Native Android Features**
- Status bar styling
- Splash screen
- Network status detection
- Native sharing
- Hardware back button support

✅ **Responsive Design**
- Touch-optimized interface
- Mobile-friendly charts
- Swipe gestures
- Portrait/landscape support

✅ **Performance**
- Fast startup time
- Smooth animations
- Efficient memory usage
- Offline capabilities

## Development Workflow

### For Development
```bash
# Start development with live reload
npm run android:dev

# This will:
# 1. Build the React app
# 2. Sync with Android
# 3. Launch on device/emulator
# 4. Enable live reload for changes
```

### For Production
```bash
# Build and open in Android Studio
npm run android:build
npm run android:open

# In Android Studio:
# 1. Build → Generate Signed Bundle/APK
# 2. Choose Android App Bundle (recommended)
# 3. Sign with your keystore
# 4. Build for release
```

## Troubleshooting

### Common Issues

**Build Fails**
```bash
cd android
./gradlew clean
./gradlew build
```

**Device Not Detected**
- Enable Developer Options
- Enable USB Debugging
- Install device drivers

**Environment Issues**
```bash
# Check environment variables
echo $JAVA_HOME
echo $ANDROID_HOME

# Reload shell configuration
source ~/.bashrc
```

### Getting Help

1. Run `npm run android:check` to diagnose issues
2. Check the full guide: `ANDROID_BUILD_GUIDE.md`
3. Visit [Capacitor Documentation](https://capacitorjs.com/docs)

## Next Steps

1. **Install Prerequisites**: Follow the setup check output
2. **Build Your First APK**: Use Android Studio
3. **Test on Device**: Enable developer mode and USB debugging
4. **Publish to Play Store**: Generate signed app bundle

Happy building! 🚀📱 
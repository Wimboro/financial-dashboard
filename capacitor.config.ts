import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hiddenglam.financialdashboard',
  appName: 'Financial Dashboard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a",
      showSpinner: true,
      spinnerColor: "#0ea5e9"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#0f172a"
    }
  }
};

export default config;

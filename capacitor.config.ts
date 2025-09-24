import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pomodoro.app',
  appName: '番茄鐘應用程式',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;


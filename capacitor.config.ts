// @ts-nocheck
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.floussi.budget',
  appName: 'Floussi',
  webDir: 'out', // static build output folder of Next.js
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    allowNavigation: []
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#10B981',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#123524',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    }
  }
};

export default config;

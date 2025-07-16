import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaizen.app',
  appName: 'kaizen',
  webDir: 'out',
  // server: {
  //   url: 'http://192.168.1.8:3000',
  //   cleartext: true,
  // },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
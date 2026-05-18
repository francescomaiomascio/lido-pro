import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl =
  process.env.LIDOPRO_CAPACITOR_SERVER_URL ??
  process.env.CAPACITOR_SERVER_URL ??
  '';

const config: CapacitorConfig = {
  appId: 'it.lidopro.app',
  appName: 'LidoPro',
  webDir: 'dist',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: devServerUrl.startsWith('http://'),
        },
      }
    : {}),
};

export default config;

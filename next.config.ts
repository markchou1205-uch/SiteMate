
import type {NextConfig} from 'next';

// This function will be the default export.
export default async (phase: string, { defaultConfig }: { defaultConfig: NextConfig }) => {
  const envVars: { [key: string]: string } = {};

  // Firebase App Hosting provides FIREBASE_WEBAPP_CONFIG as a JSON string during build.
  // We parse it and set the individual NEXT_PUBLIC_ environment variables.
  if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
      const firebaseWebAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
      console.log("[next.config.ts] FIREBASE_WEBAPP_CONFIG found:", JSON.stringify(firebaseWebAppConfig, null, 2));

      if (firebaseWebAppConfig.apiKey) {
        envVars.NEXT_PUBLIC_FIREBASE_API_KEY = String(firebaseWebAppConfig.apiKey);
      }
      if (firebaseWebAppConfig.authDomain) {
        envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = String(firebaseWebAppConfig.authDomain);
      }
      if (firebaseWebAppConfig.projectId) {
        envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID = String(firebaseWebAppConfig.projectId);
      }
      if (firebaseWebAppConfig.storageBucket) {
        envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = String(firebaseWebAppConfig.storageBucket);
      }
      if (firebaseWebAppConfig.messagingSenderId) {
        envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = String(firebaseWebAppConfig.messagingSenderId);
      }
      if (firebaseWebAppConfig.appId) {
        envVars.NEXT_PUBLIC_FIREBASE_APP_ID = String(firebaseWebAppConfig.appId);
      }
      console.log("[next.config.ts] Successfully parsed FIREBASE_WEBAPP_CONFIG and set NEXT_PUBLIC_ variables for build:", JSON.stringify(envVars, null, 2));
    } catch (error) {
      console.error('[next.config.ts] Failed to parse FIREBASE_WEBAPP_CONFIG:', error);
    }
  } else {
    console.log("[next.config.ts] FIREBASE_WEBAPP_CONFIG not found. Relying on .env files for NEXT_PUBLIC_ variables (if any).");
  }

  const nextConfig: NextConfig = {
    ...defaultConfig, // Spread the default config from the adapter
    typescript: {
      ignoreBuildErrors: true,
      ...(defaultConfig.typescript || {}),
    },
    eslint: {
      ignoreDuringBuilds: true,
      ...(defaultConfig.eslint || {}),
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
      ],
      ...(defaultConfig.images || {}),
    },
    webpack: (config, context) => {
      // Apply the existing webpack modifications from defaultConfig if any
      let newConfig = config;
      if (defaultConfig.webpack) {
        newConfig = defaultConfig.webpack(config, context);
      }

      // Prevent webpack from trying to resolve 'canvas'
      if (!newConfig.resolve.alias) {
        newConfig.resolve.alias = {};
      }
      newConfig.resolve.alias.canvas = false;
      return newConfig;
    },
    env: {
      ...(defaultConfig.env || {}), // Spread env from defaultConfig
      ...envVars, // Then add/override with our parsed vars
    },
    allowedDevOrigins: [
      "https://studio.firebase.google.com",
      "http://localhost:3000"
    ]
  };
  console.log("[next.config.ts] Final nextConfig.env being returned:", JSON.stringify(nextConfig.env, null, 2));
  return nextConfig;
};

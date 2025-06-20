
import type {NextConfig} from 'next';

const envVars: {[key: string]: string} = {};

// Firebase App Hosting provides FIREBASE_WEBAPP_CONFIG as a JSON string during build.
// We parse it and set the individual NEXT_PUBLIC_ environment variables.
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    const firebaseWebAppConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
    if (firebaseWebAppConfig.apiKey) {
      envVars.NEXT_PUBLIC_FIREBASE_API_KEY = firebaseWebAppConfig.apiKey;
    }
    if (firebaseWebAppConfig.authDomain) {
      envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = firebaseWebAppConfig.authDomain;
    }
    if (firebaseWebAppConfig.projectId) {
      envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID = firebaseWebAppConfig.projectId;
    }
    if (firebaseWebAppConfig.storageBucket) {
      envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = firebaseWebAppConfig.storageBucket;
    }
    if (firebaseWebAppConfig.messagingSenderId) {
      envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = firebaseWebAppConfig.messagingSenderId;
    }
    if (firebaseWebAppConfig.appId) {
      envVars.NEXT_PUBLIC_FIREBASE_APP_ID = firebaseWebAppConfig.appId;
    }
    console.log("Successfully parsed FIREBASE_WEBAPP_CONFIG and set NEXT_PUBLIC_ variables for build.");
  } catch (error) {
    console.error('Failed to parse FIREBASE_WEBAPP_CONFIG in next.config.js:', error);
    // You might want to fall back to .env variables here if needed for local builds
    // where FIREBASE_WEBAPP_CONFIG might not be present.
    // However, for App Hosting, FIREBASE_WEBAPP_CONFIG should be the source of truth.
  }
} else {
  console.log("FIREBASE_WEBAPP_CONFIG not found. Relying on .env files for NEXT_PUBLIC_ variables (if any).");
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
  },
  webpack: (config, { isServer }) => {
    // Prevent webpack from trying to resolve 'canvas'
    // This is a common workaround for 'Module not found: Can't resolve 'canvas'' with pdfjs-dist.
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.canvas = false;
    return config;
  },
  env: envVars, // Expose the parsed Firebase config (and any other manually set env vars)
};

export default nextConfig;


import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// This function constructs the config object. It will be called on the client side.
const getFirebaseConfig = () => {
  // Ensure that this code only runs in the browser.
  if (typeof window === 'undefined') {
    return null;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Detailed validation to ensure all keys have a meaningful value.
  const allConfigValuesPresent = Object.entries(firebaseConfig).every(
    ([key, value]) => {
      const isPresent = value && typeof value === 'string' && value.trim() !== '' && value !== 'undefined';
      if (!isPresent) {
        console.warn(`[firebase.ts] Missing or invalid config value for: ${key}`);
      }
      return isPresent;
    }
  );
  
  if (allConfigValuesPresent) {
    console.log("[firebase.ts] Client-side Firebase Config is valid:", JSON.stringify(firebaseConfig, null, 2));
    return firebaseConfig;
  }
  
  console.error("[firebase.ts] Firebase config is incomplete. App cannot be initialized. Values received:", JSON.stringify(firebaseConfig, null, 2));
  return null;
};


let app: FirebaseApp | undefined;
let storage: ReturnType<typeof getStorage> | undefined;
let functions: ReturnType<typeof getFunctions> | undefined;

// Initialize Firebase only on the client side where env vars are available
if (typeof window !== 'undefined') {
    const firebaseConfig = getFirebaseConfig();
    if (firebaseConfig) {
      if (!getApps().length) {
        try {
          app = initializeApp(firebaseConfig);
          console.log("[firebase.ts] Firebase app initialized successfully.");
        } catch (error) {
          console.error("[firebase.ts] Error initializing Firebase app:", error);
        }
      } else {
        app = getApp();
        console.log("[firebase.ts] Firebase app already initialized, getting existing app.");
      }

      if (app) {
        storage = getStorage(app);
        functions = getFunctions(app);
      }
    }
}


export { app, storage, functions };

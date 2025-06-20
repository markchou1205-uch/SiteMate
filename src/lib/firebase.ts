
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("[firebase.ts] Client-side Firebase Config being used for initializeApp:", JSON.stringify(firebaseConfig));

// Check if all config values are present (basic check)
const allConfigValuesPresent = Object.values(firebaseConfig).every(value => value && typeof value === 'string' && value.trim() !== '' && value !== 'undefined');
console.log("[firebase.ts] All config values present for initializeApp check (value !== 'undefined'):", allConfigValuesPresent);


let app: FirebaseApp | undefined; // app can be undefined if config is not complete
if (allConfigValuesPresent) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("[firebase.ts] Firebase app initialized successfully.");
    } catch (error) {
      console.error("[firebase.ts] Error initializing Firebase app:", error);
      // app will remain undefined
    }
  } else {
    app = getApp();
    console.log("[firebase.ts] Firebase app already initialized, getting existing app.");
  }
} else {
  console.warn("[firebase.ts] Firebase config incomplete based on direct process.env values. Firebase app NOT initialized. Check NEXT_PUBLIC_ environment variables. Values received:", JSON.stringify({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }));
}

const storage = app ? getStorage(app) : undefined; // Only get storage if app is initialized
const functions = app ? getFunctions(app) : undefined; // Only get functions if app is initialized

export { app, storage, functions };

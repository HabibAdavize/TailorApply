import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Add debug logging
console.log('Firebase config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  // Don't log the actual values for security
});

let app;
if (!getApps().length) {
  try {
    console.log('Firebase: Initializing app');
    app = initializeApp(firebaseConfig);
    console.log('Firebase: App initialized successfully');
  } catch (error) {
    console.error('Firebase: Error initializing app:', error);
    throw error;
  }
} else {
  console.log('Firebase: Using existing app instance');
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Verify auth is initialized
console.log('Firebase: Auth initialized:', !!auth);
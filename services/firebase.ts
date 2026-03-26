import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '';

let app: FirebaseApp;
let db: Firestore;
let analytics: Analytics | null = null;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firestoreDatabaseId || undefined);
  auth = getAuth(app);
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch {
      // Analytics may fail if measurementId is not set
    }
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Create minimal stubs so the app can still render
  app = {} as FirebaseApp;
  db = {} as Firestore;
  auth = { currentUser: null } as unknown as Auth;
}

export { db, analytics, auth };

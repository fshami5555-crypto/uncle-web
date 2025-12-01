import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4eOTHYYZiG6x4j9TH8S9my7V7HHdg-wQ",
  authDomain: "uncle-web-2fb36.firebaseapp.com",
  projectId: "uncle-web-2fb36",
  storageBucket: "uncle-web-2fb36.firebasestorage.app",
  messagingSenderId: "940226285326",
  appId: "1:940226285326:web:945336229e7173c58a915f",
  measurementId: "G-ES885Z5RFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
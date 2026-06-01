import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Values come from NEXT_PUBLIC_FIREBASE_* environment variables.
// Fallbacks are the real project values so local development works
// without any .env.local changes — only Vercel env vars need to be set.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || "AIzaSyAUDr0ecBheI7jB_NBcTht_u0_7_bQR8sM",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || "campus-crush-20774.firebaseapp.com",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || "campus-crush-20774",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || "campus-crush-20774.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "171727469028",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || "1:171727469028:web:1fc4c5f718e402ad382ff1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
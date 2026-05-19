import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUDr0ecBheI7jB_NBcTht_u0_7_bQR8sM",
  authDomain: "campus-crush-20774.firebaseapp.com",
  projectId: "campus-crush-20774",
  storageBucket: "campus-crush-20774.firebasestorage.app",
  messagingSenderId: "171727469028",
  appId: "1:171727469028:web:1fc4c5f718e402ad382ff1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
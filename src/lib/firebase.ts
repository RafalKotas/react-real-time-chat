import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
if (!apiKey || typeof apiKey !== "string") {
  console.error(
    "VITE_FIREBASE_API_KEY is missing or invalid. Check .env has VITE_FIREBASE_API_KEY=... and restart the dev server."
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: "reactrealtimechat-17f13.firebaseapp.com",
  projectId: "reactrealtimechat-17f13",
  storageBucket: "reactrealtimechat-17f13.firebasestorage.app",
  messagingSenderId: "148344823322",
  appId: "1:148344823322:web:0e5d000b8e874447763ba3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

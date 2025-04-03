import { initializeApp, getApps, getApp } from "firebase/app";
import { FieldValue, getFirestore, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAYqFtX4lBsRRCFB6fBlvz6qzrFc0vmZ80",
  authDomain: "kaizen-b8806.firebaseapp.com",
  projectId: "kaizen-b8806",
  storageBucket: "kaizen-b8806.firebasestorage.app",
  messagingSenderId: "62250180001",
  appId: "1:62250180001:web:94e1dd285dbdfef15f3fe0",
  measurementId: "G-L6B79BSYW8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export type FirestoreTimestamp = FieldValue | Timestamp | Date;
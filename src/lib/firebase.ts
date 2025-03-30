import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBaZpWNIA0geXKU6mQzinh3XbcLiaDVdO0",
  authDomain: "ecommerce-d5edd.firebaseapp.com",
  projectId: "ecommerce-d5edd",
  storageBucket: "ecommerce-d5edd.appspot.com",
  messagingSenderId: "636775073841",
  appId: "1:636775073841:web:ffdf7669f4223596e5ad10",
  measurementId: "G-LDMGKRLLXS",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
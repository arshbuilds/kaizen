import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getRandomNumber } from "../utils/genUtils";
import { userType } from "../types/userTypes";

type AuthState = {
  user: userType | null;
  loading: boolean;
  setUser: (user: userType | null) => void;
};

export const useAuthStore = create<AuthState>((set) => {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const appUser: userType = {
        userId: firebaseUser.uid,
        userName: firebaseUser.displayName || `user${getRandomNumber(100000000, 999999999)}`,
        email: firebaseUser.email || "",
        pfpUrl: firebaseUser.photoURL || "",
      };
      set({ user: appUser, loading: false });
    } else {
      set({ user: null, loading: false });
    }
  });

  return {
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
  };
});

import { create } from "zustand";
import { userType } from "../types/userTypes";

type AuthState = {
  user: userType | null;
  loading: boolean;
  hasFetchedUser: boolean;
  setUser: (user: userType | null) => void;
  setLoading: (loading: boolean) => void;
  setHasFetchedUser: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hasFetchedUser: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setHasFetchedUser: (value) => set({ hasFetchedUser: value }),
}));
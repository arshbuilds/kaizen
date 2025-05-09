import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { useAuthStore } from "../stores/useAuthStore";
import { addNewUser } from "../repositories/authRepos";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
import { userType } from "../types/userTypes";

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<userType> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const pfpUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const userData: userType = {
        userId: user.uid,
        userName: data.userName,
        email: data.email,
        pfpUrl: data.pfpUrl,
        role: data.role,
        interests: data.interests,
        createdAt: data.createdAt,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        goalsCount: data.goalsCount,
        dailyFocusHours: data.dailyFocusHours,
        dailyFocusDelta: data.dailyFocusDelta,
        wellbeingScore: data.wellbeingScore,
        wellbeingDelta: data.wellbeingDelta,
        dayStreak: data.dayStreak,
        meditationHours: data.meditationHours,
        badgesCount: data.badgesCount,
        bestStreak: data.bestStreak,
        totalCoins: data.totalCoins,
        weeklyCoins: data.weeklyCoins,
        todayCoins: data.todayCoins,
        percentileRank: data.percentileRank,
      };
      return userData;
    } else {
      const userData: userType = {
        userId: user.uid,
        userName: user.displayName!,
        email: user.email!,
        pfpUrl: pfpUrl,
        role: "",
        interests: [],
        createdAt: serverTimestamp(),
        followersCount: 0,
        followingCount: 0,
        goalsCount: 0,
        dailyFocusHours: 0,
        dailyFocusDelta: 0,
        wellbeingScore: 0,
        wellbeingDelta: 0,
        dayStreak: 0,
        meditationHours: 0,
        badgesCount: 0,
        bestStreak: 0,
        totalCoins: 0,
        weeklyCoins: 0,
        todayCoins: 0,
        percentileRank: 0,
      };
      await addNewUser(userData);
      return userData;
    }
  } catch (e) {
    console.error("Google login error:", e);
    throw e;
  }
};

export const signupWithEmailPass = async ({
  username,
  email,
  pass,
}: {
  username: string;
  email: string;
  pass: string;
}): Promise<userType> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    const pfpUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    const userData: userType = {
      userId: user.uid,
      userName: username,
      email: email,
      pfpUrl: pfpUrl,
      role: "",
      interests: [],
      createdAt: serverTimestamp(),
      followersCount: 0,
      followingCount: 0,
      goalsCount: 0,
      dailyFocusHours: 0,
      dailyFocusDelta: 0,
      wellbeingScore: 0,
      wellbeingDelta: 0,
      dayStreak: 0,
      meditationHours: 0,
      badgesCount: 0,
      bestStreak: 0,
      totalCoins: 0,
      weeklyCoins: 0,
      todayCoins: 0,
      percentileRank: 0,
    };
    await addNewUser(userData);
    return userData;
  } catch (e) {
    console.error("Login failed:", e);
    throw e;
  }
};

export const loginWithEmailPass = async ({
  email,
  pass,
}: {
  email: string;
  pass: string;
}): Promise<userType> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const userData: userType = {
        userId: user.uid,
        userName: data.userName,
        email: email,
        pfpUrl: data.pfpUrl,
        role: data.role,
        interests: data.interests,
        createdAt: data.createdAt,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        goalsCount: data.goalsCount,
        dailyFocusHours: data.dailyFocusHours,
        dailyFocusDelta: data.dailyFocusDelta,
        wellbeingScore: data.wellbeingScore,
        wellbeingDelta: data.wellbeingDelta,
        dayStreak: data.dayStreak,
        meditationHours: data.meditationHours,
        badgesCount: data.badgesCount,
        bestStreak: data.bestStreak,
        totalCoins: data.totalCoins,
        weeklyCoins: data.weeklyCoins,
        todayCoins: data.todayCoins,
        percentileRank: data.percentileRank,
      };
      return userData;
    } else {
      throw new Error("User data not found in Firestore.");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
  useAuthStore.getState().setUser(null);
};

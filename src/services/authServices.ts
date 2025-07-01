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
import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { userType } from "../types/userTypes";
import { addGoalByUser } from "./goalServices";
import { addHabitByUser } from "./habitServices";

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
        goals: data.goals,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        goalsCount: data.goalsCount,
        dayStreak: data.dayStreak,
        meditationHours: data.meditationHours,
        badgesCount: data.badgesCount,
        bestStreak: data.bestStreak,
        totalCoins: data.totalCoins,
        weeklyCoins: data.weeklyCoins,
        todayCoins: data.todayCoins,
        percentileRank: data.percentileRank,
        xp: data.xp,
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
        goals: ["general"],
        followersCount: 0,
        followingCount: 0,
        goalsCount: 0,
        dayStreak: 0,
        meditationHours: 0,
        badgesCount: 0,
        bestStreak: 0,
        totalCoins: 0,
        weeklyCoins: 0,
        todayCoins: 0,
        percentileRank: 0,
        xp: 0,
        streakLastUpdated: serverTimestamp(),
      };
      await addNewUser(userData);
      await addHabitByUser({
        formData: {
          title: "Meditate 10 minutes",
          category: "🏥 Health",
          timeRequired: 10
        },
        userId: user.uid,
      });
      await addHabitByUser({
        formData: {
          title: "Read 30 minutes",
          category: "📚 Learning",
          timeRequired: 30
        },
        userId: user.uid,
      });
      await addGoalByUser({
        userId: user.uid,
        title: "general",
        tags: "general",
        description: "General Todos",
        weeks: 0,
        totalTodos: 0,
      });
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
      goals: ["general"],
      followersCount: 0,
      followingCount: 0,
      goalsCount: 0,
      dayStreak: 0,
      meditationHours: 0,
      badgesCount: 0,
      bestStreak: 0,
      totalCoins: 0,
      weeklyCoins: 0,
      todayCoins: 0,
      percentileRank: 0,
      xp: 0,
      streakLastUpdated: serverTimestamp(),
    };
    await addNewUser(userData);
    await addHabitByUser({
      formData: {
        title: "Meditate 10 minutes",
        category: "🏥 Health",
        timeRequired: 10
      },
      userId: user.uid,
    });
    await addHabitByUser({
      formData: {
        title: "Read 30 minutes",
        category: "📚 Learning",
        timeRequired: 30
      },
      userId: user.uid,
    });
    await addGoalByUser({
      userId: user.uid,
      title: "general",
      tags: "general",
      description: "General Todos",
      weeks: 0,
      totalTodos: 0,
    });
    return userData;
  } catch (e) {
    console.error("Signup failed:", e);
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
        goals: data.goals,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        goalsCount: data.goalsCount,
        dayStreak: data.dayStreak,
        meditationHours: data.meditationHours,
        badgesCount: data.badgesCount,
        bestStreak: data.bestStreak,
        totalCoins: data.totalCoins,
        weeklyCoins: data.weeklyCoins,
        todayCoins: data.todayCoins,
        percentileRank: data.percentileRank,
        xp: data.xp,
        streakLastUpdated: data.streakLastUpdated,
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

export const incrementUserXp = async ({
  userId,
  isIncrementing,
}: {
  userId: string;
  isIncrementing: boolean;
}) => {
  try {
    const userRef = doc(db, `users/${userId}`);
    if (isIncrementing) {
      await updateDoc(userRef, {
        xp: increment(1),
      });
    } else {
      await updateDoc(userRef, {
        xp: increment(-1),
      });
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const updateUserData = async ({
  userId,
  data,
}: {
  userId: string;
  data: { name: string; interests: string[]; role: string };
}) => {
  try {
    console.log("in", data)
    const userRef = doc(db, `users/${userId}`);
    await updateDoc(userRef, data);
  } catch (e) {
    console.error(e);
  }
};

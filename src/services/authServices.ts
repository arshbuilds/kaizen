import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithCredential,
  onIdTokenChanged,
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
  writeBatch,
} from "firebase/firestore";
import { userType } from "../types/userTypes";
import { addGoalByUser } from "./goalServices";
import { addHabitByUser } from "./habitServices";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { toast } from "sonner";

const provider = new GoogleAuthProvider();
const platform = Capacitor.getPlatform();

export const loginWithGoogle = async (): Promise<userType> => {
  try {
    let result;
    if (platform === "android") {
      result = await FirebaseAuthentication.signInWithGoogle();
      if (result.credential?.idToken) {
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken
        );
        await signInWithCredential(auth, credential);
      }
    } else {
      result = await signInWithPopup(auth, provider);
    }

    const user = result.user;
    if (!user) {
      console.error("sign in failed");
      throw "some error occured";
    }
    const pfpUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const userData: userType = {
        userId: user.uid,
        userName: data.userName,
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
      const batch = writeBatch(db);
      const userData: userType = {
        userId: user.uid,
        userName: user.displayName!,
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
      batch.set(doc(db, `users/${user.uid}`), userData);
      const medRef = doc(db, `users/${user.uid}/habits/meditate-10-minutes`);
      batch.set(medRef, {
        title: "Meditate 10 minutes",
        category: "🏥 Health",
        timeRequired: 10,
        createdAt: serverTimestamp(),
        habitId: "meditate-10-minutes",
        lastCompleted: null,
        streak: 0,
      });

      const readRef = doc(db, `users/${user.uid}/habits/read-30-minutes`);
      batch.set(readRef, {
        title: "Read 30 minutes",
        category: "📚 Learning",
        timeRequired: 30,
        createdAt: serverTimestamp(),
        habitId: "read-30-minutes",
        lastCompleted: null,
        streak: 0,
      });
      const goalRef = doc(db, `users/${user.uid}/goals/general`);
      batch.set(goalRef, {
        goalId: "General",
        title: "general",
        description: "General Todos",
        createdAt: serverTimestamp(),
        weeks: 0,
        tags: ["general"],
        totalTodos: 0,
        doneTodos: 0,
        timeSpent: 0,
        isCompleted: false,
      });
      await batch.commit();
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
        timeRequired: 10,
      },
      userId: user.uid,
    });
    await addHabitByUser({
      formData: {
        title: "Read 30 minutes",
        category: "📚 Learning",
        timeRequired: 30,
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
  data: { userName: string; interests: string[]; role: string };
}) => {
  try {
    const userRef = doc(db, `users/${userId}`);
    await updateDoc(userRef, data);
  } catch (e) {
    console.error(e);
  }
};

export const updateUserProfile = async ({
  userId,
  pfpUrl,
}: {
  userId: string;
  pfpUrl: string;
}) => {
  try {
    const userRef = doc(db, `users/${userId}`);
    await updateDoc(userRef, { pfpUrl });
  } catch (e) {
    console.error(e);
    toast.error("Some error occured");
    throw e;
  }
};

// export const sendVerificationLink = async (email: string) => {
//   try {

//   } catch (e) {
//     console.error(e);
//     throw e;
//   }
// };

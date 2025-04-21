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
import { getRandomNumber } from "../utils/genUtils";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { userType } from "../types/userTypes";

const provider = new GoogleAuthProvider();

export const getUserData = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("User not found");
  return snapshot.data();
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const pfpUrl = `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`;
    useAuthStore.getState().setUser({
      userId: user.uid,
      userName: user.displayName,
      email: user.email,
      pfpUrl: `https://api.dicebear.com/7.x/thumbs/svg?seed=${user.uid}`,
    });
    const userData = {
      userId: user.uid,
      userName: user.displayName
        ? user.displayName
        : `user${getRandomNumber(100000000, 999999999)}`,
      email: user.email,
      pfpUrl,
    };
    await addNewUser(userData);
    toast.success("succesffull");
  } catch (e) {
    toast.error("Some error occured");
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
    const userData = {
      userId: user.uid,
      userName: username,
      email,
      pfpUrl,
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
      const userData = {
        userId: user.uid,
        userName: data.name,
        email: data.email ?? "",
        pfpUrl: data.pfpUrl,
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

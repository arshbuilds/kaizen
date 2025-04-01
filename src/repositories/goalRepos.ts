import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { goalType } from "../types/goalTypes";

export const getUserGoalsData = async (userId: string) => {
  const data: Array<goalType> = [];
  const collectionRef = collection(db, `users/${userId}/goals`);
  const querySnapshot = await getDocs(collectionRef);
  querySnapshot.forEach((doc) => {
    data.push({ goalId: doc.id, ...doc.data() } as goalType);
  });
  return data;
};





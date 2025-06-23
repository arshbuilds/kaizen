import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { goalOutputType } from "../types/goalTypes";

export const getUserGoalsData = async (userId: string) => {
  const data: Array<goalOutputType> = [];
  const collectionRef = collection(db, `users/${userId}/goals`);
  const querySnapshot = await getDocs(collectionRef);
  querySnapshot.forEach((doc) => {
    data.push({ goalId: doc.id, ...doc.data() } as goalOutputType);
  });
  return data;
};
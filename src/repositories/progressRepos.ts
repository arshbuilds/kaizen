import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { MonthStats } from "../types/progressTypes";

export const getConsistencyDataRepo = async (key:string) => {
 const docRef = doc(db, key)
 const snap = await getDoc(docRef);
 if(!snap.exists()){
    return null
 }
 return snap.data() as MonthStats; 
}
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { userType } from "../types/userTypes";

export const addNewUser = async (params: userType) => {
    const docRef = doc(db, `users/${params.userId}`)
    await setDoc(docRef, params)
}
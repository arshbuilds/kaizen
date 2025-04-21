import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";



type addUserParams = {
    userId: string;
    userName: string;
    pfpUrl: string;
    email: string | null;
}

export const addNewUser = async (params: addUserParams) => {
    const docRef = doc(db, `users/${params.userId}`)
    await setDoc(docRef, {userName: params.userName ,userId: params.userId, email: params.email? params.email: "",pfpUrl: params.pfpUrl })
}
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";



type addUserParams = {
    userId: string;
    name: string;
    pfpUrl: string;
    email: string | null;
}

export const addNewUser = async (params: addUserParams) => {
    const docRef = doc(db, `users/${params.userId}`)
    await setDoc(docRef, {userName: params.name ,userId: params.userId, email: params.email? params.email: "",pfpUrl: params.pfpUrl })
}
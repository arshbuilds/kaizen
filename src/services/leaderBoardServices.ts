import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { rankedUserType} from "../types/userTypes";
import { db } from "../lib/firebase";

export const getAllUsersByRank = async (): Promise<rankedUserType[]> => {
  try {
    const data: rankedUserType[] = [];
    const colRef = collection(db, "users");
    const q = query(colRef, orderBy("xp", "desc"), limit(50));
    let rank = 1;
    (await getDocs(q)).forEach((doc) => {
      data.push({ ...doc.data(), rank } as rankedUserType);
      rank++;
    });
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

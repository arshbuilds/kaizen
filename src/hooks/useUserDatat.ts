import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import { auth, db } from "../lib/firebase";

export const useUserData = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUser({
              userId: firebaseUser.uid,
              userName: userData.name,
              email: firebaseUser.email ?? "",
              pfpUrl: userData.pfpUrl,
            });
          } else {
            console.warn("User doc not found in Firestore.");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, router]);

  return { loading };
};

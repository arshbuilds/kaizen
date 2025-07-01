import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";

export const useUserData = () => {
  const setUser           = useAuthStore(s => s.setUser);
  const setLoading        = useAuthStore(s => s.setLoading);
  const setHasFetchedUser = useAuthStore(s => s.setHasFetchedUser);

  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    const unsubscribeAuth = onAuthStateChanged(auth, firebaseUser => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        router.push('/enter');
        return;
      }

      // LIVE LISTENER on the user doc ↓↓↓
      const unsubscribeUserDoc = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        snap => {
          if (snap.exists()) {
            setUser({ userId: firebaseUser.uid, ...snap.data() });
          } else {
            console.warn('No user doc found!');
            setUser(null);
          }
          setHasFetchedUser(true);
          setLoading(false);
        },
        err => {
          console.error('Error listening user doc', err);
          setLoading(false);
        }
      );

      // When auth state changes again → stop listening to old doc
      return unsubscribeUserDoc;
    });

    // Clean up on unmount
    return () => unsubscribeAuth();
  }, [router, setUser, setLoading, setHasFetchedUser]);
};
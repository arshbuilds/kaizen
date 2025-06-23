import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/useAuthStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";

export const useUserData = () => {
  
  const hasFetchedUser = useAuthStore((state) => state.hasFetchedUser)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setHasFetchedUser = useAuthStore((state) => state.setHasFetchedUser)
 
  const router = useRouter();

  useEffect(() => {
    if (hasFetchedUser) {
      return;
    }

    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              userId: firebaseUser.uid,
              userName: data.userName,
              email: data.email,
              pfpUrl: data.pfpUrl,
              role: data.role,
              interests: data.interests,
              createdAt: data.createdAt,
              goals: data.goals,
              followersCount: data.followersCount,
              followingCount: data.followingCount,
              goalsCount: data.goalsCount,
              dayStreak: data.dayStreak,
              meditationHours: data.meditationHours,
              badgesCount: data.badgesCount,
              bestStreak: data.bestStreak,
              totalCoins: data.totalCoins,
              weeklyCoins: data.weeklyCoins,
              todayCoins: data.todayCoins,
              percentileRank: data.percentileRank,
              xp: data.xp,
              streakLastUpdated: data.streakLastUpdated
            });
          } else {
            console.warn("No user doc found!");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUser(null);
        router.push("/enter");
      }

      setHasFetchedUser(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasFetchedUser, setUser, setLoading, setHasFetchedUser, router]);
};

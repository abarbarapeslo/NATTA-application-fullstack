import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useColors } from "@/hooks/use-colors";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn(
        "[AuthGuard] Firebase env vars missing — skipping auth. Set EXPO_PUBLIC_FIREBASE_* in .env to enable login.",
      );
      setUser(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (user) => {
        setUser(user);
        setLoading(false);
      });
    } catch (err) {
      console.error("[AuthGuard] Firebase auth init failed:", err);
      setUser(null);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = (segments[0] as string) === "auth";

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/auth/login" as any);
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [user, segments, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useSegments } from "expo-router";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useColors } from "@/hooks/use-colors";
import { usePushRegistration } from "@/hooks/use-push-registration";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  usePushRegistration();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn(
        "[AuthGuard] Firebase not initialized — skipping auth. Ensure google-services.json / GoogleService-Info.plist are present and rebuild the native app.",
      );
      setUser(null);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = getFirebaseAuth().onAuthStateChanged((user) => {
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
    const inPublicGroup = (segments[0] as string) === "legal";

    if (!user && !inAuthGroup && !inPublicGroup) {
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

import { useEffect } from "react";
import { Alert } from "react-native";
import {
  getFcmToken,
  onForegroundMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestNotificationPermission,
} from "@/lib/push-notifications";
import { useFirebaseUser } from "@/hooks/use-firebase-user";

/**
 * Stub: replace with a real backend call once `server/` exposes an endpoint
 * that stores {uid, fcmToken, platform} for later targeted push from the
 * backend. Until then we just log so we can verify the token in dev.
 */
async function registerTokenWithBackend(uid: string, token: string) {
  console.log("[push] would register token with backend", {
    uid,
    token: token.slice(0, 20) + "...",
  });
}

/**
 * Wires up push notifications for the currently signed-in user:
 * - asks for permission on first sign-in
 * - sends the FCM token to the backend
 * - listens for token refreshes
 * - shows foreground messages as a simple alert (replace with in-app toast
 *   when one is available)
 * - logs taps on notifications opened from background
 *
 * Mount once near the root (e.g. inside AuthGuard after auth succeeds).
 */
export function usePushRegistration() {
  const user = useFirebaseUser();
  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    (async () => {
      const granted = await requestNotificationPermission();
      if (!granted || cancelled) return;
      const token = await getFcmToken();
      if (!token || cancelled) return;
      await registerTokenWithBackend(uid, token);
    })();

    const unsubRefresh = onTokenRefresh((token) => {
      registerTokenWithBackend(uid, token).catch((err) =>
        console.warn("[push] register refreshed token failed", err),
      );
    });

    return () => {
      cancelled = true;
      unsubRefresh();
    };
  }, [uid]);

  useEffect(() => {
    const unsubForeground = onForegroundMessage((msg) => {
      const title = msg.notification?.title ?? "Notification";
      const body = msg.notification?.body ?? "";
      // Lightweight surfacing for now; swap for an in-app toast later.
      Alert.alert(title, body);
    });

    const unsubOpenedApp = onNotificationOpenedApp((msg) => {
      console.log("[push] opened app from background notification", msg.data);
    });

    return () => {
      unsubForeground();
      unsubOpenedApp();
    };
  }, []);
}

import { useEffect } from "react";
import { Alert } from "react-native";
import {
  getFcmToken,
  getInitialNotification,
  onForegroundMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestNotificationPermission,
} from "@/lib/push-notifications";
import { navigateFromPushNotification } from "@/lib/push-navigation";
import { registerDeviceToken } from "@/lib/push-register";
import { useFirebaseUser } from "@/hooks/use-firebase-user";

/**
 * Wires up push notifications for the currently signed-in user:
 * - asks for permission on first sign-in
 * - sends the FCM token to the NATTA backend
 * - listens for token refreshes
 * - shows foreground messages as a simple alert
 * - opens the opportunity screen when the user taps a notification
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
      try {
        await registerDeviceToken(token);
      } catch (err) {
        console.warn("[push] register token failed", err);
      }
    })();

    const unsubRefresh = onTokenRefresh((token) => {
      registerDeviceToken(token).catch((err) =>
        console.warn("[push] register refreshed token failed", err),
      );
    });

    return () => {
      cancelled = true;
      unsubRefresh();
    };
  }, [uid]);

  useEffect(() => {
    getInitialNotification().then((msg) => {
      if (msg) navigateFromPushNotification(msg);
    });

    const unsubForeground = onForegroundMessage((msg) => {
      const title = msg.notification?.title ?? "Notification";
      const body = msg.notification?.body ?? "";
      Alert.alert(title, body, [
        { text: "Dismiss", style: "cancel" },
        {
          text: "Open",
          onPress: () => navigateFromPushNotification(msg),
        },
      ]);
    });

    const unsubOpenedApp = onNotificationOpenedApp((msg) => {
      navigateFromPushNotification(msg);
    });

    return () => {
      unsubForeground();
      unsubOpenedApp();
    };
  }, []);
}

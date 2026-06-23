import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { Platform, PermissionsAndroid } from "react-native";

/**
 * Asks the OS for permission to display notifications.
 *
 * - iOS: prompts the system dialog (returns granted if user allowed).
 * - Android 13+ (API 33): prompts POST_NOTIFICATIONS.
 * - Android 12 and below: notifications are granted by default.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    return token || null;
  } catch (err) {
    console.warn("[push] getToken failed", err);
    return null;
  }
}

/**
 * Subscribes to FCM messages while the app is in the foreground. Returns the
 * unsubscribe function — call it from a useEffect cleanup.
 */
export function onForegroundMessage(
  handler: (msg: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  return messaging().onMessage(handler);
}

/**
 * Returns the message that opened the app from a killed state (cold start
 * notification tap), or null when the app was opened normally.
 */
export async function getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
  return messaging().getInitialNotification();
}

/**
 * Subscribes to the user tapping a notification while the app was in the
 * background (not killed). Returns the unsubscribe function.
 */
export function onNotificationOpenedApp(
  handler: (msg: FirebaseMessagingTypes.RemoteMessage) => void,
): () => void {
  return messaging().onNotificationOpenedApp(handler);
}

export function onTokenRefresh(
  handler: (token: string) => void,
): () => void {
  return messaging().onTokenRefresh(handler);
}

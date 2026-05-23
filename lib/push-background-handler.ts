import messaging from "@react-native-firebase/messaging";

/**
 * Background / quit-state notification handler. Must be registered at the
 * very top of the JS entry (imported from `app/_layout.tsx`) so RN Firebase
 * picks it up before any push arrives. Keep this file side-effect only — do
 * not export anything you need to call from elsewhere.
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("[push] background message", remoteMessage?.data);
  // Intentionally minimal: actual display of background notifications is
  // handled by the system using the `notification` payload that the backend
  // sends. Use this hook only for silent / data-only payloads.
});

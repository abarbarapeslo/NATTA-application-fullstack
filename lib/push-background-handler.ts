/**
 * Background / quit-state notification handler. Must be registered at the
 * very top of the JS entry (imported from `app/_layout.tsx`) so RN Firebase
 * picks it up before any push arrives.
 *
 * Defensive: if the messaging native module isn't present (older APK,
 * misconfig, etc.) we must NEVER throw at module-load time — that would
 * crash the app before React Native even mounts, before Crashlytics can
 * report anything. Hence the require + try/catch instead of a top-level
 * import.
 */
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const messaging = require("@react-native-firebase/messaging").default;
  messaging().setBackgroundMessageHandler(async (remoteMessage: unknown) => {
    try {
      console.log("[push] background message", remoteMessage);
    } catch {
      // swallow
    }
  });
} catch (err) {
  console.warn("[push] could not register background handler", err);
}

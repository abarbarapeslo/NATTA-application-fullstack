import firebase from "@react-native-firebase/app";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type FirebaseUser = FirebaseAuthTypes.User;
export type FirebaseAuthError = FirebaseAuthTypes.NativeFirebaseAuthError;

export function getFirebaseAuth(): FirebaseAuthTypes.Module {
  return auth();
}

/**
 * Firebase is initialized from the native config files bundled at build time
 * (`google-services.json` / `GoogleService-Info.plist`). If those are missing
 * or invalid, no default app gets registered. Checking `firebase.apps` is the
 * honest runtime signal that Firebase is actually available — unlike checking
 * `EXPO_PUBLIC_FIREBASE_*` env vars, which are not used for configuration.
 */
export function isFirebaseConfigured(): boolean {
  try {
    return firebase.apps.length > 0;
  } catch {
    return false;
  }
}

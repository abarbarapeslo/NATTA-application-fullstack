import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export type FirebaseUser = FirebaseAuthTypes.User;
export type FirebaseAuthError = FirebaseAuthTypes.NativeFirebaseAuthError;

export function getFirebaseAuth(): FirebaseAuthTypes.Module {
  return auth();
}

export function isFirebaseConfigured(): boolean {
  return true;
}

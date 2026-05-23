import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

// Web client ID from Firebase Console → Authentication → Sign-in method → Google.
// Required so the Google Sign-In SDK can ask Google for an `idToken` that
// Firebase accepts via `signInWithCredential(GoogleAuthProvider.credential(idToken))`.
const WEB_CLIENT_ID =
  "1002701205197-i2n4rtjeg69p633bqg4s1stfc9h9uj4p.apps.googleusercontent.com";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("User cancelled the Google sign-in flow.");
    this.name = "GoogleSignInCancelledError";
  }
}

export async function signInWithGoogle() {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();
  if (!isSuccessResponse(result)) {
    throw new GoogleSignInCancelledError();
  }
  const idToken = result.data.idToken;
  if (!idToken) {
    throw new Error("Google sign-in succeeded but no idToken was returned.");
  }
  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential);
}

export async function signOutGoogle() {
  ensureConfigured();
  try {
    await GoogleSignin.signOut();
  } catch {
    // best effort; user may not have a Google session at all
  }
}

export { statusCodes, isErrorWithCode };

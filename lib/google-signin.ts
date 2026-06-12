/**
 * Google Sign-In bridge. Uses lazy `require` so that if the native module
 * isn't available (e.g. running JS on a build that wasn't compiled with the
 * google-signin native code), importing this file at startup doesn't crash
 * the entire app. Errors surface at the point the user actually presses
 * "Continue with Google" instead.
 */
type GoogleSignInModule = typeof import("@react-native-google-signin/google-signin");
type AuthModule = typeof import("@react-native-firebase/auth").default;

function loadGoogleSignin(): GoogleSignInModule | null {
  try {
    return require("@react-native-google-signin/google-signin");
  } catch (err) {
    console.warn("[google-signin] native module unavailable", err);
    return null;
  }
}

function loadAuth(): AuthModule | null {
  try {
    return require("@react-native-firebase/auth").default;
  } catch (err) {
    console.warn("[google-signin] firebase auth unavailable", err);
    return null;
  }
}

// Web client ID from Firebase Console → Authentication → Sign-in method → Google.
// Required so the Google Sign-In SDK can ask Google for an `idToken` that
// Firebase accepts via `signInWithCredential(GoogleAuthProvider.credential(idToken))`.
const WEB_CLIENT_ID =
  "1002701205197-i2n4rtjeg69p633bqg4s1stfc9h9uj4p.apps.googleusercontent.com";

let configured = false;

function ensureConfigured(gs: GoogleSignInModule) {
  if (configured) return;
  gs.GoogleSignin.configure({
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
  const gs = loadGoogleSignin();
  const auth = loadAuth();
  if (!gs || !auth) {
    throw new Error("Google sign-in is not available on this build.");
  }
  ensureConfigured(gs);
  await gs.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await gs.GoogleSignin.signIn();
  if (!gs.isSuccessResponse(result)) {
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
  const gs = loadGoogleSignin();
  if (!gs) return;
  ensureConfigured(gs);
  try {
    await gs.GoogleSignin.signOut();
  } catch {
    // best effort; user may not have a Google session at all
  }
}

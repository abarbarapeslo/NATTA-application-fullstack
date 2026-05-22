import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { Platform } from "react-native";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  setPersistence,
  type Auth,
} from "firebase/auth";

// `getReactNativePersistence` is only exported from the RN entry of
// @firebase/auth (dist/rn). Pull it via require so the web bundle, which does
// not include it, does not blow up at import time.
function loadReactNativePersistence(): ((storage: unknown) => unknown) | null {
  try {
    const mod = require("firebase/auth") as Record<string, unknown>;
    const fn = mod.getReactNativePersistence;
    return typeof fn === "function" ? (fn as (storage: unknown) => unknown) : null;
  } catch {
    return null;
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
}

let authInstance: Auth | null = null;

function createFirebaseAuth(app: FirebaseApp): Auth {
  if (Platform.OS === "web") {
    if (typeof globalThis.document === "undefined") {
      throw new Error(
        "[firebase] getFirebaseAuth() must run in the browser (after mount), not during SSR.",
      );
    }
    const auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("[firebase] setPersistence failed:", err);
    });
    return auth;
  }

  const rnPersistence = loadReactNativePersistence();
  try {
    if (rnPersistence) {
      return initializeAuth(app, {
        persistence: rnPersistence(AsyncStorage) as any,
      });
    }
    return initializeAuth(app);
  } catch (err) {
    console.warn("[firebase] initializeAuth failed, falling back to getAuth", err);
    return getAuth(app);
  }
}

/**
 * Lazily creates Auth so Expo Web SSR does not call getAuth at import time
 * (`Component auth has not been registered yet`).
 * Use from useEffect / event handlers, not during render / module top-level.
 */
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = createFirebaseAuth(getFirebaseApp());
  }
  return authInstance;
}

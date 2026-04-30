import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

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
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
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

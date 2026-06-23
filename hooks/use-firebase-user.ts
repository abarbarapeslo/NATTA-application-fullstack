import { useEffect, useState } from "react";
import { getFirebaseAuth, type FirebaseUser } from "@/lib/firebase";
import { telemetry } from "@/lib/telemetry";

type ProfileRefreshListener = () => void;
const profileRefreshListeners = new Set<ProfileRefreshListener>();

function subscribeProfileRefresh(listener: ProfileRefreshListener): () => void {
  profileRefreshListeners.add(listener);
  return () => profileRefreshListeners.delete(listener);
}

function emitProfileRefresh() {
  profileRefreshListeners.forEach((listener) => listener());
}

/**
 * Reloads the current Firebase user from the server and notifies all
 * `useFirebaseUser()` subscribers. Call after `updateProfile()` — auth
 * profile changes do not fire `onAuthStateChanged`.
 */
export async function refreshFirebaseUserProfile(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return;
  await user.reload();
  emitProfileRefresh();
}

/** Re-render subscribers without a network reload (e.g. on screen focus). */
export function notifyUserProfileChanged(): void {
  emitProfileRefresh();
}

/**
 * Subscribe to Firebase Auth user changes. Returns the live `currentUser`
 * on every render — never a stale snapshot from useState.
 */
export function useFirebaseUser(): FirebaseUser | null {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const unsubAuth = getFirebaseAuth().onAuthStateChanged((next) => {
      setRevision((r) => r + 1);
      telemetry.identify(next?.uid ?? null, next?.email ?? null);
    });
    const unsubProfile = subscribeProfileRefresh(() => {
      setRevision((r) => r + 1);
    });
    return () => {
      unsubAuth();
      unsubProfile();
    };
  }, []);

  return getFirebaseAuth().currentUser;
}

/** Nickname stored on Firebase Auth as `displayName`. */
export function nicknameFromUser(user: FirebaseUser | null): string {
  const u = user ?? getFirebaseAuth().currentUser;
  if (!u) return "";
  return u.displayName?.trim() || u.email?.split("@")[0] || "there";
}

/** @deprecated Use `nicknameFromUser`. */
export const displayNameFromUser = nicknameFromUser;

/** @deprecated Use `nicknameFromUser`. */
export const firstNameFromUser = nicknameFromUser;

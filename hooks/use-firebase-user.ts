import { useEffect, useState } from "react";
import { getFirebaseAuth, type FirebaseUser } from "@/lib/firebase";

export function useFirebaseUser(): FirebaseUser | null {
  const [user, setUser] = useState<FirebaseUser | null>(
    () => getFirebaseAuth().currentUser,
  );

  useEffect(() => {
    return getFirebaseAuth().onAuthStateChanged((next) => setUser(next));
  }, []);

  return user;
}

export function firstNameFromUser(user: FirebaseUser | null): string {
  if (!user) return "";
  const display = user.displayName?.trim();
  if (display) return display.split(" ")[0];
  const email = user.email ?? "";
  return email.split("@")[0] || "there";
}

export function displayNameFromUser(user: FirebaseUser | null): string {
  if (!user) return "";
  return user.displayName?.trim() || user.email?.split("@")[0] || "there";
}

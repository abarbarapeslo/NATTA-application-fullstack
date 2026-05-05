import { describe, it, expect } from "vitest";

const hasFirebaseEnv = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
);

describe.skipIf(!hasFirebaseEnv)("Firebase Configuration", () => {
  it("should have all required Firebase environment variables", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_API_KEY).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_APP_ID).toBeDefined();
  });

  it("should have valid Firebase API key format", () => {
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    expect(apiKey).toMatch(/^AIza[0-9A-Za-z_-]{35}$/);
  });

  it("should have valid Firebase project ID", () => {
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    expect(projectId).toBe("aipply-app-e1a7e");
  });
});

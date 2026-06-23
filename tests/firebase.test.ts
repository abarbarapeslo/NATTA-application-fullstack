import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Firebase is configured through the native config files
 * (`google-services.json` on Android, `GoogleService-Info.plist` on iOS) and
 * the @react-native-firebase plugins in `app.config.ts` — not through
 * `EXPO_PUBLIC_FIREBASE_*` env vars. These tests validate that the committed
 * Android config points at the correct project.
 */
const googleServicesPath = path.join(__dirname, "../google-services.json");

describe("Firebase Configuration", () => {
  it("ships the Android google-services.json", () => {
    expect(fs.existsSync(googleServicesPath)).toBe(true);
  });

  it("points at the natta-app Firebase project", () => {
    const config = JSON.parse(fs.readFileSync(googleServicesPath, "utf-8"));
    expect(config.project_info.project_id).toBe("natta-app-b9e3b");
  });

  it("targets the com.natta.app Android package", () => {
    const config = JSON.parse(fs.readFileSync(googleServicesPath, "utf-8"));
    const packageNames = config.client.map(
      (c: any) => c.client_info.android_client_info.package_name,
    );
    expect(packageNames).toContain("com.natta.app");
  });

  it("has a valid Firebase API key format", () => {
    const config = JSON.parse(fs.readFileSync(googleServicesPath, "utf-8"));
    const apiKey = config.client[0].api_key[0].current_key;
    expect(apiKey).toMatch(/^AIza[0-9A-Za-z_-]{35}$/);
  });

  it("registers the Firebase plugins in app.config.ts", () => {
    const appConfig = fs.readFileSync(
      path.join(__dirname, "../app.config.ts"),
      "utf-8",
    );
    expect(appConfig).toContain("@react-native-firebase/app");
    expect(appConfig).toContain("@react-native-firebase/auth");
    expect(appConfig).toContain("./google-services.json");
  });
});

/**
 * Thin telemetry wrapper around RN Firebase Analytics.
 *
 * Crashlytics was REMOVED in 2026-05 because @react-native-firebase/crashlytics
 * 23.x ships without the Expo config plugin (only 24.x+ has it), and adding
 * it to the app without the corresponding Gradle plugin makes the APK crash
 * at startup with `IllegalStateException: The Crashlytics build ID is missing`.
 * Re-add once the whole @react-native-firebase suite can move to 24.x.
 *
 * Resilient by design: if the analytics native module isn't present, every
 * call silently no-ops. Telemetry must never break the UI.
 */

type AnalyticsModule = ReturnType<
  typeof import("@react-native-firebase/analytics").default
>;

let analyticsInstance: AnalyticsModule | null = null;
let analyticsAvailable: boolean | null = null;

function tryGet<T>(label: string, load: () => T): T | null {
  try {
    return load();
  } catch (err) {
    console.warn(`[telemetry] ${label} native module unavailable — skipping.`, err);
    return null;
  }
}

function getAnalytics(): AnalyticsModule | null {
  if (analyticsAvailable === false) return null;
  if (analyticsInstance) return analyticsInstance;
  const inst = tryGet("Analytics", () => {
    const mod = require("@react-native-firebase/analytics").default;
    return mod() as AnalyticsModule;
  });
  if (inst) {
    analyticsInstance = inst;
    analyticsAvailable = true;
  } else {
    analyticsAvailable = false;
  }
  return analyticsInstance;
}

function safe(fn: () => Promise<unknown> | unknown) {
  try {
    const r = fn();
    if (r && typeof (r as Promise<unknown>).catch === "function") {
      (r as Promise<unknown>).catch(() => {
        // swallow — telemetry must never break the UI
      });
    }
  } catch {
    // swallow
  }
}

export const telemetry = {
  /** Call once after Firebase Auth resolves the current user. */
  identify(uid: string | null, _email?: string | null) {
    const a = getAnalytics();
    if (a) safe(() => a.setUserId(uid));
  },

  /** Record a screen view. */
  screen(name: string) {
    const a = getAnalytics();
    if (a) safe(() => a.logScreenView({ screen_name: name, screen_class: name }));
  },

  /** Custom event. Keep names snake_case and < 40 chars. */
  event(name: string, params?: Record<string, string | number | boolean | undefined>) {
    const a = getAnalytics();
    if (a) safe(() => a.logEvent(name, params as Record<string, string | number | boolean>));
  },

  /**
   * Manually record a non-fatal error. No-op until Crashlytics is re-added.
   * Kept in the API so callers don't break.
   */
  recordError(_err: unknown, _context?: string) {
    // intentionally no-op
  },
};

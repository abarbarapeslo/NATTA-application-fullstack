import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";

/**
 * Thin telemetry wrapper around RN Firebase Analytics + Crashlytics.
 * All calls are best-effort — never throw, never block the UI.
 *
 * Crashlytics: collects native + JS crashes. Surfaces in Firebase console
 * under Crashlytics. Auto-enabled in release builds; in dev builds we keep
 * it on too so we catch issues during the 60-user MVP.
 *
 * Analytics: lightweight events to answer "what do testers actually use?"
 * Avoid PII — the user is already identified by Firebase Auth uid, which
 * we set via `setUserId`.
 */

function safe(fn: () => Promise<unknown> | unknown) {
  try {
    const r = fn();
    if (r && typeof (r as Promise<unknown>).catch === "function") {
      (r as Promise<unknown>).catch((err) =>
        console.warn("[telemetry] op failed", err),
      );
    }
  } catch (err) {
    console.warn("[telemetry] op failed", err);
  }
}

export const telemetry = {
  /** Call once after Firebase Auth resolves the current user. */
  identify(uid: string | null, email?: string | null) {
    safe(() => analytics().setUserId(uid));
    safe(() => crashlytics().setUserId(uid ?? ""));
    if (email) {
      safe(() => crashlytics().setAttribute("email_domain", email.split("@")[1] ?? ""));
    }
  },

  /** Record a screen view (Firebase Analytics treats screens as a special event). */
  screen(name: string) {
    safe(() =>
      analytics().logScreenView({ screen_name: name, screen_class: name }),
    );
    safe(() => crashlytics().log(`screen:${name}`));
  },

  /** Custom event. Keep names snake_case and < 40 chars. */
  event(name: string, params?: Record<string, string | number | boolean | undefined>) {
    safe(() => analytics().logEvent(name, params as Record<string, string | number | boolean>));
    safe(() => crashlytics().log(`event:${name}`));
  },

  /** Manually record a non-fatal error (e.g. a caught exception you want to track). */
  recordError(err: unknown, context?: string) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (context) {
      safe(() => crashlytics().log(`context:${context}`));
    }
    safe(() => crashlytics().recordError(error));
  },
};

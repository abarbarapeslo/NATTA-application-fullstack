import { Platform } from "react-native";
import { auth as nattaAuth } from "@/lib/natta-api";
import { getFcmToken } from "@/lib/push-notifications";

export type PushPlatform = "android" | "ios" | "web";

export function pushPlatform(): PushPlatform {
  if (Platform.OS === "android" || Platform.OS === "ios" || Platform.OS === "web") {
    return Platform.OS;
  }
  return "android";
}

export async function registerDeviceToken(token: string): Promise<void> {
  await nattaAuth.registerDevice({
    fcmToken: token,
    platform: pushPlatform(),
  });
}

export async function unregisterCurrentDeviceToken(): Promise<void> {
  const token = await getFcmToken();
  if (!token) return;
  await nattaAuth.unregisterDevice({ fcmToken: token });
}

import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { router } from "expo-router";
import { opportunityIdFromPush } from "@/lib/push-data";

export { opportunityIdFromPush } from "@/lib/push-data";

export function navigateFromPushNotification(
  msg: FirebaseMessagingTypes.RemoteMessage,
): void {
  const opportunityId = opportunityIdFromPush(msg);
  if (opportunityId === null) return;
  router.push(`/opportunities/${opportunityId}` as any);
}

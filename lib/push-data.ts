import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";

export function opportunityIdFromPush(
  msg: FirebaseMessagingTypes.RemoteMessage,
): number | null {
  const raw = msg.data?.opportunityId;
  if (typeof raw !== "string") return null;
  const id = Number.parseInt(raw, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

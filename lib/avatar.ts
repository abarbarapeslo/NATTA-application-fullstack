/**
 * Profile avatar storage helpers (Firebase Storage).
 *
 * Each user has a single deterministic avatar object at
 * `avatars/{uid}/avatar.jpg`, so re-uploading overwrites the previous file (no
 * orphaned blobs) and the `{uid}` folder maps cleanly to Storage security
 * rules. The resulting download URL is persisted on the user's Firestore doc
 * and Firebase Auth profile — see `useUserProfile().saveAvatar`.
 */
import storage from "@react-native-firebase/storage";

function avatarRef(uid: string) {
  return storage().ref(`avatars/${uid}/avatar.jpg`);
}

/**
 * Uploads a local image file to Storage and returns its public download URL.
 * `localUri` is the file URI returned by expo-image-picker.
 */
export async function uploadAvatar(uid: string, localUri: string): Promise<string> {
  const ref = avatarRef(uid);
  await ref.putFile(localUri, { contentType: "image/jpeg" });
  return ref.getDownloadURL();
}

/** Removes the user's avatar from Storage. Missing file is treated as success. */
export async function deleteAvatar(uid: string): Promise<void> {
  try {
    await avatarRef(uid).delete();
  } catch (err: any) {
    if (err?.code !== "storage/object-not-found") throw err;
  }
}

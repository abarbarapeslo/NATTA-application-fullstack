/**
 * Profile avatar helpers (Base64 data URI, no external storage).
 *
 * The Firebase Spark (free) plan no longer includes Cloud Storage, so instead
 * of uploading a file we downscale the picked image to a small square and embed
 * it as a JPEG `data:` URI. That string is persisted directly on the user's
 * Firestore doc (`users/{uid}.photoURL`) — see `useUserProfile().saveAvatar`.
 *
 * Firestore documents are capped at ~1MB, so we aggressively resize/compress to
 * keep the encoded avatar well under that (~20–50KB in practice).
 */
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

/** Target square size (px) for the stored avatar. */
const AVATAR_SIZE = 256;
/** JPEG compression (0 = smallest, 1 = best quality). */
const AVATAR_COMPRESS = 0.5;

/**
 * Downscales a locally-picked image and returns a `data:image/jpeg;base64,...`
 * URI ready to be stored and rendered directly by `<Image source={{ uri }} />`.
 * `localUri` is the file URI returned by expo-image-picker.
 */
export async function buildAvatarDataUri(localUri: string): Promise<string> {
  const context = ImageManipulator.manipulate(localUri);
  context.resize({ width: AVATAR_SIZE, height: AVATAR_SIZE });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: AVATAR_COMPRESS,
    format: SaveFormat.JPEG,
    base64: true,
  });

  if (!result.base64) {
    throw new Error("Failed to encode avatar image.");
  }
  return `data:image/jpeg;base64,${result.base64}`;
}

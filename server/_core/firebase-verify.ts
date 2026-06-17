import { decodeProtectedHeader, importX509, jwtVerify } from "jose";
import { ENV } from "./env";

/**
 * Verifies a Firebase ID token without the Firebase Admin SDK (and without a
 * service account). Firebase signs ID tokens with RS256 using rotating keys
 * whose public x509 certificates are published by Google. We fetch those
 * certs, pick the one matching the token's `kid`, and verify the signature +
 * standard claims (issuer/audience/expiry) against the project id.
 *
 * Reference:
 * https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 */

const CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

type CertMap = Record<string, string>;

let certCache: { certs: CertMap; expiresAt: number } | null = null;

async function getCerts(): Promise<CertMap> {
  if (certCache && certCache.expiresAt > Date.now()) {
    return certCache.certs;
  }

  const res = await fetch(CERTS_URL);
  if (!res.ok) {
    throw new Error(`Could not fetch Firebase public certs: ${res.status}`);
  }

  const certs = (await res.json()) as CertMap;

  // Honour Google's Cache-Control max-age so we don't refetch on every call.
  const cacheControl = res.headers.get("cache-control") ?? "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  certCache = { certs, expiresAt: Date.now() + maxAgeSeconds * 1000 };

  return certs;
}

export type VerifiedFirebaseUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
};

export async function verifyFirebaseToken(
  idToken: string,
): Promise<VerifiedFirebaseUser> {
  const projectId = ENV.firebaseProjectId;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured");
  }

  const { kid, alg } = decodeProtectedHeader(idToken);
  if (alg !== "RS256") {
    throw new Error(`Unexpected token algorithm: ${alg}`);
  }
  if (!kid) {
    throw new Error("Token is missing a key id (kid)");
  }

  const certs = await getCerts();
  const pem = certs[kid];
  if (!pem) {
    throw new Error("No matching public key for token");
  }

  const publicKey = await importX509(pem, "RS256");
  const { payload } = await jwtVerify(idToken, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (!payload.sub) {
    throw new Error("Token is missing a subject (uid)");
  }

  return {
    uid: payload.sub,
    email: (payload.email as string | undefined) ?? null,
    emailVerified: Boolean(payload.email_verified),
  };
}

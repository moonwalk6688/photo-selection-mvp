import { createHash, timingSafeEqual } from "crypto";

function getSecret() {
  return process.env.PHOTO_PASSWORD_SECRET || "local-dev-photo-secret";
}

export function hashAlbumPassword(password: string) {
  const normalized = password.trim();
  if (!normalized) return null;
  return createHash("sha256")
    .update(`${getSecret()}:${normalized}`)
    .digest("hex");
}

export function verifyAlbumPassword(password: string, hash: string | null) {
  if (!hash) return true;
  const incoming = hashAlbumPassword(password);
  if (!incoming) return false;
  const a = Buffer.from(incoming, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

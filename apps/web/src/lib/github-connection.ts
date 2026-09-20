import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const key = createHash("sha256").update(process.env.AUTH_SECRET ?? "").digest();

export function sealGitHubToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openGitHubToken(value?: string) {
  if (!value) return null;
  try {
    const payload = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key, payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
  } catch { return null; }
}

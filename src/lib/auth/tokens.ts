import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase, encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export function generateMagicLinkToken(): { token: string; tokenHash: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  return { token, tokenHash };
}

export function hashToken(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export function generateSessionId(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return encodeHexLowerCase(sha256(new TextEncoder().encode(ip))).slice(0, 32);
}

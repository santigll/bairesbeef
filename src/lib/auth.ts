import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "bb_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.SESSION_SECRET || "baires-beef-dev-secret-change-me";
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

function sign(payload: string): string {
  return base64url(createHmac("sha256", getSecret()).update(payload).digest());
}

export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  const encodedPayload = base64url(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = sign(encodedPayload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(fromBase64url(encodedPayload).toString("utf-8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function constantTimeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a comparison to avoid trivially leaking length via timing.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "bairesbeef2024";
  return (
    constantTimeStringEqual(username, expectedUser) &&
    constantTimeStringEqual(password, expectedPassword)
  );
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

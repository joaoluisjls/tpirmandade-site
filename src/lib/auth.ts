import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

const SECRET = process.env.AUTH_SECRET || "tpirmandade-auth-secret-2026";
const COOKIE_NAME = "admin-token";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashToVerify = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashToVerify, "hex"));
}

export function createToken(email: string): string {
  const payload = `${email}:${Date.now()}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) return null;
    const sig = parts.pop()!;
    const email = parts[0];
    const payload = parts.join(":");
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expectedSig) return null;
    return email;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const email = verifyToken(token);
  if (!email) return null;
  return { email };
}



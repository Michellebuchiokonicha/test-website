import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Single-owner admin login. Set ADMIN_PASSWORD (and ideally SESSION_SECRET) in Vercel.
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(value: string): string {
  return createHmac("sha256", secret() ?? "").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

export async function createSession(): Promise<void> {
  const expires = Date.now() + MAX_AGE * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  const store = await cookies();
  store.set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured() || !secret()) return false;
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  if (!expires || !sig) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(sig, sign(expires));
}

// Very small in-memory brake on password guessing (per server instance).
const attempts = new Map<string, { count: number; first: number }>();
export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.first > 15 * 60 * 1000) return false;
  return a.count >= 8;
}
export function recordFailure(key: string): void {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.first > 15 * 60 * 1000) attempts.set(key, { count: 1, first: now });
  else a.count += 1;
}
export function clearFailures(key: string): void {
  attempts.delete(key);
}

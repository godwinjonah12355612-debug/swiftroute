import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "swift-route-admin";

function configured() { return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET); }
function sign(value: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(value).digest("hex"); }
function safeEqual(left: string, right: string) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }

export function isAdminConfigured() { return configured(); }

export async function isAdmin() {
  if (!configured()) return false;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  return Boolean(expires && signature && Number(expires) > Date.now() && safeEqual(signature, sign(expires)));
}

export async function createAdminSession(password: string) {
  if (!configured() || !safeEqual(password, process.env.ADMIN_PASSWORD ?? "")) return false;
  const expires = String(Date.now() + 1000 * 60 * 60 * 8);
  (await cookies()).set(cookieName, `${expires}.${sign(expires)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return true;
}

export async function clearAdminSession() { (await cookies()).delete(cookieName); }

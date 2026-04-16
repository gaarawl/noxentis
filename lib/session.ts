import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import type { PlanTier, SessionUser } from "@/lib/domain/models";

const SESSION_COOKIE = "noxentis_session";

function getSecret() {
  return process.env.AUTH_SECRET || "noxentis-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function encodeSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token?: string | null): SessionUser | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = sign(payload);
  const valid =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export async function createDemoSession(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  plan?: PlanTier;
}) {
  const store = await cookies();
  const user: SessionUser = {
    email: input.email,
    firstName: input.firstName || "Clara",
    lastName: input.lastName || "Martin",
    companyName: input.companyName || "Maison Serein Studio",
    role: "OWNER",
    plan: input.plan || "PRO"
  };

  store.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return user;
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

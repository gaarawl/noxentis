import { z } from "zod";

import { createDemoSession, destroySession, getSessionUser } from "@/lib/session";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema
} from "@/lib/domain/validators";

export type AuthResult = { ok: true; redirectTo?: string } | { ok: false; message: string };

function parseWithMessage<T extends z.ZodTypeAny>(schema: T, payload: unknown) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return {
      ok: false as const,
      message: result.error.issues[0]?.message || "Informations invalides."
    };
  }

  return { ok: true as const, data: result.data };
}

export async function signIn(payload: unknown): Promise<AuthResult> {
  const parsed = parseWithMessage(loginSchema, payload);
  if (!parsed.ok) {
    return parsed;
  }

  await createDemoSession({
    email: parsed.data.email
  });

  return { ok: true, redirectTo: "/dashboard" };
}

export async function registerAccount(payload: unknown): Promise<AuthResult> {
  const parsed = parseWithMessage(registerSchema, payload);
  if (!parsed.ok) {
    return parsed;
  }

  await createDemoSession({
    email: parsed.data.email,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    companyName: parsed.data.companyName
  });

  return { ok: true, redirectTo: "/dashboard" };
}

export async function requestReset(payload: unknown): Promise<AuthResult> {
  const parsed = parseWithMessage(forgotPasswordSchema, payload);
  if (!parsed.ok) {
    return parsed;
  }

  return {
    ok: true,
    redirectTo: `/login?reset=${encodeURIComponent(parsed.data.email)}`
  };
}

export async function logout() {
  await destroySession();
}

export async function getCurrentSession() {
  return getSessionUser();
}

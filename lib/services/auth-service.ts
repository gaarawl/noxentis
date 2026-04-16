import { z } from "zod";

import { billingPlanCatalog, TRIAL_LENGTH_DAYS } from "@/lib/config/billing";
import { demoSession } from "@/lib/data/demo-data";
import type { SessionUser } from "@/lib/domain/models";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/lib/domain/validators";
import { hashPassword, normalizeEmail, verifyPassword, generatePlaceholderSiren } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";
import { isLiveMode } from "@/lib/runtime";
import { createDemoSession, createSession, destroySession, getSessionUser } from "@/lib/session";

export type AuthResult = { ok: true; redirectTo?: string } | { ok: false; message: string };

export class AuthenticationError extends Error {
  constructor(message = "Connexion requise.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

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

function toSessionUser(input: {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: SessionUser["role"];
  };
  company: {
    id: string;
    brandName: string;
    subscription?: {
      plan: SessionUser["plan"];
    } | null;
  };
}): SessionUser {
  return {
    userId: input.user.id,
    companyId: input.company.id,
    email: input.user.email,
    firstName: input.user.firstName,
    lastName: input.user.lastName,
    companyName: input.company.brandName,
    role: input.user.role,
    plan: input.company.subscription?.plan || "PRO"
  };
}

export async function signIn(payload: unknown): Promise<AuthResult> {
  const parsed = parseWithMessage(loginSchema, payload);
  if (!parsed.ok) {
    return parsed;
  }

  if (!isLiveMode()) {
    await createDemoSession({
      email: parsed.data.email
    });

    return { ok: true, redirectTo: "/dashboard" };
  }

  const prisma = getPrisma();
  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      companies: {
        include: {
          subscription: true
        },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return {
      ok: false,
      message: "Email ou mot de passe invalide."
    };
  }

  const company = user.companies[0];
  if (!company) {
    return {
      ok: false,
      message: "Aucune entreprise n'est rattachée à ce compte."
    };
  }

  await createSession(
    toSessionUser({
      user,
      company
    })
  );

  return { ok: true, redirectTo: "/dashboard" };
}

export async function registerAccount(payload: unknown): Promise<AuthResult> {
  const parsed = parseWithMessage(registerSchema, payload);
  if (!parsed.ok) {
    return parsed;
  }

  if (!isLiveMode()) {
    await createDemoSession({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      companyName: parsed.data.companyName
    });

    return { ok: true, redirectTo: "/dashboard" };
  }

  const prisma = getPrisma();
  const email = normalizeEmail(parsed.data.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return {
      ok: false,
      message: "Un compte existe déjà avec cette adresse email."
    };
  }

  const companyName = parsed.data.companyName.trim();
  const passwordHash = hashPassword(parsed.data.password);

  const result = await prisma.$transaction(async (tx) => {
    const trialEndsAt = addDays(new Date(), TRIAL_LENGTH_DAYS);
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: parsed.data.firstName.trim(),
        lastName: parsed.data.lastName.trim(),
        role: "OWNER"
      }
    });

    const company = await tx.company.create({
      data: {
        ownerId: user.id,
        legalName: companyName,
        brandName: companyName,
        siren: generatePlaceholderSiren(),
        vatNumber: null,
        address: "À compléter",
        city: "Paris",
        postalCode: "75001",
        country: "France",
        paymentTerms: "Paiement à 30 jours",
        email,
        phone: "",
        activityLabel: "À compléter",
        tvaOnDebits: false
      }
    });

    const subscription = await tx.billingSubscription.create({
      data: {
        companyId: company.id,
        plan: "PRO",
        status: "TRIALING",
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
        seats: billingPlanCatalog.PRO.includedSeats
      }
    });

    return { user, company: { ...company, subscription } };
  });

  await createSession(
    toSessionUser({
      user: result.user,
      company: result.company
    })
  );

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
  const session = await getSessionUser();
  if (session) {
    return session;
  }

  return isLiveMode() ? null : demoSession;
}

export async function requireCurrentSession() {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthenticationError();
  }

  return session;
}

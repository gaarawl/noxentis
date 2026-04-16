import { PrismaClient } from "@prisma/client";

declare global {
  var __noxentisPrisma__: PrismaClient | undefined;
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.__noxentisPrisma__) {
    globalThis.__noxentisPrisma__ = new PrismaClient();
  }

  return globalThis.__noxentisPrisma__;
}

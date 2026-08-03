// Prisma Client singleton — Node.js runtime only.
//
// - `engineType = "library"` is set in prisma/schema.prisma so Prisma ships the
//   standard Node.js library engine instead of the WASM build that fails on
//   Vercel/Next.js with "Can't resolve './query_engine_bg.js'".
// - The global singleton prevents connection exhaustion across dev hot-reloads
//   and ensures a single client instance per serverless function invocation.
// - This file must NEVER be imported from `middleware.ts` / `lib/auth.config.ts`
//   because those run on the Edge Runtime. No WASM / edge-specific drivers are
//   used here.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


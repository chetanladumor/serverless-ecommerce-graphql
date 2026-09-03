import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// In serverless (AWS Lambda) and local dev hot-reloading,
// we cache the PrismaClient instance on globalThis to prevent
// exhausting database connections.
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

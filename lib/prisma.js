import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern: in dev mode, modules can be reloaded
// on every request, which would otherwise create a new PrismaClient (and a
// new DB connection) each time. Stashing it on globalThis avoids that.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

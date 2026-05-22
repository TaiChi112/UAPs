import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

import { dbEnv } from "./config";

declare global {
  var __uapsPrismaClient__: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const adapter = new PrismaPg(
    {
      connectionString: dbEnv.databaseUrl,
      max: dbEnv.pgPoolMax,
      connectionTimeoutMillis: dbEnv.pgPoolConnectionTimeoutMs,
      idleTimeoutMillis: dbEnv.pgPoolIdleTimeoutMs,
    },
    {
      schema: dbEnv.databaseSchema,
    },
  );

  return new PrismaClient({ adapter });
};

export const prisma =
  globalThis.__uapsPrismaClient__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__uapsPrismaClient__ = prisma;
}

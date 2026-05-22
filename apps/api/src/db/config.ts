import { z } from "zod";

const DbStrategySchema = z.enum(["ORM", "RAW"]);

const dbEnvironmentSchema = z.object({
  DB_STRATEGY: DbStrategySchema.default("ORM"),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  DATABASE_SCHEMA: z.string().min(1).default("public"),
  PGPOOL_MAX: z.coerce.number().int().positive().default(10),
  PGPOOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(5000),
  PGPOOL_IDLE_TIMEOUT_MS: z.coerce.number().int().nonnegative().default(10000),
});

const parsedEnvironment = dbEnvironmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(
    `Invalid database environment configuration: ${parsedEnvironment.error.message}`,
  );
}

export type DbStrategy = z.infer<typeof DbStrategySchema>;

export const dbEnv = {
  strategy: parsedEnvironment.data.DB_STRATEGY,
  databaseUrl: parsedEnvironment.data.DATABASE_URL,
  directUrl:
    parsedEnvironment.data.DIRECT_URL ?? parsedEnvironment.data.DATABASE_URL,
  databaseSchema: parsedEnvironment.data.DATABASE_SCHEMA,
  pgPoolMax: parsedEnvironment.data.PGPOOL_MAX,
  pgPoolConnectionTimeoutMs:
    parsedEnvironment.data.PGPOOL_CONNECTION_TIMEOUT_MS,
  pgPoolIdleTimeoutMs: parsedEnvironment.data.PGPOOL_IDLE_TIMEOUT_MS,
} as const;

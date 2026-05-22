import { Pool } from "pg";
import type { PoolClient, QueryResult, QueryResultRow } from "pg";

import { dbEnv } from "./config";

export type SqlParameters = readonly unknown[];

let sharedPool: Pool | null = null;

const createPool = () => {
  const pool = new Pool({
    connectionString: dbEnv.databaseUrl,
    max: dbEnv.pgPoolMax,
    connectionTimeoutMillis: dbEnv.pgPoolConnectionTimeoutMs,
    idleTimeoutMillis: dbEnv.pgPoolIdleTimeoutMs,
  });

  pool.on("error", (error) => {
    console.error("[api][db] Unexpected idle PostgreSQL client error", error);
  });

  return pool;
};

export const getPgPool = () => {
  if (!sharedPool) {
    sharedPool = createPool();
  }

  return sharedPool;
};

export const query = async <TRow extends QueryResultRow>(
  text: string,
  values: SqlParameters = [],
): Promise<QueryResult<TRow>> => {
  return getPgPool().query<TRow>(text, [...values]);
};

export const withClient = async <TValue>(
  runner: (client: PoolClient) => Promise<TValue>,
): Promise<TValue> => {
  const client = await getPgPool().connect();

  try {
    return await runner(client);
  } finally {
    client.release();
  }
};

export const withTransaction = async <TValue>(
  runner: (client: PoolClient) => Promise<TValue>,
): Promise<TValue> => {
  return withClient(async (client) => {
    await client.query("BEGIN");

    try {
      const result = await runner(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
};

export const endPgPool = async () => {
  if (!sharedPool) {
    return;
  }

  const pool = sharedPool;
  sharedPool = null;
  await pool.end();
};

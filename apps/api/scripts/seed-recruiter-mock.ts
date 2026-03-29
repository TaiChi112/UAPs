import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

const readDatabaseUrl = () => {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf8");
  const databaseUrlLine = envContent
    .split(/\r?\n/)
    .find((line) => line.startsWith("DATABASE_URL="));

  if (!databaseUrlLine) {
    throw new Error("DATABASE_URL is missing in apps/api/.env");
  }

  return databaseUrlLine.slice("DATABASE_URL=".length).trim();
};

const run = async () => {
  const pool = new Pool({ connectionString: readDatabaseUrl() });

  try {
    const schemaSql = readFileSync(resolve(process.cwd(), "../../packages/db/sql/003_resume_visibility_recruiter_access.sql"), "utf8");
    const seedSql = readFileSync(resolve(process.cwd(), "../../packages/db/sql/004_seed_public_recruiter_marketplace.sql"), "utf8");

    await pool.query(schemaSql);
    await pool.query(seedSql);

    const countResult = await pool.query<{ total: number }>(
      "SELECT COUNT(*)::int AS total FROM resumes WHERE visibility IN ('public', 'company-only') AND status = 'Published'",
    );

    const total = countResult.rows[0]?.total ?? 0;
    console.log(`SEED_OK public_or_company_resumes=${total}`);
  } finally {
    await pool.end();
  }
};

run().catch((error) => {
  console.error("SEED_FAILED", error instanceof Error ? error.message : error);
  process.exit(1);
});
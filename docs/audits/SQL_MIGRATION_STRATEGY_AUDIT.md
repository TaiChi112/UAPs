# SQL Migration Strategy Audit

## 1. One-Paragraph Verdict
The current database setup contains raw SQL migrations (`001` and `003`) that mix active Resume Builder table definitions with obsolete recruiter marketplace tables (`companies`, `recruiter_accounts`, etc.). To prepare high-quality, accurate database documentation for a student project, the legacy recruiter tables should be cleanly separated and removed from the active SQL DDL scripts. The recommended strategy is to consolidate all 16 active tables into a single clean bootstrap DDL script, archiving the legacy files under a `legacy/` subfolder. This ensures that the SQL files match the Prisma schema precisely and keep the project focused on the Resume Builder database model.

---

## 2. Current Schema Source of Truth
- **Main Data Model Source**: `apps/api/prisma/schema.prisma` defines the active ORM entities and database mapping.
- **DDL Bootstrap Source**: `packages/db/sql/001_init_uaps.sql` and `packages/db/sql/003_resume_visibility_recruiter_access.sql` (only the parts modifying `resumes` and creating `resume_basics`).
- **Seeding Source**: `apps/api/scripts/seed-vault-test.ts` (Prisma-based TypeScript seed).

---

## 3. Prisma vs SQL Comparison

| Table/Model | Prisma | SQL 001 | SQL 003 | Current Used | Issue | Recommendation |
|---|---|---|---|---|---|---|
| **users** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **skills** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **projects** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **experiences** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **certificates** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **awards** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resumes** | Yes | Yes | Alters | Yes | Base columns created in `001`, but visibility and contact info fields are appended via `ALTER` in `003`. | Consolidate all fields into a single `CREATE TABLE resumes` statement in the active bootstrap. |
| **resume_basics** | Yes | No | Yes | Yes | Created in `003` as a 1:1 extension of `resumes`. | Keep in active bootstrap. |
| **user_skills** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **project_skills** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **experience_skills**| Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resume_projects** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resume_skills** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resume_experiences**| Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resume_certificates**| Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **resume_awards** | Yes | Yes | No | Yes | None. | Keep in active bootstrap. |
| **companies** | No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |
| **recruiter_accounts**| No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |
| **recruiter_verifications**| No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |
| **resume_access_requests**| No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |
| **resume_access_audit_logs**| No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |
| **fraud_signals** | No | No | Yes | No | Unmapped legacy recruiter table. | Remove from active bootstrap. |

---

## 4. Legacy SQL Objects

| SQL Object | File | Why Legacy | Recommendation |
|---|---|---|---|
| `companies` table | `003_resume_visibility_recruiter_access.sql` | Recruiter company directory. No active routes or Prisma models. | Remove. |
| `recruiter_accounts` table | `003_resume_visibility_recruiter_access.sql` | Marketplace recruiter profiles. No active routes or Prisma models. | Remove. |
| `recruiter_verifications` table | `003_resume_visibility_recruiter_access.sql` | Verification logs for recruiter registrations. | Remove. |
| `resume_access_requests` table | `003_resume_visibility_recruiter_access.sql` | Access governance workflow. Endpoints pruned in app.ts. | Remove. |
| `resume_access_audit_logs` table| `003_resume_visibility_recruiter_access.sql` | Recruiter interactions audit log. Endpoints pruned in app.ts. | Remove. |
| `fraud_signals` table | `003_resume_visibility_recruiter_access.sql` | Suspicious recruiter behavior flag signals. | Remove. |

---

## 5. Strategy Options

| Option | Description | Pros | Cons | Recommended? |
|---|---|---|---|---|
| **Option A** | Keep `001` and `003` as-is; document Prisma as source of truth. | Safest; zero change to SQL execution script list. | Active dev setup runs SQL scripts creating dead recruiter tables. | No |
| **Option B** | **Rewrite SQL into a consolidated bootstrap file; archive old DDL.** | Highly clean. Separates active database DDL from legacy/deleted features. Shows raw SQL DDL design skills for a student report. | Requires updating the README setup instructions. | **Yes (Recommended)** |
| **Option C** | Move fully to Prisma Migrate and delete raw SQL DDL files. | Eliminates duplicate schema definitions. | Lose raw SQL files, which are often required for academic documentation submissions. | No |
| **Option D** | Hybrid: Keep old files but comment out recruiter tables inside `003`. | Minimizes file changes. | Messy; comments clutter the SQL migration folder. | No |

---

## 6. Recommended Strategy
We choose **Option B: Rewrite SQL into a consolidated bootstrap file and archive legacy DDL**.

### Rationale:
For an academic or student project, having clean, readable raw SQL scripts that correspond exactly to the application's actual data model is critical. 
- Keeping recruiter tables in the database setup leads to inconsistencies between SQL files, Prisma schemas, and active app routes.
- Consolidating `001` and the active parts of `003` (such as `resume_basics` and visibility columns) into a single, clean `001_bootstrap_active_schema.sql` makes database bootstrapping fast and simple.
- Moving the original `001` and `003` to `packages/db/sql/legacy/` preserves git history and historical development context.

---

## 7. Database Documentation Impact
- **ERD Alignment**: The Entity-Relationship Diagram (ERD) in the project documentation should display exactly the 16 active tables, with no recruiter-related clutter.
- **DDL Reference**: The database report DDL section will link directly to the new consolidated active bootstrap script.
- **Prisma Schema Reference**: Document that Prisma serves as the active application data model wrapper, while the SQL bootstrap represents the physical database structure.

---

## 8. Do Not Do Yet
- Do not run `DROP TABLE` or destructive DDL against a production database containing user data without first taking a backup.
- Do not delete `packages/db/sql/001_init_uaps.sql` or `003_resume_visibility_recruiter_access.sql` before copying their active table structures to the new consolidated file.

---

## 9. Exact Next Prompt Recommendation
```
Proceed with Phase 5C.1: Execute SQL Migration Consolidation.

Tasks:
1. Create a legacy DDL archive directory:
   - packages/db/sql/legacy

2. Move legacy raw SQL files into the archive:
   - Move packages/db/sql/001_init_uaps.sql -> packages/db/sql/legacy/001_init_uaps.sql
   - Move packages/db/sql/003_resume_visibility_recruiter_access.sql -> packages/db/sql/legacy/003_resume_visibility_recruiter_access.sql

3. Create a consolidated active bootstrap file packages/db/sql/001_bootstrap_active_schema.sql containing:
   - PostgreSQL table creation DDL for all 16 active tables (including resume_basics and visibility columns defined directly on the tables rather than via ALTER).
   - Core active indexes.

4. Update README.md database setup section to reference only packages/db/sql/001_bootstrap_active_schema.sql.

Validation:
- Reset local PostgreSQL database using the new 001_bootstrap_active_schema.sql script.
- Run database seed: bun run --cwd apps/api seed:vault-test
- Run bun run typecheck
- Run bun run build:web
- Run bun run test
```

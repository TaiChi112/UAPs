# Database Cleanup Audit

## 1. One-Paragraph Verdict
The current database is in a hybrid state where the active **Resume Builder** features (e.g. resumes, vault entities, skills, and configuration mappings) are fully synchronized and mapped via Prisma models in `schema.prisma`. However, the database also contains obsolete recruiter-centric tables (`companies`, `recruiter_accounts`, `resume_access_requests`, `resume_access_audit_logs`, `recruiter_verifications`, and `fraud_signals`) that were introduced in SQL DDL migrations but completely omitted from the Prisma ORM schema. Since all frontend and backend endpoints associated with these tables have been successfully pruned, these recruiter tables are completely orphaned and safe to be removed from the database lifecycle.

---

## 2. Current Database Source of Truth
The schema source of truth is split:
- **Active Application ORM**: `apps/api/prisma/schema.prisma` is the source of truth for the active Resume Builder backend API and repositories.
- **Raw SQL Migrations**: `packages/db/sql/` contains the legacy DDL scripts. In particular, `001_init_uaps.sql` and `003_resume_visibility_recruiter_access.sql` (which also initializes `resume_basics`) are still required for bootstrapped Postgres instances, but they include unmapped legacy recruiter tables.
- **Seeding**: `apps/api/scripts/seed-vault-test.ts` is the active seeding source, populating realistic test profiles via the Prisma client.

---

## 3. Prisma Model Map

| Model | Current / Legacy / Unclear | Evidence | Recommendation |
|---|---|---|---|
| **User** | Current | Handles user auth metadata and owner relationships. Used by OAuth. | Keep. |
| **Skill** | Current | Holds vault-wide and resume-specific skill tags. | Keep. |
| **Project** | Current | User portfolio projects mapped to resumes. | Keep. |
| **Experience** | Current | Professional experience items. | Keep. |
| **Certificate** | Current | User certifications rendered in manual forms and PDF. | Keep. |
| **Award** | Current | User awards/honors rendered in manual forms and PDF. | Keep. |
| **Resume** | Current | Root entity representing a resume version, metadata, and status. | Keep. |
| **ResumeBasic** | Current | Maps core profile contact info/headline to a specific resume. | Keep. |
| **UserSkill** | Current | Maps user proficiency in skills (M:N). | Keep. |
| **ProjectSkill** | Current | Links skills to portfolio projects (M:N). | Keep. |
| **ExperienceSkill** | Current | Links skills to professional experience (M:N). | Keep. |
| **ResumeProject** | Current | Maps selected projects to a resume configuration (M:N). | Keep. |
| **ResumeSkill** | Current | Maps selected skills to a resume configuration (M:N). | Keep. |
| **ResumeExperience**| Current | Maps selected experiences to a resume configuration (M:N). | Keep. |
| **ResumeCertificate**| Current | Maps selected certificates to a resume configuration (M:N). | Keep. |
| **ResumeAward** | Current | Maps selected awards to a resume configuration (M:N). | Keep. |

---

## 4. SQL Migration File Map

| File | Purpose | Current / Legacy / Unclear | Recommendation |
|---|---|---|---|
| `001_init_uaps.sql` | Builds initial base UAPS tables (users, skills, resumes, etc.). | Current | Keep for migration support, but mark as legacy DDL in documentation. |
| `002_seed_mock_use_case.sql` | Raw SQL seeds for developers / old sandbox profiles. | Legacy | Delete. Active TS seeding has replaced this. |
| `003_resume_visibility_recruiter_access.sql` | Creates `resume_basics` and alters `resumes` (Current), but also creates recruiter tables (Legacy). | Hybrid | Keep for migration support. Future refactoring should split the active `resume_basics` table setup from the recruiter tables. |
| `004_seed_public_recruiter_marketplace.sql` | Seeds mock recruiter accounts, companies, and access requests. | Legacy | Delete. Recruiter flows are fully obsolete. |

---

## 5. Seed / Script Map

| File | Purpose | Current / Legacy / Unclear | Recommendation |
|---|---|---|---|
| `apps/api/scripts/seed-vault-test.ts` | Seeds user personas and resumes via Prisma. | Current | Keep. It is the primary developer seed script. |
| `apps/api/scripts/seed-recruiter-mock.ts` | Runs `003` and `004` DDL and SQL seeds. | Legacy | Delete. Recruiter flows have been pruned. |
| `scripts/smoke-hr-flow.ps1` | Smoke test script validating legacy recruiter flow. | Legacy | Delete. Home, search, and access request HR endpoints are gone. |

---

## 6. Legacy Table Candidates

| Table | Why Legacy | Evidence | Safe Action |
|---|---|---|---|
| `companies` | Recruiter company directory. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |
| `recruiter_accounts` | Marketplace recruiter user profiles. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |
| `recruiter_verifications`| Anti-fraud recruiter verification logs. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |
| `resume_access_requests`| Access governance request logs. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |
| `resume_access_audit_logs`| Recruiter audit trail. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |
| `fraud_signals` | Anti-fraud automated flagging. | Not mapped in Prisma; no references in frontend or API code. | Safe to drop. |

---

## 7. Current Resume Builder Tables
These 16 tables form the core structure of the active Resume Builder platform and should be the sole focus of any ERD / database documentation:
1. `users`
2. `skills`
3. `projects`
4. `experiences`
5. `certificates`
6. `awards`
7. `resumes`
8. `resume_basics`
9. `user_skills`
10. `project_skills`
11. `experience_skills`
12. `resume_projects`
13. `resume_skills`
14. `resume_experiences`
15. `resume_certificates`
16. `resume_awards`

---

## 8. Database Documentation Recommendation
- **Main ERD Source**: The documentation should use the Prisma schema (`apps/api/prisma/schema.prisma`) as the primary and definitive source of truth for the database schema.
- **Handling of Raw SQL Files**: Raw SQL scripts in `packages/db/sql` should be treated as legacy migration support files. They are only needed because Prisma migrations were not actively used to initialize the production DB in this repository copy.
- **Entity Documentation Scope**: Explicitly document the relationship between resumes and the vault (M:N mappings). Certifications and awards are active and fully supported, so they should be represented in the ERD alongside core user projects and skills.

---

## 9. Proposed Phase 5B Cleanup Plan
- **5B.1**: Delete legacy seed scripts only.
  - Delete `apps/api/scripts/seed-recruiter-mock.ts`.
  - Delete `packages/db/sql/002_seed_mock_use_case.sql`.
  - Delete `packages/db/sql/004_seed_public_recruiter_marketplace.sql`.
  - Delete `scripts/smoke-hr-flow.ps1`.
  - Validate: Run `bun run typecheck`, `bun run build:web`, and `bun run test`.
- **5B.2**: Decide whether `packages/db/sql` should be archived or rewritten.
  - Document that `001_init_uaps.sql` and `003_resume_visibility_recruiter_access.sql` are needed only to bootstrap initial schema and can be archived in a `legacy/` subfolder, or rewritten to omit the 6 legacy recruiter tables.
  - Validate: Run typecheck and builds.
- **5B.3**: Update README and database documentation.
  - Edit references in `README.md` to remove mentions of the recruiter smoke tests and SQL seeds.
  - Validate: Run typecheck and builds.

---

## 10. Do Not Delete Yet
- **`packages/db/sql/001_init_uaps.sql`** and **`packages/db/sql/003_resume_visibility_recruiter_access.sql`**: While they contain legacy table configurations, they also contain critical definitions for active tables like `users`, `resumes`, and `resume_basics`. Do not delete these files until a migration rewrite strategy is finalized.

---

## 11. Exact Next Prompt Recommendation
```
Proceed with Phase 5B: Database / Schema / Seed Cleanup Execution.

Tasks:
1. Delete legacy seed/test scripts:
   - apps/api/scripts/seed-recruiter-mock.ts
   - packages/db/sql/002_seed_mock_use_case.sql
   - packages/db/sql/004_seed_public_recruiter_marketplace.sql
   - scripts/smoke-hr-flow.ps1

2. Update README.md references to remove obsolete mention of the recruiter seed SQL files and the scripts/smoke-hr-flow.ps1 smoke test command.

Validation:
- bun run typecheck
- bun run build:web
- bun run test
- Verify no remaining references to the deleted seeds or smoke script exist.
```

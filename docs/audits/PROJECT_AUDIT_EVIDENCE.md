# Project Audit Evidence

## 1. One-Paragraph Verdict

This codebase represents a **hybrid version (Option 3)** containing both the older UAPS canonical portfolio + recruiter marketplace implementation and the newer Next.js-based Resume Builder / Resume Vault / AI Tailoring system. In the current frontend, the root layout navigation topbar ([RoleSwitchNav](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/role-switch-nav.tsx)) has been commented out and the root route (`/`) has been overridden by the `(resume-builder)` route group, making the Resume Builder dashboard ([page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/page.tsx)) the primary active page. However, all legacy portfolio management and recruiter filter marketplace files are still present in the filesystem and fully active at their respective paths (such as `/dashboard`, `/portfolio/skills`, and `/hr/filter`) on both the frontend and the backend Elysia API ([app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts)), which serves endpoints for both modules simultaneously.

## 2. Current UI / Route Evidence

The following routes and feature files were checked in the codebase:

| Item | Found? | Evidence |
| ---- | ------ | -------- |
| `apps/web/src/app/(resume-builder)/page.tsx` | Yes | [page.tsx:L31-L163](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/page.tsx#L31-L163) (Renders `ResumeBuilderDashboardPage` which loads `<DashboardView />` for the resume builder). |
| `apps/web/src/app/(resume-builder)/resume/manual/page.tsx` | Yes | [page.tsx:L38-L146](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/resume/manual/page.tsx#L38-L146) (Renders `ResumeBuilderManualPage` which loads `<ManualBuilderView />`). |
| `apps/web/src/app/(resume-builder)/resume/ai/page.tsx` | Yes | [page.tsx:L29-L100](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/resume/ai/page.tsx#L29-L100) (Renders `ResumeBuilderAiPage` which loads `<AiBuilderView />`). |
| `apps/web/src/features/resume-builder/` | Yes | Directory exists at [features/resume-builder/](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder) containing subdirectories: `components/`, `constants/`, `services/`, and `state/`. |
| any route that renders “My Vault & Resumes” | Yes | [dashboard-view.tsx:L68-L71](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/components/dashboard/dashboard-view.tsx#L68-L71) renders this heading (split across lines 69-70). |
| any route that renders “Create Manually” | Yes | [create-resume-options.tsx:L23](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/components/dashboard/create-resume-options.tsx#L23) renders this button option. |
| any route that renders “Auto-Tailor with AI” | Yes | [create-resume-options.tsx:L44](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/components/dashboard/create-resume-options.tsx#L44) renders this button option. |
| any route that renders “Local Dev Mode” | Yes | [layout.tsx:L27-L29](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/layout.tsx#L27-L29) renders this label in the header. |

## 3. README vs Implementation Evidence

This table maps documentation claims in the README files against the actual source code implementation:

| README Claim | Source Code Evidence | Verdict |
| ------------ | -------------------- | ------- |
| **Recruiter Marketplace**: "Expose a public recruiter marketplace with skill/role/experience filtering" (README.md section 1.2 / 2.1) | Frontend page exists at [filter/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/hr/filter/page.tsx) rendering [hr-resume-marketplace.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/hr-resume-marketplace.tsx). Backend API exposes `/hr/resumes` (GET) and `/hr/resumes/:resumeId/quick-view` in [app.ts:L499-L531](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L499-L531), which calls raw PostgreSQL query helper [listRecruiterVisibleResumes](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L1250-L1367) in `db.ts`. | **Verified** |
| **Access Governance**: "Implement an owner-gated access request and approval workflow" (README.md section 1.2 / 2.1) | Frontend page exists at [access-requests/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/access-requests/page.tsx). Backend API exposes `/hr/access-requests` (POST) to submit, and `/resumes/access-requests` (GET) and `/resumes/access-requests/:requestId/review` (POST) in [app.ts:L532-L553,L1065-L1093](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L532-L553), which uses raw SQL in `db.ts` (e.g., [createResumeAccessRequest](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L1618-L1702) and [reviewResumeAccessRequest](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L1778-L1842)). | **Verified** |
| **Audit Logs**: "Maintain a tamper-evident audit log of all recruiter interactions" (README.md section 1.2 / 2.2 NFR-05) | SQL table is created in [003_resume_visibility_recruiter_access.sql:L111-L123](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql#L111-L123). Backend API exposes `/resumes/access-audit-logs` (GET) in [app.ts:L1094-L1102](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L1094-L1102) and queries via [listOwnerAccessAuditLogs](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L1844-L1904). | **Verified** |
| **PostgreSQL Database**: "PostgreSQL + pg pool... pg.Pool instantiation" (README.md section 1.3 / 2.2 NFR-08) | pg Pool is instantiated in [pool.ts:L10-L23](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/pool.ts#L10-L23) using `DATABASE_URL` and queried throughout raw DB operations in [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts). | **Verified** |
| **Prisma**: (Omitted from main README.md) | Prisma schema exists at [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) and client is instantiated in [prisma.ts:L11-L28](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/prisma.ts#L11-L28). It is actively used by the resume builder's [OrmVaultRepository](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/orm-vault.repository.ts#L62-L73) when `DB_STRATEGY` is set to `ORM`. | **Verified** |
| **Raw SQL / pg**: "All SQL is encapsulated in named async functions... app.ts never writes raw SQL" (README.md section 3.2) | All classic endpoints call functions in [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) which query via `pg`. The resume builder also has a raw SQL repository [raw-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/raw-vault.repository.ts) that is chosen if `DB_STRATEGY` is `RAW`. | **Verified** |
| **AI Resume Tailoring**: (Listed under Milestone v0.4 as future enhancement in README.md section 7.4) | AI resume tailoring is already fully implemented on both frontend and backend. Backend service [resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts#L295-L311) integrates with Google Gemini API via Vercel AI SDK. | **Outdated** (Implemented ahead of schedule) |
| **Resume Builder**: (Listed under Milestone v0.4 as future enhancement in README.md section 7.4) | Resume builder layout and page routes are fully implemented and set as the default homepage. | **Outdated** (Implemented ahead of schedule) |
| **Local/Single-Player Mode**: (Omitted from main README.md) | Fully implemented. The frontend uses a [HybridVaultRepository](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts#L157-L285) which falls back to [MockVaultRepository](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/mock-vault.repository.ts) (storing data in `window.localStorage`) when the backend API is offline or unauthenticated. | **Verified** |
| **In-Memory Storage**: "Current implementation uses in-memory storage for rapid MVP bootstrap." (apps/api/README.md line 42) | Elysia endpoints in [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) call `./db` which queries PostgreSQL. The old in-memory store in [store.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/store.ts) is completely dead code and never imported. | **Outdated** |

## 4. AI Feature Truth Check

The table below outlines search terms related to the AI Resume Tailoring engine and their meanings in the codebase:

| Evidence Type | Found? | File Path | Meaning |
| ------------- | ------ | --------- | ------- |
| `gemini` | Yes | [config.ts:L8](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/config.ts#L8) | Sets default `LLM_MODEL` environment variable value to `"gemini-2.5-flash"`. |
| `GoogleGenerativeAI` | Yes | [config.ts:L22](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/config.ts#L22) | Checks and parses environment variable for `GOOGLE_GENERATIVE_AI_API_KEY`. |
| `generateObject` | No | N/A | Not called directly. Instead, backend uses `generateText` with `Output.object` format. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | [config.ts:L6](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/config.ts#L6) | Checked at startup and validated via `assertGoogleConfigured()`. |
| `analyzeJobDescription` | Yes | [resume-analysis.service.ts:L295](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts#L295) | Endpoint callback function executing the Vercel AI SDK Google model call. |
| `analyze-jd` | Yes | [app.ts:L611](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L611) | Registers Elysia route `/resume-builder/analyze-jd` on the backend. |
| `setTimeout` | Yes | [page.tsx:L485 (Prototype)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/prototype/v5/page.tsx#L485) | Renders mock analysis with fake network delays in prototype files. (Also in [context.tsx:L61](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/state/context.tsx#L61) for toasts). |
| `Mock LLM` | Yes | [page.tsx:L469 (Prototype)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/prototype/v5/page.tsx#L469) | Code comments defining mock LLM service behavior in prototypes. |
| `mockMissingSkills` | Yes | [page.tsx:L497 (Prototype)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/prototype/v5/page.tsx#L497) | Returns hardcoded missing skills (e.g., Kubernetes, Apache Kafka, Go) in mock flow. |
| `suggestedConfig` | Yes | [resume-analysis.service.ts:L26](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts#L26) | Zod schema validation key mapping suggested resume configurations from Gemini. |

`AI Feature Verdict: fully real LLM API`

*Explanation:* The core backend service [resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts) implements a real integration with the `@ai-sdk/google` provider and calls `generateText` with the Google Gemini model. The frontend calls `/v1/resume-builder/analyze-jd` which triggers this service. Although older prototype mockups (under `/app/prototype`) simulate the LLM call using `setTimeout`, the active `/resume/ai` route utilizes the production-ready Google Gemini integration.

## 5. Data Persistence Truth Check

This section details how data is saved and loaded across the different flows:

| Flow | Storage Method | Evidence | Verdict |
| ---- | -------------- | -------- | ------- |
| **dashboard saved resumes** | Hybrid | Uses [HybridVaultRepository](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts#L166-L186). Tries `ApiVaultRepository` (`/resume-builder/snapshot` GET, which calls `vaultBackendRepository.loadSnapshot` using Prisma or raw PG SQL). Falls back to `MockVaultRepository` (`window.localStorage` / in-memory). | Hybrid |
| **manual builder save** | Hybrid | Uses [HybridVaultRepository.saveResume](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts#L204-L228) calling `ApiVaultRepository` (POST/PUT on `/resume-builder/resumes`). Falls back to `MockVaultRepository` (`localStorage`). | Hybrid |
| **AI builder save** | Hybrid | Saves via the same `HybridVaultRepository.saveResume` action as the manual builder to persist the AI-suggested config. | Hybrid |
| **portfolio CRUD** | Database-backed | Calls `/skills`, `/projects`, `/experiences` endpoints in [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) which query PostgreSQL directly using raw SQL query layers in [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) (e.g., `createSkill`, `createProject`). No fallback is defined. | Database-backed |
| **classic resume composer** | Database-backed | Elysia routes `/resumes` (GET/POST) and `/resumes/:resumeId/compose` in [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) query PostgreSQL directly using raw SQL queries in `db.ts` (e.g. `createResume`, `updateResumeComposition`). | Database-backed |
| **recruiter marketplace** | Database-backed | Elysia routes `/hr/resumes` and `/hr/resumes/:resumeId/quick-view` query PostgreSQL directly using raw SQL queries in `db.ts` (e.g. `listRecruiterVisibleResumes`, `getRecruiterResumeQuickView`). | Database-backed |
| **access request workflow** | Database-backed | Elysia routes `/hr/access-requests` (POST) and `/resumes/access-requests` (GET) and `/resumes/access-requests/:requestId/review` (POST) query PostgreSQL directly using raw SQL queries in `db.ts` (e.g. `createResumeAccessRequest`, `listOwnerAccessRequests`, `reviewResumeAccessRequest`). | Database-backed |

## 6. Database Schema Evidence

We verified the existence and purposes of the following database schemas:

| Database Artifact | Found? | Purpose | Evidence |
| ----------------- | ------ | ------- | -------- |
| `packages/db/sql/` | Yes | Contains base SQL schema and recruiter visibility/access migrations. | Directory exists at [db/sql/](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/) |
| `001_init_uaps.sql` | Yes | Creates base database tables (`users`, `skills`, `projects`, `experiences`, `resumes`, `user_skills`, `project_skills`, `experience_skills`, `resume_projects`, `resume_skills`, `resume_experiences`). | File exists at [001_init_uaps.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/001_init_uaps.sql). |
| `003_resume_visibility_recruiter_access.sql` | Yes | Extends base tables and adds recruiter marketplace tables (`resume_basics`, `companies`, `recruiter_accounts`, `recruiter_verifications`, `resume_access_requests`, `resume_access_audit_logs`, `fraud_signals`). | File exists at [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql). |
| `apps/api/prisma/schema.prisma` | Yes | Prisma ORM schema. Defines base tables, but **wholly omits** the recruiter marketplace tables (`companies`, `recruiter_accounts`, `resume_access_requests`, `resume_access_audit_logs`, `recruiter_verifications`, `fraud_signals`). | File exists at [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma). |
| `apps/api/src/db.ts` | Yes | Contains the raw SQL connection pool and DB queries for classic portfolio management, recruiter marketplace, and access workflows. | File exists at [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts). |
| `apps/api/src/db/` | Yes | Houses the active DB configs, Prisma client setup, connection pooling, and the repository files for the resume builder. | Directory exists at [db/](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/). |
| migration folder | Yes | Contains Prisma migrations folder at `apps/api/prisma/migrations/`. | Directory exists with only a `.gitkeep` file (no migrations recorded). |
| seed files | Yes | Raw SQL seeds (`002_seed_mock_use_case.sql`, `004_seed_public_recruiter_marketplace.sql`) and TypeScript seeds (`seed-recruiter-mock.ts`, `seed-vault-test.ts`) used to seed database. | Files exist in `packages/db/sql/` and `apps/api/scripts/`. |

## 7. Active Version Verdict

Based on the audit, this folder represents a **hybrid version (Option 3)** containing both implementations concurrently:

* **Is this folder likely the active version?** Yes. It contains active code, tests, and configurations for both modules.
* **Is this folder likely the old README/database version?** No. The code has been migrated to support the resume-builder and AI tailoring system alongside the older recruiter marketplace version.
* **Is this folder likely the newer resume-builder version?** Yes, the resume-builder is the default route group rendering the homepage. However, it is not *only* the new version since the old codebase is still fully functional.
* **Is this folder a hybrid?** Yes. Both modules run simultaneously in the API and filesystem.
* **What exact files prove this?**
  1. [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) maps endpoints for both modules (e.g., `/hr/resumes` alongside `/resume-builder/snapshot`).
  2. [db-factory.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/db-factory.ts) decides dynamically between ORM (`OrmVaultRepository`) and Raw SQL (`RawVaultRepository`) based on `DB_STRATEGY`.
  3. [page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/page.tsx) overrides the default route `/` to display the new Resume Builder dashboard.
  4. [role-switch-nav.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/role-switch-nav.tsx) contains nav links to the old portfolio dashboards (`/dashboard`, `/portfolio/projects`, `/resume/list`) and recruiter filters (`/hr/filter`), confirming that they are still accessible.
* **What exact files contradict this?**
  1. The main [README.md](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/README.md) does not document Prisma or the new resume-builder / AI tailoring features, describing them as future milestones (v0.4).
  2. [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) omits recruiter marketplace tables completely, contradicting the idea that Prisma is the single source of truth database model.
  3. `apps/api/README.md` claims that the API uses in-memory storage, which is outdated.

## 8. Correct Database Documentation Direction

**Recommendation: C. Hybrid documentation with two modules**

*Explanation:* 
The database uses two completely separate strategies for data access and represents two distinct feature sets:
1. The **UAPS Recruiter Marketplace & Access Governance** module, which runs exclusively on raw PostgreSQL queries via `apps/api/src/db.ts` and relies on tables defined in `packages/db/sql/003_resume_visibility_recruiter_access.sql`. These tables are NOT mapped in Prisma.
2. The **Resume Vault & AI Tailoring** module, which uses either Prisma (`OrmVaultRepository`) or raw SQL (`RawVaultRepository`) depending on the `DB_STRATEGY` environment variable, operating on a subset of tables that represents user portfolios and resume compositions.

Documenting only one would miss a huge portion of active features. Documenting them as two separate modules under a hybrid system is the only accurate approach.

## 9. Claims That Must Not Be Used Yet

The following claims appeared in README files or previous summaries but are **not proven/supported** by source code:

1. **Recruiter risk level / auto-escalation background workers**: The main README claims a background worker will auto-escalate recruiter risk levels based on fraud signals. No background worker or cron script exists in the source code; only the schema columns exist in `003_resume_visibility_recruiter_access.sql`. This is unverified/future work.
2. **Platform Administrator dashboard**: The main README mentions a dashboard for verifying companies/recruiters. No frontend route or component for an administrator dashboard exists.
3. **In-Memory Storage for API**: `apps/api/README.md` claims that the API uses in-memory storage. This is completely false in the current version, as it throws an error if `DATABASE_URL` is missing and routes use PG pool/Prisma connections.
4. **AI-assisted resume composition as future milestone**: The main README claims AI-assisted resume composition is in progress / future work. It is actually fully implemented.

## 10. Files the Human Should Open Next

Top 10 files to manually inspect:

1. [apps/api/src/app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) - The Elysia API gateway containing all endpoints for both modules.
2. [apps/api/prisma/schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) - The Prisma schema containing only the resume builder/portfolio tables.
3. [apps/api/src/db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) - The raw SQL connection layer and database operations for the classic marketplace and access requests.
4. [apps/api/src/db/repositories/db-factory.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/db-factory.ts) - Factory deciding between raw and ORM strategies for the resume builder.
5. [apps/api/src/db/repositories/orm-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/orm-vault.repository.ts) - The Prisma-based backend implementation of the vault repository.
6. [apps/api/src/db/repositories/raw-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/raw-vault.repository.ts) - The raw SQL-based backend implementation of the vault repository.
7. [apps/api/src/ai/resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts) - The Google Gemini integration service using Vercel AI SDK.
8. [apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts) - Frontend repository implementing API requests with client localStorage fallback.
9. [packages/db/sql/003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) - Schema extensions containing the recruiter tables not present in Prisma.
10. [apps/web/src/components/role-switch-nav.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/role-switch-nav.tsx) - Navigation links showing the mapping of both subsystems.

# Backend Pruning Plan

## 1. One-Paragraph Verdict

Pruning the legacy UAPS recruiter, access governance, and portfolio CRUD backend code is completely safe. The frontend workspaces have been successfully cleaned in Phases 1–3, leaving zero active page routes or component imports referencing the legacy REST endpoints. The primary risk of this phase is accidentally deleting shared helper objects, middleware functions, or oauth callbacks. We will mitigate this risk by performing the cleanup incrementally: first removing the legacy endpoints from [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) to verify it builds and typechecks, and only then deleting the now-orphaned [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts), [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts), and [store.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/store.ts) files.

## 2. Current Backend Keep List

These backend directories and files are the foundation of the active Resume Builder & AI Tailoring product and **must be preserved**:

| File/Folder | Why Keep | Evidence |
| ----------- | -------- | -------- |
| `apps/api/src/ai/` | Contains the Google Gemini AI integration and prompt tailoring code via Vercel AI SDK. | Instantiated in [resume-analysis.service.ts:L313](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts#L313). |
| `apps/api/src/db/repositories/` | Houses `OrmVaultRepository` (Prisma) and `RawVaultRepository` (Raw SQL) containing all resume builder storage adapters. | Decided by factory in [db-factory.ts:L7-L15](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/db-factory.ts#L7-L15). |
| `apps/api/src/resume-builder-export/` | The PDF generation engine converting resume structure to A4 PDF using `pdfkit`. | Export handler `/resume-builder/resumes/:resumeId/export` triggers [renderResumeBuilderPdf](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L770). |
| `apps/api/src/routes/resume-builder.schemas.ts` | Schema objects validating input JSON for resume snapshots, status updates, and duplicating drafts. | Imported in [app.ts:L56-L63](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L56-L63). |
| `apps/api/src/auth.ts` | Manages GitHub OAuth flow state, session decryption (JWT jose verification), and local developer mocks. | Middleware [app.ts:L224-L236](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L224-L236) derives session variables using `auth.ts`. |
| `apps/api/prisma/schema.prisma` | Core source of truth database structure mapped by Prisma ORM. | Used to build db clients and relations. |
| `packages/shared/src/resume-builder/` | Shareable TypeScript interfaces, types, and schema models shared between frontend and backend. | Imported widely across both workspaces (e.g. `SavedResume`, `VaultData`). |

---

## 3. Legacy Backend Candidate List

These files and functions are completely unreferenced by the current active code and are marked for pruning:

| File/Function/Endpoint | Why Legacy | Current Dependency Found? | Safe Action | Evidence |
| ---------------------- | ---------- | ------------------------- | ----------- | -------- |
| `apps/api/src/db.ts` | Older raw PostgreSQL client operations for recruiter marketplace and legacy portfolio pages. | No. Only imported by legacy handlers in `app.ts`. | Delete after pruning `app.ts` | Once legacy routes are deleted, `db.ts` has zero imports in the API workspace. |
| `apps/api/src/export-renderer.ts` | Classic SVG/pdf-lib based resume resume renderer. | No. Only imported by legacy `/resumes/:resumeId/export/:format` endpoint. | Delete after pruning `app.ts` | Once export endpoints are deleted, this file is fully orphaned. |
| `apps/api/src/store.ts` | Unused bootstrap mock in-memory store. | No active imports. | Delete now | Completely dead file. |
| Legacy `/v1/hr/*` endpoints | Handles recruiter search filter searches and recruiter visibilities. | No. | Prune in `app.ts` | Recruiter features are out of scope. |
| Legacy `/v1/skills` endpoints | Handles portfolio skill creations/updates. | No. | Prune in `app.ts` | Resume Builder uses `/resume-builder/skills`. |
| Legacy `/v1/projects` endpoints | Handles portfolio project CRUD. | No. | Prune in `app.ts` | Resume Builder uses `/resume-builder/projects`. |
| Legacy `/v1/experiences` endpoints | Handles portfolio experience CRUD. | No. | Prune in `app.ts` | Active experience updates are handled inside the resume saves. |
| Legacy `/v1/resumes` endpoints | Classic resume CRUD endpoints. | No. | Prune in `app.ts` | Resume Builder uses `/resume-builder/resumes`. |

---

## 4. app.ts Import Map

How imports inside [apps/api/src/app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) map to endpoint usages:

| Import | Source | Current Used? | Legacy Used? | Recommendation |
| ------ | ------ | ------------- | ------------ | -------------- |
| `resumeAnalysisService` | `./ai` | Yes | No | **Keep** |
| `vaultBackendRepository` | `./db/index` | Yes | No | **Keep** |
| `mapResumeBuilderExportPayload`, `renderResumeBuilderPdf` | `./resume-builder-export` | Yes | No | **Keep** |
| `upsertUserFromGithub` | `./db` | Yes (in OAuth redirect) | No | **Move to auth / db factory** |
| All other database functions (`createSkill`, `createProject`, `createResume`, etc.) | `./db` | No | Yes | **Prune** |
| `buildResumeMarkdown`, `renderResumeImage`, `renderResumePdf` | `./export-renderer` | No | Yes | **Prune** |

---

## 5. API Endpoint Map

Active and legacy routing endpoints inside [apps/api/src/app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts):

| Endpoint | Method | Current/Legacy | Frontend Caller Exists? | Recommendation |
| -------- | ------ | -------------- | ----------------------- | -------------- |
| `GET /v1/health` | GET | Current | No (Standard liveness check) | **Keep** |
| `/v1/auth/github/*` | GET/POST | Current | Yes (Sign-in flows) | **Keep** |
| `/v1/auth/session` | GET | Current | Yes (Session verification) | **Keep** |
| `/v1/resume-builder/snapshot` | GET | Current | Yes (Loads dashboard) | **Keep** |
| `/v1/resume-builder/skills` | POST | Current | Yes (Creates skill card) | **Keep** |
| `/v1/resume-builder/projects` | POST | Current | Yes (Creates project card) | **Keep** |
| `/v1/resume-builder/analyze-jd` | POST | Current | Yes (Triggers Gemini analysis) | **Keep** |
| `/v1/resume-builder/resumes` | POST/PUT | Current | Yes (Saves manual/AI drafts) | **Keep** |
| `/v1/resume-builder/resumes/:resumeId/duplicate` | POST | Current | Yes (Duplicates card) | **Keep** |
| `/v1/resume-builder/resumes/:resumeId` | DELETE | Current | Yes (Deletes card) | **Keep** |
| `/v1/resume-builder/resumes/:resumeId/status` | PATCH | Current | Yes (Edits status dropdown) | **Keep** |
| `/v1/resume-builder/resumes/:resumeId/export` | GET | Current | Yes (Downloads pdfkit A4 PDF) | **Keep** |
| `/v1/hr/resumes` | GET | Legacy | No | **Prune** |
| `/v1/hr/resumes/:resumeId/quick-view` | GET | Legacy | No | **Prune** |
| `/v1/hr/access-requests` | POST | Legacy | No | **Prune** |
| `/v1/users/me/summary` | GET | Legacy | No | **Prune** |
| `/v1/skills` (and subpaths) | GET/POST/PUT/DELETE | Legacy | No | **Prune** |
| `/v1/projects` (and subpaths) | GET/POST/PUT/DELETE | Legacy | No | **Prune** |
| `/v1/experiences` (and subpaths) | GET/POST/PUT/DELETE | Legacy | No | **Prune** |
| `/v1/resumes` (and subpaths) | GET/POST/PUT/DELETE | Legacy | No | **Prune** |

---

## 6. Frontend Caller Evidence

We ran grep searches across `apps/web/src` to identify any remaining references to legacy endpoints:
1. **Recruiter path `/hr/`**: Found only inside [apps/web/src/lib/api.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/lib/api.ts#L369) in the unused client helpers `searchResumes`, `getRecruiterResumeQuickView`, and `requestResumeAccess`. None of these functions are imported by active components.
2. **Dashboard path `/users/me/summary`**: Referenced only inside [api.ts:L305](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/lib/api.ts#L305) in `getSummary`. This helper has zero active page imports.
3. **Portfolio paths `/skills`, `/projects`, `/experiences`**: Found wrappers in `api.ts` lines 307–336. These wrappers are unreferenced. All active portfolio creations use paths prefixed with `/resume-builder/*` (e.g. `/resume-builder/skills` at `api.ts:L435`).
4. **Classic path `/resumes`**: Wrappers in `api.ts` lines 338–360, 411–421 are legacy. Active saves use `/resume-builder/resumes` wrappers at `api.ts:L464`.

---

## 7. Backend Internal Reference Evidence

We ran grep searches across `apps/api/src` to identify internal dependencies:
1. **Module Imports (`./db`, `./export-renderer`, `./store`)**: Imports only exist in `app.ts`. There are zero imports of `./store` anywhere, confirming `store.ts` is fully dead code.
2. **Legacy Functions (`listRecruiterVisibleResumes`, `renderResumePdf`, etc.)**: References found only in [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) (definitions), [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts) (definitions), and [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) (handlers).
3. **Active Repositories**: The `db/repositories` adapters (`OrmVaultRepository` and `RawVaultRepository`) are fully self-contained and implement database connections directly without referencing `db.ts` or `export-renderer.ts`.

---

## 8. Proposed Phase 4B Implementation Plan

The backend pruning will be executed in three separate, validated steps:

### 4B.1 Prune Legacy Routes and Imports from app.ts Only
1. Open [apps/api/src/app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts).
2. Keep the `upsertUserFromGithub` import from `./db`, but prune all other functions in that multi-line import block.
3. Prune the entire import statement for `./export-renderer` (lines 50).
4. Prune the endpoint handler blocks for:
   * `/hr/resumes` (lines 499-522)
   * `/hr/resumes/:resumeId/quick-view` (lines 523-531)
   * `/hr/access-requests` (lines 532-553)
   * `/users/me/summary` (lines 554-561)
   * `/skills` (lines 784-841)
   * `/projects` (lines 842-899)
   * `/experiences` (lines 900-957)
   * `/resumes` (lines 958-1064)
   * `/resumes/access-requests` (lines 1065-1073)
   * `/resumes/access-requests/:requestId/review` (lines 1074-1093)
   * `/resumes/access-audit-logs` (lines 1094-1102)
   * `/resumes/:resumeId/preview` (lines 1103-1116)
   * `/resumes/:resumeId/export/:format` (lines 1117-1170)
   * `/resumes/:resumeId` (lines 1171-1184)
5. Run `bun run typecheck:api` to verify compiler compliance.

### 4B.2 Move GitHub User Mapping to Database Factory
1. `upsertUserFromGithub` uses raw PostgreSQL pools. To avoid `app.ts` referencing the legacy `db.ts` file just for this oauth user upsert helper, we will copy this query helper into [db-factory.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/db-factory.ts) (which already handles database strategies).
2. Change the import in `app.ts` to fetch `upsertUserFromGithub` from `./db/repositories/db-factory`.
3. Run `bun run typecheck:api`.

### 4B.3 Delete Obsolete Files and Verify
1. Delete [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts).
2. Delete [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts).
3. Delete [store.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/store.ts).
4. Delete old test files under `apps/api/src` that cover legacy endpoints (if any exist).
5. Run the full validation suite: `bun run typecheck`, `bun run build`, and `bun run test`.

---

## 9. Do Not Delete Yet

* **`apps/api/src/db/pool.ts`**: Contains the common connection pooling module for PostgreSQL, imported by `RawVaultRepository` to execute raw SQL statements when `DB_STRATEGY` is set to `RAW`. Must be kept.

---

## 10. Exact Next Prompt Recommendation

When you are ready to execute the pruning phase, run the following prompt:

```text
Proceed with Phase 4B: Backend API Pruning.
Target:
1. Open apps/api/src/app.ts, remove all legacy route registration blocks, and clean up unnecessary imports.
2. Move the `upsertUserFromGithub` DB query helper from apps/api/src/db.ts to apps/api/src/db/repositories/db-factory.ts, updating its import in app.ts.
3. Delete apps/api/src/db.ts, apps/api/src/export-renderer.ts, and apps/api/src/store.ts.
4. Run validation checks (typecheck, build, test) and provide the Phase 4 Cleanup Report.
```

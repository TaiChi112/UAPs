# Current Project Isolation Plan

## 1. One-Paragraph Verdict

This repository can be safely reduced to the current Resume Vault & AI Tailoring project. The active Resume Builder frontend pages (rendered at `/` under the route group `(resume-builder)`) and its corresponding state and component folders are completely decoupled from the older UAPS canonical portfolio dashboard, classic resume composer, recruiter marketplace, and prototype page directories. The primary risk in this isolation refactor is accidentally deleting a shared helper file or breaking Elysia API registration. However, our dependency analysis confirms that the active resume-builder features only depend on [packages/shared/src/resume-builder/](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/shared/src/resume-builder/) types and [apps/web/src/lib/api.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/lib/api.ts) (specifically the `/resume-builder/*` endpoints and the auth state routes), making it highly feasible to perform an isolated prune of all legacy frontend folders, unused components, and legacy backend query handlers without affecting the active product.

## 2. Current Project Map

These areas of the codebase form the core of the Resume Vault & AI Tailoring product and **must be kept**:

| Area | File/Folder | Purpose | Keep? | Evidence |
| ---- | ----------- | ------- | ----- | -------- |
| Routes | `apps/web/src/app/(resume-builder)` | Next.js App Router route group rendering the main dashboard, manual editor, and AI resume generator. | Keep | Contains active page components: [page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/page.tsx#L31-L163) (dashboard), [manual/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/resume/manual/page.tsx#L38-L146) (editor), [ai/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/resume/ai/page.tsx#L29-L100) (AI assistant), and [manual/[resumeId]/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/resume/manual/[resumeId]/page.tsx#L32-L174) (editing mode). |
| Features | `apps/web/src/features/resume-builder` | Complete UI components, constants, state management, actions, and client-side repository/LLM services for the resume builder. | Keep | Direct imports in all `(resume-builder)` pages (e.g., [page.tsx:L14-L16](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/(resume-builder)/page.tsx#L14-L16)). |
| AI Service | `apps/api/src/ai` | AI resume tailoring backend service using Vercel AI SDK to call the Google Gemini API. | Keep | Instantiated in [resume-analysis.service.ts:L313](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts#L313) and imported in [app.ts:L17](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L17) for route handler `/v1/resume-builder/analyze-jd`. |
| Repository | `apps/api/src/db/repositories` | Database repositories (`OrmVaultRepository` using Prisma, `RawVaultRepository` using raw SQL) implementing snapshot and CRUD capabilities. | Keep | Decided by factory in [db-factory.ts:L7-L15](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/db-factory.ts#L7-L15) and imported by Elysia endpoints (e.g. `/resume-builder/snapshot`). |
| Database | `apps/api/src/db/prisma.ts` | PrismaClient instantiation wrapper configured with connection parameters. | Keep | Imported and used by [orm-vault.repository.ts:L31](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/orm-vault.repository.ts#L31). |
| Schema | `apps/api/prisma/schema.prisma` | Source of truth database models (User, Resume, Skill, Project, Experience, Certificate, Award, etc.) and relations. | Keep | Used to generate Prisma Client code via `prisma generate`. |
| Export | `apps/api/src/resume-builder-export` | pdfkit generation engine and mapper translating composed resume data to an A4 PDF stream. | Keep | Imported and used in [app.ts:L51-L55](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L51-L55) to download PDF resumes via `/v1/resume-builder/resumes/:resumeId/export`. |
| Shared types | `packages/shared/src/resume-builder` | Shareable Zod schemas, types, enums, and repository interface definition between web and api. | Keep | Imported in both workspaces (e.g., [models.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/shared/src/resume-builder/models.ts)). |
| API Client | `apps/web/src/lib/api.ts` | Frontend REST fetch client setting headers, credentials, and mapping active API endpoints. | Keep | Imported by vault repositories (e.g., [api-vault.repository.ts:L23](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/api-vault.repository.ts#L23)). |
| Auth routes | `apps/web/src/app/auth` | Frontend route layouts and login page supporting GitHub OAuth redirection. | Keep | Handles `/auth/login` page when Local Dev Mode is disabled. |

## 3. Legacy Candidate Map

These legacy files/folders are **not required** by the current Resume Builder experience and are marked for pruning:

| File/Folder | Legacy Reason | Current Dependency Found? | Safe Action | Evidence |
| ----------- | ------------- | ------------------------- | ----------- | -------- |
| `apps/web/src/app/prototype` | Early design prototypes (v1-v5). | No. | Delete now | Never imported by active routes. `/prototype/v5` contains a client-side mock LLM using `setTimeout` which is replaced by the actual API service. |
| `apps/web/src/app/hr` | Recruiter-facing search marketplace UI. | No. | Delete now | Recruiter filter search is out of scope for the Resume Vault. |
| `apps/web/src/app/dashboard` | Older landing page overview of skill/project counts. | No. | Delete now | Superseded by the new homepage dashboard in `(resume-builder)/page.tsx`. |
| `apps/web/src/app/portfolio` | Legacy CRUD portfolio pages for skills, projects, and experiences. | No. | Delete now | New Resume Builder editor handles inline skill and project creations via `/resume-builder/*` endpoints and does not redirect to these pages. |
| `apps/web/src/app/resume/create` | Legacy resume composition dashboard. | No. | Delete now | Superseded by manual and AI creation flows. |
| `apps/web/src/app/resume/list` | Legacy resume list page. | No. | Delete now | Superseded by the main dashboard grid. |
| `apps/web/src/app/resume/mock-editor` | Mock test page for the resume composer. | No. | Delete now | Dead test route. |
| `apps/web/src/app/resume/access-requests` | Older recruiter access list page. | No. | Delete now | Access control workflows are out of scope. |
| `apps/web/src/app/resume/format-preview` | Draft test page for resume previewing. | No. | Delete now | Dead route. |
| `apps/web/src/app/resume/builder` | Contains empty folders (`ai/`, `manual/[resumeId]/`). | No. | Delete now | Folder contains zero files. |
| `apps/web/src/components/hr-resume-marketplace.tsx` | UI component for recruiter filters. | Only imported by legacy page [filter/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/hr/filter/page.tsx#L1). | Delete now | Safe to remove once `/hr/filter` route is deleted. |
| `apps/web/src/components/role-switch-nav.tsx` | Navbar containing links to legacy candidate/recruiter pages. | No. It was commented out in root [layout.tsx:L37](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/layout.tsx#L37). | Delete now | Completely unreferenced in layouts. |
| `apps/web/src/components/auth-nav-button.tsx` | Authentication login button. | Only imported by legacy [role-switch-nav.tsx:L5](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/role-switch-nav.tsx#L5). | Delete now | Safe to delete once `role-switch-nav.tsx` is deleted. |
| `apps/web/src/lib/mock-items.ts` | Seed mock arrays for projects/skills. | Only imported by legacy [mock-editor/page.tsx:L4](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/mock-editor/page.tsx#L4). | Delete now | Unused by the active Resume Builder. |
| `apps/web/src/lib/mock-resume-format.ts` | Seed mock data for previews. | Only imported by legacy [list/page.tsx:L5](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/list/page.tsx#L5) and [format-preview/page.tsx:L1](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/format-preview/page.tsx#L1). | Delete now | Unused. |
| `apps/web/src/lib/server-api.ts` | Server-side data fetching wrappers. | Only imported by legacy dashboard [page.tsx:L2](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/dashboard/page.tsx#L2). | Delete now | Safe to delete once the legacy dashboard is removed. |
| `apps/web/src/app/api/[...elysia]` | Mock next-elysia endpoint folder. | Only imported by legacy test page [page.tsx:L2](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/next_elysia/page.tsx#L2). | Delete now | Safe to delete once `/next_elysia` is removed. |
| `apps/web/src/app/next_elysia` | Mock test page for Elysia Eden type safety. | No. | Delete now | Dead route. |
| `apps/api/src/db.ts` | Raw PostgreSQL operations for recruiter marketplace and access workflows. | Imported in [app.ts:L48](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L48) to support legacy endpoints. | Delete after backend pruning | Safe to delete once all legacy API endpoints are pruned from `app.ts`. |
| `apps/api/src/store.ts` | Unused legacy in-memory bootstrap database store. | No active imports in the API codebase. | Delete now | Unreferenced dead file. |
| `apps/api/src/export-renderer.ts` | Older SVG/resvg/pdf-lib based resume rendering pipeline. | Imported in [app.ts:L50](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts#L50) to support legacy `/resumes/:resumeId/export/:format` route. | Delete after backend pruning | Safe to delete once classic export endpoints are pruned from `app.ts`. |
| `packages/db/sql/002_seed_mock_use_case.sql` | SQL seed data for legacy portfolio. | None. | Delete now | Unreferenced. |
| `packages/db/sql/004_seed_public_recruiter_marketplace.sql` | SQL seed data for recruiter marketplace. | Referenced by seed scripts. | Delete now | Unreferenced in active application. |
| `apps/api/scripts/seed-recruiter-mock.ts` | Seeding script for recruiter mock profiles. | None. | Delete now | Recruiter flows are legacy. |
| `scripts/smoke-hr-flow.ps1` | Smoke test script for validating recruiter marketplace flows. | None. | Delete now | Recruiter flows are legacy. |

## 4. Current Route Map

The Next.js App Router maps pages to specific route URLs:

| Route | File | Current/Legacy | Keep/Delete | Evidence |
| ----- | ---- | -------------- | ----------- | -------- |
| `/` | `apps/web/src/app/(resume-builder)/page.tsx` | Current | Keep | Entry point rendering Resume Builder dashboard. |
| `/resume/manual` | `apps/web/src/app/(resume-builder)/resume/manual/page.tsx` | Current | Keep | Entry point to create manual resumes. |
| `/resume/ai` | `apps/web/src/app/(resume-builder)/resume/ai/page.tsx` | Current | Keep | Entry point to auto-tailor resumes with AI. |
| `/resume/manual/[resumeId]` | `apps/web/src/app/(resume-builder)/resume/manual/[resumeId]/page.tsx` | Current | Keep | Entry point to edit existing composed resumes. |
| `/auth/login` | `apps/web/src/app/auth/login/page.tsx` | Current | Keep | Login page via GitHub. |
| `/auth/logout` | `apps/web/src/app/auth/logout/route.ts` | Current | Keep | Session logout route handler. |
| `/dashboard` | `apps/web/src/app/dashboard/page.tsx` | Legacy | Delete | Unlinked legacy count dashboard. |
| `/hr/filter` | `apps/web/src/app/hr/filter/page.tsx` | Legacy | Delete | Recruiter marketplace page. |
| `/next_elysia` | `apps/web/src/app/next_elysia/page.tsx` | Legacy | Delete | Mock test page for type safety. |
| `/portfolio/projects` | `apps/web/src/app/portfolio/projects/page.tsx` | Legacy | Delete | Project CRUD management. |
| `/portfolio/skills` | `apps/web/src/app/portfolio/skills/page.tsx` | Legacy | Delete | Skill CRUD management. |
| `/portfolio/experiences` | `apps/web/src/app/portfolio/experiences/page.tsx` | Legacy | Delete | Experience CRUD management. |
| `/prototype` | `apps/web/src/app/prototype/page.tsx` | Legacy | Delete | Design mockup index page. |
| `/prototype/v2` | `apps/web/src/app/prototype/v2/page.tsx` | Legacy | Delete | Design mockup v2. |
| `/prototype/v3` | `apps/web/src/app/prototype/v3/page.tsx` | Legacy | Delete | Design mockup v3. |
| `/prototype/v4` | `apps/web/src/app/prototype/v4/page.tsx` | Legacy | Delete | Design mockup v4. |
| `/prototype/v5` | `apps/web/src/app/prototype/v5/page.tsx` | Legacy | Delete | Design mockup v5. |
| `/resume/access-requests` | `apps/web/src/app/resume/access-requests/page.tsx` | Legacy | Delete | Recruiter access governance dashboard. |
| `/resume/create` | `apps/web/src/app/resume/create/page.tsx` | Legacy | Delete | Legacy resume composition dashboard. |
| `/resume/format-preview` | `apps/web/src/app/resume/format-preview/page.tsx` | Legacy | Delete | Draft formatting preview page. |
| `/resume/list` | `apps/web/src/app/resume/list/page.tsx` | Legacy | Delete | Old resume list. |
| `/resume/mock-editor` | `apps/web/src/app/resume/mock-editor/page.tsx` | Legacy | Delete | Unused early composer mock. |
| `/api/[...elysia]` | `apps/web/src/app/api/[...elysia]/route.ts` | Legacy | Delete | Local Next-Elysia mock route. |

## 5. Current API Endpoint Map

Active endpoints in the Elysia backend API (`apps/api/src/app.ts`) and their relationships with the frontend:

| Endpoint | Handler File | Called By Current UI? | Current/Legacy | Action |
| -------- | ------------ | --------------------- | -------------- | ------ |
| `GET /v1/health` | `app.ts` | No | Current | Keep (Standard service liveness check) |
| `GET /v1/auth/github/start` | `app.ts` | Yes (during sign-in) | Current | Keep |
| `GET /v1/auth/github/callback` | `app.ts` | Yes (during sign-in) | Current | Keep |
| `GET /v1/auth/github/config` | `app.ts` | Yes | Current | Keep |
| `GET /v1/auth/session` | `app.ts` | Yes | Current | Keep |
| `POST /v1/auth/logout` | `app.ts` | Yes | Current | Keep |
| `GET /v1/resume-builder/snapshot` | `app.ts` | Yes (on page load) | Current | Keep (Loads vault & saved resumes) |
| `POST /v1/resume-builder/skills` | `app.ts` | Yes (adds skill) | Current | Keep |
| `POST /v1/resume-builder/projects` | `app.ts` | Yes (adds project) | Current | Keep |
| `POST /v1/resume-builder/analyze-jd` | `app.ts` | Yes (auto-tailor) | Current | Keep (Invokes Gemini model analysis) |
| `POST /v1/resume-builder/resumes` | `app.ts` | Yes (saves draft) | Current | Keep |
| `PUT /v1/resume-builder/resumes/:resumeId` | `app.ts` | Yes (updates draft) | Current | Keep |
| `POST /v1/resume-builder/resumes/:resumeId/duplicate` | `app.ts` | Yes (duplicates card) | Current | Keep |
| `DELETE /v1/resume-builder/resumes/:resumeId` | `app.ts` | Yes (deletes card) | Current | Keep |
| `PATCH /v1/resume-builder/resumes/:resumeId/status` | `app.ts` | Yes (changes status dropdown) | Current | Keep |
| `GET /v1/resume-builder/resumes/:resumeId/export` | `app.ts` | Yes (downloads PDF) | Current | Keep (Renders A4 PDF via pdfkit) |
| `GET /v1/hr/resumes` | `app.ts` | No | Legacy | Prune (Recruiter marketplace search) |
| `GET /v1/hr/resumes/:resumeId/quick-view` | `app.ts` | No | Legacy | Prune |
| `POST /v1/hr/access-requests` | `app.ts` | No | Legacy | Prune (Access workflow) |
| `GET /v1/users/me/summary` | `app.ts` | No | Legacy | Prune (Legacy dashboard summary count) |
| `GET/POST /v1/skills` | `app.ts` | No | Legacy | Prune (Legacy portfolio skill CRUD) |
| `PUT/DELETE /v1/skills/:skillId` | `app.ts` | No | Legacy | Prune |
| `GET/POST /v1/projects` | `app.ts` | No | Legacy | Prune (Legacy portfolio project CRUD) |
| `PUT/DELETE /v1/projects/:projectId` | `app.ts` | No | Legacy | Prune |
| `GET/POST /v1/experiences` | `app.ts` | No | Legacy | Prune (Legacy portfolio experience CRUD) |
| `PUT/DELETE /v1/experiences/:experienceId` | `app.ts` | No | Legacy | Prune |
| `GET/POST /v1/resumes` | `app.ts` | No | Legacy | Prune (Legacy resume management) |
| `PUT/DELETE /v1/resumes/:resumeId` | `app.ts` | No | Legacy | Prune |
| `POST /v1/resumes/:resumeId/compose` | `app.ts` | No | Legacy | Prune (Legacy composition mappings) |
| `GET/PUT /v1/resumes/:resumeId/baseline` | `app.ts` | No | Legacy | Prune (Legacy contact baselines) |
| `GET /v1/resumes/access-requests` | `app.ts` | No | Legacy | Prune (Access workflow) |
| `POST /v1/resumes/access-requests/:requestId/review` | `app.ts` | No | Legacy | Prune |
| `GET /v1/resumes/access-audit-logs` | `app.ts` | No | Legacy | Prune (Recruiter audit logging) |
| `GET /v1/resumes/:resumeId/preview` | `app.ts` | No | Legacy | Prune |
| `GET /v1/resumes/:resumeId/export/:format` | `app.ts` | No | Legacy | Prune (Old SVG/pdf-lib download pipeline) |

## 6. Current Database Model Map

This table maps database entities and relations inside the PostgreSQL storage backend to verify their active status:

| Table/Model | Used By Current Resume Builder? | Used By Legacy Only? | Keep/Delete/Archive | Evidence |
| ----------- | ------------------------------- | -------------------- | ------------------- | -------- |
| `users` | Yes | No | Keep | Mapped by Prisma `User` model. Stores active profile details. |
| `skills` | Yes | No | Keep | Mapped by Prisma `Skill` model. Contains vault skills. |
| `user_skills` | Yes | No | Keep | Mapped by Prisma `UserSkill` model. Sets candidate proficiency level. |
| `projects` | Yes | No | Keep | Mapped by Prisma `Project` model. Contains vault projects. |
| `experiences` | Yes | No | Keep | Mapped by Prisma `Experience` model. Contains vault experiences. |
| `certificates` | Yes | No | Keep | Mapped by Prisma `Certificate` model. Contains vault certificates. |
| `awards` | Yes | No | Keep | Mapped by Prisma `Award` model. Contains vault awards. |
| `resumes` | Yes | No | Keep | Mapped by Prisma `Resume` model. Tracks created resumes and statuses. |
| `resume_basics` | Yes | No | Keep | Mapped by Prisma `ResumeBasic` model. Stores 1:1 contact baselines for PDF exports. |
| `resume_projects` | Yes | No | Keep | Mapped by Prisma `ResumeProject` model. Junction mapping projects in resumes. |
| `resume_skills` | Yes | No | Keep | Mapped by Prisma `ResumeSkill` model. Junction mapping skills in resumes. |
| `resume_experiences` | Yes | No | Keep | Mapped by Prisma `ResumeExperience` model. Junction mapping experiences in resumes. |
| `resume_certificates` | Yes | No | Keep | Mapped by Prisma `ResumeCertificate` model. Junction mapping certs in resumes. |
| `resume_awards` | Yes | No | Keep | Mapped by Prisma `ResumeAward` model. Junction mapping awards in resumes. |
| `project_skills` | No | Yes (Classic only) | Keep | Mapped by Prisma `ProjectSkill` model. Binds skills to projects. Kept for schema completeness, although not actively read by the resume builder. |
| `experience_skills` | No | Yes (Classic only) | Keep | Mapped by Prisma `ExperienceSkill` model. Binds skills to experiences. Kept for schema completeness. |
| `companies` | No | Yes | Delete | Not mapped in Prisma. Stores company names and verification statuses. |
| `recruiter_accounts` | No | Yes | Delete | Not mapped in Prisma. Stores recruiter accounts and risk levels. |
| `recruiter_verifications` | No | Yes | Delete | Not mapped in Prisma. Stores admin recruiter verification outcomes. |
| `resume_access_requests` | No | Yes | Delete | Not mapped in Prisma. Stores gated access request logs. |
| `resume_access_audit_logs` | No | Yes | Delete | Not mapped in Prisma. Stores immutable logs of recruiter operations. |
| `fraud_signals` | No | Yes | Delete | Not mapped in Prisma. Stores flags for malicious recruiters. |

## 7. Import Dependency Check

The following searches and checks were conducted to verify file dependencies:

1. **Unused navigation buttons**: Search for `role-switch-nav` showed zero imports in frontend pages (removed from root layout). Search for `auth-nav-button` showed it was only imported in `role-switch-nav.tsx`, making it completely unused.
2. **Unused components**: Search for `hr-resume-marketplace` showed it was only imported in [filter/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/hr/filter/page.tsx#L1), which is a legacy filter page candidate.
3. **Unused lib helpers**: Search for `server-api` showed it was only imported in [dashboard/page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/dashboard/page.tsx#L2). Search for `mock-items` showed it was only imported in `resume/mock-editor/page.tsx`. Search for `mock-resume-format` showed it was only imported in `resume/list/page.tsx` and `resume/format-preview/page.tsx`.
4. **Isolated DB repository**: Search for recruiter-related terms (`recruiter`, `companies`, `audit`, `access`) in `apps/api/src/db/repositories/` yielded zero results, verifying that the new database repositories (`OrmVaultRepository`, `RawVaultRepository`) are completely clean and do not touch legacy recruiter flows.
5. **Shared package exports**: Analysis of `packages/shared/src/index.ts` verified that the shared package exports only the `resume-builder` folder, containing zero legacy types.

## 8. Proposed Refactor Phases

The refactoring process is structured into incremental, verified phases to isolate the current project safely:

### Phase 0: Safety branch and baseline checks
* **Files affected**: None.
* **Risk level**: Very Low.
* **Validation command**: `bun run typecheck` and `bun run test` (asserts the hybrid codebase builds successfully before modifications).
* **Rollback strategy**: `git checkout main` or discard changes.

### Phase 1: Delete prototype pages
* **Files affected**: 
  * `apps/web/src/app/prototype/**`
  * `apps/web/src/app/next_elysia/**`
  * `apps/web/src/app/api/[...elysia]/**`
* **Risk level**: Low.
* **Validation command**: `bun run typecheck:web`
* **Rollback strategy**: `git restore apps/web/src/app/prototype apps/web/src/app/next_elysia apps/web/src/app/api/[...elysia]`

### Phase 2: Delete old frontend routes
* **Files affected**:
  * `apps/web/src/app/dashboard/**`
  * `apps/web/src/app/hr/**`
  * `apps/web/src/app/portfolio/**`
  * `apps/web/src/app/resume/create/**`
  * `apps/web/src/app/resume/list/**`
  * `apps/web/src/app/resume/mock-editor/**`
  * `apps/web/src/app/resume/access-requests/**`
  * `apps/web/src/app/resume/format-preview/**`
  * `apps/web/src/app/resume/builder/**` (directory containing empty route groups)
* **Risk level**: Low.
* **Validation command**: `bun run typecheck:web`
* **Rollback strategy**: `git restore` on all deleted route directories.

### Phase 3: Delete old navigation/components
* **Files affected**:
  * `apps/web/src/components/role-switch-nav.tsx`
  * `apps/web/src/components/hr-resume-marketplace.tsx`
  * `apps/web/src/components/auth-nav-button.tsx`
  * `apps/web/src/lib/mock-items.ts`
  * `apps/web/src/lib/mock-resume-format.ts`
  * `apps/web/src/lib/server-api.ts`
* **Risk level**: Medium.
* **Validation command**: `bun run typecheck:web`
* **Rollback strategy**: `git restore` on the deleted component and lib files.

### Phase 4: Prune old API endpoints
* **Files affected**:
  * `apps/api/src/app.ts` (prune legacy endpoints)
  * `apps/api/src/db.ts` (delete entire file)
  * `apps/api/src/export-renderer.ts` (delete entire file)
  * `apps/api/src/store.ts` (delete entire file)
* **Risk level**: High.
* **Validation command**: `bun run typecheck:api` and `bun run test:api`
* **Rollback strategy**: `git restore apps/api/src/app.ts apps/api/src/db.ts apps/api/src/export-renderer.ts apps/api/src/store.ts`

### Phase 5: Prune old database schemas/seeds
* **Files affected**:
  * `packages/db/sql/002_seed_mock_use_case.sql` (delete entire file)
  * `packages/db/sql/003_resume_visibility_recruiter_access.sql` (prune tables, keeping only `resume_basics` and columns added to `resumes`)
  * `packages/db/sql/004_seed_public_recruiter_marketplace.sql` (delete entire file)
  * `apps/api/scripts/seed-recruiter-mock.ts` (delete entire file)
  * `scripts/smoke-hr-flow.ps1` (delete entire file)
* **Risk level**: Medium.
* **Validation command**: `bun run --cwd apps/api prisma:generate` followed by `bun run seed:vault-test` to assert mock owner seeding works on PostgreSQL.
* **Rollback strategy**: `git restore` on packages and scripts folders.

### Phase 6: Update README and database documentation
* **Files affected**:
  * `README.md`
  * `PROJECT_SUMMARY.md`
  * `PROJECT_AUDIT_EVIDENCE.md`
* **Risk level**: Very Low.
* **Validation command**: Build check.
* **Rollback strategy**: `git restore` markdown files.

## 9. Do Not Delete Yet

These files look old but **must not be deleted** yet:

1. **`apps/web/src/app/auth/`**: Renders login page and logout route handlers. Essential for Github OAuth authentication in production mode.
2. **`apps/api/src/auth.ts`**: Contains session decryption and creation helpers (jose JWT verification) used globally by the Elysia backend context middleware.
3. **`apps/api/scripts/seed-vault-test.ts`**: Active seeding script used to bootstrap developer mock profiles (Maya, Rafael, Priya) and composed resumes.
4. **`project_skills` and `experience_skills` tables in `schema.prisma`**: Even though not queried by the resume builder repository, they define relations of `Project` and `Experience` models. Deleting them might trigger database generation errors unless those models are pruned as well.

## 10. Recommended First Deletion PR

**Recommended PR: "Prune Prototype Pages and Unused Elysia Mock Routes"**

*   **Files to delete**:
    *   `apps/web/src/app/prototype/` (entire directory)
    *   `apps/web/src/app/next_elysia/` (entire directory)
    *   `apps/web/src/app/api/[...elysia]/` (entire directory)
*   **Rationale**: These folders contain zero imports or dependencies in the active codebase. They were created as mock prototypes or learning guides and are completely safe to remove with zero risk of compile errors or build breaks.

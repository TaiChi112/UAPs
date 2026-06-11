# Project Summary

## 1. Executive Summary

The Universal Academic Portfolio System (UAPS) is a full-stack monorepo application designed to enable developers and academic professionals to manage a single canonical portfolio of skills, projects, and experiences, from which they can compose and export customized resume versions. The application provides a recruiter-facing marketplace where public or company-only resumes can be filtered, searched, and previewed. To protect user privacy and combat recruitment fraud, the system implements an owner-gated access request and approval workflow, backed by a tamper-evident audit log of recruiter interactions. Built on a modern tech stack, UAPS utilizes Next.js 16 (React 19) for the frontend, Elysia on Bun for the API backend, and PostgreSQL for persistent storage. Additionally, the system includes a fully implemented AI-assisted resume tailoring feature that leverages the Google Gemini API to analyze job descriptions against candidate portfolios.

## 2. Source of Truth Assessment

The actual source code within this monorepo represents the highest source of truth. The repository's [README.md](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/README.md) is mostly accurate regarding the features and technology stack but is partially outdated or incomplete on the following architectural details:
* **Database Access Discrepancy**: The README states that all SQL is encapsulated in raw query functions in `db.ts`. However, the newer `/resume-builder/*` endpoints use a separate dynamic repository layer located under `apps/api/src/db/` that defaults to a Prisma Client implementation (`OrmVaultRepository`) mapping to a schema file (`schema.prisma`).
* **AI Feature Status**: The README designates the AI-assisted resume composition feature as a planned "Future Enhancement" (v0.4). In reality, this is already fully implemented on both the frontend and backend using the Google GenAI SDK.
* **Unmapped Recruiter Tables**: The recruiter governance tables (`companies`, `recruiter_accounts`, `resume_access_requests`, etc.) are defined in the PostgreSQL DDL migrations but are entirely omitted from the Prisma schema file (`schema.prisma`).

## 3. Project Identity

* Project name: Universal Academic Portfolio System (UAPS)
* Current product type: Academic/Professional Portfolio & Gated Recruiter Marketplace
* Current main user: Software professionals, developers, academics, and recruiters
* Current main workflow: Portfolio owners manage their skills, projects, and experiences, and compose customized resumes. Recruiters search candidate profiles in the marketplace and request access to gated resumes.
* Current maturity level: MVP / Production-like (contains functioning API integrations with Supabase and Gemini, along with local-storage fallback capabilities).

## 4. Tech Stack

| Area | Technology | Evidence / File |
| ---- | ---------- | --------------- |
| **Runtime** | Bun 1.x | Root [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/package.json), [bun.lock](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/bun.lock) |
| **Frontend Framework** | Next.js 16.2.3 + React 19.2.4 | apps/web [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/package.json) |
| **Backend Framework** | Elysia 1.4.28 | apps/api [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/package.json) |
| **Database** | PostgreSQL | packages/db/sql [001_init_uaps.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/001_init_uaps.sql) |
| **ORM / Client** | Prisma 7.8.0 & `pg` connection pool | apps/api [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma), [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) |
| **AI Integration** | Google Generative AI (`gemini-2.5-flash`) via Vercel AI SDK | apps/api [resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | apps/web [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/package.json), [globals.css](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/globals.css) |
| **Export Engines** | pdfkit (Resume Builder) & `@resvg/resvg-js` + `pdf-lib` (Classic) | apps/api [resume-builder-pdf.renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts), [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts) |
| **Authentication** | JWT (HS256 via `jose` library) + GitHub OAuth 2.0 | apps/api [auth.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/auth.ts) |
| **Testing** | Vitest (Web) & Bun Test (API) | apps/web [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/package.json), apps/api [package.json](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/package.json) |

## 5. Project Structure

```
universal_academic_portfolio_system_copy/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   └── schema.prisma                # Database mapping for portfolio entities
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── ai/
│   │   │   │   ├── config.ts                # Gemini API environment configuration
│   │   │   │   └── resume-analysis.service.ts # AI job description analysis logic
│   │   │   ├── db/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── db-factory.ts        # Strategy selector (ORM vs RAW)
│   │   │   │   │   ├── orm-vault.repository.ts # Prisma implementation
│   │   │   │   │   ├── raw-vault.repository.ts # Raw pg SQL implementation
│   │   │   │   │   └── vault-backend.types.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── pool.ts                  # Shared database connection pool
│   │   │   │   └── prisma.ts                # Prisma Client instance
│   │   │   ├── routes/
│   │   │   │   └── resume-builder.schemas.ts
│   │   │   ├── resume-builder-export/
│   │   │   │   ├── resume-builder-pdf.renderer.ts # pdfkit direct drawing layout
│   │   │   │   └── resume-builder-export.mapper.ts
│   │   │   ├── app.ts                       # Main route registry & endpoints
│   │   │   ├── auth.ts                      # JWT session and cookie utilities
│   │   │   ├── db.ts                        # Raw SQL access layer (UAPS Classic)
│   │   │   └── export-renderer.ts           # SVG-to-PNG/PDF export pipeline (Classic)
│   │   ├── .env
│   │   ├── index.ts                         # Elysia Server entrypoint
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (resume-builder)/
│       │   │   │   ├── resume/
│       │   │   │   │   ├── ai/page.tsx          # AI resume generator view
│       │   │   │   │   └── manual/              # Manual resume builder pages
│       │   │   │   ├── layout.tsx
│       │   │   │   └── page.tsx                 # Resume Builder Dashboard (Root)
│       │   │   ├── dashboard/page.tsx           # Owner portfolio item overview stats
│       │   │   ├── hr/
│       │   │   │   └── filter/page.tsx          # Recruiter Marketplace page
│       │   │   ├── portfolio/
│       │   │   │   ├── projects/page.tsx        # Project item manager
│       │   │   │   ├── skills/page.tsx          # Skill item manager
│       │   │   │   └── experiences/page.tsx     # Work experience manager
│       │   │   ├── resume/
│       │   │   │   ├── access-requests/page.tsx # Access approvals page
│       │   │   │   ├── create/page.tsx          # Classic resume composer page
│       │   │   │   ├── list/page.tsx            # Mock resume card shelf (Mock)
│       │   │   │   └── mock-editor/page.tsx     # Mock resume editor (Mock)
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── auth-nav-button.tsx
│       │   │   ├── hr-resume-marketplace.tsx    # Recruiter search page component
│       │   │   └── role-switch-nav.tsx          # Header switch between Owner/HR
│       │   ├── features/
│       │   │   └── resume-builder/              # State context, reducers, and logic
│       │   ├── lib/
│       │   │   ├── api.ts                       # Typed client-side API fetches
│       │   │   └── server-api.ts                # Server-side data loaders
│       │   └── package.json
│       └── postcss.config.mjs
├── packages/
│   ├── db/
│   │   └── sql/
│   │       ├── 001_init_uaps.sql            # Base schema (users, portfolios, resumes)
│   │       ├── 002_seed_mock_use_case.sql   # Developer initial seeds
│   │       ├── 003_resume_visibility_recruiter_access.sql # Recruiter governance schema
│   │       └── 004_seed_public_recruiter_marketplace.sql # Recruiter demo seeds
│   └── shared/
│       ├── package.json
│       └── src/
│           └── resume-builder/              # Shared types, enums, schemas
├── scripts/
│   └── smoke-hr-flow.ps1                    # Recruiter flow test suite
├── package.json
└── tsconfig.json
```

## 6. Main Routes / Pages

| Route / Entry | Purpose | Key Files |
| ------------- | ------- | --------- |
| `/` | **Resume Builder Dashboard**: lists saved resumes, exposes options to create resumes manually or with AI assistance, lets users duplicate, delete, and download PDFs. | [page.tsx (Route Group)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/%28resume-builder%29/page.tsx) |
| `/dashboard` | **Owner Overview**: Displays total counts of projects, skills, experiences, and resumes. Links to portfolio managers. | [page.tsx (Dashboard)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/dashboard/page.tsx) |
| `/resume/ai` | **AI Resume Tailoring**: Accepts a job description, submits it to the API, and updates the local state with Gemini's selections. | [page.tsx (AI Builder)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/%28resume-builder%29/resume/ai/page.tsx) |
| `/resume/manual` | **Manual Resume Form**: Offers a layout to create or edit a resume, baseline summary, and choose skills, projects, and experiences. | [page.tsx (Manual Builder)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/%28resume-builder%29/resume/manual/page.tsx) |
| `/resume/create` | **Classic Resume Composer**: Composes resumes and baselines using direct API endpoints that update database tables. | [page.tsx (Classic Composer)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/create/page.tsx) |
| `/resume/list` | **Resume Product Shelf (Mock)**: Displays mock resume products and formats. Strictly hardcoded client-side. | [page.tsx (Mock Shelf)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/list/page.tsx) |
| `/resume/mock-editor` | **Mock Resume Editor (Mock)**: In-memory interface to add mock skills and projects to resumes. Strictly client-side. | [page.tsx (Mock Editor)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/mock-editor/page.tsx) |
| `/resume/access-requests` | **Owner Governance Panel**: Displays list of incoming access requests submitted by recruiters, allowing approvals and rejections. | [page.tsx (Access Requests)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/access-requests/page.tsx) |
| `/portfolio/projects` | **Project Manager**: Form to add, update, delete projects, and link skills to them. | [page.tsx (Portfolio Projects)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/projects/page.tsx) |
| `/portfolio/skills` | **Skill Manager**: UI to list, add, edit proficiency levels, and categorize owner skills. | [page.tsx (Portfolio Skills)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/skills/page.tsx) |
| `/portfolio/experiences` | **Work Experience Manager**: UI to register work history, dates, roles, achievements, and tag relevant skills. | [page.tsx (Portfolio Experiences)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/experiences/page.tsx) |
| `/hr/filter` | **Recruiter Marketplace**: Let recruiters search published resumes by job title, minimum experience years, required skills, and keyword. | [page.tsx (Marketplace Filter)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/hr/filter/page.tsx) |

## 7. Main Features

### Portfolio Vault Management (Owner)
* **What it does**: Handles the registration and updates of the owner's master data (Skills, Projects, Experiences, Certifications, Awards). 
* **Implementation Status**: Fully implemented.
* **Important files involved**: 
  * Frontend: [page.tsx (Projects)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/projects/page.tsx), [page.tsx (Skills)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/skills/page.tsx), [page.tsx (Experiences)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/portfolio/experiences/page.tsx)
  * Backend: [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) (handles database writes and links)

### Resume Composition & Tailoring (Owner)
* **What it does**: Composes a targeted resume version by linking selected projects, skills, and experiences to a resume ID, and configures baseline details.
* **Implementation Status**: Fully implemented via two distinct interfaces: the Classic Composer (`/resume/create`) which interacts directly with PostgreSQL tables, and the State Resume Builder (`/`) which updates client context and syncs via snapshot endpoints.
* **Important files involved**:
  * Frontend: [page.tsx (Classic Composer)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/create/page.tsx), [context.tsx (State Context)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/state/context.tsx), [hybrid-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts)
  * Backend: [orm-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/orm-vault.repository.ts), [raw-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/repositories/raw-vault.repository.ts)

### AI-Assisted Resume Generator (Owner)
* **What it does**: Sends the candidate's master portfolio data alongside a pasted job description to Google Gemini. The model analyzes the job requirements and returns a tailored resume configuration, including a computed match score and a list of missing skills.
* **Implementation Status**: Fully implemented (ahead of the README's schedule).
* **Important files involved**:
  * Frontend: [page.tsx (AI Page)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/%28resume-builder%29/resume/ai/page.tsx)
  * Backend: [resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts) (invokes Vercel AI SDK with Google Gemini model)

### Recruiter Search & Marketplace (Recruiter)
* **What it does**: Exposes an unauthenticated dashboard where recruiters can filter published profiles using criteria like job title, minimum experience years, and required skills. Recruiters can click to view a quick-view card containing public portfolio details.
* **Implementation Status**: Fully implemented.
* **Important files involved**:
  * Frontend: [hr-resume-marketplace.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/components/hr-resume-marketplace.tsx)
  * Backend: [db.ts (listRecruiterVisibleResumes)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L1066-L1134) (executes lateral sub-query aggregation)

### Access Governance & Audit Logs (Owner / Recruiter)
* **What it does**: Recruiters can request access to gated resume details (such as contact cards or full exports). Owners can review, approve, or reject access requests in real time. All actions write records to a tamper-evident audit log.
* **Implementation Status**: Fully implemented.
* **Important files involved**:
  * Frontend: [page.tsx (Access Requests)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/resume/access-requests/page.tsx)
  * Backend: [db.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) (methods: `createResumeAccessRequest`, `reviewResumeAccessRequest`, `listOwnerAccessRequests`, `listOwnerAccessAuditLogs`)

### Resume Exports (Owner / Recruiter)
* **What it does**: Generates and downloads compiled resumes in JSON, Markdown, PNG, and PDF.
* **Implementation Status**: Fully implemented.
* **Important files involved**:
  * UAPS Classic: [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts) (renders via SVG rasterization using `resvg` and `pdf-lib`).
  * Resume Builder: [resume-builder-pdf.renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts) (directly draws layouts to document pages using `pdfkit`).

---

## 8. Data Model Summary

All database objects are managed in PostgreSQL. The physical database layout is defined by SQL migration scripts in `packages/db/sql/` and mapped for the resume builder backend in `apps/api/prisma/schema.prisma`.

| Entity / Object | Purpose | Fields / Important Properties | Source File |
| --------------- | ------- | ----------------------------- | ----------- |
| `users` | Candidate user identity | `user_id` (UUID), `name`, `email` (Unique), `github_login`, `github_id`, `avatar_url`, timestamps | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `skills` | Master taxonomy of skills | `skill_id` (UUID), `name` (Unique), `category` | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `user_skills` | Junction assigning skills to users | `user_id` (FK), `skill_id` (FK), `proficiency_level` (Check) | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `projects` | Portfolio projects | `project_id` (UUID), `user_id` (FK), `title`, `description`, `repo_url`, `is_active`, `status` | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `project_skills` | Junction tying skills to projects | `project_id` (FK), `skill_id` (FK) | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `experiences` | Employment history items | `experience_id` (UUID), `user_id` (FK), `organization`, `role`, `description`, `achievement`, `start_date`, `end_date` | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `experience_skills` | Junction tying skills to work items | `experience_id` (FK), `skill_id` (FK) | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `resumes` | Composed resume version metadata | `resume_id` (UUID), `user_id` (FK), `version_name`, `target_job_title`, `target_company`, `visibility` (Check), `status` | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `resume_basics` | 1:1 Contact info for a specific resume | `resume_id` (PK, FK), `full_name`, `headline`, `email`, `phone`, `location`, `linkedin_url`, `portfolio_url`, `github_url`, `summary` | [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) |
| `companies` | Directory of verified recruiter employers | `company_id` (UUID), `legal_name`, `domain` (Unique), `website`, `verification_status` (Check) | [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) |
| `recruiter_accounts` | Accounts of marketplace recruiters | `recruiter_id` (UUID), `company_id` (FK), `full_name`, `email` (Unique), `risk_level` (Check), `account_status` (Check) | [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) |
| `resume_access_requests` | Governance requests submitted by recruiters | `access_request_id` (UUID), `resume_id` (FK), `recruiter_id` (FK), `purpose`, `position_title`, `requested_visibility`, `request_status` (Check), `expires_at` | [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) |
| `resume_access_audit_logs`| Access control logs | `audit_id` (UUID), `resume_id` (FK), `recruiter_id` (FK), `action` (Check), `ip_address`, `user_agent`, `referrer`, `event_time`, `metadata` | [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) |

## 9. Relationship / Composition Model

* **One-to-Many Relationships**: A `User` owns multiple `Projects`, `Experiences`, `Certificates`, `Awards`, and `Resumes`. A `Company` employs multiple `RecruiterAccounts`.
* **Many-to-Many Relationships**: Skills are modeled in a global registry (`skills`). Associations between users and skills are linked via `user_skills`, which houses the user's customized `proficiency_level`. Projects and experiences are tagged with skills using the M:N junction tables `project_skills` and `experience_skills`.
* **Resume Composition Pattern**:
  * A `Resume` represents a customized view. Basic contact details are configured as a 1:1 optional extension table (`resume_basics`).
  * The actual structure (skills, projects, experiences, certificates, awards) selected for a resume version is established via M:N link tables (`resume_skills`, `resume_projects`, `resume_experiences`, `resume_certificates`, `resume_awards`).
* **State vs Database**:
  * In the classic flow, edits to portfolio items or compositions write directly to the database.
  * In the integrated state builder, frontend mutations are dispatched to a React context (`use-resume-builder`). The actions wrapper calls `HybridVaultRepository`, which attempts to synchronize the entire snapshot to the backend `/resume-builder/*` endpoints. If the backend fails or Dev Mode is active, the repository falls back to browser `localStorage` (`MockVaultRepository`) to maintain local state, returning source `"hybrid"`.

---

## 10. Database Readiness Assessment

* **Is a real database currently used?**: Yes. The application is configured to connect to a PostgreSQL database. In development, it points to a Supabase instance (configured in `apps/api/.env`).
* **Is there a schema or migration?**: Yes. Base database migration scripts are located in `packages/db/sql/` and database mapping models are maintained in `apps/api/prisma/schema.prisma`.
* **Is the current implementation in-memory/mock/local state?**: The application backend relies on database persistence. The frontend uses a hybrid repository layer (`HybridVaultRepository`) that falls back to `localStorage` (mock state) only when backend endpoints are unreachable.
* **What would need to change to make it database-backed?**: The system is database-backed. However, to synchronize all features, the recruiter governance tables (`companies`, `recruiter_accounts`, `resume_access_requests`, `resume_access_audit_logs`, `recruiter_verifications`, `fraud_signals`) must be added to the Prisma schema (`schema.prisma`), allowing backend components to read/write them using the ORM.
* **Which entities should become relational tables?**: All key entities are relational tables.

---

## 11. AI Feature Assessment

* **Input**: User pastes a Job Description (plain-text string) from the frontend, which is packaged with the owner's portfolio data (`VaultData` containing skills, projects, and experiences) and the current active resume configuration.
* **Processing Flow**:
  1. The user clicks "Analyze" on the frontend AI tailoring view.
  2. The frontend actions submit a JSON payload containing the JD and vault details to the `/resume-builder/analyze-jd` endpoint.
  3. The backend delegates processing to `resumeAnalysisService.analyzeJobDescription`.
  4. The service constructs a structured prompt, loading candidate details.
  5. The Vercel AI SDK calls the Google model (`gemini-2.5-flash`) using native structured JSON object output configuration.
  6. The prompt constrains the LLM to select *only* existing IDs from the candidate's vault and forbids inventing projects or skills.
  7. The backend validates and filters the response (e.g. removing any fabricated IDs) and returns the JSON payload.
  8. The frontend receives the tailored config, updating the local builder context.
* **Output**: A tailored resume configuration including suggested role title, summary, selected skill/project/experience IDs, a match score (0-100), and a list of plain-text missing skills.
* **Real or Mock**: Real LLM API. The system uses the official Google Generative AI integration, requiring `GOOGLE_GENERATIVE_AI_API_KEY` to be set.

---

## 12. README vs Actual Implementation

| README / Docs Claim | Actual Implementation | Status |
| ------------------- | --------------------- | ------ |
| Next.js 16 + React 19 App Router | Implemented in `apps/web` with forced dynamic rendering (`force-dynamic`). | Accurate |
| Database: PostgreSQL + `pg` pool | Database uses PostgreSQL, but the backend mixes two approaches: the classic routes use `pg` directly, while the newer builder routes use Prisma Client (`@prisma/client`). | Partially accurate |
| `db.ts` acts as the data access layer; `app.ts` never writes raw SQL | True for classic endpoints. Builder endpoints use a separate repository layer in `apps/api/src/db/` via a dynamic strategy factory. | Partially accurate |
| Export resumes as JSON, Markdown, PNG, and PDF | Implemented using two separate rendering pipelines: `export-renderer.ts` (using SVG + resvg + pdf-lib) and `resume-builder-pdf.renderer.ts` (using pdfkit). | Accurate |
| Gated access request & recruiter marketplace | Implemented with search filters, quick-views, access request creation, and approval handling. | Accurate |
| Anti-fraud signal registry | The database schema defines `fraud_signals`, `recruiter_verifications`, etc., but there is no application-level logic to write to or read from these tables in `app.ts`. | Partially accurate (Schema only) |
| AI-assisted resume composition: Future Enhancement | Already fully implemented using the Google SDK and Gemini. | Accurate (Implemented ahead of schedule) |

---

## 13. Important Files

| File | Why It Matters |
| ---- | -------------- |
| [package.json (Root)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/package.json) | Declares workspaces (`apps/*`, `packages/*`) and workspace scripts. |
| [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma) | Governs the ORM schema mapped to portfolio tables. |
| [003_resume_visibility_recruiter_access.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/003_resume_visibility_recruiter_access.sql) | Script defining the recruiter governance and audit log tables. |
| [db.ts (API)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts) | Encapsulates raw SQL queries for classic portfolio endpoints and recruiter requests. |
| [app.ts (API)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) | Elysia routing and request handlers for all API endpoints. |
| [resume-analysis.service.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/ai/resume-analysis.service.ts) | Core backend logic triggering Google Gemini for job description matching. |
| [hybrid-vault.repository.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/features/resume-builder/services/repositories/hybrid-vault.repository.ts) | Frontend repository coordinator; synchronizes with API and falls back to `localStorage`. |
| [export-renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/export-renderer.ts) | Classic export pipeline utilizing SVG translation, resvg rasterization, and pdf-lib. |
| [resume-builder-pdf.renderer.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/resume-builder-export/resume-builder-pdf.renderer.ts) | Main builder export pipeline utilizing pdfkit for structured rendering. |

---

## 14. Risks / Confusions

* **Duplicate Database Connection Pools**: The backend instantiates one PostgreSQL `Pool` inside [db.ts (API)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db.ts#L10) and a completely separate `Pool` inside [pool.ts (DB Folder)](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/pool.ts#L8). This results in double the idle connections and configuration redundancy.
* **Dual Frontend Architectures**: Portfolio data is managed in two conflicting ways on the frontend. The `/resume/create` view reads and writes to specific entity-level backend routes directly. The `/` dashboard uses a client-side React reducer state and synchronizes the entire configuration via snapshot endpoints under `/resume-builder/*`.
* **Missing Prisma Models**: The recruiter governance tables (such as `companies`, `recruiter_accounts`, and `resume_access_requests`) are only created via SQL scripts and are absent from `schema.prisma`. This prevents builder-related code from querying these tables through Prisma.
* **Split Export Codebases**: SVG-based rendering via `resvg` is maintained alongside `pdfkit` drawing. Having two PDF rendering pipelines makes updates to the layout template difficult to coordinate.
* **Mock Pages in Web app**: `/resume/list` and `/resume/mock-editor` are hardcoded client-side templates that do not synchronize with the database or call the API. This could confuse developers looking to modify the active resume list or editor workflows.

---

## 15. Recommended Documentation Direction

* **ERD & Relational Catalog**: Provide a comprehensive diagram mapping the relational database structure. Document how M:N link tables (`resume_projects`, `resume_skills`, etc.) connect portfolios to individual resume versions.
* **Access Governance Rules**: Clearly map the states of `resume_access_requests` (`pending`, `approved`, `rejected`, `expired`, `revoked`) and indicate how the audit logs track each access event.
* **Dual Repository Architecture Guide**: Document the switch strategy (`DB_STRATEGY` env variable) inside `db-factory.ts` and explain which routes call `db.ts` (classic) versus `vaultBackendRepository` (builder snapshots).
* **AI & Export Protocols**: Document the prompts used by Gemini and the output schema validation. Outline the two PDF generation pipelines (SVG rasterization vs pdfkit).

---

## 16. Final Verdict

* **Is this folder likely the current active version?**: Yes.
* **Evidence**:
  1. Configured local environment variables in `apps/api/.env` and `apps/web/.env` pointing to active development databases and APIs.
  2. Complete workspace linking and dependencies configured in the root `package.json` for Bun workspaces.
  3. Integrated and tested Google Gemini AI tailoring endpoints and recruiter search methods, backed by active PostgreSQL queries.
* **What should the human check next?**:
  1. Verify the Supabase database instance connection credentials.
  2. Unify the database connection pools in the backend (merge `db.ts` pool with `pool.ts`).
  3. Decide on a single PDF export engine (pdfkit vs resvg) to reduce codebase maintenance overhead.
  4. Consolidate or document the dual front-end composition paths (`/resume/create` versus the root `/` page group).

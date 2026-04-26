# Universal Academic Portfolio System (UAPS)

> **A structured platform for developers to manage a canonical portfolio of skills, projects, and experiences — then compose multiple targeted resume versions from that single source of truth — with a recruiter-facing marketplace and controlled access governance.**

---

## Table of Contents

1. [Planning](#1-planning)
2. [Analysis](#2-analysis)
3. [Design](#3-design)
4. [Implementation](#4-implementation)
5. [Testing](#5-testing)
6. [Deployment](#6-deployment)
7. [Maintenance](#7-maintenance)

---

## 1. Planning

### 1.1 Problem Statement

Software professionals frequently maintain multiple inconsistent versions of their resume across different formats and platforms. When targeting different roles or companies, they manually duplicate and edit documents with no systematic way to track which version was sent where, who accessed it, or whether the recruiter was legitimate. This creates three compounding problems:

- **Content fragmentation** — skills, projects, and experiences are scattered across documents.
- **No version control** — there is no audit trail of which resume version was presented for which role.
- **No access governance** — once a PDF is shared, the owner loses all visibility into downstream usage, opening the door to data misuse and recruiting scams.

### 1.2 Core Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Provide a single canonical portfolio store (skills, projects, experiences) | ✅ Implemented |
| 2 | Allow composition of multiple targeted resume versions from portfolio items | ✅ Implemented |
| 3 | Export resumes as JSON, Markdown, PNG image, and PDF | ✅ Implemented |
| 4 | Expose a public recruiter marketplace with skill/role/experience filtering | ✅ Implemented |
| 5 | Implement an owner-gated access request and approval workflow | ✅ Implemented |
| 6 | Maintain a tamper-evident audit log of all recruiter interactions | ✅ Implemented |
| 7 | Anti-fraud signal registry for suspicious recruiter behaviour | 🏗 Schema defined, enforcement In Progress |

### 1.3 Technology Stack Rationale

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | [Bun](https://bun.sh) | Near-native JavaScript runtime; replaces Node.js for dramatically faster startup and built-in TypeScript execution without a separate transpile step. |
| **API Framework** | [Elysia](https://elysiajs.com) | Bun-native, type-safe HTTP framework with end-to-end type inference; reduces boilerplate versus Express without sacrificing composability. |
| **Schema Validation** | [Zod v4](https://zod.dev) | Runtime validation for all inbound HTTP payloads; `z.treeifyError` provides structured error detail for client consumption. |
| **Authentication** | [jose](https://github.com/panva/jose) (JWT / HS256) | Lightweight, standards-compliant JWT library; used for both session cookies and short-lived OAuth state tokens. |
| **Database** | PostgreSQL + `pg` pool | ACID-compliant relational store; chosen for complex multi-table join queries required by the recruiter marketplace filter engine. |
| **Frontend** | Next.js 16 + React 19 | App Router with forced dynamic rendering (`force-dynamic`); enables server-side session resolution without a dedicated BFF. |
| **Styling** | Tailwind CSS v4 | Utility-first; co-located with component markup for rapid iteration in the MVP phase. |
| **Monorepo** | Bun Workspaces | Native workspace support eliminates the need for Turborepo or Nx at the current scale. |
| **Export** | `@resvg/resvg-js` + `pdf-lib` | Server-side SVG rasterisation (PNG) and PDF embedding without a headless browser dependency. |
| **Auth Provider** | GitHub OAuth 2.0 | Provides verified email, identity linkage, and a developer-centric login UX without requiring a password store. |

---

## 2. Analysis

### 2.1 Functional Requirements

#### Portfolio Management (Owner)
- **FR-01** — Create, read, update, delete **Skills** with name, category, and proficiency level (`Beginner` → `Expert`).
- **FR-02** — Create, read, update, delete **Projects** with title, description, repository URL, status (`In Progress` / `Completed` / `On Hold`), and linked skill IDs.
- **FR-03** — Create, read, update, delete **Experiences** with organisation, role, description, achievement, date range, and linked skill IDs.
- **FR-04** — Create, read, update, delete **Resumes** with version name, target job title, target company, visibility, and lifecycle status (`Draft` / `Published` / `Archived`).
- **FR-05** — Compose a resume by cherry-picking a subset of portfolio projects, skills, and experiences.
- **FR-06** — Manage a per-resume **Baseline** (contact card: full name, headline, email, phone, location, LinkedIn, portfolio URL, GitHub URL, professional summary).
- **FR-07** — Export a resume in four formats: `json` (structured data), `md` (Markdown), `image` (PNG), `pdf`.
- **FR-08** — Authenticate via GitHub OAuth 2.0; session maintained via an `HttpOnly` JWT cookie (7-day expiry).

#### Recruiter Marketplace (Public / Unauthenticated)
- **FR-09** — Browse published resumes with visibility `public` or `company-only` without authentication.
- **FR-10** — Filter resumes by: job title (ILIKE), required skills (all-match), experience keyword (full-text ILIKE), minimum experience years, and visibility tier.
- **FR-11** — Preview a candidate's quick-view card (skills, projects, experiences, baseline summary) before requesting access.
- **FR-12** — Submit an **Access Request** identifying the recruiter, company, purpose, target position, and requested access level (`read-only` / `export`).

#### Access Governance (Owner)
- **FR-13** — List all incoming access requests for owned resumes, optionally filtered by status.
- **FR-14** — Approve or reject an access request; approved requests expire after 30 days.
- **FR-15** — View a full **Audit Log** of recruiter interactions (`request`, `approve`, `reject`, `view`, `export`, `revoke`, `blocked`).

### 2.2 Non-Functional Requirements

| ID | Requirement | Implementation Evidence |
|----|-------------|-------------------------|
| NFR-01 | **Security** — Session tokens must be `HttpOnly`, `SameSite=Lax`, and `Secure` in production. | `auth.ts` → `makeSessionCookie` |
| NFR-02 | **Security** — OAuth state parameter must be a short-lived (10-minute) signed JWT to prevent CSRF. | `auth.ts` → `createOauthState` |
| NFR-03 | **Data Integrity** — All multi-table writes must be atomic. | `withTransaction` wrapper in `db.ts` |
| NFR-04 | **Data Integrity** — Proficiency levels, project statuses, resume statuses, and visibility values are enforced at both application and database constraint levels. | `CHECK` constraints in `001_init_uaps.sql` + Zod enums in `app.ts` |
| NFR-05 | **Auditability** — Every recruiter interaction is written to an immutable audit log including IP address, user-agent, and referrer. | `resume_access_audit_logs` table + `createResumeAccessRequest` in `db.ts` |
| NFR-06 | **Performance** — Recruiter marketplace query uses indexed columns (`visibility`, `target_job_title`, `user_id`) and a lateral sub-query for experience year aggregation. | `listRecruiterVisibleResumes` in `db.ts` |
| NFR-07 | **Developer Experience** — Full TypeScript strict mode across all workspaces. | Root `tsconfig.json` |
| NFR-08 | **Scalability** — Database connections are pooled via `pg.Pool`. | `db.ts` Pool instantiation |

### 2.3 Stakeholders / User Roles

| Role | Description |
|------|-------------|
| **Portfolio Owner** | A developer or academic who manages their skills, projects, and experience, composes resume versions, and governs recruiter access to their profile. Authenticates via GitHub. |
| **Recruiter** | A talent acquisition professional who browses the public marketplace, previews candidate profiles, and submits a formal access request. Does **not** require authentication in the MVP. |
| **Platform Administrator** | [To be defined] — Will manage company verification status, recruiter risk levels, and fraud signal resolution using the `companies`, `recruiter_verifications`, and `fraud_signals` tables already present in the schema. |

---

## 3. Design

### 3.1 System Architecture

UAPS is a **Monorepo** (Bun Workspaces) containing two deployable applications and two shared packages, following a **Layered Architecture** within each application.

```
Universal_Academic_Portfolio_System/
├── apps/
│   ├── api/          # Elysia HTTP API — Bun runtime
│   └── web/          # Next.js 16 frontend — React 19
└── packages/
    ├── db/           # SQL migration scripts (PostgreSQL DDL + seeds)
    └── shared/       # [Reserved — empty; intended for cross-app types]
```

**Request Flow:**

```mermaid
flowchart TD
    A["🌐 Browser"]
    B["Next.js\n(apps/web)\nSSR session resolution via server-api.ts"]
    C["Elysia API\n(apps/api) — /v1/*"]
    D[("PostgreSQL")]

    A -->|"HTTP request"| B
    B -->|"REST · JSON over HTTP\ncredentials: include"| C
    C -->|"Zod validation → business logic\n→ pg.Pool queries"| D
```

The API and Web are **decoupled services** communicating over HTTP, making them independently deployable and scalable.

### 3.2 Architectural Patterns & Design Patterns

| Pattern | Application |
|---------|-------------|
| **Repository Pattern** | `db.ts` acts as the data access layer. All SQL is encapsulated in named async functions (`listResumes`, `createProject`, etc.). `app.ts` never writes raw SQL — it only calls repository functions. |
| **Facade Pattern** | `src/lib/api.ts` (frontend) wraps all `fetch` calls behind typed helper functions (`getResumes`, `createSkill`, etc.), hiding HTTP details from page components. |
| **Strategy Pattern (Export Pipeline)** | `export-renderer.ts` implements three distinct render strategies (`buildResumeMarkdown`, `renderResumeImage`, `renderResumePdf`) selected at runtime by the `format` path parameter. |
| **Template Method (SVG rendering)** | `buildResumeSvg` defines the resume document template; `renderResumeImage` and `renderResumePdf` call it as the first step in their respective pipelines. |
| **Unit of Work / Transaction Wrapper** | `withTransaction(runner)` in `db.ts` encapsulates `BEGIN` / `COMMIT` / `ROLLBACK` logic, allowing any multi-step operation to participate in a transaction without duplicating control flow. |
| **Middleware / Derive Pattern** | Elysia's `.derive()` is used to resolve the session JWT and inject `userId` into every handler context, a clean equivalent of Express middleware applied globally. |
| **Envelope Response** | All API responses follow `{ ok: boolean, data?: T, error?: { code, message, details? } }`, providing a consistent contract for client error handling. |

### 3.3 Data Model

**Core Entities:**

```mermaid
erDiagram

    users {
        uuid user_id PK
        string email UK
        string github_id UK
        string github_login
        string avatar_url
    }

    projects {
        uuid project_id PK
        uuid user_id FK
        string title
        string status
        string repo_url
        boolean is_active
    }

    experiences {
        uuid experience_id PK
        uuid user_id FK
        string organization
        string role
        string description
        string achievement
        date start_date
        date end_date
    }

    resumes {
        uuid resume_id PK
        uuid user_id FK
        string version_name
        string visibility
        string status
        boolean is_active
    }

    resume_basics {
        uuid resume_id PK
        string full_name
        string headline
        string email
        string phone
        string location
        string linkedin_url
        string portfolio_url
        string github_url
        text summary
    }

    skills {
        uuid skill_id PK
        string name UK
        string category
    }

    user_skills {
        uuid user_id FK
        uuid skill_id FK
        string proficiency_level
    }

    project_skills {
        uuid project_id FK
        uuid skill_id FK
    }

    experience_skills {
        uuid experience_id FK
        uuid skill_id FK
    }

    resume_projects {
        uuid resume_id FK
        uuid project_id FK
    }

    resume_skills {
        uuid resume_id FK
        uuid skill_id FK
    }

    resume_experiences {
        uuid resume_id FK
        uuid experience_id FK
    }

    companies {
        uuid company_id PK
        string legal_name
        string domain UK
        string verification_status
    }

    recruiter_accounts {
        uuid recruiter_id PK
        uuid company_id FK
        string email UK
        string risk_level
        string account_status
    }

    resume_access_requests {
        uuid access_request_id PK
        uuid resume_id FK
        uuid recruiter_id FK
        string purpose
        string position_title
        string requested_visibility
        string request_status
        timestamp expires_at
    }

    resume_access_audit_logs {
        uuid audit_id PK
        uuid resume_id FK
        uuid recruiter_id FK
        string action
        string ip_address
        string user_agent
        json metadata
    }

    recruiter_verifications {
        uuid verification_id PK
        uuid recruiter_id FK
        string verification_type
        string verification_status
    }

    fraud_signals {
        uuid fraud_signal_id PK
        uuid recruiter_id FK
        string signal_type
        string severity
        timestamp resolved_at
    }

    %% --- Portfolio ownership ---
    users ||--o{ projects : "owns"
    users ||--o{ experiences : "owns"
    users ||--o{ resumes : "owns"

    %% --- Skill ownership (M:N via user_skills) ---
    users ||--o{ user_skills : "proficient in"
    skills ||--o{ user_skills : "owned by"

    %% --- Project skill tagging (M:N via project_skills) ---
    projects ||--o{ project_skills : "tagged with"
    skills ||--o{ project_skills : "used in"

    %% --- Experience skill tagging (M:N via experience_skills) ---
    experiences ||--o{ experience_skills : "tagged with"
    skills ||--o{ experience_skills : "used in"

    %% --- Resume composition (M:N junction tables) ---
    resumes ||--o| resume_basics : "has baseline"
    resumes ||--o{ resume_projects : "composes"
    projects ||--o{ resume_projects : "included in"
    resumes ||--o{ resume_skills : "composes"
    skills ||--o{ resume_skills : "selected in"
    resumes ||--o{ resume_experiences : "composes"
    experiences ||--o{ resume_experiences : "included in"

    %% --- Recruiter access governance ---
    companies ||--o{ recruiter_accounts : "employs"
    recruiter_accounts ||--o{ resume_access_requests : "submits"
    resumes ||--o{ resume_access_requests : "receives"
    recruiter_accounts ||--o{ resume_access_audit_logs : "logged in"
    resumes ||--o{ resume_access_audit_logs : "logged for"
    recruiter_accounts ||--o{ recruiter_verifications : "verified by"
    recruiter_accounts ||--o{ fraud_signals : "flagged by"
```

**Key Design Decisions:**
- `skills` is a **global registry** (unique by name); ownership is expressed via the `user_skills` junction table, allowing proficiency levels to vary per-user without duplicating skill records.
- `resume_basics` is a **1:1 optional extension** of `resumes`, allowing a resume to be created without a baseline and enriched later.
- `visibility` on `resumes` is enforced with a `CHECK` constraint at the DB level: `private | public | company-only`.
- `resume_access_requests.expires_at` is set to `+30 days` upon approval — enabling future automated expiry enforcement.

---

## 4. Implementation

### 4.1 Directory Structure Logic

```
apps/api/
├── index.ts              # Entrypoint: instantiates Elysia app, binds to PORT
└── src/
    ├── app.ts            # Route definitions — all HTTP handlers (923 lines)
    ├── auth.ts           # JWT session + OAuth state helpers (jose)
    ├── db.ts             # Repository layer — all PostgreSQL queries (1,920 lines)
    ├── export-renderer.ts # SVG/PNG/PDF resume rendering pipeline
    └── store.ts          # In-memory store (legacy; superseded by db.ts, retained for reference)

apps/web/
└── src/
    ├── app/
    │   ├── layout.tsx        # Root layout: Space Grotesk font, topbar, role-switch nav
    │   ├── page.tsx          # Landing page with embedded recruiter marketplace
    │   ├── auth/             # GitHub OAuth entry points
    │   ├── dashboard/        # Owner portfolio dashboard
    │   ├── hr/filter/        # Recruiter filter & search page
    │   ├── portfolio/        # Portfolio item management pages
    │   └── resume/           # Resume create / compose / preview / export pages
    ├── components/
    │   ├── auth-nav-button.tsx       # Session-aware login/logout button
    │   ├── role-switch-nav.tsx       # Toggle between Owner and Recruiter views
    │   └── hr-resume-marketplace.tsx # Full recruiter search, filter, quick-view, and access request UI
    └── lib/
        ├── api.ts            # Client-side typed API functions (fetch wrapper)
        └── server-api.ts     # Server-side API calls (used in RSC / Server Actions)

packages/db/sql/
├── 001_init_uaps.sql                        # Base schema: users, skills, projects, experiences, resumes
├── 002_seed_mock_use_case.sql               # Development seed data
├── 003_resume_visibility_recruiter_access.sql # Visibility, recruiter governance tables, audit logs
└── 004_seed_public_recruiter_marketplace.sql  # Idempotent marketplace demo seed (2 personas)

scripts/
└── smoke-hr-flow.ps1   # PowerShell smoke test: validates home page, HR filter, search, quick-view, access request
```

### 4.2 API Surface

**Base path:** `/v1`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | Public | Service liveness check |
| `GET` | `/auth/github/start` | Public | Initiates GitHub OAuth redirect |
| `GET` | `/auth/github/callback` | Public | Exchanges OAuth code; sets session cookie |
| `GET` | `/auth/session` | Cookie | Returns current session user |
| `POST` | `/auth/logout` | Cookie | Clears session cookie |
| `GET` | `/users/me/summary` | 🔒 | Portfolio counts + active resume |
| `GET/POST` | `/skills` | 🔒 | List / create skills |
| `PUT/DELETE` | `/skills/:skillId` | 🔒 | Update / delete a skill |
| `GET/POST` | `/projects` | 🔒 | List / create projects |
| `PUT/DELETE` | `/projects/:projectId` | 🔒 | Update / delete a project |
| `GET/POST` | `/experiences` | 🔒 | List / create experiences |
| `PUT/DELETE` | `/experiences/:experienceId` | 🔒 | Update / delete an experience |
| `GET/POST` | `/resumes` | 🔒 | List / create resumes |
| `PUT/DELETE` | `/resumes/:resumeId` | 🔒 | Update / delete a resume |
| `POST` | `/resumes/:resumeId/compose` | 🔒 | Set resume composition (projects, skills, experiences) |
| `GET/PUT` | `/resumes/:resumeId/baseline` | 🔒 | Get / upsert resume baseline (contact card) |
| `GET` | `/resumes/:resumeId/preview` | 🔒 | Full resume preview with hydrated items |
| `GET` | `/resumes/:resumeId/export/:format` | 🔒 | Export as `json`, `md`, `image`, `pdf` |
| `GET` | `/resumes/access-requests` | 🔒 | List incoming access requests |
| `POST` | `/resumes/access-requests/:requestId/review` | 🔒 | Approve or reject a request |
| `GET` | `/resumes/access-audit-logs` | 🔒 | View recruiter interaction audit log |
| `GET` | `/hr/resumes` | Public | Search recruiter-visible resumes with filters |
| `GET` | `/hr/resumes/:resumeId/quick-view` | Public | Candidate preview card |
| `POST` | `/hr/access-requests` | Public | Submit an access request |

### 4.3 Core Module Highlights

**`db.ts` — Repository Layer**
- `withClient` / `withTransaction`: RAII-style connection management; transactions automatically rollback on exception.
- `mapSkillIdsByProject` / `mapCompositionByResume`: Parallel batch queries using `Promise.all`, building `Map<id, id[]>` structures to avoid N+1 query patterns.
- `listRecruiterVisibleResumes`: A single composite SQL query with lateral sub-queries for experience-year aggregation and a `CASE WHEN` baseline-progress score (0–100 in 20-point increments).
- `ensureRecruiterAccount`: Implements upsert-like logic across `companies` and `recruiter_accounts`, auto-provisioning a company record on first encounter.

**`export-renderer.ts` — Export Pipeline**
- `buildResumeMarkdown` → Plain-text Markdown string.
- `buildResumeSvg` → A 1240×1754 SVG document (A4 portrait aspect ratio) with a linear gradient background and `foreignObject` content block. All user content is XML-escaped before injection.
- `renderResumeImage` → Rasterises the SVG via `@resvg/resvg-js` to a PNG `Buffer`.
- `renderResumePdf` → Embeds the PNG into a `pdf-lib` `PDFDocument`, returning the raw PDF bytes.

**`auth.ts` — Authentication**
- Session tokens: HS256 JWT, 7-day expiry, signed with `JWT_SECRET`.
- OAuth state tokens: HS256 JWT, 10-minute expiry, containing a `nonce` + `returnTo` URL, preventing CSRF and open redirects.
- Cookies: `HttpOnly; SameSite=Lax` always; `Secure` flag added when `WEB_APP_URL` starts with `https://`.

### 4.4 Environment Configuration

**`apps/api/.env`** (see `.env.example`):

```env
PORT=4000
API_BASE_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uaps
WEB_APP_URL=http://localhost:3000
GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_SECRET=<your_github_client_secret>
GITHUB_REDIRECT_URI=http://localhost:4000/v1/auth/github/callback
JWT_SECRET=<at_least_32_random_chars>
SESSION_COOKIE_NAME=uaps_session
```

**`apps/web/.env`**:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/v1
NEXT_PUBLIC_WEB_BASE_URL=http://localhost:3000
```

---

## 5. Testing

### 5.1 Current State

A PowerShell **smoke test** script (`scripts/smoke-hr-flow.ps1`) validates the critical public recruiter flow end-to-end against a running local instance:

1. `SMOKE_HOME_PAGE` — Asserts HTTP 200 on the landing page.
2. `SMOKE_HR_FILTER_PAGE` — Asserts HTTP 200 on the recruiter filter page.
3. `SMOKE_SEARCH` — Calls `/v1/hr/resumes?requiredSkills=AWS,Docker&minExperienceYears=2` and asserts at least one result.
4. `SMOKE_QUICK_VIEW` — Fetches the quick-view of the first result and asserts skill data is present.
5. `SMOKE_ACCESS_REQUEST` — Submits a mock recruiter access request and asserts a returned `accessRequestId`.

### 5.2 Intended Testing Strategy

> [To be defined / In Progress]

| Layer | Framework | Scope |
|-------|-----------|-------|
| **Unit** | [Bun test runner](https://bun.sh/docs/cli/test) (`bun test`) | `auth.ts` helpers, `export-renderer.ts` render functions, Zod schema validation edge cases |
| **Integration** | Bun test + a test PostgreSQL database | `db.ts` repository functions (create/read/update/delete for all entities, transaction rollback behaviour) |
| **API Contract** | [Elysia Eden](https://elysiajs.com/eden/overview.html) or Bun test + `fetch` | All `/v1/*` endpoints: happy path, 401, 404, 422 validation error shapes |
| **End-to-End** | [Playwright](https://playwright.dev) | Owner sign-in → create skill → create resume → compose → export; Recruiter search → quick-view → access request |
| **Smoke** | `scripts/smoke-hr-flow.ps1` | Post-deployment liveness check (already implemented) |

---

## 6. Deployment

### 6.1 Current State

> [To be defined / In Progress] — No CI/CD pipeline or container manifests are present in the repository at this time.

### 6.2 Local Development

**Prerequisites:** Bun ≥ 1.x, PostgreSQL ≥ 15, a GitHub OAuth App.

```bash
# 1. Install dependencies (all workspaces)
bun install

# 2. Apply database migrations in order
psql -d uaps -f packages/db/sql/001_init_uaps.sql
psql -d uaps -f packages/db/sql/002_seed_mock_use_case.sql
psql -d uaps -f packages/db/sql/003_resume_visibility_recruiter_access.sql
psql -d uaps -f packages/db/sql/004_seed_public_recruiter_marketplace.sql

# 3. Configure environment variables
cp apps/api/.env.example apps/api/.env   # then fill in secrets
cp apps/web/.env.example apps/web/.env

# 4. Start both services concurrently
bun run dev
# API → http://localhost:4000
# Web → http://localhost:3000

# 5. Run smoke tests (optional)
powershell -File scripts/smoke-hr-flow.ps1
```

### 6.3 Intended Deployment Architecture

> [To be defined / In Progress]

| Component | Recommended Target |
|-----------|-------------------|
| **API (`apps/api`)** | Containerised via Docker (`FROM oven/bun`); deployable to any OCI-compatible platform (Fly.io, Railway, AWS ECS, GCP Cloud Run). |
| **Web (`apps/web`)** | Vercel (native Next.js support) or Docker with `next start`. |
| **Database** | Managed PostgreSQL (Supabase, Neon, AWS RDS, or Railway Postgres). |
| **CI/CD** | GitHub Actions — lint → typecheck → unit tests → integration tests → build → deploy. |

---

## 7. Maintenance

### 7.1 Scalability Considerations

- **Connection Pooling:** The `pg.Pool` in `db.ts` is already in place. For higher throughput, introduce [PgBouncer](https://www.pgbouncer.org) as a connection proxy in front of PostgreSQL.
- **Read Replicas:** The recruiter marketplace query (`listRecruiterVisibleResumes`) is read-only. Routing it to a read replica would decouple reporting load from write-critical paths.
- **Caching:** The marketplace filter query is a strong candidate for a short-lived (30–60 second) Redis cache keyed by serialised filter parameters, given recruiter browse patterns are repetitive.
- **Horizontal Scaling:** The API is stateless (session state is in the JWT cookie, persistence in PostgreSQL), so multiple API instances can run behind a load balancer without sticky sessions.

### 7.2 Security & Governance Roadmap

- **Recruiter Verification Flow:** The `recruiter_verifications` and `fraud_signals` tables are schema-ready. A background worker to auto-escalate `risk_level` on unverified accounts submitting many requests in a short window is the next enforcement layer.
- **Access Expiry Enforcement:** `resume_access_requests.expires_at` is populated on approval. A scheduled job (cron or pg_cron) should transition `approved` → `expired` records past their expiry timestamp.
- **Rate Limiting:** The public `/hr/access-requests` endpoint is unauthenticated and should be rate-limited by IP (e.g., via a middleware layer or an upstream edge proxy).
- **Email Notifications:** Notify portfolio owners on new access requests; notify recruiters on approval/rejection. Integration point: send-grid / resend / AWS SES.

### 7.3 Observability

> [To be defined / In Progress]

| Signal | Recommended Tool |
|--------|-----------------|
| **Structured Logging** | Pino (API) / Next.js built-in logger (Web) |
| **Metrics** | Prometheus + Grafana or Datadog |
| **Tracing** | OpenTelemetry SDK → Jaeger or Datadog APM |
| **Error Tracking** | Sentry (both API and Web) |
| **Uptime** | `/v1/health` endpoint → external monitor (UptimeRobot, Better Uptime) |

### 7.4 Planned Future Enhancements

| Milestone | Feature |
|-----------|---------|
| **v0.2** | Platform Administrator dashboard (company verification, recruiter risk management, fraud signal resolution) |
| **v0.3** | Email notification system for access request lifecycle events |
| **v0.4** | AI-assisted resume composition — suggest which portfolio items best match a given job description |
| **v0.5** | Resume analytics — track view counts, access request conversion rates per resume version |
| **v1.0** | Public portfolio page (`/p/:githubLogin`) — shareable, markdown-rendered public profile |

---

## Quick Reference

```
Monorepo root scripts:
  bun run dev           # Start API + Web concurrently (concurrently -k)
  bun run dev:api       # API only  (bun --hot index.ts on port 4000)
  bun run dev:web       # Web only  (next dev on port 3000)
  bun run build:web     # Production Next.js build
  bun run typecheck:api # tsc --noEmit on the API workspace
  bun run lint:web      # ESLint on the Web workspace
```

---

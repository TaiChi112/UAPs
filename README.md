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

```
Browser
  │
  ▼
Next.js (apps/web) — SSR session resolution via server-api.ts
  │  REST (JSON over HTTP, credentials: include)
  ▼
Elysia API (apps/api) — /v1/*
  │  Zod validation → business logic → pg.Pool queries
  ▼
PostgreSQL
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

```
users (user_id PK, email UNIQUE, github_id UNIQUE, github_login, avatar_url)
  │
  ├─── projects (project_id PK, user_id FK, title, status, repo_url, is_active)
  │       └─── project_skills (project_id FK, skill_id FK)  [M:N junction]
  │
  ├─── experiences (experience_id PK, user_id FK, organization, role, start_date, end_date)
  │       └─── experience_skills (experience_id FK, skill_id FK)  [M:N junction]
  │
  └─── resumes (resume_id PK, user_id FK, version_name, visibility, status, is_active)
          ├─── resume_basics (resume_id PK FK, full_name, headline, summary, contact fields)
          ├─── resume_projects   (resume_id FK, project_id FK)    [M:N composition]
          ├─── resume_skills     (resume_id FK, skill_id FK)      [M:N composition]
          └─── resume_experiences (resume_id FK, experience_id FK) [M:N composition]

skills (skill_id PK, name UNIQUE, category)  ← shared global skill registry
  └─── user_skills (user_id FK, skill_id FK, proficiency_level) [M:N ownership]

companies (company_id PK, legal_name, domain UNIQUE, verification_status)
  └─── recruiter_accounts (recruiter_id PK, company_id FK, email UNIQUE, risk_level, account_status)
          ├─── resume_access_requests (access_request_id PK, resume_id FK, recruiter_id FK, request_status)
          ├─── resume_access_audit_logs (audit_id PK, resume_id FK, recruiter_id FK, action, ip_address, metadata JSONB)
          └─── recruiter_verifications (verification_id PK, recruiter_id FK, verification_status)

fraud_signals (fraud_signal_id PK, recruiter_id FK, signal_type, severity, resolved_at)
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

<<<<<<< HEAD
*Generated: 2026-04-27 · UAPS MVP · Repository: `TaiChi112/UAPs`*
=======
### GitHub OAuth Setup (MVP)

1. ไปที่ GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. กรอกข้อมูล:
    - Application name: `UAPS Local MVP`
    - Homepage URL: `http://localhost:3000`
    - Authorization callback URL: `http://localhost:4000/v1/auth/github/callback`
3. หลังสร้างเสร็จ จะได้ค่า `Client ID`
4. กด `Generate a new client secret` เพื่อได้ค่า `Client Secret`
5. นำค่าไปใส่ไฟล์ env:
    - `apps/api/.env` ใส่ `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `API_BASE_URL`, `WEB_APP_URL`, `JWT_SECRET`
    - `apps/web/.env` ใส่ `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WEB_BASE_URL`

### Database Bootstrap

ถ้าต้องการเริ่มใช้ PostgreSQL schema ให้รันไฟล์:

- `packages/db/sql/001_init_uaps.sql`

หมายเหตุ: เวอร์ชันเริ่มต้นนี้ใช้ in-memory store ใน API เพื่อให้พัฒนา flow ได้เร็ว ก่อนเชื่อม persistence จริงในขั้นถัดไป

### Mock Data Seed (Use Case Demo)

หลังจาก sign in อย่างน้อย 1 ครั้ง (เพื่อให้มี user record) สามารถ seed ข้อมูลตัวอย่างสำหรับ demo use case ได้ด้วย:

```bash
cat packages/db/sql/002_seed_mock_use_case.sql | docker exec -i csi_postgres psql -U postgres -d uaps
```

ไฟล์นี้จะเติมข้อมูลตัวอย่างในตาราง Skills/Projects/Experiences/Resumes และเชื่อม composition ให้เห็น flow การทำ Resume หลายเวอร์ชันจากข้อมูลชุดเดียว โดยมีทั้งแนว Backend และ AI Engineer

นอกจากนี้ seed ชุดใหม่จะสร้าง Resume พื้นฐาน (`Core Profile - Base (Private)`) ก่อน แล้วค่อยมี Resume ที่ tailor งานแต่ละสายเพื่อแสดงแนวทาง add project/skill/experience ลงใน resume ที่มีโครงพื้นฐานแล้ว

ถ้าต้องการ mock ผู้สมัครหลายคนที่เปิด `public` / `company-only` เพื่อเดโหมด HR/Recruiter marketplace ให้รันเพิ่ม:

```bash
bun run --cwd apps/api scripts/seed-recruiter-mock.ts
```

คำสั่งนี้จะ apply schema visibility ที่จำเป็น (idempotent) และเติมข้อมูล demo ผู้สมัครหลายโปรไฟล์สำหรับทดสอบหน้า Home + HR filter ได้ทันที

### Visibility + Recruiter Access Schema (Design Foundation)

ถ้าต้องการรองรับ public/private resume, การ filter โดย HR/Recruiter และ audit กัน scam ให้ apply schema เพิ่มดังนี้:

```bash
cat packages/db/sql/003_resume_visibility_recruiter_access.sql | docker exec -i csi_postgres psql -U postgres -d uaps
```

ไฟล์นี้จะเพิ่ม:
- `resumes.visibility` (`private`, `public`, `company-only`)
- `resume_basics` สำหรับข้อมูลพื้นฐานที่ทุก resume ควรมี
- `companies`, `recruiter_accounts`, `recruiter_verifications`
- `resume_access_requests`, `resume_access_audit_logs`, `fraud_signals`

## Project Overview (แนวคิดโครงการ)
- UAPS คือระบบจัดการพอร์ตโฟลิโอและเรซูเม่แบบรวมศูนย์ (Centralized Portfolio Management System) สำหรับนักศึกษาและผู้สมัครงาน
- ปัญหาของการสมัครงานในปัจจุบันคือ ผู้สมัครมักมีเรซูเม่เพียงรูปแบบเดียว (One-size-fits-all) ทำให้ไม่สามารถนำเสนอจุดเด่นที่ตรงกับความต้องการของแต่ละบริษัทได้อย่างเต็มที่ UAPS จึงถูกออกแบบมาเพื่อแก้ปัญหานี้ โดยอนุญาตให้ผู้ใช้บันทึกข้อมูลตั้งต้น (Master Data) ทั้งหมดไว้ในที่เดียว และสามารถ "เลือกหยิบ" (Cherry-pick) ข้อมูลเหล่านั้นมาสร้างเป็นเรซูเม่ที่ปรับแต่งให้เหมาะสมกับแต่ละตำแหน่งงานได้อย่างรวดเร็ว

**Core Features:**
- จัดเก็บข้อมูลผลงาน (Project), ประสบการณ์ (Experience), และทักษะ (Skill) ไว้ในฐานข้อมูลส่วนตัว
- สร้างเรซูเม่ (Resume/CV) ได้ไม่จำกัดรูปแบบ โดยดึงเฉพาะข้อมูลที่เกี่ยวข้องกับตำแหน่งงานเป้าหมายมาใช้งาน

**Use Case & Core Value (ตัวอย่างสถานการณ์ใช้งาน)**
- เพื่อให้เห็นภาพความสามารถของระบบอย่างชัดเจน สมมติว่าผู้ใช้งานมีทักษะและผลงานทั้งด้าน AI และ Web Development:
    - Scenario A (สมัครงาน AI Engineer): ผู้ใช้งานสร้าง Resume ใบที่ 1 โดยระบบจะให้เลือกดึงเฉพาะข้อมูล Project ที่เกี่ยวกับการทำ Machine Learning และ Skill ด้าน Python/Data Science มาแสดงผล เพื่อยื่นสมัครบริษัท A และ B
    - Scenario B (สมัครงาน Software Engineer): ผู้ใช้งานสร้าง Resume ใบที่ 2 (หรือกดทำซ้ำจากใบแรก) แล้วสลับไปดึงผลงาน Project ที่เกี่ยวกับการเขียน Web API และ Skill ด้าน JavaScript มาแสดงผลแทน เพื่อยื่นสมัครบริษัท C และ D
- The Result: ผู้ใช้งานสามารถจับคู่ (Map) คุณสมบัติของตนเองให้ตรงกับ Job Description ของแต่ละบริษัทได้แม่นยำที่สุด ซึ่งช่วยเพิ่มโอกาสในการผ่านการคัดเลือก (Screening Process)

**Technical Focus (เป้าหมายเชิงเทคนิค)**
- โปรเจกต์นี้ถูกพัฒนาขึ้นโดยมีวัตถุประสงค์หลักเพื่อ ศึกษาและประยุกต์ใช้ความรู้ด้านการออกแบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database Design) ตั้งแต่การวางโครงสร้างระดับแนวคิด (Conceptual), ระดับตรรกะ (Logical), ไปจนถึงการบังคับใช้ข้อจำกัดในระดับกายภาพ (Physical Implementation) ผ่าน PostgreSQL

## Entity
- User
    - userID
    - name
    - email
    - githubURL
- Project
    - projectID
    - userID
    - title
    - description
    - repoURL
    - isActive
    - status 
- Skill
    - skillID
    - name
    - category
- Experience
    - experienceID
    - userID
    - description
    - achievement
    - organization
    - role
    - startDate
    - endDate 
- Resume
    - resumeID
    - userID
    - versionName
    - targetJobTitle
    - targetCompany
    - isActive
    - status 
    - createdAt
    - updatedAt
- ResumeProject
    - resumeID
    - projectID
- ResumeSkill
    - resumeID
    - skillID
- ResumeExperience
    - resumeID
    - experienceID
- UserSkill
    - userID
    - skillID
    - proficiencyLevel
- ProjectSkill
    - projectID
    - skillID
- ExperienceSkill
    - experienceID
    - skillID

## Relationship

**Conceptual Relationships (ความสัมพันธ์เชิงแนวคิดภาพรวม)**
- User 1 : M Project (1 user มีหลาย project)
- User 1 : M Experience (1 user มีหลาย experience)
- User 1 : M Resume (1 user มีหลาย resume)
- User M : M Skill (หลาย user มีหลาย skill & หลาย skill อยู่ในหลาย user)
- Project M : M Skill (หลาย project มีการใช้หลาย skill & หลาย skill มีการใช้หลาย project)
- Project M : M Resume (หลาย project ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย project)
- Experience M : M Resume (หลาย experience ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย experience)
- Experience M : M Skill (หลาย experience มีการใช้หลาย skill & หลาย skill มีการใช้หลาย experience)
- Skill M : M Resume (หลาย skill ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย skill)

**Logical Relationships (ความสัมพันธ์ระดับตารางฐานข้อมูลจริงที่ถูก Resolve แล้ว)**
- User 1 : M UserSkill
- Skill 1 : M UserSkill
- Project 1 : M ProjectSkill
- Skill 1 : M ProjectSkill
- Resume 1 : M ResumeProject
- Project 1 : M ResumeProject
- Resume 1 : M ResumeExperience
- Experience 1 : M ResumeExperience
- Resume 1 : M ResumeSkill
- Skill 1 : M ResumeSkill
- Experience 1 : M ExperienceSkill
- Skill 1 : M ExperienceSkill

**Physical Relationships (ความสัมพันธ์ระดับกายภาพและข้อจำกัดของข้อมูล)**

ในระดับการนำไปสร้างจริง (Physical Implementation) จะใช้หลักการกำหนด Primary Key (PK) และ Foreign Key (FK) ร่วมกับข้อจำกัด (Constraints) ดังนี้:

**กลุ่ม Entity หลัก (Master Tables)**
- `User`: PK คือ `userID`
- `Project`: PK คือ `projectID`, FK คือ `userID` (อ้างอิง User)
- `Skill`: PK คือ `skillID`
- `Experience`: PK คือ `experienceID`, FK คือ `userID` (อ้างอิง User)
- `Resume`: PK คือ `resumeID`, FK คือ `userID` (อ้างอิง User)

**กลุ่มตารางเชื่อมโยง (Junction Tables)**
- `UserSkill`: Composite PK (`userID`, `skillID`), FK `userID` อ้างอิงตาราง User, FK `skillID` อ้างอิงตาราง Skill
- `ProjectSkill`: Composite PK (`projectID`, `skillID`), FK `projectID` อ้างอิงตาราง Project, FK `skillID` อ้างอิงตาราง Skill
- `ExperienceSkill`: Composite PK (`experienceID`, `skillID`), FK `experienceID` อ้างอิงตาราง Experience, FK `skillID` อ้างอิงตาราง Skill
- `ResumeProject`: Composite PK (`resumeID`, `projectID`), FK อ้างอิงตาราง Resume และ Project ตามลำดับ
- `ResumeSkill`: Composite PK (`resumeID`, `skillID`), FK อ้างอิงตาราง Resume และ Skill ตามลำดับ
- `ResumeExperience`: Composite PK (`resumeID`, `experienceID`), FK อ้างอิงตาราง Resume และ Experience ตามลำดับ

*หมายเหตุ: ตาราง Junction ทั้งหมดควรตั้งค่า Constraint `ON DELETE CASCADE` เพื่อให้ข้อมูลที่เชื่อมโยงกันถูกลบอัตโนมัติหากข้อมูลหลักถูกลบ เพื่อป้องกันปัญหาข้อมูลขยะ (Orphan Records)*


## Feature Planning & Future Roadmap
### Phase 1: Data Completeness (ส่วนขยายข้อมูลโปรไฟล์ให้สมบูรณ์)
- ขยายการรองรับข้อมูลส่วนบุคคลอื่นๆ (Scaling Entities) เพื่อให้ Resume มีความสมบูรณ์ยิ่งขึ้น โดยเตรียมเพิ่มตารางจัดเก็บข้อมูลดังนี้: Certificate, Award, Education, Training, Language และ Social Media Links
- พัฒนาระบบ Export ข้อมูล เพื่อให้ผู้ใช้สามารถดาวน์โหลด Resume ที่ถูก Tailor-made แล้วออกมาในรูปแบบ PDF หรือสร้างเป็น Web Link (Public URL) สำหรับแชร์ได้ทันที

### Phase 2: Automated Application System (ระบบอำนวยความสะดวกในการสมัครงาน)
- พัฒนาระบบรวบรวมข้อมูลบริษัทและอีเมลของฝ่ายทรัพยากรบุคคล (HR Contacts Database)
- สร้างฟีเจอร์ "1-Click Apply" ที่อนุญาตให้ผู้ใช้เลือก Resume Profile ที่สร้างไว้ และกดส่งอีเมลพร้อมแนบเอกสารไปยังบริษัทและตำแหน่งที่สนใจได้โดยตรงผ่านระบบ

### Phase 3: HR Headhunting & Matching (ระบบสำหรับองค์กรและฝ่ายบุคคล)
- พัฒนาระบบค้นหาสำหรับ HR (Reverse Search) เพื่อให้ฝั่งบริษัทสามารถเข้ามาค้นหาผู้สมัครที่มีคุณสมบัติตรงตามต้องการ
- สร้างเงื่อนไขการกรองขั้นสูง (Advanced Filtering) เช่น HR สามารถตั้งค่าค้นหา "นักศึกษาที่มี Skill ด้าน Python และมี Project ที่เกี่ยวข้องกับ AI มากกว่า 2 โปรเจกต์ขึ้นไป"
- มีระบบการส่งข้อความส่วนตัว (Direct Contact) เพื่อให้ HR สามารถส่งอีเมลหรือข้อความทาบทามเจ้าของ Resume ได้โดยตรงผ่านระบบ

<!-- - ให้ใครก็ตามที่เข้ามาสร้างเเละจัดเก็บข้อมูลที่เกี่ยวกับ resume or cv สามารถดึงข้อมูลออกมาทำ Resume หรือ CV ได้หลายรูปเเบบตามประเภทงานที่สมัครเเละบริษัท
- scale เพิ่ม table Certificate , Award , Education , Training , Language , Social Media
- รวม email HR เเละข้อมูลบริษัท เเล้วเลือก Resume or CV กดส่งไปตามบริษัทที่ตัวเองสนใจ ตามตำเเหน่งนั้นๆ 
- ถ้าในอนาคตมี resume or cv เต็มไปหมด HR อยากได้คนที่มี skill or project or experience มากกว่า 2 เป็นต้นไป HR ก็สามารถเอา email ของเจ้าของ resume or cv ไปเพื่อติดต่อส่วนตัวได้เลย -->

```sql
-- ==========================================
-- UAPS Database Schema (PostgreSQL)
-- ==========================================
-- คำแนะนำ: ก่อนรันสคริปต์นี้ใน PostgreSQL ควรสร้าง Database แยกไว้ต่างหาก
-- ทุกตารางใช้ UUID เป็น Primary Key เพื่อความปลอดภัยและรองรับการขยายตัวในอนาคต

-- 1. สร้างตาราง User (ผู้ใช้งานหลัก)
CREATE TABLE Users (
    userID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    githubURL VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. สร้างตาราง Skill (ข้อมูลทักษะที่เป็น Master Data)
CREATE TABLE Skills (
    skillID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) -- เช่น 'Programming Language', 'Soft Skill', 'Tool'
);

-- 3. สร้างตาราง Project (ข้อมูลผลงาน)
CREATE TABLE Projects (
    projectID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    repoURL VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Completed', -- เช่น In Progress, Completed
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- 4. สร้างตาราง Experience (ข้อมูลประสบการณ์ทำงาน/กิจกรรม)
CREATE TABLE Experiences (
    experienceID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    organization VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT,
    achievement TEXT,
    startDate DATE,
    endDate DATE, -- หากเป็น null อาจแปลว่ากำลังทำอยู่ (Present)
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- 5. สร้างตาราง Resume (ข้อมูลโปรไฟล์เอกสารสำหรับสมัครงาน)
CREATE TABLE Resumes (
    resumeID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    versionName VARCHAR(255) NOT NULL, -- เช่น 'AI Engineer - Company A'
    targetJobTitle VARCHAR(255),
    targetCompany VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Draft', -- เช่น Draft, Published
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- ==========================================
-- สร้าง Junction Tables (สำหรับจัดการความสัมพันธ์ M:N)
-- ==========================================

-- 6. ความสัมพันธ์ระหว่าง User และ Skill
CREATE TABLE UserSkills (
    userID UUID NOT NULL,
    skillID UUID NOT NULL,
    proficiencyLevel VARCHAR(50), -- เช่น Beginner, Intermediate, Expert
    PRIMARY KEY (userID, skillID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 7. ความสัมพันธ์ระหว่าง Project และ Skill
CREATE TABLE ProjectSkills (
    projectID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (projectID, skillID),
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 8. ความสัมพันธ์ระหว่าง Experience และ Skill
CREATE TABLE ExperienceSkills (
    experienceID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (experienceID, skillID),
    FOREIGN KEY (experienceID) REFERENCES Experiences(experienceID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 9. ความสัมพันธ์ระหว่าง Resume และ Project (เลือกโปรเจกต์ไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeProjects (
    resumeID UUID NOT NULL,
    projectID UUID NOT NULL,
    PRIMARY KEY (resumeID, projectID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE
);

-- 10. ความสัมพันธ์ระหว่าง Resume และ Skill (เลือกทักษะไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeSkills (
    resumeID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (resumeID, skillID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 11. ความสัมพันธ์ระหว่าง Resume และ Experience (เลือกประสบการณ์ไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeExperiences (
    resumeID UUID NOT NULL,
    experienceID UUID NOT NULL,
    PRIMARY KEY (resumeID, experienceID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (experienceID) REFERENCES Experiences(experienceID) ON DELETE CASCADE
);
```

<!-- - [ ] การออกแบบ ER Diagram
- [ ] การออกแบบ Schema
- [ ] การออกแบบ Normalization
- [ ] การออกแบบ Query
- [ ] การออกแบบ Trigger
- [ ] การออกแบบ View
- [ ] การออกแบบ Stored Procedure
- [ ] การออกแบบ Function
- [ ] การออกแบบ Index
- [ ] การออกแบบ Constraint
- [ ] การออกแบบ Trigger
- [ ] การออกแบบ View
- [ ] การออกแบบ Stored Procedure
- [ ] การออกแบบ Function
- [ ] การออกแบบ Index
- [ ] การออกแบบ Constraint -->
>>>>>>> f4f6583af82b12876354d0638941993bf9cbb3a6

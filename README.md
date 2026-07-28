# Universal Academic Portfolio System (UAPS)

> **A structured platform for developers to manage a canonical portfolio of skills, projects, and experiences — then compose multiple targeted resume versions from that single source of truth, with AI job description tailoring and PDF export.**

*Note: Legacy recruiter marketplace, access governance workflows, and HR search endpoints were removed during the current Resume Builder codebase isolation refactoring.*

---

## Table of Contents

- **[🚀 Quick Start (Local Development)](#-quick-start-local-development)**
1. [Planning](#1-planning)
2. [Analysis](#2-analysis)
3. [Design](#3-design)
4. [Implementation](#4-implementation)
5. [Testing](#5-testing)
6. [Deployment](#6-deployment)
7. [Maintenance](#7-maintenance)

---

## 🚀 Quick Start (Local Development)

If you want to start developing immediately, follow these steps. For full architectural details, see the documentation below.

**Prerequisites:** [Bun](https://bun.sh/) (≥ 1.x), [Docker](https://www.docker.com/), and a GitHub OAuth App.

```bash
# 1. Install dependencies
bun install

# 2. Start PostgreSQL via Docker (Automatically runs schema bootstrap)
docker compose up -d

# 3. Generate Prisma Client
bun run --cwd apps/api prisma:generate

# 4. Configure environment variables
cp apps/api/.env.example apps/api/.env   # (Add your GitHub OAuth secrets here)
cp apps/web/.env.example apps/web/.env

# 5. (Optional) Seed dummy data
bun run --cwd apps/api seed:vault-test

# 6. Start the development servers (API on 4000, Web on 3000)
bun run dev
```

---

## 1. Planning

### 1.1 Problem Statement

Software professionals frequently maintain multiple inconsistent versions of their resume across different formats and platforms. When targeting different roles or companies, they manually duplicate and edit documents with no systematic way to track which version has which content, or ensure consistency. This creates compounding problems:

- **Content fragmentation** — skills, projects, and experiences are scattered across documents.
- **No version control** — there is no audit trail of which resume version has been composed with which subset of portfolio items.
- **Manual tailoring** — adjusting resumes for different job descriptions is tedious and manual.

### 1.2 Core Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Provide a single canonical portfolio store (skills, projects, experiences) | ✅ Implemented |
| 2 | Allow composition of multiple targeted resume versions from portfolio items | ✅ Implemented |
| 3 | Export tailored resumes as PDF | ✅ Implemented |
| 4 | AI-assisted resume tailoring / job description analysis | ✅ Implemented |

### 1.3 Technology Stack Rationale

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Runtime** | [Bun](https://bun.sh) | Near-native JavaScript runtime; replaces Node.js for dramatically faster startup and built-in TypeScript execution without a separate transpile step. |
| **API Framework** | [Elysia](https://elysiajs.com) | Bun-native, type-safe HTTP framework with end-to-end type inference; reduces boilerplate versus Express without sacrificing composability. |
| **Schema Validation** | [Zod v4](https://zod.dev) | Runtime validation for all inbound HTTP payloads; `z.treeifyError` provides structured error detail for client consumption. |
| **Authentication** | [jose](https://github.com/panva/jose) (JWT / HS256) | Lightweight, standards-compliant JWT library; used for session cookies and short-lived OAuth state tokens. |
| **Database** | PostgreSQL + Prisma ORM | ACID-compliant relational store; chosen for structured multi-table query relationships in the resume composition engine. |
| **Frontend** | Next.js 16 + React 19 | App Router with forced dynamic rendering (`force-dynamic`); enables server-side session resolution without a dedicated BFF. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework for rapid iteration. |
| **Monorepo** | Bun Workspaces | Native workspace support eliminates the need for Turborepo or Nx at the current scale. |
| **Export** | `pdfkit` | Server-side PDF generation engine to draw structured tailored resume layouts. |
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
- **FR-07** — Export a resume as a styled PDF.
- **FR-08** — Authenticate via GitHub OAuth 2.0; session maintained via an `HttpOnly` JWT cookie (7-day expiry).
- **FR-09** — AI-assisted resume tailoring via job description analysis, mapping vault skills, and suggesting tailored feedback.

### 2.2 Non-Functional Requirements

| ID | Requirement | Implementation Evidence |
|----|-------------|-------------------------|
| NFR-01 | **Security** — Session tokens must be `HttpOnly`, `SameSite=Lax`, and `Secure` in production. | `auth.ts` → `makeSessionCookie` |
| NFR-02 | **Security** — OAuth state parameter must be a short-lived (10-minute) signed JWT to prevent CSRF. | `auth.ts` → `createOauthState` |
| NFR-03 | **Data Integrity** — All multi-table writes must be atomic. | Prisma Transactions in repositories |
| NFR-04 | **Data Integrity** — Proficiency levels, project statuses, resume statuses, and visibility values are enforced at both application and database constraint levels. | `CHECK` constraints in database + Zod enums in schemas |
| NFR-05 | **Developer Experience** — Full TypeScript strict mode across all workspaces. | Root `tsconfig.json` |
| NFR-06 | **Scalability** — Database connections are pooled and managed via Prisma client. | Prisma initialization |

### 2.3 Stakeholders / User Roles

| Role | Description |
|------|-------------|
| **Portfolio Owner** | A developer or academic who manages their skills, projects, and experience, composes resume versions, and governs their profile. Authenticates via GitHub. |

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
    ├── db/           # SQL migration scripts (PostgreSQL DDL)
    └── shared/       # Shared models and schemas (Zod/TypeScript)
```

**Request Flow:**

```mermaid
flowchart TD
    A["🌐 Browser"]
    B["Next.js\n(apps/web)\nSSR session and API resolution"]
    C["Elysia API\n(apps/api) — /v1/*"]
    D[("PostgreSQL")]

    A -->|"HTTP request"| B
    B -->|"REST · JSON over HTTP\ncredentials: include"| C
    C -->|"Zod validation → business logic\n→ Prisma queries"| D
```

The API and Web are decoupled services communicating over HTTP, making them independently deployable and scalable.

### 3.2 Architectural Patterns & Design Patterns

| Pattern | Application |
|---------|-------------|
| **Repository Pattern** | Encapsulated in the `repositories` directory. All database queries are managed by Prisma repositories (e.g., `OrmVaultRepository`). |
| **Facade Pattern** | `src/lib/api.ts` (frontend) wraps all `fetch` calls behind typed helper functions (`getResumes`, etc.), hiding HTTP details from page components. |
| **Strategy Pattern (Export Pipeline)** | `resume-builder-export` rendering pipeline implements strategies selected at runtime by the export endpoint. |
| **Derive Pattern** | Elysia's `.derive()` is used to resolve the session JWT and inject `userId` into every handler context. |
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

    certificates {
        uuid certificate_id PK
        uuid user_id FK
        string name
        string year
    }

    awards {
        uuid award_id PK
        uuid user_id FK
        string name
        string description
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

    resume_certificates {
        uuid resume_id FK
        uuid certificate_id FK
    }

    resume_awards {
        uuid resume_id FK
        uuid award_id FK
    }

    %% --- Portfolio ownership ---
    users ||--o{ projects : "owns"
    users ||--o{ experiences : "owns"
    users ||--o{ resumes : "owns"
    users ||--o{ certificates : "owns"
    users ||--o{ awards : "owns"

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
    resumes ||--o{ resume_certificates : "composes"
    certificates ||--o{ resume_certificates : "included in"
    resumes ||--o{ resume_awards : "composes"
    awards ||--o{ resume_awards : "included in"
```

**Key Design Decisions:**
- `skills` is a **global registry** (unique by name); ownership is expressed via the `user_skills` junction table, allowing proficiency levels to vary per-user without duplicating skill records.
- `resume_basics` is a **1:1 optional extension** of `resumes`, allowing a resume to be created without a baseline and enriched later.
- `visibility` on `resumes` is enforced with a `CHECK` constraint at the database level: `private | public | company-only`.

---

## 4. Implementation

### 4.1 Directory Structure Logic

```
apps/api/
├── index.ts              # Entrypoint: instantiates Elysia app, binds to PORT
└── src/
    ├── app.ts            # Route definitions — active HTTP handlers
    ├── auth.ts           # JWT session + OAuth state helpers (jose)
    ├── db/               # Active database module and repositories
    │   ├── index.ts      # Main database exports
    │   ├── pool.ts       # Raw pg pool setup
    │   ├── prisma.ts     # Prisma client setup
    │   └── repositories/ # Vault and resume repository implementations
    └── resume-builder-export/ # PDF/metadata export mapping and rendering
        ├── index.ts
        └── resume-builder-pdf.renderer.ts

apps/web/
└── src/
    ├── app/
    │   ├── layout.tsx        # Root layout: Space Grotesk font, topbar
    │   ├── auth/             # GitHub OAuth entry points (login, logout)
    │   └── (resume-builder)/ # Main active Resume Builder flow routes
    │       ├── layout.tsx
    │       ├── page.tsx      # Main landing/dashboard page
    │       └── resume/
    │           ├── ai/
    │           │   └── page.tsx # AI-assisted resume tailoring
    │           └── manual/
    │               ├── page.tsx # Manual resume composition
    │               └── [resumeId]/
    │                   └── page.tsx # Manual resume composer for specific draft
    ├── features/resume-builder/ # React state, UI components, and client-side logic
    └── lib/
        └── api.ts            # Client-side typed API functions (fetch wrapper)

packages/db/sql/
├── 001_bootstrap_active_schema.sql          # Clean bootstrap schema (16 active tables)
└── legacy/                                  # Archived legacy migrations/seeds (for reference)
```

For the product vision and MVP scope, see [apps/web/README.md](apps/web/README.md).

### 4.2 API Surface

**Base path:** `/v1`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | Public | Service liveness check |
| `GET` | `/auth/github/start` | Public | Initiates GitHub OAuth redirect |
| `GET` | `/auth/github/config` | Public | Returns GitHub configuration |
| `GET` | `/auth/github/callback` | Public | Exchanges OAuth code; sets session cookie |
| `GET` | `/auth/session` | Cookie | Returns current session user |
| `POST` | `/auth/logout` | Cookie | Clears session cookie |
| `GET` | `/resume-builder/snapshot` | 🔒 | Loads entire vault snapshot (skills, projects, experiences, resumes) |
| `POST` | `/resume-builder/skills` | 🔒 | Creates a new skill in the vault |
| `POST` | `/resume-builder/projects` | 🔒 | Creates a new project in the vault |
| `POST` | `/resume-builder/analyze-jd` | 🔒 | Submits a job description to trigger AI analysis |
| `POST` | `/resume-builder/resumes` | 🔒 | Creates a new resume draft |
| `PUT` | `/resume-builder/resumes/:resumeId` | 🔒 | Saves resume config and baseline info |
| `POST` | `/resume-builder/resumes/:resumeId/duplicate` | 🔒 | Duplicates an existing resume |
| `DELETE` | `/resume-builder/resumes/:resumeId` | 🔒 | Deletes a resume |
| `PATCH` | `/resume-builder/resumes/:resumeId/status` | 🔒 | Updates resume lifecycle status |
| `GET` | `/resume-builder/resumes/:resumeId/export` | 🔒 | Exports tailored resume as PDF |

### 4.3 Core Module Highlights

**`db` — Repository Layer**
- Encapsulated via `IVaultBackendRepository` with concrete implementations (e.g. `OrmVaultRepository` leveraging Prisma client).
- Batch queries optimize relation loading to prevent N+1 queries.

**`resume-builder-export` — PDF Export Pipeline**
- Processes structured resume configurations and formats a clean visual layout.
- Generates structured PDF outputs using pdfkit, avoiding heavy browser-based rendering stacks.

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

Unit and integration tests are executed using the built-in Bun test runner for backend code and Vitest for frontend code.

### 5.2 Testing Strategy

| Layer | Framework | Scope |
|-------|-----------|-------|
| **Unit** | [Bun test runner](https://bun.sh/docs/cli/test) (`bun test`) | `auth.ts` helpers, schema validation, and core analysis services |
| **Integration (Backend)** | Bun test + Prisma client | Repository functions (create, duplicate, status updates, transaction checks) |
| **Unit / Integration (Frontend)** | Vitest + React Testing Library | Resume Builder state transitions, React component renders, preview modals |
| **End-to-End** | [Playwright](https://playwright.dev) | Owner sign-in → create skill → create resume → compose → export |

---

## 6. Deployment

### 6.1 Current State

> [To be defined / In Progress] — No CI/CD pipeline or container manifests are present in the repository at this time.

### 6.2 Local Development

Please refer to the **[🚀 Quick Start](#-quick-start-local-development)** section at the top of this document for the recommended way to get the project running using Docker. 

If you prefer running PostgreSQL natively without Docker, ensure you create a database named `uaps` and apply the schema manually:
```bash
psql -d uaps -f packages/db/sql/001_bootstrap_active_schema.sql
```

### 6.3 Intended Deployment Architecture

| Component | Recommended Target |
|-----------|-------------------|
| **API (`apps/api`)** | Containerised via Docker (`FROM oven/bun`); deployable to any OCI-compatible platform (Fly.io, Railway, AWS ECS, GCP Cloud Run). |
| **Web (`apps/web`)** | Vercel (native Next.js support) or Docker with `next start`. |
| **Database** | Managed PostgreSQL (Supabase, Neon, AWS RDS, or Railway Postgres). |
| **CI/CD** | GitHub Actions — lint → typecheck → unit tests → integration tests → build → deploy. |

---

## 7. Maintenance

### 7.1 Scalability Considerations

- **Connection Pooling:** Database connection limits are managed using pooled resources via PostgreSQL.
- **Horizontal Scaling:** The API is stateless (session state is in the JWT cookie, persistence in PostgreSQL), so multiple API instances can run behind a load balancer without sticky sessions.

### 7.2 Observability

| Signal | Recommended Tool |
|--------|-----------------|
| **Structured Logging** | Pino (API) / Next.js built-in logger (Web) |
| **Error Tracking** | Sentry (both API and Web) |
| **Uptime** | `/v1/health` endpoint → external monitor (UptimeRobot, Better Uptime) |

---

## Quick Reference

```
Monorepo root scripts:
  bun run dev           # Start API + Web concurrently (concurrently -k)
  bun run dev:api       # API only  (bun --hot index.ts on port 4000)
  bun run dev:web       # Web only  (next dev on port 3000)
  bun run build:web     # Production Next.js build
  bun run typecheck     # Typecheck API and Web workspaces
  bun run test          # Run all test suites
```

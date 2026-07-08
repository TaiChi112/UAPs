# Copilot Instructions for UAPS

## Build, test, and lint commands

This monorepo uses **Bun workspaces**.

```bash
# install all workspace dependencies
bun install

# run both services
bun run dev

# run one service
bun run dev:api
bun run dev:web

# production builds
bun run build
bun run build:api
bun run build:web

# tests
bun run test
bun run test:api
bun run test:web

# run a single backend test file (Bun test runner)
bun test apps/api/src/ai/resume-analysis.service.test.ts

# run a single frontend test file (Vitest)
bun run --cwd apps/web test src/features/resume-builder/state/reducer.test.ts

# type checks
bun run typecheck
bun run typecheck:api
bun run typecheck:web

# lint (currently configured for web workspace)
bun run lint:web
```

Database-related commands (API workspace):

```bash
bun run --cwd apps/api prisma:generate
bun run --cwd apps/api prisma:migrate:dev
bun run --cwd apps/api prisma:studio
bun run --cwd apps/api seed:vault-test
```

## High-level architecture

- **Monorepo layout**:
  - `apps/api`: Elysia API on Bun
  - `apps/web`: Next.js 16 + React 19 frontend
  - `packages/shared`: shared resume-builder types/contracts
  - `packages/db`: bootstrap SQL schema
- **Runtime flow**: web app calls API over HTTP (`NEXT_PUBLIC_API_BASE_URL`), API validates payloads with Zod, persists via repository layer to PostgreSQL (Prisma by default), and returns an envelope response.
- **Repository layering**:
  - API persistence is abstracted behind `IVaultBackendRepository` with strategy selection (`DB_STRATEGY=ORM|RAW`).
  - Web uses `VaultRepository` interface and defaults to `HybridVaultRepository`, which tries API-backed repository first and falls back to mock repository on failures.
- **Auth/session model**:
  - API resolves session in `.derive()` from JWT cookie.
  - Non-production defaults to **single-player mode** unless explicitly disabled, using a seeded local dev user.
- **Resume export path**:
  - Selection IDs from saved resume + vault data are mapped by `resume-builder-export.mapper.ts`.
  - PDF bytes are generated in API and returned as binary response (`Content-Disposition` filename).

## Key conventions in this codebase

- **API response envelope is standard**: success and error responses follow `{ ok, data?, error? }`; frontend API client expects this shape in `apps/web/src/lib/api.ts`.
- **Validate + normalize at route boundary**: API routes parse with Zod schemas in `apps/api/src/routes/resume-builder.schemas.ts`, trim strings, apply defaults, and convert incoming string IDs into branded IDs (`asSkillId`, `asResumeId`, etc.).
- **Use shared branded ID helpers** from `@uaps/shared/resume-builder` instead of raw string casting for domain IDs.
- **Use repository interfaces, not direct data access from UI code**:
  - Web state/actions should call `getResumeBuilderRepository()` methods.
  - API handlers should call `vaultBackendRepository` methods.
- **Zero-hallucination AI behavior is enforced in code**: resume analysis normalizes generated output by allowing only IDs that exist in the vault and deduplicating/clamping results.
- **Next.js-specific rule for this repo**: treat this as a breaking-change Next.js environment; check docs in `node_modules/next/dist/docs/` before changing Next.js behavior (from `apps/web/AGENTS.md` and `apps/web/CLAUDE.md`).

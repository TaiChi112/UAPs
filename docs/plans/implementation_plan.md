# Implementation Plan - Scalable Multi-Provider OAuth Authentication

This plan outlines the steps to introduce a highly scalable, multi-provider OAuth authentication system supporting GitHub, Google, Discord, Line, Facebook, and Instagram, along with a beautiful frontend login interface.

---

## User Review Required

> [!IMPORTANT]
> **Key Decisions & Database Migration:**
> 1. We will introduce a new `oauth_accounts` table linked to `users`.
> 2. We will automatically migrate existing users' `github_id` fields to `oauth_accounts` using a migration script so that no existing profiles (like Maya Chen, Mali Chantarang, etc.) are broken.
> 3. We will modify the login behavior so that when `SINGLE_PLAYER_MODE=false`, the user is greeted by a premium login interface on `http://localhost:3000/auth/login`. We will also add a **"Dev Bypass Login"** button on this page for developers to skip login and enter as Maya Chen immediately.

---

## Proposed Changes

### Database Layer
We will migrate from a hardcoded `github_id` model on the `users` table to an extensible one-to-many relationship using a new `oauth_accounts` table.

#### [MODIFY] [schema.prisma](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/prisma/schema.prisma)
* Add `OAuthAccount` model to the schema.
* Link it to `User` through a one-to-many relationship.

#### [MODIFY] [001_bootstrap_active_schema.sql](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/packages/db/sql/001_bootstrap_active_schema.sql)
* Update the bootstrap DDL to create the `oauth_accounts` table.
* Include a data migration SQL script that populates `oauth_accounts` from the existing `github_id` fields of registered users.

---

### Backend API (`apps/api`)
We will rewrite the authentication router in [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts) to handle multi-provider OAuth in a unified, extensible way.

#### [MODIFY] [users.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/db/users.ts)
* Implement a general function `upsertUserFromOAuth(provider, providerId, email, name, avatarUrl, profileUrl, login)` that checks if the `oauth_accounts` record exists. If not, it checks if a `users` record exists by email to link them, or creates a new user.

#### [MODIFY] [app.ts](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/api/src/app.ts)
* Create dynamic routes:
  - `GET /v1/auth/:provider/start`
  - `GET /v1/auth/:provider/callback`
* Support GitHub fully.
* Add structured handler skeletons/placeholders for `google`, `discord`, `line`, `facebook`, `instagram`, showing how new OAuth protocols can easily plug in without schema changes.

---

### Frontend Web (`apps/web`)
We will replace the redirect-to-root placeholder page with a premium, modern login screen.

#### [MODIFY] [page.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/auth/login/page.tsx)
* Replace the `redirect("/")` with a stunning, modern login screen using rich glassmorphism backgrounds, custom typography (Google Fonts), micro-animations, and styled buttons with brand colors for:
  - GitHub (Black)
  - Google (White/Grey with Google logo)
  - Discord (Blurple)
  - Line (Green)
  - Facebook (Blue)
  - Instagram (Gradient orange/purple)
* Add a **"Dev Bypass Login"** (Amber badge button) to log in as Maya Chen immediately for local testing.

#### [MODIFY] [layout.tsx](file:///d:/RepositoryVS/Project/universal_academic_portfolio_system_copy/apps/web/src/app/layout.tsx)
* Update the root layout or page check to redirect unauthenticated users to `/auth/login` if `SINGLE_PLAYER_MODE` is disabled.

---

## Verification Plan

### Automated Tests
- Run `bun run test:web` and `bun run test:api` to verify that existing test suites remain intact.

### Manual Verification
1. **Mock Mode Check:** With `SINGLE_PLAYER_MODE=true`, verify that the system still automatically bypasses login and signs in as Maya Chen.
2. **OAuth Page UI Check:** Open `http://localhost:3000/auth/login` and verify that the layout, brand colors, hover effects, and typography look premium and professional.
3. **Bypass Login Check:** Verify that clicking "Dev Bypass Login" successfully logs you in as Maya Chen.
4. **Scale Verification:** Verify that initiating `/auth/google/start` redirects or behaves in a structured, documented way, proving readiness for adding client credentials.

# UAPS API

Elysia-based API service for the UAPS MVP.

## Commands

```bash
bun run dev
bun run typecheck
```

## Environment

Use `.env` in this folder if you want to override defaults.

```env
PORT=4000
API_BASE_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uaps
WEB_APP_URL=http://localhost:3000

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

JWT_SECRET=replace_with_at_least_32_chars
SESSION_COOKIE_NAME=uaps_session
```

## GitHub OAuth Callback

Use this callback URL when creating GitHub OAuth App:

`http://localhost:4000/v1/auth/github/callback`

OAuth flow endpoints:

- `GET /v1/auth/github/start`
- `GET /v1/auth/github/callback`
- `GET /v1/auth/session`
- `POST /v1/auth/logout`

Current implementation uses in-memory storage for rapid MVP bootstrap.
The SQL schema lives in [../../packages/db/sql/001_init_uaps.sql](../../packages/db/sql/001_init_uaps.sql).

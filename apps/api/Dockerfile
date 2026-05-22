FROM oven/bun:1.3.10 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile

FROM oven/bun:1.3.10 AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock
COPY --from=deps /app/apps/api/package.json ./apps/api/package.json
COPY --from=deps /app/packages/shared/package.json ./packages/shared/package.json

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db

RUN bun run --cwd apps/api build

FROM oven/bun:1.3.10 AS prod-deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.10-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=build /app/apps/api/src/generated/prisma ./apps/api/src/generated/prisma
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/db ./packages/db

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["bun", "dist/index.js"]

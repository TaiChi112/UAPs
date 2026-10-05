#!/bin/bash
export PATH=$PATH:~/.bun/bin

echo "1. Installing dependencies..."
bun install

echo "2. Copying environment variables..."
cp apps/api/.env.example apps/api/.env

echo "3. Starting PostgreSQL (Docker must be installed and running)..."
if command -v docker &> /dev/null; then
    docker compose up -d
else
    echo "⚠️  WARNING: docker command not found! Please install Docker Desktop or OrbStack to run the database."
    echo "Without the database, the API will not work fully."
fi

echo "4. Generating Prisma Client..."
bun run --cwd apps/api prisma:generate

echo "5. Killing existing Next.js server if port is busy..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Setup complete! Starting the development servers..."
bun run dev

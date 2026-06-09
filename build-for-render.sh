#!/usr/bin/env bash
set -e

echo "==> Installing dependencies (excluding mobile)..."
pnpm install --filter '!@workspace/couple-compass-mobile' --frozen-lockfile

echo "==> Building frontend..."
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/compatibility-planner exec \
  vite build --config vite.config.prod.ts

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Copying frontend into API dist/public/ ..."
# Must run AFTER API build because build.mjs wipes dist/ first
mkdir -p artifacts/api-server/dist/public
cp -r artifacts/compatibility-planner/dist/public/. artifacts/api-server/dist/public/

echo "==> Running DB migrations..."
pnpm --filter @workspace/db run push

echo "==> Done!"

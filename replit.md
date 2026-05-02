# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Applications

### Relationship Compatibility Planner (`artifacts/compatibility-planner`)
- **Preview path**: `/`
- **Description**: A full-stack web app for couples to test compatibility before marriage
- **Flow**: Partner 1 creates a session → shares code → both complete 40 questions across 8 categories → receive a compatibility report with score, aligned areas, differing areas, and discussion prompts
- **Pages**: `/` (home), `/start` (create session), `/join` (join with code), `/questionnaire/:code/:slot` (questions), `/waiting/:code/:slot` (waiting room), `/report/:code` (compatibility report)

### API Server (`artifacts/api-server`)
- **Preview path**: `/api`
- **Routes**: `/api/questions`, `/api/sessions`, `/api/sessions/:code/responses`, `/api/sessions/:code/report`, `/api/sessions/:code/status`

## Database Schema

- `questions` — 40 pre-seeded questions across 8 categories (values, life_plans, finances, family, lifestyle, communication, intimacy, growth)
- `sessions` — couple sessions with a unique 8-char code
- `partner_responses` — each partner's submission record
- `answers` — individual question answers per partner

## Notes

- After running `pnpm --filter @workspace/api-spec run codegen`, manually fix `lib/api-zod/src/index.ts` to only export from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts

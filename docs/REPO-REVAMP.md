# Cognis repository revamp

## Goal

Create a clean monorepo boundary before adding AWS infrastructure, without changing the existing Python backend.

## Changes

- Moved the Next.js application from the repository root into `apps/web`.
- Moved frontend-only config (`next.config.ts`, `postcss.config.mjs`, ESLint, TypeScript config) into `apps/web`.
- Converted the repository root `package.json` into workspace orchestration.
- Added an explicit pnpm workspace definition for `apps/*` and `packages/*`.
- Added an app-local `vercel.json` for monorepo deployment.
- Rebuilt CI around the `@cognis/web` workspace.
- Removed empty placeholder application/package files from the old layout.
- Added explicit documentation for the frontend/backend boundary.

## Backend protection

The `backend/` directory is copied byte-for-byte from the source repository. It is not moved, renamed, reformatted, refactored, or dependency-edited in this revamp.

## Next implementation boundary

AWS infrastructure belongs under `infra/`. The next phase can add Lambda Function URLs/API ingress, Step Functions, DynamoDB, S3, CloudWatch, and Bedrock integration without contaminating the web workspace or rewriting `backend/`.

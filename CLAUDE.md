# Ziply — Claude Code Agent Rules

## Project Overview
Ziply is a SaaS web app that generates professional websites for nonprofits. Users select a template, fill a wizard, pay $29 via Stripe, and download a ZIP of their static site.

## Architecture
- **Client**: Next.js 14 (App Router, TypeScript, Tailwind CSS) in `client/`
- **Server**: Express (TypeScript) in `server/`
- **Database**: Azure Cosmos DB
- **Storage**: Azure Blob Storage
- **Payments**: Stripe Checkout + Webhooks
- **AI**: OpenAI GPT API (server-side only)

## Key Constraints
- Do not change architecture without updating `docs/spec.md`.
- Do not add dependencies without justification.
- Do not move to the next task unless Definition of Done is satisfied.
- Prefer small, verifiable commits.
- No hardcoded secrets — use environment variables via `.env` files.
- OpenAI API key must never be exposed to the client.
- Stripe webhook signature verification is required — never trust redirect-only confirmation.

## Development Commands
- `npm run dev` — start client + server concurrently
- `npm run build` — build both projects
- `npm run lint` — lint both projects
- `npm run install:all` — install all dependencies

## Code Style
- TypeScript strict mode in both client and server.
- Server uses ESLint with `@typescript-eslint`.
- Client uses Next.js ESLint config.
- Use `no-console` rule (warn) in server — use proper logging when available.

## Branching
- `main` — stable, production-ready
- `develop` — integration branch
- `feature/<name>` — feature branches off `develop`

## File Structure Conventions
- Client pages: `client/src/app/`
- Server routes: `server/src/` (organized by feature)
- Shared types/contracts: define in both for now; consolidate if needed later
- Docs: `docs/`
- CI: `.github/workflows/`

## Phase Execution
Follow `docs/plan.md` strictly. Each phase must meet its Definition of Done before proceeding.

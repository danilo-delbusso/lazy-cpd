# Contributing to CPD Portal

Thanks for your interest in contributing! This guide will help you get started.

## Prerequisites

- [Bun](https://bun.sh) (v1.3+)
- [Docker](https://docker.com) (for PostgreSQL)
- [Node.js](https://nodejs.org) (v22+ for production runtime)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Ricky-Stevens/CPD-Portal.git
cd CPD-Portal

# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d

# Set up environment
cp .env.example .env
# Edit .env with your values (see comments in .env.example)

# Run database migrations
bunx drizzle-kit push

# Seed the database (optional)
bun run scripts/seed.ts

# Start dev server
bun run dev
```

## Project Structure

```
src/
├── app/           # Next.js App Router (pages, layouts, API routes)
│   ├── (public)/  # Public-facing portfolio pages
│   ├── admin/     # Admin dashboard pages
│   └── api/       # REST API + MCP endpoint
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Business logic (auth, db, utils, validations)
├── mcp/           # MCP server tools
├── stores/        # Zustand stores
└── test/          # Test setup
```

## Code Standards

- **Max file length:** 300 lines (tests excluded)
- **No `any` types** without a justifying comment
- **Zod v4** for all validation (`import { z } from "zod/v4"`)
- **Bun** for package management and scripts — never npm/yarn
- **Biome** for linting and formatting — run `bun run check` before submitting

## Running Tests

```bash
# Unit tests
bun run test

# E2E tests (requires dev server running)
bun run test:e2e
```

## Making Changes

1. Create a branch from `main`
2. Make your changes
3. Ensure `bun run check` passes (lint + format)
4. Ensure `bun run test` passes
5. Keep files under 300 lines
6. Submit a pull request with a clear description

## MCP Tools

If adding a new MCP tool:

1. Add the tool in `src/mcp/tools/`
2. Register it in `src/mcp/server.ts`
3. Use `zod/v4` schemas with `.describe()` on every field and `.max()` bounds
4. Wrap handlers in try/catch with generic error messages
5. Use `@paralleldrive/cuid2` for new entity IDs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

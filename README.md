# CPD Portal

A self-hosted Continuing Professional Development (CPD) tracking portal. Track your learning goals, log activities, and manage your professional development — with an MCP server for AI-powered management via Claude Code.

## Features

- **Goals & Activities**: Create goals, track activities with dates, formats, tags, and markdown notes
- **Public Portfolio**: Share your CPD progress at a public URL
- **Admin Dashboard**: Full CRUD management with tag autocomplete, markdown editor, and format management
- **MCP Server**: 12 tools for managing CPD data via Claude Code (list, create, update, delete goals/activities, search, formats)
- **Expand Notes**: Paste rough notes and expand them into structured key learnings via AI
- **Docker-ready**: Multi-stage Dockerfile for production deployment

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) (dev) / Node.js 22 (production)
- **Framework**: [Next.js](https://nextjs.org) 16 (App Router, standalone output)
- **Database**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
- **Validation**: [Zod](https://zod.dev) v4
- **Auth**: env-based password + JWT + HttpOnly cookies
- **MCP**: [@modelcontextprotocol/server](https://github.com/modelcontextprotocol/typescript-sdk) v2
- **UI**: Tailwind CSS, Motion, GSAP
- **Testing**: Vitest, Testing Library, Playwright

## Quick Start

```bash
# Prerequisites: Bun, Docker

# Install dependencies
bun install

# Start PostgreSQL
docker compose up -d

# Configure environment
cp .env.example .env
# Edit .env — set JWT_SECRET (openssl rand -base64 32)

# Run database migrations
bunx drizzle-kit push

# Seed with sample data (optional)
bun run scripts/seed.ts

# Start dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

## MCP Integration

Connect Claude Code to manage your CPD data with natural language:

```bash
# Generate a token
export CPD_MCP_TOKEN=$(openssl rand -hex 32)

# Add to .env on the server
echo "CPD_MCP_TOKEN=$CPD_MCP_TOKEN" >> .env

# Connect Claude Code
claude mcp add -s user --transport http cpd-portal http://localhost:3000/api/mcp \
  --header "Authorization: Bearer ${CPD_MCP_TOKEN}"
```

MCP connection details are also available on the admin dashboard after login.

## Production Deployment

```bash
# Build the Docker image
docker build -t cpd-portal .

# Run with required env vars
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e CPD_MCP_TOKEN="$(openssl rand -hex 32)" \
  cpd-portal
```

The app runs on port 3000. Put it behind a reverse proxy (nginx, Caddy, or a PaaS like Sliplane) for TLS.

## Development

```bash
bun run dev          # Start dev server
bun run check        # Lint + format (Biome)
bun run test         # Unit tests (Vitest)
bun run test:e2e     # E2E tests (Playwright)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guidelines.

## License

[MIT](LICENSE)

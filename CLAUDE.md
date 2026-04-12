## MCP Server

The CPD Portal exposes an MCP server at `/api/mcp` for Claude Code integration.

- **Route:** `src/app/api/mcp/route.ts` — POST (tools), GET (health), DELETE (405)
- **Server factory:** `src/mcp/server.ts` — creates a new `McpServer` per request (required by the SDK)
- **Tools:** `src/mcp/tools/` — goals.ts, activities.ts, formats.ts, search.ts (12 tools total)
- **Auth:** Bearer token via `CPD_MCP_TOKEN` env var, validated with `crypto.timingSafeEqual`
- **Transport:** `WebStandardStreamableHTTPServerTransport` from `@modelcontextprotocol/server` (stateless)
- **SDK:** `@modelcontextprotocol/server` v2 — uses `registerTool()` with Zod v4 schemas

### Adding a new tool
1. Add the tool registration in the appropriate file under `src/mcp/tools/`
2. Use `zod/v4` for input schemas with `.describe()` on every field and `.max()` bounds on strings/arrays
3. Wrap the handler body in try/catch — return `error("generic message")`, never raw errors
4. Use `@paralleldrive/cuid2` `createId()` for new entity IDs

### Key constraints
- Do NOT share a single `McpServer` instance across requests — `server.connect()` throws on reuse
- Do NOT expose auth-related data through MCP tools
- `delete_goal` requires `confirm: true` to execute (cascade safety)
- Error responses must be generic — never surface `DATABASE_URL` or internal details

## AI Features
Only **expand-notes** remains (`src/lib/ai/capabilities/expand-notes.ts`). All other AI features were deliberately removed in favour of MCP tools. Do not re-add in-app AI features.

## Proxy (route protection)
- Next.js 16 uses `src/proxy.ts` — do NOT create a `middleware.ts` file, they conflict
- The proxy protects `/admin/*` routes (except `/admin/login`) via JWT verification
- Auth is env-based: single `ADMIN_PASSWORD` env var, no database-backed users

## Database Schema Isolation
- `DB_SCHEMA` env var controls which PostgreSQL schema tables live in
- **Unset (default):** tables in `public` schema — vanilla Postgres, no setup needed
- **Set (e.g. `cpd_portal`):** tables in a custom schema — for Supabase or shared databases
- Schema is defined in `src/lib/db/schema.ts` via conditional `pgSchema`/`pgTable`
- `drizzle.config.ts` uses `schemaFilter` when `DB_SCHEMA` is set to avoid touching other schemas
- When switching schemas, run `drizzle-kit push` or `drizzle-kit generate` + `drizzle-kit migrate`

## Stack
- **Runtime:** Bun (not npm) — use `bun add`, `bun run`, `bunx`
- **Framework:** Next.js 16 with App Router, `output: "standalone"` for Docker
- **Database:** PostgreSQL via Drizzle ORM, queries in `src/lib/db/queries/`
- **Validation:** Zod v4 (`zod/v4` import path), schemas in `src/lib/validations/`
- **IDs:** `@paralleldrive/cuid2`
- **Deployment:** Sliplane at cpd.ricky-stevens.com (Dockerfile in root, NOT Vercel)

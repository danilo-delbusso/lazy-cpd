# Stage 1: Install dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_SITE_OWNER="Ricky Stevens"
ARG NEXT_PUBLIC_GITHUB_URL="https://github.com/Ricky-Stevens"
ARG NEXT_PUBLIC_LINKEDIN_URL="https://www.linkedin.com/in/rickysstevens/"
ARG NEXT_PUBLIC_CODEBERG_URL=""

ENV NEXT_PUBLIC_SITE_OWNER=$NEXT_PUBLIC_SITE_OWNER
ENV NEXT_PUBLIC_GITHUB_URL=$NEXT_PUBLIC_GITHUB_URL
ENV NEXT_PUBLIC_LINKEDIN_URL=$NEXT_PUBLIC_LINKEDIN_URL
ENV NEXT_PUBLIC_CODEBERG_URL=$NEXT_PUBLIC_CODEBERG_URL

# Cap the build's V8 heap. Same reasoning as the runtime ceiling below, but for
# `next build`: unbounded, V8 sizes old space against a multi-GB default and the
# build gets OOM-killed on a small host. Overridable so a roomier builder can
# raise it.
ARG BUILD_MAX_OLD_SPACE_MB=1536
ENV NODE_OPTIONS="--max-old-space-size=${BUILD_MAX_OLD_SPACE_MB}"

RUN bun run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --chmod=0755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# V8 heap ceiling used when the platform exposes no cgroup memory limit that Node
# can read (the common PaaS case — the container cgroup reports "max"). Without a
# ceiling V8 grows heapTotal against its multi-GB default and never returns it, so
# RSS ratchets upward for days until the platform OOM-kills the container. Tune to
# ~75% of the container's memory; the entrypoint auto-derives from the cgroup limit
# when one is visible, and NODE_MAX_OLD_SPACE_MB overrides everything.
ENV DEFAULT_OLD_SPACE_MB=384

# Entrypoint applies the heap ceiling before starting the server.
CMD ["/app/docker-entrypoint.sh"]

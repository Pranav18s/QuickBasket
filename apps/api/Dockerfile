# ─────────────────────────────────────────────────────────────────────────────
# apps/api/Dockerfile
# Multi-stage build for the Express API.
#
# Stage 1 (deps)   — Install ALL dependencies (including devDependencies).
# Stage 2 (runner) — Install production-only dependencies and copy source.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy workspace root manifests first for better Docker layer caching.
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json
# Web package is referenced by the workspace but not needed in the API image.
# Copy it so `npm install` doesn't fail workspace resolution.
COPY apps/web/package.json ./apps/web/package.json

# Install all workspace dependencies from the root.
RUN npm install

# ── Stage 2: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Create a non-root user for security.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 expressjsuser

WORKDIR /app

# Copy installed node_modules from the deps stage.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules 2>/dev/null || true

# Copy application source code.
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

USER expressjsuser

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "apps/api/src/server.js"]

# Multi-stage production image for the QuickBasket Express API.
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --omit=dev

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 expressjsuser

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/src ./packages/shared/src
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/src ./apps/api/src

USER expressjsuser
EXPOSE 5000
CMD ["node", "apps/api/src/server.js"]

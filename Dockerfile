# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Install all dependencies (including devDependencies) for build
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Production dependencies stage
FROM oven/bun:1-slim AS prod-deps

WORKDIR /app

# Install only production dependencies for a smaller runtime image
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Runtime stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4444

# Use non-root user for better container security
USER bun

COPY --chown=bun:bun --from=prod-deps /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/dist ./dist
COPY --chown=bun:bun --from=builder /app/package.json ./

EXPOSE 4444

CMD ["bun", "dist/main.js"]

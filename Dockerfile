# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies) for build
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and config for the build
COPY tsconfig*.json vite.config.ts ./
COPY components.json eslint.config.js index.html ./
COPY public ./public
COPY src ./src

# Compile the production bundle
RUN bun run build

# Production dependencies stage
FROM oven/bun:1-slim AS prod-deps

WORKDIR /app

# Install only production dependencies for a smaller runtime image
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Runtime stage
FROM oven/bun:1-slim AS runner

# Runtime stage
FROM nginx:1.27-alpine AS runner

ENV NODE_ENV=production
ENV PORT=4444

# Use non-root user for better container security
USER bun

COPY --chown=bun:bun --from=prod-deps /app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /app/dist ./dist
COPY --chown=bun:bun --from=builder /app/package.json ./

EXPOSE 4444

CMD ["bun", "dist/main.js"]

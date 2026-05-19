# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies with better layer caching
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile || bun install

# Copy source and config for the build
COPY tsconfig*.json vite.config.ts ./
COPY components.json eslint.config.js index.html ./
COPY public ./public
COPY src ./src

# Compile the production bundle
RUN bun run build


# Runtime stage
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 88
CMD ["nginx", "-g", "daemon off;"]


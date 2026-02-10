# Build stage - Use Ubuntu to match runtime for native modules
FROM ubuntu:24.04 AS builder

# Install Node.js 24 and build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    python3 \
    make \
    g++ && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY node/packages/permiso-core/package*.json ./node/packages/permiso-core/
COPY node/packages/permiso-logger/package*.json ./node/packages/permiso-logger/
COPY node/packages/permiso-db/package*.json ./node/packages/permiso-db/
COPY node/packages/permiso-server/package*.json ./node/packages/permiso-server/

# Copy build scripts from scripts directory
COPY scripts/ ./scripts/

# Copy source code
COPY tsconfig.base.json ./
COPY node ./node
COPY database ./database

# Install dependencies and build
RUN chmod +x scripts/build.sh scripts/clean.sh scripts/format-all.sh scripts/install-deps.sh && \
    ./scripts/build.sh --install

# Make dist files readable by any user (for rootless Docker)
RUN chmod -R a+rX /app/node/packages/*/dist /app/database 2>/dev/null || true

# Migrations stage - runs migrations and exits
FROM ubuntu:24.04 AS migrations

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy from builder - need knex, migrations, and database access
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/database/ ./database/
COPY --from=builder /app/node/packages/permiso-db/dist ./node/packages/permiso-db/dist
COPY --from=builder /app/node/packages/permiso-db/package*.json ./node/packages/permiso-db/
COPY --from=builder /app/node/packages/permiso-logger/dist ./node/packages/permiso-logger/dist
COPY --from=builder /app/node/packages/permiso-logger/package*.json ./node/packages/permiso-logger/

# Create data directory
RUN mkdir -p /app/data

CMD ["./node_modules/.bin/knex", "migrate:latest", "--knexfile", "database/permiso/knexfile.js", "--env", "production"]

# Development stage - hot reload with source mounts
FROM builder AS development

WORKDIR /app

EXPOSE 5001

ENV NODE_ENV=development \
    PERMISO_SERVER_HOST=0.0.0.0 \
    PERMISO_SERVER_PORT=5001 \
    LOG_LEVEL=debug

CMD ["node", "--import", "tsx", "node/packages/permiso-server/src/bin/server.ts"]

# Production stage
FROM ubuntu:24.04 AS production

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application and dependencies from builder
COPY --from=builder /app/node/packages/permiso-server/dist ./node/packages/permiso-server/dist
COPY --from=builder /app/node/packages/permiso-server/package*.json ./node/packages/permiso-server/
COPY --from=builder /app/node/packages/permiso-db/dist ./node/packages/permiso-db/dist
COPY --from=builder /app/node/packages/permiso-db/package*.json ./node/packages/permiso-db/
COPY --from=builder /app/node/packages/permiso-logger/dist ./node/packages/permiso-logger/dist
COPY --from=builder /app/node/packages/permiso-logger/package*.json ./node/packages/permiso-logger/
COPY --from=builder /app/node/packages/permiso-core/dist ./node/packages/permiso-core/dist
COPY --from=builder /app/node/packages/permiso-core/package*.json ./node/packages/permiso-core/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy start script and entrypoint
COPY scripts/start.sh scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x scripts/start.sh scripts/docker-entrypoint.sh

# Create data and log directories
RUN mkdir -p /app/data /app/logs

# Expose server port
EXPOSE 5001

# Set default environment variables (non-sensitive only)
ENV NODE_ENV=production \
    PERMISO_SERVER_HOST=0.0.0.0 \
    PERMISO_SERVER_PORT=5001 \
    LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PERMISO_SERVER_PORT || 5001) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Use entrypoint for automatic setup
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]

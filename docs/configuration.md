# Configuration

All configuration is done via environment variables.

## Required Variables

```bash
# Database
PERMISO_DATA_DIR=./data

# Server
PERMISO_SERVER_HOST=localhost
PERMISO_SERVER_PORT=5001
```

## Optional Variables

```bash
# API Authentication
PERMISO_API_KEY=your-secret-key      # Enables API key auth when set
PERMISO_API_KEY_ENABLED=true         # Explicit enable flag

# Docker/Production
PERMISO_AUTO_MIGRATE=true            # Run migrations on startup

# Logging
NODE_ENV=production                  # Set to 'production' for less verbose logs
LOG_LEVEL=debug                      # debug, info, warn, error
```

## Docker Configuration

For Docker deployments, use environment variables with `-e`:

```bash
docker run -p 5001:5001 \
  -v ./data:/app/data \
  -e PERMISO_DATA_DIR=/app/data \
  -e PERMISO_AUTO_MIGRATE=true \
  ghcr.io/codespin-ai/permiso:latest
```

## Configuration Files

For local development, create a `.env` file:

```bash
# .env
PERMISO_DATA_DIR=./data
PERMISO_SERVER_HOST=localhost
PERMISO_SERVER_PORT=5001
```

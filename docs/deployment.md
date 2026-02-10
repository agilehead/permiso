# Deployment

## Docker

### Quick Start

```bash
docker run -p 5001:5001 \
  -v ./data:/app/data \
  -e PERMISO_DATA_DIR=/app/data \
  -e PERMISO_AUTO_MIGRATE=true \
  ghcr.io/codespin-ai/permiso:latest
```

### Docker Compose

```yaml
version: "3.8"

services:
  permiso:
    image: ghcr.io/codespin-ai/permiso:latest
    ports:
      - "5001:5001"
    volumes:
      - permiso_data:/app/data
    environment:
      PERMISO_DATA_DIR: /app/data
      PERMISO_SERVER_HOST: "0.0.0.0"
      PERMISO_SERVER_PORT: "5001"
      PERMISO_AUTO_MIGRATE: "true"
      PERMISO_API_KEY: "your-secure-api-key"
      PERMISO_API_KEY_ENABLED: "true"

volumes:
  permiso_data:
```

## Production Checklist

- [ ] Enable API key authentication (`PERMISO_API_KEY`)
- [ ] Set up monitoring and health checks
- [ ] Configure backup strategy for SQLite database file
- [ ] Set `NODE_ENV=production`
- [ ] Configure rate limiting at proxy/load balancer
- [ ] Enable SSL/TLS termination
- [ ] Mount persistent volume for SQLite data

## Health Check

```bash
curl http://localhost:5001/health
```

## Building Docker Image

```bash
# Build locally
./scripts/docker-build.sh

# Push to registry
./scripts/docker-push.sh latest ghcr.io/codespin-ai

# Test image
./scripts/docker-test.sh
```

# Permiso

Multi-tenant RBAC system with SQLite and GraphQL API.

## Architecture

Permiso implements multi-tenant isolation using app-level tenant filtering with SQLite. Each request includes a tenant context via the `x-tenant-id` header, and repositories filter all queries by tenant.

- **With `x-tenant-id` header**: Operations scoped to that tenant
- **Without `x-tenant-id` header**: ROOT context for cross-tenant operations

## Quick Start

### Docker

```bash
docker run -p 5001:5001 \
  -v ./data:/app/data \
  -e PERMISO_DATA_DIR=/app/data \
  -e PERMISO_AUTO_MIGRATE=true \
  ghcr.io/codespin-ai/permiso:latest
```

### Local Development

```bash
# Clone and build
git clone https://github.com/codespin-ai/permiso.git
cd permiso
./scripts/build.sh

# Configure
cp .env.example .env

# Run migrations
npm run migrate:permiso:latest

# Start server
./scripts/start.sh
```

## Core Concepts

### Data Model

- **Tenants**: Top-level tenants (globally accessible)
- **Users**: Identity provider integration (tenant-scoped)
- **Roles**: Named permission sets (tenant-scoped)
- **Resources**: Path-like identifiers supporting wildcards (tenant-scoped)
- **Permissions**: User/role to resource+action mappings (tenant-scoped)
- **Properties**: JSON metadata on all entities

## API Usage

### TypeScript Client

```typescript
import { createUser, grantUserPermission } from "@codespin/permiso-client";

const config = {
  endpoint: "http://localhost:5001",
  tenantId: "acme-corp", // Optional - omit for ROOT operations
};

await createUser(config, {
  id: "user-123",
  identityProvider: "auth0",
  identityProviderUserId: "auth0|123",
});
```

### GraphQL

```graphql
mutation {
  createUser(
    input: {
      id: "user-123"
      identityProvider: "auth0"
      identityProviderUserId: "auth0|123"
    }
  ) {
    id
    tenantId
  }
}
```

## Development

### Commands

```bash
./scripts/build.sh                  # Build all packages
./scripts/build.sh --install        # Build with forced dependency reinstall
./scripts/lint-all.sh               # Run ESLint
./scripts/format-all.sh             # Format with Prettier
npm test                            # Run all tests
npm run test:grep -- "pattern"      # Search tests
```

### Project Structure

```
/node/packages/
  permiso-core/           # Shared types and utilities
  permiso-db/             # SQLite database initialization
  permiso-logger/         # Logging utilities
  permiso-server/         # GraphQL server
  permiso-client/         # TypeScript client library
  permiso-test-utils/     # Test utilities
  permiso-integration-tests/  # Integration tests
```

### Key Files

- `database/permiso/migrations/` - Database schema
- `node/packages/permiso-server/src/schema.graphql` - GraphQL schema
- `node/packages/permiso-server/src/domain/` - Business logic
- `node/packages/permiso-server/src/repositories/sqlite/` - Data access

## Configuration

### Required Environment Variables

```bash
# Database
PERMISO_DATA_DIR=./data

# Server
PERMISO_SERVER_HOST=localhost
PERMISO_SERVER_PORT=5001

# Optional Bearer authentication
PERMISO_API_KEY=your-secret-token
PERMISO_API_KEY_ENABLED=true
```

## Testing

```bash
# Run all tests
npm test

# Search specific tests
npm run test:grep -- "Tenants"
npm run test:integration:grep -- "Users"
npm run test:client:grep -- "Permissions"
```

## Documentation

- [API Reference](docs/api.md) - GraphQL schema and examples
- [Architecture](docs/architecture.md) - System design details
- [Database](docs/database.md) - Database configuration
- [Configuration](docs/configuration.md) - All environment variables
- [Deployment](docs/deployment.md) - Production deployment guide
- [Coding Standards](CODING-STANDARDS.md) - Development conventions

## License

MIT

# API Reference

## GraphQL Endpoint

```
http://localhost:5001/graphql
```

## Headers

- `x-tenant-id`: Tenant ID (required for tenant-scoped operations)
- `Authorization`: Bearer token (if authentication enabled) - Format: `Bearer <token>`

## TypeScript Client

```bash
npm install @codespin/permiso-client
```

```typescript
import { createUser, hasPermission } from "@codespin/permiso-client";

const config = {
  endpoint: "http://localhost:5001",
  tenantId: "acme-corp",
};

await createUser(config, {
  id: "user-123",
  identityProvider: "auth0",
  identityProviderUserId: "auth0|123",
});
```

## Core Operations

### Tenants

```graphql
# Create
mutation {
  createTenant(input: { id: "acme-corp", name: "ACME Corporation" }) {
    id
    name
  }
}

# Query
query {
  tenant(id: "acme-corp") {
    id
    name
  }
  tenants {
    nodes {
      id
      name
    }
    totalCount
  }
}
```

### Users

```graphql
# Create
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

# Query
query {
  user(userId: "user-123") {
    id
    identityProvider
  }
  users {
    nodes {
      id
    }
    totalCount
  }
}
```

### Permissions

```graphql
# Grant to user
mutation {
  grantUserPermission(
    input: { userId: "user-123", resourceId: "/api/users/*", action: "read" }
  ) {
    userId
    resourceId
    action
  }
}

# Grant to role
mutation {
  grantRolePermission(
    input: { roleId: "admin", resourceId: "/api/*", action: "write" }
  ) {
    roleId
    resourceId
    action
  }
}

# Check permission
query {
  hasPermission(
    userId: "user-123"
    resourceId: "/api/users/456"
    action: "read"
  )
}

# Get effective permissions
query {
  effectivePermissions(userId: "user-123") {
    resourceId
    action
    source
  }
}
```

### Properties

```graphql
# Set property
mutation {
  setUserProperty(
    userId: "user-123"
    name: "settings"
    value: {"theme": "dark", "notifications": true}
  ) { name value }
}

# Query with property filter
query {
  users(filter: {
    properties: [
      { name: "department", value: "engineering" }
    ]
  }) {
    nodes { id }
  }
}
```

## Pagination

```graphql
query {
  users(
    pagination: { limit: 10, offset: 20 }
    sort: { field: id, order: DESC }
  ) {
    nodes {
      id
    }
    totalCount
  }
}
```

## Resource Patterns

Resources use path-like IDs with wildcard support:

- `/api/users` - Exact match
- `/api/users/*` - Direct children
- `/api/users/**` - All descendants
- `/api/*/read` - Pattern matching

## Error Handling

Errors follow GraphQL standard:

```json
{
  "errors": [
    {
      "message": "User not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

## Complete Schema

See `/node/packages/permiso-server/src/schema.graphql` for the complete GraphQL schema.

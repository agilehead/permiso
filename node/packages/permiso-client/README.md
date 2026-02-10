# @codespin/permiso-client

A TypeScript client library for the Permiso RBAC (Role-Based Access Control) API. This package provides a simple, type-safe way to interact with Permiso without needing to write GraphQL queries.

## Features

- 🔒 **Type-safe** - Full TypeScript support with comprehensive type definitions
- 🚀 **Zero GraphQL knowledge required** - Simple function calls instead of query strings
- ⚡ **Lightweight** - Minimal dependencies, tree-shakeable
- 🛡️ **Result types** - Explicit error handling with discriminated unions
- 🔄 **Consistent API** - Uniform patterns across all operations
- 📦 **Pagination support** - Built-in pagination for list operations
- 🔍 **Property filtering** - Filter entities by custom properties
- 🎯 **IDE friendly** - Full auto-completion and inline documentation

## Installation

```bash
npm install @codespin/permiso-client
```

## Quick Start

```typescript
import {
  createTenant,
  createUser,
  assignUserRole,
  hasPermission,
  PermisoConfig,
} from "@codespin/permiso-client";

// Configure the client
const config: PermisoConfig = {
  endpoint: "http://localhost:5001",
  apiKey: "your-bearer-token", // optional - will be sent as Bearer token
  timeout: 30000, // optional, in milliseconds
};

// Create a tenant
const tenantResult = await createTenant(config, {
  id: "acme-corp",
  name: "ACME Corporation",
  description: "A sample tenant",
});

if (tenantResult.success) {
  console.log("Created tenant:", tenantResult.data);
}

// Check if a user has permission
const hasPermResult = await hasPermission(config, {
  tenantId: "acme-corp",
  userId: "john-doe",
  resourceId: "/api/users/*",
  action: "read",
});

if (hasPermResult.success) {
  console.log("Has permission:", hasPermResult.data);
}
```

## Configuration

### Basic Configuration

```typescript
import { PermisoConfig } from "@codespin/permiso-client";

const config: PermisoConfig = {
  endpoint: "http://localhost:5001", // GraphQL endpoint URL
  apiKey: "your-bearer-token", // Optional: Bearer token for authentication
  timeout: 30000, // Optional: Request timeout in ms (default: 30000)
  headers: {
    // Optional: Additional headers
    "X-Custom-Header": "value",
  },
};
```

### Environment-based Configuration

```typescript
const config: PermisoConfig = {
  endpoint: process.env.PERMISO_ENDPOINT || "http://localhost:5001",
  apiKey: process.env.PERMISO_API_KEY,
  timeout: parseInt(process.env.PERMISO_TIMEOUT || "30000"),
};
```

## Error Handling

All functions return a `Result` type that explicitly handles success and failure cases:

```typescript
const result = await createUser(config, {
  id: "john-doe",
  tenantId: "acme-corp",
  identityProvider: "google",
  identityProviderUserId: "john@example.com",
});

if (result.success) {
  // Type-safe access to data
  console.log("User created:", result.data.id);
} else {
  // Type-safe access to error
  console.error("Failed to create user:", result.error.message);
}
```

## API Reference

### Tenants

- `getTenant(config, id)` - Get a tenant by ID
- `listTenants(config, options?)` - List tenants with optional filtering and pagination
- `getTenantsByIds(config, ids)` - Get multiple tenants by IDs
- `createTenant(config, input)` - Create a new tenant
- `updateTenant(config, id, input)` - Update a tenant
- `deleteTenant(config, id, safetyKey?)` - Delete a tenant
- `getTenantProperty(config, tenantId, propertyName)` - Get a specific property
- `setTenantProperty(config, tenantId, name, value, hidden?)` - Set a property
- `deleteTenantProperty(config, tenantId, name)` - Delete a property

### Users

- `getUser(config, tenantId, userId)` - Get a user
- `listUsers(config, tenantId, options?)` - List users with optional filtering and pagination
- `getUsersByIds(config, tenantId, ids)` - Get multiple users by IDs
- `getUsersByIdentity(config, identityProvider, identityProviderUserId)` - Find users by identity
- `createUser(config, input)` - Create a new user
- `updateUser(config, tenantId, userId, input)` - Update a user
- `deleteUser(config, tenantId, userId)` - Delete a user
- `getUserProperty(config, tenantId, userId, propertyName)` - Get a user property
- `setUserProperty(config, tenantId, userId, name, value, hidden?)` - Set a user property
- `deleteUserProperty(config, tenantId, userId, name)` - Delete a user property
- `assignUserRole(config, tenantId, userId, roleId)` - Assign a role to a user
- `unassignUserRole(config, tenantId, userId, roleId)` - Remove a role from a user

### Roles

- `getRole(config, tenantId, roleId)` - Get a role
- `listRoles(config, tenantId, options?)` - List roles with optional filtering and pagination
- `getRolesByIds(config, tenantId, ids)` - Get multiple roles by IDs
- `createRole(config, input)` - Create a new role
- `updateRole(config, tenantId, roleId, input)` - Update a role
- `deleteRole(config, tenantId, roleId)` - Delete a role
- `getRoleProperty(config, tenantId, roleId, propertyName)` - Get a role property
- `setRoleProperty(config, tenantId, roleId, name, value, hidden?)` - Set a role property
- `deleteRoleProperty(config, tenantId, roleId, name)` - Delete a role property

### Resources

- `getResource(config, tenantId, resourceId)` - Get a resource
- `listResources(config, tenantId, options?)` - List resources with optional filtering and pagination
- `getResourcesByIdPrefix(config, tenantId, idPrefix)` - Get resources by ID prefix
- `createResource(config, input)` - Create a new resource
- `updateResource(config, tenantId, resourceId, input)` - Update a resource
- `deleteResource(config, tenantId, resourceId)` - Delete a resource

### Permissions

- `hasPermission(config, params)` - Check if a user has permission
- `getUserPermissions(config, params)` - Get user permissions
- `getRolePermissions(config, params)` - Get role permissions
- `getEffectivePermissions(config, params)` - Get effective permissions for a user
- `getEffectivePermissionsByPrefix(config, params)` - Get effective permissions by resource prefix
- `grantUserPermission(config, input)` - Grant permission to a user
- `revokeUserPermission(config, params)` - Revoke permission from a user
- `grantRolePermission(config, input)` - Grant permission to a role
- `revokeRolePermission(config, params)` - Revoke permission from a role

## Pagination

List operations support pagination through the `PaginationInput` type:

```typescript
const result = await listUsers(config, "acme-corp", {
  pagination: {
    limit: 10,
    offset: 20,
    sortDirection: "DESC", // "ASC" or "DESC", defaults to "ASC"
  },
});

if (result.success) {
  console.log("Users:", result.data.nodes);
  console.log("Total count:", result.data.totalCount);
  console.log("Has next page:", result.data.pageInfo.hasNextPage);
}
```

## Filtering

List operations support filtering by properties:

```typescript
const result = await listUsers(config, "acme-corp", {
  filter: {
    properties: [
      { name: "department", value: "engineering" },
      { name: "active", value: true },
    ],
  },
});
```

```typescript
// Set a hidden property (e.g., for sensitive data)
await setUserProperty(
  config,
  "acme-corp",
  "john-doe",
  "apiToken",
  "secret-token-123",
  true, // hidden = true
);
```

### Property Filtering

Filter entities by their properties:

```typescript
// Set a property
const setPropResult = await setUserProperty(
  config,
  "acme-corp",
  "john-doe",
  "preferences",
  { theme: "dark", language: "en" },
  false, // not hidden
);

// Get a property
const getPropResult = await getUserProperty(
  config,
  "acme-corp",
  "john-doe",
  "preferences",
);

if (getPropResult.success && getPropResult.data) {
  console.log("User preferences:", getPropResult.data.value);
}
```

## Advanced Usage

### Batch Operations

For better performance when creating multiple entities:

```typescript
// Create multiple users efficiently
const users = [
  {
    id: "user-1",
    tenantId: "tenant-1",
    identityProvider: "auth0",
    identityProviderUserId: "auth0|123",
  },
  {
    id: "user-2",
    tenantId: "tenant-1",
    identityProvider: "auth0",
    identityProviderUserId: "auth0|456",
  },
  {
    id: "user-3",
    tenantId: "tenant-1",
    identityProvider: "auth0",
    identityProviderUserId: "auth0|789",
  },
];

const results = await Promise.all(
  users.map((user) => createUser(config, user)),
);

const failed = results.filter((r) => !r.success);
if (failed.length > 0) {
  console.error("Some users failed to create:", failed);
}
```

### Permission Checking Patterns

```typescript
// Check single permission
const canRead = await hasPermission(config, {
  tenantId: "acme-corp",
  userId: "john-doe",
  resourceId: "/api/users/*",
  action: "read",
});

// Check multiple permissions
const permissions = await Promise.all([
  hasPermission(config, {
    tenantId,
    userId,
    resourceId: "/api/users/*",
    action: "read",
  }),
  hasPermission(config, {
    tenantId,
    userId,
    resourceId: "/api/users/*",
    action: "write",
  }),
  hasPermission(config, {
    tenantId,
    userId,
    resourceId: "/api/billing/*",
    action: "read",
  }),
]);

const [canReadUsers, canWriteUsers, canReadBilling] = permissions.map(
  (r) => r.success && r.data,
);

// Get all effective permissions for a user
const effectivePerms = await getEffectivePermissions(config, {
  tenantId: "acme-corp",
  userId: "john-doe",
});

if (effectivePerms.success) {
  const groupedByResource = effectivePerms.data.reduce(
    (acc, perm) => {
      if (!acc[perm.resourceId]) acc[perm.resourceId] = [];
      acc[perm.resourceId].push(perm.action);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  console.log("Permissions by resource:", groupedByResource);
}
```

### Resource Path Patterns

Permiso uses Unix-like path patterns for resources:

```typescript
// Exact match
const resource1 = await createResource(config, {
  id: "/api/users",
  tenantId: "acme-corp",
  description: "User management API",
});

// Wildcard match (matches any sub-path)
const resource2 = await createResource(config, {
  id: "/api/users/*",
  tenantId: "acme-corp",
  description: "All user endpoints",
});

// Specific endpoint
const resource3 = await createResource(config, {
  id: "/api/users/profile",
  tenantId: "acme-corp",
  description: "User profile endpoint",
});

// Hierarchical resources
const resource4 = await createResource(config, {
  id: "/api/billing/invoices/*",
  tenantId: "acme-corp",
  description: "Invoice management",
});
```

### Handling Pagination

```typescript
// Fetch all users page by page
async function getAllUsers(config: PermisoConfig, tenantId: string) {
  const allUsers = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const result = await listUsers(config, tenantId, {
      pagination: { limit, offset },
    });

    if (!result.success) {
      throw new Error(`Failed to fetch users: ${result.error.message}`);
    }

    allUsers.push(...result.data.nodes);

    if (!result.data.pageInfo.hasNextPage) {
      break;
    }

    offset += limit;
  }

  return allUsers;
}
```

## Types

The client exports all TypeScript types from the Permiso API:

```typescript
import type {
  // Core entities
  Tenant,
  User,
  Role,
  Resource,
  Permission,
  Property,

  // Input types
  CreateTenantInput,
  CreateUserInput,
  CreateRoleInput,
  CreateResourceInput,
  UpdateTenantInput,
  UpdateUserInput,
  UpdateRoleInput,

  // Permission types
  UserPermission,
  RolePermission,
  EffectivePermission,

  // Utility types
  PaginationInput,
  Connection,
  PageInfo,
  Result,

  // Configuration
  PermisoConfig,
} from "@codespin/permiso-client";
```

## Best Practices

### 1. Configuration Management

Store configuration in a central location:

```typescript
// config/permiso.ts
export const permisoConfig: PermisoConfig = {
  endpoint: process.env.PERMISO_ENDPOINT!,
  apiKey: process.env.PERMISO_API_KEY,
};

// Usage in other files
import { permisoConfig } from "./config/permiso";
import { createUser } from "@codespin/permiso-client";

const result = await createUser(permisoConfig, userData);
```

### 2. Error Handling Wrapper

Create a wrapper for consistent error handling:

```typescript
async function executePermiso<T>(
  operation: Promise<Result<T>>,
  errorMessage: string,
): Promise<T> {
  const result = await operation;

  if (!result.success) {
    console.error(`${errorMessage}:`, result.error);
    throw new Error(`${errorMessage}: ${result.error.message}`);
  }

  return result.data;
}

// Usage
const user = await executePermiso(
  createUser(config, userData),
  "Failed to create user",
);
```

### 3. Type Guards

Use type guards for property values:

```typescript
interface UserPreferences {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
}

function isUserPreferences(value: unknown): value is UserPreferences {
  return (
    typeof value === "object" &&
    value !== null &&
    "theme" in value &&
    "language" in value &&
    "notifications" in value
  );
}

// Usage
const prefResult = await getUserProperty(config, tenantId, userId, "preferences");
if (prefResult.success && prefResult.data) {
  const value = prefResult.data.value;
  if (isUserPreferences(value)) {
    console.log("User theme:", value.theme);
  }
}
```

### 4. Resource Naming Conventions

Follow consistent patterns for resource IDs:

```typescript
// API endpoints
"/api/users";
"/api/users/*";
"/api/users/{id}";
"/api/users/{id}/profile";

// Feature-based
"/features/billing";
"/features/billing/*";
"/features/reporting";

// Service-based
"/services/auth";
"/services/notifications";
"/services/analytics/*";
```

## Troubleshooting

### Connection Issues

```typescript
// Add retry logic for transient failures
async function withRetry<T>(
  operation: () => Promise<Result<T>>,
  maxRetries = 3,
): Promise<Result<T>> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await operation();

    if (result.success || i === maxRetries - 1) {
      return result;
    }

    // Check if error is retryable
    if (
      result.error.message.includes("ECONNREFUSED") ||
      result.error.message.includes("ETIMEDOUT")
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      continue;
    }

    return result;
  }

  return { success: false, error: new Error("Max retries exceeded") };
}
```

### Debugging

Enable debug logging:

```typescript
// Create a debugging wrapper
function createDebugClient(config: PermisoConfig) {
  return new Proxy(
    {},
    {
      get(target, prop) {
        const original = (await import("@codespin/permiso-client"))[prop];
        if (typeof original === "function") {
          return async (...args) => {
            console.log(`Calling ${String(prop)} with:`, args);
            const result = await original(...args);
            console.log(`Result:`, result);
            return result;
          };
        }
        return original;
      },
    },
  );
}
```

## Migration Guide

### From Direct GraphQL

If migrating from direct GraphQL queries:

```typescript
// Before (GraphQL)
const query = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      tenantId
    }
  }
`;
const result = await graphqlClient.request(query, { input: userData });

// After (Client)
const result = await createUser(config, userData);
if (result.success) {
  console.log(result.data.id, result.data.tenantId);
}
```

## Testing

The client package includes comprehensive integration tests that verify all API operations against a real Permiso server.

### Running Tests

```bash
# From the project root
npm run test:client

# Run specific test suite
npm run test:client:grep -- "Tenants"
```

### Test Coverage

The test suite covers all API operations:

- **Tenants** (12 tests): CRUD, properties, pagination
- **Users** (11 tests): CRUD, role assignment, properties, search
- **Roles** (13 tests): CRUD, hidden properties, filtering
- **Resources** (13 tests): CRUD, wildcards, hierarchical paths
- **Permissions** (15 tests): Grants, effective permissions, inheritance

### Test Infrastructure

- Uses separate test database (`permiso_client_test`)
- Runs on port 5003 (isolated from main server)
- Database cleaned between tests
- Migrations run automatically

## API Stability

This client follows semantic versioning. The API is stable and breaking changes will only be introduced in major versions.

## Contributing

Contributions are welcome! Please see the main [Permiso repository](https://github.com/codespin-ai/permiso) for contribution guidelines.

## License

MIT © Codespin

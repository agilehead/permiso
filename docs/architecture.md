# Architecture

## System Design

Permiso uses SQLite with app-level tenant filtering for multi-tenant isolation.

```
┌─────────────────┐
│  GraphQL API    │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Context │ → Sets tenant ID
    └────┬────┘
         │
    ┌────▼────────────────┐
    │ Domain Functions    │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │ Repository Layer    │
    │ (tenant filtering)  │
    └────┬────────────────┘
         │
    ┌────▼────────────────┐
    │ SQLite Database     │
    └─────────────────────┘
```

## Multi-Tenancy

Tenant isolation is enforced at the repository layer. All queries include explicit `tenant_id` filtering:

- **With `x-tenant-id` header**: Repositories filter by the specified tenant
- **Without `x-tenant-id` header**: ROOT context for cross-tenant operations (e.g., tenant management)

## Data Model

### Core Tables

```sql
tenant
├── id (PK)
├── name
└── description

user
├── id (PK, composite with tenant_id)
├── tenant_id (FK)
├── identity_provider
└── identity_provider_user_id

role
├── id (PK, composite with tenant_id)
├── tenant_id (FK)
├── name
└── description

resource
├── id (PK, composite with tenant_id)
├── tenant_id (FK)
├── name
└── description

user_permission
├── user_id (FK)
├── resource_id
├── action
└── tenant_id (FK)

role_permission
├── role_id (FK)
├── resource_id
├── action
└── tenant_id (FK)

user_role
├── user_id (FK)
├── role_id (FK)
└── tenant_id (FK)
```

### Property Tables

Each entity has a corresponding property table for JSON metadata:

- `tenant_property`
- `user_property`
- `role_property`

## Code Organization

### Package Structure

- `permiso-core`: Shared types and utilities
- `permiso-db`: SQLite database initialization
- `permiso-logger`: Logging utilities
- `permiso-server`: GraphQL server, domain logic, and repositories
- `permiso-client`: TypeScript client library
- `permiso-test-utils`: Testing utilities
- `permiso-integration-tests`: Integration tests

### Design Patterns

- **No classes**: Only pure functions with explicit dependencies
- **Result types**: Error handling without exceptions
- **Repository pattern**: All database access through repository interfaces
- **Tinqer**: Type-safe query building for SQLite

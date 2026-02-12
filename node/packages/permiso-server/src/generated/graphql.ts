import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import { GraphQLContext } from "../context.js";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  JSON: { input: unknown; output: unknown };
};

export type CreateResourceInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateRoleInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  properties?: InputMaybe<Array<PropertyInput>>;
};

export type CreateTenantInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["ID"]["input"];
  name: Scalars["String"]["input"];
  properties?: InputMaybe<Array<PropertyInput>>;
};

export type CreateUserInput = {
  id: Scalars["ID"]["input"];
  identityProvider: Scalars["String"]["input"];
  identityProviderUserId: Scalars["String"]["input"];
  properties?: InputMaybe<Array<PropertyInput>>;
  roleIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type EffectivePermission = {
  __typename?: "EffectivePermission";
  action: Scalars["String"]["output"];
  createdAt: Scalars["Float"]["output"];
  resourceId: Scalars["ID"]["output"];
  source: Scalars["String"]["output"];
  sourceId: Maybe<Scalars["ID"]["output"]>;
};

export type GrantRolePermissionInput = {
  action: Scalars["String"]["input"];
  resourceId: Scalars["ID"]["input"];
  roleId: Scalars["ID"]["input"];
};

export type GrantUserPermissionInput = {
  action: Scalars["String"]["input"];
  resourceId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  assignUserRole: User;
  createResource: Resource;
  createRole: Role;
  createTenant: Tenant;
  createUser: User;
  deleteResource: Scalars["Boolean"]["output"];
  deleteRole: Scalars["Boolean"]["output"];
  deleteRoleProperty: Scalars["Boolean"]["output"];
  deleteTenant: Scalars["Boolean"]["output"];
  deleteTenantProperty: Scalars["Boolean"]["output"];
  deleteUser: Scalars["Boolean"]["output"];
  deleteUserProperty: Scalars["Boolean"]["output"];
  grantRolePermission: RolePermission;
  grantUserPermission: UserPermission;
  revokeRolePermission: Scalars["Boolean"]["output"];
  revokeUserPermission: Scalars["Boolean"]["output"];
  setRoleProperty: Property;
  setTenantProperty: Property;
  setUserProperty: Property;
  unassignUserRole: User;
  updateResource: Resource;
  updateRole: Role;
  updateTenant: Tenant;
  updateUser: User;
};

export type MutationAssignUserRoleArgs = {
  roleId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationCreateResourceArgs = {
  input: CreateResourceInput;
};

export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};

export type MutationCreateTenantArgs = {
  input: CreateTenantInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteResourceArgs = {
  resourceId: Scalars["ID"]["input"];
};

export type MutationDeleteRoleArgs = {
  roleId: Scalars["ID"]["input"];
};

export type MutationDeleteRolePropertyArgs = {
  name: Scalars["String"]["input"];
  roleId: Scalars["ID"]["input"];
};

export type MutationDeleteTenantArgs = {
  id: Scalars["ID"]["input"];
  safetyKey?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationDeleteTenantPropertyArgs = {
  name: Scalars["String"]["input"];
  tenantId: Scalars["ID"]["input"];
};

export type MutationDeleteUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationDeleteUserPropertyArgs = {
  name: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationGrantRolePermissionArgs = {
  input: GrantRolePermissionInput;
};

export type MutationGrantUserPermissionArgs = {
  input: GrantUserPermissionInput;
};

export type MutationRevokeRolePermissionArgs = {
  action: Scalars["String"]["input"];
  resourceId: Scalars["ID"]["input"];
  roleId: Scalars["ID"]["input"];
};

export type MutationRevokeUserPermissionArgs = {
  action: Scalars["String"]["input"];
  resourceId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationSetRolePropertyArgs = {
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  roleId: Scalars["ID"]["input"];
  value?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type MutationSetTenantPropertyArgs = {
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  tenantId: Scalars["ID"]["input"];
  value?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type MutationSetUserPropertyArgs = {
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
  value?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type MutationUnassignUserRoleArgs = {
  roleId: Scalars["ID"]["input"];
  userId: Scalars["ID"]["input"];
};

export type MutationUpdateResourceArgs = {
  input: UpdateResourceInput;
  resourceId: Scalars["ID"]["input"];
};

export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
  roleId: Scalars["ID"]["input"];
};

export type MutationUpdateTenantArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateTenantInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  userId: Scalars["ID"]["input"];
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor: Maybe<Scalars["String"]["output"]>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor: Maybe<Scalars["String"]["output"]>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  sortDirection?: InputMaybe<SortDirection>;
};

export type Permission = {
  action: Scalars["String"]["output"];
  createdAt: Scalars["Float"]["output"];
  resource: Resource;
  resourceId: Scalars["ID"]["output"];
  tenant: Tenant;
};

export type Property = {
  __typename?: "Property";
  createdAt: Scalars["Float"]["output"];
  hidden: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  value: Maybe<Scalars["JSON"]["output"]>;
};

export type PropertyFilter = {
  name: Scalars["String"]["input"];
  value?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type PropertyInput = {
  hidden?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
  value?: InputMaybe<Scalars["JSON"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  effectivePermissions: Array<EffectivePermission>;
  effectivePermissionsByPrefix: Array<EffectivePermission>;
  hasPermission: Scalars["Boolean"]["output"];
  resource: Maybe<Resource>;
  resources: ResourceConnection;
  resourcesByIdPrefix: Array<Resource>;
  role: Maybe<Role>;
  rolePermissions: Array<RolePermission>;
  roleProperty: Maybe<Property>;
  roles: RoleConnection;
  rolesByIds: Array<Role>;
  tenant: Maybe<Tenant>;
  tenantProperty: Maybe<Property>;
  tenants: TenantConnection;
  tenantsByIds: Array<Tenant>;
  user: Maybe<User>;
  userPermissions: Array<UserPermission>;
  userProperty: Maybe<Property>;
  users: UserConnection;
  usersByIdentity: Array<User>;
  usersByIds: Array<User>;
};

export type QueryEffectivePermissionsArgs = {
  action?: InputMaybe<Scalars["String"]["input"]>;
  resourceId: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type QueryEffectivePermissionsByPrefixArgs = {
  action?: InputMaybe<Scalars["String"]["input"]>;
  resourceIdPrefix: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type QueryHasPermissionArgs = {
  action: Scalars["String"]["input"];
  resourceId: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type QueryResourceArgs = {
  resourceId: Scalars["ID"]["input"];
};

export type QueryResourcesArgs = {
  filter?: InputMaybe<ResourceFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryResourcesByIdPrefixArgs = {
  idPrefix: Scalars["String"]["input"];
};

export type QueryRoleArgs = {
  roleId: Scalars["ID"]["input"];
};

export type QueryRolePermissionsArgs = {
  action?: InputMaybe<Scalars["String"]["input"]>;
  resourceId?: InputMaybe<Scalars["String"]["input"]>;
  roleId: Scalars["ID"]["input"];
};

export type QueryRolePropertyArgs = {
  propertyName: Scalars["String"]["input"];
  roleId: Scalars["ID"]["input"];
};

export type QueryRolesArgs = {
  filter?: InputMaybe<RoleFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryRolesByIdsArgs = {
  ids: Array<Scalars["ID"]["input"]>;
};

export type QueryTenantArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTenantPropertyArgs = {
  propertyName: Scalars["String"]["input"];
  tenantId: Scalars["ID"]["input"];
};

export type QueryTenantsArgs = {
  filter?: InputMaybe<TenantFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryTenantsByIdsArgs = {
  ids: Array<Scalars["ID"]["input"]>;
};

export type QueryUserArgs = {
  userId: Scalars["ID"]["input"];
};

export type QueryUserPermissionsArgs = {
  action?: InputMaybe<Scalars["String"]["input"]>;
  resourceId?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type QueryUserPropertyArgs = {
  propertyName: Scalars["String"]["input"];
  userId: Scalars["ID"]["input"];
};

export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type QueryUsersByIdentityArgs = {
  identityProvider: Scalars["String"]["input"];
  identityProviderUserId: Scalars["String"]["input"];
};

export type QueryUsersByIdsArgs = {
  ids: Array<Scalars["ID"]["input"]>;
};

export type Resource = {
  __typename?: "Resource";
  createdAt: Scalars["Float"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  permissions: Array<Permission>;
  tenant: Tenant;
  tenantId: Scalars["ID"]["output"];
  updatedAt: Scalars["Float"]["output"];
};

export type ResourceConnection = {
  __typename?: "ResourceConnection";
  nodes: Array<Resource>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type ResourceFilter = {
  idPrefix?: InputMaybe<Scalars["String"]["input"]>;
};

export type Role = {
  __typename?: "Role";
  createdAt: Scalars["Float"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  permissions: Array<RolePermission>;
  properties: Array<Property>;
  tenant: Tenant;
  tenantId: Scalars["ID"]["output"];
  updatedAt: Scalars["Float"]["output"];
  users: Array<User>;
};

export type RoleConnection = {
  __typename?: "RoleConnection";
  nodes: Array<Role>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type RoleFilter = {
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type RolePermission = Permission & {
  __typename?: "RolePermission";
  action: Scalars["String"]["output"];
  createdAt: Scalars["Float"]["output"];
  resource: Resource;
  resourceId: Scalars["ID"]["output"];
  role: Role;
  roleId: Scalars["ID"]["output"];
  tenant: Tenant;
};

export type SortDirection = "ASC" | "DESC";

export type Tenant = {
  __typename?: "Tenant";
  createdAt: Scalars["Float"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  properties: Array<Property>;
  resources: ResourceConnection;
  roles: RoleConnection;
  updatedAt: Scalars["Float"]["output"];
  users: UserConnection;
};

export type TenantResourcesArgs = {
  filter?: InputMaybe<ResourceFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type TenantRolesArgs = {
  filter?: InputMaybe<RoleFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type TenantUsersArgs = {
  filter?: InputMaybe<UserFilter>;
  pagination?: InputMaybe<PaginationInput>;
};

export type TenantConnection = {
  __typename?: "TenantConnection";
  nodes: Array<Tenant>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type TenantFilter = {
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type UpdateResourceInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateRoleInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateTenantInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateUserInput = {
  identityProvider?: InputMaybe<Scalars["String"]["input"]>;
  identityProviderUserId?: InputMaybe<Scalars["String"]["input"]>;
};

export type User = {
  __typename?: "User";
  createdAt: Scalars["Float"]["output"];
  effectivePermissions: Array<EffectivePermission>;
  id: Scalars["ID"]["output"];
  identityProvider: Scalars["String"]["output"];
  identityProviderUserId: Scalars["String"]["output"];
  permissions: Array<UserPermission>;
  properties: Array<Property>;
  roles: Array<Role>;
  tenant: Tenant;
  tenantId: Scalars["ID"]["output"];
  updatedAt: Scalars["Float"]["output"];
};

export type UserEffectivePermissionsArgs = {
  action?: InputMaybe<Scalars["String"]["input"]>;
  resourceId?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserConnection = {
  __typename?: "UserConnection";
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"]["output"];
};

export type UserFilter = {
  identityProvider?: InputMaybe<Scalars["String"]["input"]>;
  identityProviderUserId?: InputMaybe<Scalars["String"]["input"]>;
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type UserPermission = Permission & {
  __typename?: "UserPermission";
  action: Scalars["String"]["output"];
  createdAt: Scalars["Float"]["output"];
  resource: Resource;
  resourceId: Scalars["ID"]["output"];
  tenant: Tenant;
  user: User;
  userId: Scalars["ID"]["output"];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> =
  ResolversObject<{
    Permission:
      | (Omit<RolePermission, "resource" | "role" | "tenant"> & {
          resource: _RefType["Resource"];
          role: _RefType["Role"];
          tenant: _RefType["Tenant"];
        })
      | (Omit<UserPermission, "resource" | "tenant" | "user"> & {
          resource: _RefType["Resource"];
          tenant: _RefType["Tenant"];
          user: _RefType["User"];
        });
  }>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CreateResourceInput: CreateResourceInput;
  CreateRoleInput: CreateRoleInput;
  CreateTenantInput: CreateTenantInput;
  CreateUserInput: CreateUserInput;
  EffectivePermission: ResolverTypeWrapper<EffectivePermission>;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  GrantRolePermissionInput: GrantRolePermissionInput;
  GrantUserPermissionInput: GrantUserPermissionInput;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginationInput: PaginationInput;
  Permission: ResolverTypeWrapper<
    ResolversInterfaceTypes<ResolversTypes>["Permission"]
  >;
  Property: ResolverTypeWrapper<Property>;
  PropertyFilter: PropertyFilter;
  PropertyInput: PropertyInput;
  Query: ResolverTypeWrapper<{}>;
  Resource: ResolverTypeWrapper<
    Omit<Resource, "permissions" | "tenant"> & {
      permissions: Array<ResolversTypes["Permission"]>;
      tenant: ResolversTypes["Tenant"];
    }
  >;
  ResourceConnection: ResolverTypeWrapper<
    Omit<ResourceConnection, "nodes"> & {
      nodes: Array<ResolversTypes["Resource"]>;
    }
  >;
  ResourceFilter: ResourceFilter;
  Role: ResolverTypeWrapper<
    Omit<Role, "permissions" | "properties" | "tenant" | "users"> & {
      permissions: Array<ResolversTypes["RolePermission"]>;
      properties: Array<ResolversTypes["Property"]>;
      tenant: ResolversTypes["Tenant"];
      users: Array<ResolversTypes["User"]>;
    }
  >;
  RoleConnection: ResolverTypeWrapper<
    Omit<RoleConnection, "nodes"> & { nodes: Array<ResolversTypes["Role"]> }
  >;
  RoleFilter: RoleFilter;
  RolePermission: ResolverTypeWrapper<
    Omit<RolePermission, "resource" | "role" | "tenant"> & {
      resource: ResolversTypes["Resource"];
      role: ResolversTypes["Role"];
      tenant: ResolversTypes["Tenant"];
    }
  >;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Tenant: ResolverTypeWrapper<
    Omit<Tenant, "properties" | "resources" | "roles" | "users"> & {
      properties: Array<ResolversTypes["Property"]>;
      resources: ResolversTypes["ResourceConnection"];
      roles: ResolversTypes["RoleConnection"];
      users: ResolversTypes["UserConnection"];
    }
  >;
  TenantConnection: ResolverTypeWrapper<
    Omit<TenantConnection, "nodes"> & { nodes: Array<ResolversTypes["Tenant"]> }
  >;
  TenantFilter: TenantFilter;
  UpdateResourceInput: UpdateResourceInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateTenantInput: UpdateTenantInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<
    Omit<
      User,
      "effectivePermissions" | "permissions" | "properties" | "roles" | "tenant"
    > & {
      effectivePermissions: Array<ResolversTypes["EffectivePermission"]>;
      permissions: Array<ResolversTypes["UserPermission"]>;
      properties: Array<ResolversTypes["Property"]>;
      roles: Array<ResolversTypes["Role"]>;
      tenant: ResolversTypes["Tenant"];
    }
  >;
  UserConnection: ResolverTypeWrapper<
    Omit<UserConnection, "nodes"> & { nodes: Array<ResolversTypes["User"]> }
  >;
  UserFilter: UserFilter;
  UserPermission: ResolverTypeWrapper<
    Omit<UserPermission, "resource" | "tenant" | "user"> & {
      resource: ResolversTypes["Resource"];
      tenant: ResolversTypes["Tenant"];
      user: ResolversTypes["User"];
    }
  >;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"]["output"];
  CreateResourceInput: CreateResourceInput;
  CreateRoleInput: CreateRoleInput;
  CreateTenantInput: CreateTenantInput;
  CreateUserInput: CreateUserInput;
  EffectivePermission: EffectivePermission;
  Float: Scalars["Float"]["output"];
  GrantRolePermissionInput: GrantRolePermissionInput;
  GrantUserPermissionInput: GrantUserPermissionInput;
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  JSON: Scalars["JSON"]["output"];
  Mutation: {};
  PageInfo: PageInfo;
  PaginationInput: PaginationInput;
  Permission: ResolversInterfaceTypes<ResolversParentTypes>["Permission"];
  Property: Property;
  PropertyFilter: PropertyFilter;
  PropertyInput: PropertyInput;
  Query: {};
  Resource: Omit<Resource, "permissions" | "tenant"> & {
    permissions: Array<ResolversParentTypes["Permission"]>;
    tenant: ResolversParentTypes["Tenant"];
  };
  ResourceConnection: Omit<ResourceConnection, "nodes"> & {
    nodes: Array<ResolversParentTypes["Resource"]>;
  };
  ResourceFilter: ResourceFilter;
  Role: Omit<Role, "permissions" | "properties" | "tenant" | "users"> & {
    permissions: Array<ResolversParentTypes["RolePermission"]>;
    properties: Array<ResolversParentTypes["Property"]>;
    tenant: ResolversParentTypes["Tenant"];
    users: Array<ResolversParentTypes["User"]>;
  };
  RoleConnection: Omit<RoleConnection, "nodes"> & {
    nodes: Array<ResolversParentTypes["Role"]>;
  };
  RoleFilter: RoleFilter;
  RolePermission: Omit<RolePermission, "resource" | "role" | "tenant"> & {
    resource: ResolversParentTypes["Resource"];
    role: ResolversParentTypes["Role"];
    tenant: ResolversParentTypes["Tenant"];
  };
  String: Scalars["String"]["output"];
  Tenant: Omit<Tenant, "properties" | "resources" | "roles" | "users"> & {
    properties: Array<ResolversParentTypes["Property"]>;
    resources: ResolversParentTypes["ResourceConnection"];
    roles: ResolversParentTypes["RoleConnection"];
    users: ResolversParentTypes["UserConnection"];
  };
  TenantConnection: Omit<TenantConnection, "nodes"> & {
    nodes: Array<ResolversParentTypes["Tenant"]>;
  };
  TenantFilter: TenantFilter;
  UpdateResourceInput: UpdateResourceInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateTenantInput: UpdateTenantInput;
  UpdateUserInput: UpdateUserInput;
  User: Omit<
    User,
    "effectivePermissions" | "permissions" | "properties" | "roles" | "tenant"
  > & {
    effectivePermissions: Array<ResolversParentTypes["EffectivePermission"]>;
    permissions: Array<ResolversParentTypes["UserPermission"]>;
    properties: Array<ResolversParentTypes["Property"]>;
    roles: Array<ResolversParentTypes["Role"]>;
    tenant: ResolversParentTypes["Tenant"];
  };
  UserConnection: Omit<UserConnection, "nodes"> & {
    nodes: Array<ResolversParentTypes["User"]>;
  };
  UserFilter: UserFilter;
  UserPermission: Omit<UserPermission, "resource" | "tenant" | "user"> & {
    resource: ResolversParentTypes["Resource"];
    tenant: ResolversParentTypes["Tenant"];
    user: ResolversParentTypes["User"];
  };
}>;

export type EffectivePermissionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["EffectivePermission"] = ResolversParentTypes["EffectivePermission"],
> = ResolversObject<{
  action?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  resourceId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  source?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  sourceId?: Resolver<Maybe<ResolversTypes["ID"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"],
> = ResolversObject<{
  assignUserRole?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationAssignUserRoleArgs, "roleId" | "userId">
  >;
  createResource?: Resolver<
    ResolversTypes["Resource"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateResourceArgs, "input">
  >;
  createRole?: Resolver<
    ResolversTypes["Role"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateRoleArgs, "input">
  >;
  createTenant?: Resolver<
    ResolversTypes["Tenant"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateTenantArgs, "input">
  >;
  createUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserArgs, "input">
  >;
  deleteResource?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteResourceArgs, "resourceId">
  >;
  deleteRole?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteRoleArgs, "roleId">
  >;
  deleteRoleProperty?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteRolePropertyArgs, "name" | "roleId">
  >;
  deleteTenant?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTenantArgs, "id">
  >;
  deleteTenantProperty?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteTenantPropertyArgs, "name" | "tenantId">
  >;
  deleteUser?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteUserArgs, "userId">
  >;
  deleteUserProperty?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteUserPropertyArgs, "name" | "userId">
  >;
  grantRolePermission?: Resolver<
    ResolversTypes["RolePermission"],
    ParentType,
    ContextType,
    RequireFields<MutationGrantRolePermissionArgs, "input">
  >;
  grantUserPermission?: Resolver<
    ResolversTypes["UserPermission"],
    ParentType,
    ContextType,
    RequireFields<MutationGrantUserPermissionArgs, "input">
  >;
  revokeRolePermission?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<
      MutationRevokeRolePermissionArgs,
      "action" | "resourceId" | "roleId"
    >
  >;
  revokeUserPermission?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<
      MutationRevokeUserPermissionArgs,
      "action" | "resourceId" | "userId"
    >
  >;
  setRoleProperty?: Resolver<
    ResolversTypes["Property"],
    ParentType,
    ContextType,
    RequireFields<MutationSetRolePropertyArgs, "name" | "roleId">
  >;
  setTenantProperty?: Resolver<
    ResolversTypes["Property"],
    ParentType,
    ContextType,
    RequireFields<MutationSetTenantPropertyArgs, "name" | "tenantId">
  >;
  setUserProperty?: Resolver<
    ResolversTypes["Property"],
    ParentType,
    ContextType,
    RequireFields<MutationSetUserPropertyArgs, "name" | "userId">
  >;
  unassignUserRole?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationUnassignUserRoleArgs, "roleId" | "userId">
  >;
  updateResource?: Resolver<
    ResolversTypes["Resource"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateResourceArgs, "input" | "resourceId">
  >;
  updateRole?: Resolver<
    ResolversTypes["Role"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateRoleArgs, "input" | "roleId">
  >;
  updateTenant?: Resolver<
    ResolversTypes["Tenant"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateTenantArgs, "id" | "input">
  >;
  updateUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserArgs, "input" | "userId">
  >;
}>;

export type PageInfoResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["PageInfo"] = ResolversParentTypes["PageInfo"],
> = ResolversObject<{
  endCursor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  hasNextPage?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  hasPreviousPage?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType
  >;
  startCursor?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PermissionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Permission"] = ResolversParentTypes["Permission"],
> = ResolversObject<{
  __resolveType: TypeResolveFn<
    "RolePermission" | "UserPermission",
    ParentType,
    ContextType
  >;
  action?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes["Resource"], ParentType, ContextType>;
  resourceId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
}>;

export type PropertyResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Property"] = ResolversParentTypes["Property"],
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  hidden?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = ResolversObject<{
  effectivePermissions?: Resolver<
    Array<ResolversTypes["EffectivePermission"]>,
    ParentType,
    ContextType,
    RequireFields<QueryEffectivePermissionsArgs, "resourceId" | "userId">
  >;
  effectivePermissionsByPrefix?: Resolver<
    Array<ResolversTypes["EffectivePermission"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryEffectivePermissionsByPrefixArgs,
      "resourceIdPrefix" | "userId"
    >
  >;
  hasPermission?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<QueryHasPermissionArgs, "action" | "resourceId" | "userId">
  >;
  resource?: Resolver<
    Maybe<ResolversTypes["Resource"]>,
    ParentType,
    ContextType,
    RequireFields<QueryResourceArgs, "resourceId">
  >;
  resources?: Resolver<
    ResolversTypes["ResourceConnection"],
    ParentType,
    ContextType,
    Partial<QueryResourcesArgs>
  >;
  resourcesByIdPrefix?: Resolver<
    Array<ResolversTypes["Resource"]>,
    ParentType,
    ContextType,
    RequireFields<QueryResourcesByIdPrefixArgs, "idPrefix">
  >;
  role?: Resolver<
    Maybe<ResolversTypes["Role"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRoleArgs, "roleId">
  >;
  rolePermissions?: Resolver<
    Array<ResolversTypes["RolePermission"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRolePermissionsArgs, "roleId">
  >;
  roleProperty?: Resolver<
    Maybe<ResolversTypes["Property"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRolePropertyArgs, "propertyName" | "roleId">
  >;
  roles?: Resolver<
    ResolversTypes["RoleConnection"],
    ParentType,
    ContextType,
    Partial<QueryRolesArgs>
  >;
  rolesByIds?: Resolver<
    Array<ResolversTypes["Role"]>,
    ParentType,
    ContextType,
    RequireFields<QueryRolesByIdsArgs, "ids">
  >;
  tenant?: Resolver<
    Maybe<ResolversTypes["Tenant"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTenantArgs, "id">
  >;
  tenantProperty?: Resolver<
    Maybe<ResolversTypes["Property"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTenantPropertyArgs, "propertyName" | "tenantId">
  >;
  tenants?: Resolver<
    ResolversTypes["TenantConnection"],
    ParentType,
    ContextType,
    Partial<QueryTenantsArgs>
  >;
  tenantsByIds?: Resolver<
    Array<ResolversTypes["Tenant"]>,
    ParentType,
    ContextType,
    RequireFields<QueryTenantsByIdsArgs, "ids">
  >;
  user?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUserArgs, "userId">
  >;
  userPermissions?: Resolver<
    Array<ResolversTypes["UserPermission"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUserPermissionsArgs, "userId">
  >;
  userProperty?: Resolver<
    Maybe<ResolversTypes["Property"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUserPropertyArgs, "propertyName" | "userId">
  >;
  users?: Resolver<
    ResolversTypes["UserConnection"],
    ParentType,
    ContextType,
    Partial<QueryUsersArgs>
  >;
  usersByIdentity?: Resolver<
    Array<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<
      QueryUsersByIdentityArgs,
      "identityProvider" | "identityProviderUserId"
    >
  >;
  usersByIds?: Resolver<
    Array<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUsersByIdsArgs, "ids">
  >;
}>;

export type ResourceResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Resource"] = ResolversParentTypes["Resource"],
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  permissions?: Resolver<
    Array<ResolversTypes["Permission"]>,
    ParentType,
    ContextType
  >;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ResourceConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["ResourceConnection"] = ResolversParentTypes["ResourceConnection"],
> = ResolversObject<{
  nodes?: Resolver<Array<ResolversTypes["Resource"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RoleResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Role"] = ResolversParentTypes["Role"],
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  permissions?: Resolver<
    Array<ResolversTypes["RolePermission"]>,
    ParentType,
    ContextType
  >;
  properties?: Resolver<
    Array<ResolversTypes["Property"]>,
    ParentType,
    ContextType
  >;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes["User"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RoleConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RoleConnection"] = ResolversParentTypes["RoleConnection"],
> = ResolversObject<{
  nodes?: Resolver<Array<ResolversTypes["Role"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type RolePermissionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["RolePermission"] = ResolversParentTypes["RolePermission"],
> = ResolversObject<{
  action?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes["Resource"], ParentType, ContextType>;
  resourceId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  role?: Resolver<ResolversTypes["Role"], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["Tenant"] = ResolversParentTypes["Tenant"],
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  description?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  properties?: Resolver<
    Array<ResolversTypes["Property"]>,
    ParentType,
    ContextType
  >;
  resources?: Resolver<
    ResolversTypes["ResourceConnection"],
    ParentType,
    ContextType,
    Partial<TenantResourcesArgs>
  >;
  roles?: Resolver<
    ResolversTypes["RoleConnection"],
    ParentType,
    ContextType,
    Partial<TenantRolesArgs>
  >;
  updatedAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  users?: Resolver<
    ResolversTypes["UserConnection"],
    ParentType,
    ContextType,
    Partial<TenantUsersArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TenantConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["TenantConnection"] = ResolversParentTypes["TenantConnection"],
> = ResolversObject<{
  nodes?: Resolver<Array<ResolversTypes["Tenant"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["User"] = ResolversParentTypes["User"],
> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  effectivePermissions?: Resolver<
    Array<ResolversTypes["EffectivePermission"]>,
    ParentType,
    ContextType,
    Partial<UserEffectivePermissionsArgs>
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  identityProvider?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  identityProviderUserId?: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  permissions?: Resolver<
    Array<ResolversTypes["UserPermission"]>,
    ParentType,
    ContextType
  >;
  properties?: Resolver<
    Array<ResolversTypes["Property"]>,
    ParentType,
    ContextType
  >;
  roles?: Resolver<Array<ResolversTypes["Role"]>, ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UserConnection"] = ResolversParentTypes["UserConnection"],
> = ResolversObject<{
  nodes?: Resolver<Array<ResolversTypes["User"]>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes["PageInfo"], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserPermissionResolvers<
  ContextType = GraphQLContext,
  ParentType extends
    ResolversParentTypes["UserPermission"] = ResolversParentTypes["UserPermission"],
> = ResolversObject<{
  action?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes["Resource"], ParentType, ContextType>;
  resourceId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  tenant?: Resolver<ResolversTypes["Tenant"], ParentType, ContextType>;
  user?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = GraphQLContext> = ResolversObject<{
  EffectivePermission?: EffectivePermissionResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  Property?: PropertyResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Resource?: ResourceResolvers<ContextType>;
  ResourceConnection?: ResourceConnectionResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RoleConnection?: RoleConnectionResolvers<ContextType>;
  RolePermission?: RolePermissionResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantConnection?: TenantConnectionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserPermission?: UserPermissionResolvers<ContextType>;
}>;

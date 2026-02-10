export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: unknown; output: unknown; }
};

export type CreateResourceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type CreateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  properties?: InputMaybe<Array<PropertyInput>>;
};

export type CreateTenantInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  properties?: InputMaybe<Array<PropertyInput>>;
};

export type CreateUserInput = {
  id: Scalars['ID']['input'];
  identityProvider: Scalars['String']['input'];
  identityProviderUserId: Scalars['String']['input'];
  properties?: InputMaybe<Array<PropertyInput>>;
  roleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type EffectivePermission = {
  __typename?: 'EffectivePermission';
  action: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  resourceId: Scalars['ID']['output'];
  source: Scalars['String']['output'];
  sourceId: Maybe<Scalars['ID']['output']>;
};

export type GrantRolePermissionInput = {
  action: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};

export type GrantUserPermissionInput = {
  action: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignUserRole: User;
  createResource: Resource;
  createRole: Role;
  createTenant: Tenant;
  createUser: User;
  deleteResource: Scalars['Boolean']['output'];
  deleteRole: Scalars['Boolean']['output'];
  deleteRoleProperty: Scalars['Boolean']['output'];
  deleteTenant: Scalars['Boolean']['output'];
  deleteTenantProperty: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  deleteUserProperty: Scalars['Boolean']['output'];
  grantRolePermission: RolePermission;
  grantUserPermission: UserPermission;
  revokeRolePermission: Scalars['Boolean']['output'];
  revokeUserPermission: Scalars['Boolean']['output'];
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
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
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
  resourceId: Scalars['ID']['input'];
};


export type MutationDeleteRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type MutationDeleteRolePropertyArgs = {
  name: Scalars['String']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationDeleteTenantArgs = {
  id: Scalars['ID']['input'];
  safetyKey?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteTenantPropertyArgs = {
  name: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationDeleteUserPropertyArgs = {
  name: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationGrantRolePermissionArgs = {
  input: GrantRolePermissionInput;
};


export type MutationGrantUserPermissionArgs = {
  input: GrantUserPermissionInput;
};


export type MutationRevokeRolePermissionArgs = {
  action: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  roleId: Scalars['ID']['input'];
};


export type MutationRevokeUserPermissionArgs = {
  action: Scalars['String']['input'];
  resourceId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationSetRolePropertyArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationSetTenantPropertyArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationSetUserPropertyArgs = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationUnassignUserRoleArgs = {
  roleId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateResourceArgs = {
  input: UpdateResourceInput;
  resourceId: Scalars['ID']['input'];
};


export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
  roleId: Scalars['ID']['input'];
};


export type MutationUpdateTenantArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  userId: Scalars['ID']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor: Maybe<Scalars['String']['output']>;
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
};

export type Permission = {
  action: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  resource: Resource;
  resourceId: Scalars['ID']['output'];
  tenant: Tenant;
};

export type Property = {
  __typename?: 'Property';
  createdAt: Scalars['Float']['output'];
  hidden: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  value: Maybe<Scalars['JSON']['output']>;
};

export type PropertyFilter = {
  name: Scalars['String']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type PropertyInput = {
  hidden?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  value?: InputMaybe<Scalars['JSON']['input']>;
};

export type Query = {
  __typename?: 'Query';
  effectivePermissions: Array<EffectivePermission>;
  effectivePermissionsByPrefix: Array<EffectivePermission>;
  hasPermission: Scalars['Boolean']['output'];
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
  action?: InputMaybe<Scalars['String']['input']>;
  resourceId: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryEffectivePermissionsByPrefixArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  resourceIdPrefix: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryHasPermissionArgs = {
  action: Scalars['String']['input'];
  resourceId: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryResourceArgs = {
  resourceId: Scalars['ID']['input'];
};


export type QueryResourcesArgs = {
  filter?: InputMaybe<ResourceFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryResourcesByIdPrefixArgs = {
  idPrefix: Scalars['String']['input'];
};


export type QueryRoleArgs = {
  roleId: Scalars['ID']['input'];
};


export type QueryRolePermissionsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  resourceId?: InputMaybe<Scalars['String']['input']>;
  roleId: Scalars['ID']['input'];
};


export type QueryRolePropertyArgs = {
  propertyName: Scalars['String']['input'];
  roleId: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  filter?: InputMaybe<RoleFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryRolesByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryTenantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTenantPropertyArgs = {
  propertyName: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type QueryTenantsArgs = {
  filter?: InputMaybe<TenantFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryTenantsByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUserPermissionsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  resourceId?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};


export type QueryUserPropertyArgs = {
  propertyName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilter>;
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryUsersByIdentityArgs = {
  identityProvider: Scalars['String']['input'];
  identityProviderUserId: Scalars['String']['input'];
};


export type QueryUsersByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type Resource = {
  __typename?: 'Resource';
  createdAt: Scalars['Float']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  permissions: Array<Permission>;
  tenant: Tenant;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type ResourceConnection = {
  __typename?: 'ResourceConnection';
  nodes: Array<Resource>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ResourceFilter = {
  idPrefix?: InputMaybe<Scalars['String']['input']>;
};

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['Float']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<RolePermission>;
  properties: Array<Property>;
  tenant: Tenant;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['Float']['output'];
  users: Array<User>;
};

export type RoleConnection = {
  __typename?: 'RoleConnection';
  nodes: Array<Role>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type RoleFilter = {
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type RolePermission = Permission & {
  __typename?: 'RolePermission';
  action: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  resource: Resource;
  resourceId: Scalars['ID']['output'];
  role: Role;
  roleId: Scalars['ID']['output'];
  tenant: Tenant;
};

export type SortDirection =
  | 'ASC'
  | 'DESC';

export type Tenant = {
  __typename?: 'Tenant';
  createdAt: Scalars['Float']['output'];
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  properties: Array<Property>;
  resources: ResourceConnection;
  roles: RoleConnection;
  updatedAt: Scalars['Float']['output'];
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
  __typename?: 'TenantConnection';
  nodes: Array<Tenant>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type TenantFilter = {
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type UpdateResourceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTenantInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  identityProvider?: InputMaybe<Scalars['String']['input']>;
  identityProviderUserId?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['Float']['output'];
  effectivePermissions: Array<EffectivePermission>;
  id: Scalars['ID']['output'];
  identityProvider: Scalars['String']['output'];
  identityProviderUserId: Scalars['String']['output'];
  permissions: Array<UserPermission>;
  properties: Array<Property>;
  roles: Array<Role>;
  tenant: Tenant;
  tenantId: Scalars['ID']['output'];
  updatedAt: Scalars['Float']['output'];
};


export type UserEffectivePermissionsArgs = {
  action?: InputMaybe<Scalars['String']['input']>;
  resourceId?: InputMaybe<Scalars['String']['input']>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type UserFilter = {
  identityProvider?: InputMaybe<Scalars['String']['input']>;
  identityProviderUserId?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Array<PropertyFilter>>;
};

export type UserPermission = Permission & {
  __typename?: 'UserPermission';
  action: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  resource: Resource;
  resourceId: Scalars['ID']['output'];
  tenant: Tenant;
  user: User;
  userId: Scalars['ID']['output'];
};

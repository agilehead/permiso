import type { TenantWithProperties } from "../../types.js";
import { getTenantProperties } from "../../domain/tenant/get-tenant-properties.js";
import { getUsersByTenant } from "../../domain/user/get-users-by-tenant.js";
import { getRolesByTenant } from "../../domain/role/get-roles-by-tenant.js";
import { getResourcesByTenant } from "../../domain/resource/get-resources-by-tenant.js";
import type { DataContext } from "../../domain/data-context.js";

export const tenantFieldResolvers = {
  Tenant: {
    properties: async (
      parent: TenantWithProperties,
      _: unknown,
      context: DataContext,
    ) => {
      const result = await getTenantProperties(context, parent.id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },

    users: async (
      parent: TenantWithProperties,
      args: {
        filter?: {
          properties?: { name: string; value: unknown }[];
          ids?: string[];
          identityProvider?: string;
          identityProviderUserId?: string;
        };
        pagination?: { limit?: number; offset?: number };
      },
      context: DataContext,
    ) => {
      const result = await getUsersByTenant(
        context,
        parent.id,
        args.filter,
        args.pagination,
      );
      if (!result.success) {
        throw result.error;
      }

      // Get total count without pagination
      let totalCount = result.data.length;
      if (args.pagination) {
        const countResult = await getUsersByTenant(
          context,
          parent.id,
          args.filter,
        );
        if (countResult.success) {
          totalCount = countResult.data.length;
        }
      }

      const hasNextPage =
        args.pagination?.offset !== undefined &&
        args.pagination.limit !== undefined
          ? args.pagination.offset + args.pagination.limit < totalCount
          : false;
      const hasPreviousPage =
        args.pagination?.offset !== undefined
          ? args.pagination.offset > 0
          : false;

      return {
        nodes: result.data,
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: null,
          endCursor: null,
        },
      };
    },

    roles: async (
      parent: TenantWithProperties,
      args: {
        filter?: {
          properties?: { name: string; value: unknown }[];
          ids?: string[];
        };
        pagination?: { limit?: number; offset?: number };
      },
      context: DataContext,
    ) => {
      const result = await getRolesByTenant(
        context,
        parent.id,
        args.filter,
        args.pagination,
      );
      if (!result.success) {
        throw result.error;
      }

      // Get total count without pagination
      let totalCount = result.data.length;
      if (args.pagination) {
        const countResult = await getRolesByTenant(
          context,
          parent.id,
          args.filter,
        );
        if (countResult.success) {
          totalCount = countResult.data.length;
        }
      }

      const hasNextPage =
        args.pagination?.offset !== undefined &&
        args.pagination.limit !== undefined
          ? args.pagination.offset + args.pagination.limit < totalCount
          : false;
      const hasPreviousPage =
        args.pagination?.offset !== undefined
          ? args.pagination.offset > 0
          : false;

      return {
        nodes: result.data,
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: null,
          endCursor: null,
        },
      };
    },

    resources: async (
      parent: TenantWithProperties,
      args: {
        filter?: { idPrefix?: string };
        pagination?: { limit?: number; offset?: number };
      },
      context: DataContext,
    ) => {
      const result = await getResourcesByTenant(
        context,
        parent.id,
        args.filter,
        args.pagination,
      );

      if (!result.success) {
        throw result.error;
      }

      // Get total count without pagination
      let totalCount = result.data.length;
      if (args.pagination) {
        const countResult = await getResourcesByTenant(
          context,
          parent.id,
          args.filter,
        );
        if (countResult.success) {
          totalCount = countResult.data.length;
        }
      }

      const hasNextPage =
        args.pagination?.offset !== undefined &&
        args.pagination.limit !== undefined
          ? args.pagination.offset + args.pagination.limit < totalCount
          : false;
      const hasPreviousPage =
        args.pagination?.offset !== undefined
          ? args.pagination.offset > 0
          : false;

      return {
        nodes: result.data,
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: null,
          endCursor: null,
        },
      };
    },
  },
};

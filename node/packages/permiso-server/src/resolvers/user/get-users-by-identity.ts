import { getUsersByIdentity } from "../../domain/user/get-users-by-identity.js";
import type { DataContext } from "../../domain/data-context.js";

// Re-export domain function
export { getUsersByIdentity };

export const getUsersByIdentityResolver = {
  Query: {
    usersByIdentity: async (
      _: unknown,
      args: { identityProvider: string; identityProviderUserId: string },
      context: DataContext,
    ) => {
      const result = await getUsersByIdentity(
        context,
        args.identityProvider,
        args.identityProviderUserId,
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  },
};

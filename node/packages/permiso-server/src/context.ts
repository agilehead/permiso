import type { Repositories } from "./repositories/interfaces/index.js";

export type GraphQLContext = {
  repos: Repositories;
  tenantId: string;
};

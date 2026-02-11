export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

export type PermisoConfig = {
  /** The GraphQL endpoint URL */
  endpoint: string;
  /** Tenant ID for multi-tenant isolation (optional for ROOT context) */
  tenantId?: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Optional logger for debugging */
  logger?: Logger;
};

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

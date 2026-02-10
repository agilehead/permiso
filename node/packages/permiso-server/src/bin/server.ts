#!/usr/bin/env node
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { createLogger } from "@codespin/permiso-logger";
import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import { GraphQLError } from "graphql";
import { getTypeDefs } from "../index.js";
import { resolvers } from "../resolvers/index.js";
import { getBearerAuthConfig, validateBearerToken } from "../auth/bearer.js";
import {
  config,
  initializeDatabaseConfig,
  getHealthCheckDb,
  closeDatabaseConnections,
  createRequestRepositories,
} from "../config/index.js";

const logger = createLogger("permiso-server");

async function startServer(): Promise<void> {
  try {
    logger.info("Starting Permiso server", {
      nodeEnv: process.env.NODE_ENV,
      host: config.server.host,
      port: config.server.port,
    });

    // Initialize database configuration
    initializeDatabaseConfig();

    // Get Bearer authentication configuration
    const bearerConfig = getBearerAuthConfig();
    if (bearerConfig.enabled) {
      logger.info("Bearer authentication is enabled");
    }

    // Create Express app
    const app = express();

    if (config.isProduction) {
      app.set("trust proxy", 1);
    }

    // Create GraphQL server
    const server = new ApolloServer({
      typeDefs: getTypeDefs(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      resolvers: resolvers as any,
    });

    // Health check endpoint (no auth required) - before GraphQL setup
    app.get("/health", (_req: Request, res: Response) => {
      try {
        const db = getHealthCheckDb();
        if (db) {
          db.prepare("SELECT 1 as ok").get();
          res.status(200).json({ status: "ok" });
        } else {
          res.status(503).json({ status: "ok" });
        }
      } catch {
        res.status(503).json({ status: "ok" });
      }
    });

    // Start Apollo Server
    await server.start();

    // Apply GraphQL middleware
    app.use(
      "/graphql",
      cors(),
      express.json({ limit: "1mb" }),
      expressMiddleware(server, {
        // eslint-disable-next-line @typescript-eslint/require-await -- Apollo expressMiddleware requires async context function
        context: async ({ req }: { req: Request }) => {
          // Validate Bearer token if enabled
          const authHeader = req.headers.authorization;
          const validationResult = validateBearerToken(
            authHeader,
            bearerConfig,
          );

          if (!validationResult.success) {
            throw new GraphQLError(validationResult.error.message, {
              extensions: {
                code: "UNAUTHENTICATED",
                http: { status: 401 },
              },
            });
          }

          // Extract tenant ID from header (optional)
          const tenantId = req.headers["x-tenant-id"] as string | undefined;

          // Create repositories with app-level tenant filtering
          const repos = createRequestRepositories(tenantId);

          return {
            repos,
            tenantId: tenantId ?? "",
          };
        },
      }),
    );

    await new Promise<void>((resolve) => {
      app.listen(config.server.port, config.server.host, () => {
        resolve();
      });
    });

    logger.info("Permiso server started", {
      url: `http://${config.server.host}:${String(config.server.port)}`,
      graphql: `http://${config.server.host}:${String(config.server.port)}/graphql`,
    });

    // Graceful shutdown handling
    const shutdown = (): void => {
      logger.info("Shutting down server...");
      closeDatabaseConnections();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error("Failed to start server:", { message, stack });
    process.exit(1);
  }
}

void startServer();

import type { ChildProcess } from "child_process";
import { spawn } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { Logger } from "./test-logger.js";
import { testLogger } from "./test-logger.js";

// Get the project root directory (5 levels up from this file)
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../../../../..");

export type TestServerOptions = {
  port?: number;
  dataDir?: string;
  maxRetries?: number;
  retryDelay?: number;
  logger?: Logger;
};

export class TestServer {
  private process: ChildProcess | null = null;
  private port: number;
  private dataDir: string;
  private maxRetries: number;
  private retryDelay: number;
  private logger: Logger;

  constructor(options: TestServerOptions = {}) {
    this.port = options.port ?? 5002;
    // Use absolute path for data dir to avoid cwd issues
    const defaultDataDir = resolve(projectRoot, "data");
    this.dataDir =
      options.dataDir ?? process.env.PERMISO_DATA_DIR ?? defaultDataDir;
    this.maxRetries = options.maxRetries ?? 30;
    this.retryDelay = options.retryDelay ?? 1000;
    this.logger = options.logger ?? testLogger;
  }

  private async killProcessOnPort(): Promise<void> {
    try {
      // Find process using the port
      const { execSync } = await import("child_process");
      const pid = execSync(`lsof -ti:${this.port.toString()} || true`)
        .toString()
        .trim();

      if (pid !== "") {
        this.logger.debug(
          `Killing process ${pid} using port ${this.port.toString()}`,
        );
        execSync(`kill -9 ${pid}`);
        // Wait a bit for the process to die
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch {
      // Ignore errors - port might already be free
    }
  }

  async start(): Promise<void> {
    // Kill any process using the port first
    await this.killProcessOnPort();

    return new Promise((resolve, reject) => {
      this.logger.info(
        `Starting test server on port ${this.port.toString()} with SQLite database`,
      );

      const env: Record<string, string | undefined> = {
        ...process.env,
        NODE_ENV: "test",
        PERMISO_SERVER_PORT: this.port.toString(),
        PERMISO_SERVER_HOST: "localhost",
        PERMISO_DATA_DIR: this.dataDir,
        // Include API key settings - enabled by default for tests
        PERMISO_API_KEY: process.env.PERMISO_API_KEY ?? "test-token",
        PERMISO_API_KEY_ENABLED: process.env.PERMISO_API_KEY_ENABLED ?? "true",
      };

      // Start the server directly without shell script
      const serverPath = new URL(
        "../../../permiso-server/dist/bin/server.js",
        import.meta.url,
      ).pathname;

      this.process = spawn("node", [serverPath], {
        env,
        stdio: ["ignore", "pipe", "pipe"], // Capture both stdout and stderr
        cwd: new URL("../../../permiso-server/", import.meta.url).pathname,
      });

      let serverStarted = false;

      this.process.stdout?.on("data", (data: Buffer) => {
        const output = data.toString();
        // Pass server output to test logger for debugging
        this.logger.debug("[SERVER]", output.trim());

        // Check if server is ready
        if (
          output.includes("Permiso server started") ||
          output.includes("GraphQL server running") ||
          output.includes("Server running at")
        ) {
          serverStarted = true;
          resolve(); // Resolve immediately when server is ready
        }
      });

      // Capture stderr for error output
      this.process.stderr?.on("data", (data: Buffer) => {
        const output = data.toString();
        this.logger.error("[SERVER ERROR]", output.trim());
      });

      this.process.on("error", (error) => {
        this.logger.error("[SERVER PROCESS ERROR]", error);
        reject(error);
      });

      this.process.on("exit", (code) => {
        if (!serverStarted && code !== null && code !== 0) {
          this.logger.error(
            `[SERVER EXIT] Server exited with code ${String(code)}`,
          );
          reject(new Error(`Server exited with code ${String(code)}`));
        }
      });

      // Wait for server to be ready
      this.waitForServer()
        .then(() => {
          this.logger.info("Test server is ready");
          resolve();
        })
        .catch(reject);
    });
  }

  private async waitForServer(): Promise<void> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        const response = await fetch(
          `http://localhost:${this.port.toString()}/graphql`,
          {
            method: "GET",
            headers: { Accept: "text/html" },
          },
        );

        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
    }

    throw new Error(
      `Server failed to start after ${this.maxRetries.toString()} attempts`,
    );
  }

  async stop(): Promise<void> {
    if (this.process !== null) {
      const proc = this.process;
      return new Promise((resolve) => {
        let resolved = false;

        const cleanup = (): void => {
          if (!resolved) {
            resolved = true;
            this.process = null;
            resolve();
          }
        };

        // Set up exit handler
        proc.on("exit", cleanup);

        // Try graceful shutdown
        proc.kill("SIGTERM");

        // Force kill after 2 seconds and resolve
        setTimeout(() => {
          if (this.process !== null && !resolved) {
            this.process.kill("SIGKILL");
            // Also kill any process on the port just to be sure
            void this.killProcessOnPort().then(() => {
              // Give it a moment to actually die
              setTimeout(cleanup, 100);
            });
          }
        }, 2000);
      });
    }
  }
}

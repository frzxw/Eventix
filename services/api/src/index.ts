import { buildServer } from "./server";
import { config } from "./config/environment";
import { logger } from "./config/logger";
import { disposeServiceBus } from "./lib/serviceBus";

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: config.port, host: config.host });
    logger.info({ port: config.port, host: config.host }, "API listening");

    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down API");
      await disposeServiceBus();
      await app.close();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error({ err: error }, "Failed to start API service");
    process.exit(1);
  }
}

start();

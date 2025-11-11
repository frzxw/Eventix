import { logger } from "./config/logger";
import "./config/environment";
import { redis } from "./lib/redisClient";
import { runHoldCleanup } from "./jobs/releaseExpiredHolds";
import { setupApplicationInsights } from "./telemetry/applicationInsights";

async function main() {
  setupApplicationInsights();
  try {
    await runHoldCleanup();
    logger.info("Hold cleanup completed");
    await redis.quit();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Hold cleanup failed");
    await redis.quit();
    process.exit(1);
  }
}

void main();

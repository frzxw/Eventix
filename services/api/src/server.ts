import fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config/environment";
import { loggerOptions } from "./config/logger";
import { requestContext } from "./middleware/requestContext";
import { inventoryRoutes } from "./routes/inventory";
import { checkoutRoutes } from "./routes/checkout";
import { setupApplicationInsights } from "./telemetry/applicationInsights";

export async function buildServer() {
  setupApplicationInsights();
  const app = fastify({ logger: loggerOptions as any });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  if (config.rateLimit) {
    await app.register(rateLimit, {
      max: config.rateLimit.max,
      timeWindow: config.rateLimit.window,
      allowList: ["127.0.0.1"],
    });
  }

  await app.register(requestContext);
  await app.register(inventoryRoutes);
  await app.register(checkoutRoutes);

  app.get("/healthz", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
}

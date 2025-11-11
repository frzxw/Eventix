import Redis from "ioredis";
import { config } from "../config/environment";
import { logger } from "../config/logger";

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  keyPrefix: config.redis.keyPrefix,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10_000,
  tls: config.redis.tlsEnabled ? {} : undefined,
});

redis.on("ready", () => logger.info("Redis connected"));
redis.on("error", (error: Error) => logger.error({ err: error }, "Redis error"));

export { redis };

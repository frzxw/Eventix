import Redis from "ioredis";
import { config } from "../config/environment";
import { logger } from "../config/logger";

const redisTlsOptions = config.redis.tlsEnabled ? {} : undefined;

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  keyPrefix: config.redis.keyPrefix,
  enableAutoPipelining: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 10_000,
  keepAlive: 10_000,
  tls: redisTlsOptions,
});

redis.on("ready", () => {
  logger.info("Redis connection established");
});

redis.on("error", (error: Error) => {
  logger.error({ err: error }, "Redis connection error");
});

redis.on("end", () => {
  logger.warn("Redis connection closed");
});

export async function loadScript(lua: string): Promise<string> {
  const sha = (await redis.script("LOAD", lua)) as string | Buffer;
  return typeof sha === "string" ? sha : sha.toString();
}

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.string().optional(),
  API_HOST: z.string().optional(),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().min(1, "REDIS_KEY_PREFIX is required"),
  POSTGRES_CONNECTION_STRING: z.string().min(1, "POSTGRES_CONNECTION_STRING is required"),
  HOLD_TTL_SECONDS: z.string().min(1, "HOLD_TTL_SECONDS is required"),
  HOLD_EXPIRATION_SCAN_LIMIT: z.string().min(1, "HOLD_EXPIRATION_SCAN_LIMIT is required"),
  IDEMPOTENCY_TTL_SECONDS: z.string().min(1, "IDEMPOTENCY_TTL_SECONDS is required"),
  SERVICE_BUS_CONNECTION_STRING: z.string().min(1, "SERVICE_BUS_CONNECTION_STRING is required"),
  SERVICE_BUS_FINALIZATION_QUEUE: z.string().min(1, "SERVICE_BUS_FINALIZATION_QUEUE is required"),
  APPLICATION_INSIGHTS_CONNECTION_STRING: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW: z.string().optional(),
});

const rawEnv = envSchema.parse(process.env);

export const config = {
  nodeEnv: rawEnv.NODE_ENV,
  port: rawEnv.API_PORT ? Number(rawEnv.API_PORT) : 8080,
  host: rawEnv.API_HOST ?? "0.0.0.0",
  redis: {
    host: rawEnv.REDIS_HOST,
    port: Number(rawEnv.REDIS_PORT),
    password: rawEnv.REDIS_PASSWORD,
    tlsEnabled: rawEnv.REDIS_TLS_ENABLED === "true",
    keyPrefix: rawEnv.REDIS_KEY_PREFIX,
  },
  postgres: {
    connectionString: rawEnv.POSTGRES_CONNECTION_STRING,
  },
  hold: {
    ttlSeconds: Number(rawEnv.HOLD_TTL_SECONDS),
    expirationScanLimit: Number(rawEnv.HOLD_EXPIRATION_SCAN_LIMIT),
  },
  idempotency: {
    ttlSeconds: Number(rawEnv.IDEMPOTENCY_TTL_SECONDS),
  },
  serviceBus: {
    connectionString: rawEnv.SERVICE_BUS_CONNECTION_STRING,
    finalizationQueueName: rawEnv.SERVICE_BUS_FINALIZATION_QUEUE,
  },
  applicationInsightsConnectionString: rawEnv.APPLICATION_INSIGHTS_CONNECTION_STRING,
  rateLimit: rawEnv.RATE_LIMIT_MAX && rawEnv.RATE_LIMIT_WINDOW
    ? {
        max: Number(rawEnv.RATE_LIMIT_MAX),
        window: rawEnv.RATE_LIMIT_WINDOW,
      }
    : undefined,
} as const;

type Config = typeof config;
export type RedisConfig = Config["redis"];
export type HoldConfig = Config["hold"];
export type IdempotencyConfig = Config["idempotency"];
export type ServiceBusConfig = Config["serviceBus"];
export type PostgresConfig = Config["postgres"];
export type RateLimitConfig = Config["rateLimit"];

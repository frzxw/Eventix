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
  SERVICE_BUS_CONNECTION_STRING: z.string().optional(),
  SERVICE_BUS_FINALIZATION_QUEUE: z.string().optional(),
  QUEUE_MODE: z.enum(["servicebus", "redis"]).optional(),
  REDIS_FINALIZATION_QUEUE_KEY: z.string().optional(),
  REDIS_FINALIZATION_DLQ_KEY: z.string().optional(),
  APPLICATION_INSIGHTS_CONNECTION_STRING: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW: z.string().optional(),
});

const rawEnv = envSchema.parse(process.env);

type ServiceBusQueueConfigInternal = {
  mode: "servicebus";
  connectionString: string;
  finalizationQueueName: string;
};

type RedisQueueConfigInternal = {
  mode: "redis";
  redisQueueKey: string;
  redisDeadLetterKey: string;
};

type QueueConfigInternal = ServiceBusQueueConfigInternal | RedisQueueConfigInternal;

const detectedQueueMode = rawEnv.QUEUE_MODE ?? (rawEnv.SERVICE_BUS_CONNECTION_STRING ? "servicebus" : "redis");

let queueConfig: QueueConfigInternal;

if (detectedQueueMode === "servicebus") {
  if (!rawEnv.SERVICE_BUS_CONNECTION_STRING || rawEnv.SERVICE_BUS_CONNECTION_STRING.trim().length === 0) {
    throw new Error("SERVICE_BUS_CONNECTION_STRING is required when QUEUE_MODE is 'servicebus'");
  }
  const queueName = rawEnv.SERVICE_BUS_FINALIZATION_QUEUE && rawEnv.SERVICE_BUS_FINALIZATION_QUEUE.trim().length > 0
    ? rawEnv.SERVICE_BUS_FINALIZATION_QUEUE
    : "order-queue";
  queueConfig = {
    mode: "servicebus",
    connectionString: rawEnv.SERVICE_BUS_CONNECTION_STRING,
    finalizationQueueName: queueName,
  } as const;
} else {
  queueConfig = {
    mode: "redis",
    redisQueueKey: rawEnv.REDIS_FINALIZATION_QUEUE_KEY && rawEnv.REDIS_FINALIZATION_QUEUE_KEY.trim().length > 0
      ? rawEnv.REDIS_FINALIZATION_QUEUE_KEY
      : "queues:finalization",
    redisDeadLetterKey: rawEnv.REDIS_FINALIZATION_DLQ_KEY && rawEnv.REDIS_FINALIZATION_DLQ_KEY.trim().length > 0
      ? rawEnv.REDIS_FINALIZATION_DLQ_KEY
      : "queues:finalization:dead-letter",
  } as const;
}

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
  queue: queueConfig,
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
export type QueueConfig = Config["queue"];
export type PostgresConfig = Config["postgres"];
export type RateLimitConfig = Config["rateLimit"];
export type ServiceBusQueueConfig = Extract<QueueConfig, { mode: "servicebus" }>;
export type RedisQueueConfig = Extract<QueueConfig, { mode: "redis" }>;

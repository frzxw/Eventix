import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().min(1, "REDIS_KEY_PREFIX is required"),
  POSTGRES_CONNECTION_STRING: z.string().min(1, "POSTGRES_CONNECTION_STRING is required"),
  SERVICE_BUS_CONNECTION_STRING: z.string().optional(),
  SERVICE_BUS_FINALIZATION_QUEUE: z.string().optional(),
  QUEUE_MODE: z.enum(["servicebus", "redis"]).optional(),
  REDIS_FINALIZATION_QUEUE_KEY: z.string().optional(),
  REDIS_FINALIZATION_DLQ_KEY: z.string().optional(),
  WORKER_MAX_CONCURRENCY: z.string().optional(),
  APPLICATION_INSIGHTS_CONNECTION_STRING: z.string().optional(),
});

const raw = envSchema.parse(process.env);

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

const detectedQueueMode = raw.QUEUE_MODE ?? (raw.SERVICE_BUS_CONNECTION_STRING ? "servicebus" : "redis");

let queueConfig: QueueConfigInternal;

if (detectedQueueMode === "servicebus") {
  if (!raw.SERVICE_BUS_CONNECTION_STRING || raw.SERVICE_BUS_CONNECTION_STRING.trim().length === 0) {
    throw new Error("SERVICE_BUS_CONNECTION_STRING is required when QUEUE_MODE is 'servicebus'");
  }
  const queueName = raw.SERVICE_BUS_FINALIZATION_QUEUE && raw.SERVICE_BUS_FINALIZATION_QUEUE.trim().length > 0
    ? raw.SERVICE_BUS_FINALIZATION_QUEUE
    : "order-queue";
  queueConfig = {
    mode: "servicebus",
    connectionString: raw.SERVICE_BUS_CONNECTION_STRING,
    finalizationQueueName: queueName,
  } as const;
} else {
  queueConfig = {
    mode: "redis",
    redisQueueKey: raw.REDIS_FINALIZATION_QUEUE_KEY && raw.REDIS_FINALIZATION_QUEUE_KEY.trim().length > 0
      ? raw.REDIS_FINALIZATION_QUEUE_KEY
      : "queues:finalization",
    redisDeadLetterKey: raw.REDIS_FINALIZATION_DLQ_KEY && raw.REDIS_FINALIZATION_DLQ_KEY.trim().length > 0
      ? raw.REDIS_FINALIZATION_DLQ_KEY
      : "queues:finalization:dead-letter",
  } as const;
}

export const config = {
  nodeEnv: raw.NODE_ENV,
  redis: {
    host: raw.REDIS_HOST,
    port: Number(raw.REDIS_PORT),
    password: raw.REDIS_PASSWORD,
    tlsEnabled: raw.REDIS_TLS_ENABLED === "true",
    keyPrefix: raw.REDIS_KEY_PREFIX,
  },
  postgres: {
    connectionString: raw.POSTGRES_CONNECTION_STRING,
  },
  queue: queueConfig,
  worker: {
    maxConcurrency: raw.WORKER_MAX_CONCURRENCY ? Number(raw.WORKER_MAX_CONCURRENCY) : 5,
  },
  applicationInsightsConnectionString: raw.APPLICATION_INSIGHTS_CONNECTION_STRING,
} as const;

export type WorkerConfig = typeof config.worker;
export type QueueConfig = typeof config.queue;
export type ServiceBusQueueConfig = Extract<QueueConfig, { mode: "servicebus" }>;
export type RedisQueueConfig = Extract<QueueConfig, { mode: "redis" }>;

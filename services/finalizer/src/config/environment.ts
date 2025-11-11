import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().min(1, "REDIS_KEY_PREFIX is required"),
  POSTGRES_CONNECTION_STRING: z.string().min(1, "POSTGRES_CONNECTION_STRING is required"),
  SERVICE_BUS_CONNECTION_STRING: z.string().min(1, "SERVICE_BUS_CONNECTION_STRING is required"),
  SERVICE_BUS_FINALIZATION_QUEUE: z.string().min(1, "SERVICE_BUS_FINALIZATION_QUEUE is required"),
  WORKER_MAX_CONCURRENCY: z.string().optional(),
  APPLICATION_INSIGHTS_CONNECTION_STRING: z.string().optional(),
});

const raw = envSchema.parse(process.env);

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
  serviceBus: {
    connectionString: raw.SERVICE_BUS_CONNECTION_STRING,
    finalizationQueueName: raw.SERVICE_BUS_FINALIZATION_QUEUE,
  },
  worker: {
    maxConcurrency: raw.WORKER_MAX_CONCURRENCY ? Number(raw.WORKER_MAX_CONCURRENCY) : 5,
  },
  applicationInsightsConnectionString: raw.APPLICATION_INSIGHTS_CONNECTION_STRING,
} as const;

export type WorkerConfig = typeof config.worker;

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().min(1, "REDIS_PORT is required"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS_ENABLED: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().min(1, "REDIS_KEY_PREFIX is required"),
  HOLD_EXPIRATION_SCAN_LIMIT: z.string().min(1, "HOLD_EXPIRATION_SCAN_LIMIT is required"),
  HOLD_RELEASE_RETAIN_SECONDS: z.string().min(1, "HOLD_RELEASE_RETAIN_SECONDS is required"),
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
  hold: {
    scanLimit: Number(raw.HOLD_EXPIRATION_SCAN_LIMIT),
    retainSeconds: Number(raw.HOLD_RELEASE_RETAIN_SECONDS),
  },
  applicationInsightsConnectionString: raw.APPLICATION_INSIGHTS_CONNECTION_STRING,
} as const;

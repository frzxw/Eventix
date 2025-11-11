import type { FastifyBaseLogger } from "fastify";
import pino, { type LoggerOptions as PinoLoggerOptions } from "pino";
import { config } from "./environment";

export const loggerOptions: PinoLoggerOptions = {
  level: config.nodeEnv === "production" ? "info" : "debug",
  transport:
    config.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: {
            singleLine: true,
            colorize: true,
            ignore: "pid,hostname",
          },
        }
      : undefined,
};

const baseLogger = pino(loggerOptions);

export const logger: FastifyBaseLogger = baseLogger as unknown as FastifyBaseLogger;


import pino from "pino";
import { config } from "./environment";

export const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  transport: config.nodeEnv === "development" ? {
    target: "pino-pretty",
    options: {
      singleLine: true,
      colorize: true,
      ignore: "pid,hostname",
    },
  } : undefined,
});

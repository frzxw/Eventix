import type { IncomingMessage, ServerResponse } from "http";
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

type LoggableRequest = IncomingMessage & { traceId?: string };

type LoggableResponse = ServerResponse & { traceId?: string };

export function logProcessingMetrics(req: LoggableRequest, res: LoggableResponse) {
  logger.info({ traceId: req.traceId, statusCode: res.statusCode }, "message processed");
}

import type { ProcessErrorArgs, ServiceBusReceivedMessage } from "@azure/service-bus";
import { config, type ServiceBusQueueConfig, type RedisQueueConfig } from "./config/environment";
import { logger } from "./config/logger";
import { createFinalizationReceiver, completeMessage, abandonMessage, deadLetterMessage, closeServiceBus } from "./lib/serviceBus";
import { redis } from "./lib/redisClient";
import { processFinalizationMessage, type FinalizationMessage } from "./processors/finalizeOrder";
import { setupApplicationInsights } from "./telemetry/applicationInsights";

setupApplicationInsights();

type RedisQueueEnvelope = {
  payload: FinalizationMessage;
  attempts: number;
  messageId: string;
  correlationId?: string;
  enqueuedAt: string;
  failedAt?: string;
  error?: string;
};

const MAX_RETRY_ATTEMPTS = 5;
let shuttingDown = false;

function runServiceBusWorker(_: ServiceBusQueueConfig) {
  const receiver = createFinalizationReceiver();

  function parseMessage(message: ServiceBusReceivedMessage) {
    if (!message.body) {
      throw new Error("Message body is empty");
    }

    if (typeof message.body === "string") {
      return JSON.parse(message.body);
    }

    if (Buffer.isBuffer(message.body)) {
      return JSON.parse(message.body.toString("utf-8"));
    }

    return message.body;
  }

  async function handleMessage(message: ServiceBusReceivedMessage) {
    const payload = parseMessage(message);
    await processFinalizationMessage(payload as FinalizationMessage);
    await completeMessage(receiver, message);
  }

  async function handleFailure(message: ServiceBusReceivedMessage, error: Error) {
    logger.error({ err: error, deliveryCount: message.deliveryCount }, "Failed to process finalization message");
    if (message.deliveryCount && message.deliveryCount >= MAX_RETRY_ATTEMPTS) {
      await deadLetterMessage(receiver, message, "processing-failed", error.message);
    } else {
      await abandonMessage(receiver, message);
    }
  }

  receiver.subscribe(
    {
      processMessage: async (message: ServiceBusReceivedMessage) => {
        try {
          await handleMessage(message);
        } catch (error) {
          await handleFailure(message, error as Error);
        }
      },
      processError: async (args: ProcessErrorArgs) => {
        logger.error({ err: args.error }, "Service Bus receiver error");
      },
    },
    {
      maxConcurrentCalls: config.worker.maxConcurrency,
    }
  );

  return receiver;
}

async function runRedisWorker(queueConfig: RedisQueueConfig) {
  logger.info("Starting Redis-based finalization queue consumer");
  while (!shuttingDown) {
    try {
      const result = await redis.brpop(queueConfig.redisQueueKey, 5);
      if (!result) {
        continue;
      }

      const [, raw] = result;
      let envelope: RedisQueueEnvelope;
      try {
        envelope = JSON.parse(raw) as RedisQueueEnvelope;
      } catch (parseError) {
        logger.error({ err: parseError }, "Failed to parse Redis finalization payload; discarding message");
        continue;
      }

      try {
        await processFinalizationMessage(envelope.payload);
        logger.info({ messageId: envelope.messageId }, "Processed finalization message from Redis queue");
      } catch (processingError) {
        const nextAttempts = envelope.attempts + 1;
        if (nextAttempts >= MAX_RETRY_ATTEMPTS) {
          const deadLetterEnvelope: RedisQueueEnvelope = {
            ...envelope,
            attempts: nextAttempts,
            failedAt: new Date().toISOString(),
            error: (processingError as Error).message,
          };
          await redis.lpush(queueConfig.redisDeadLetterKey, JSON.stringify(deadLetterEnvelope));
          logger.error(
            { err: processingError, messageId: envelope.messageId },
            "Moved Redis finalization message to dead-letter queue"
          );
        } else {
          await redis.lpush(
            queueConfig.redisQueueKey,
            JSON.stringify({ ...envelope, attempts: nextAttempts })
          );
          logger.warn(
            { err: processingError, messageId: envelope.messageId, attempts: nextAttempts },
            "Requeued Redis finalization message for retry"
          );
        }
      }
    } catch (error) {
      if (shuttingDown) {
        break;
      }
      logger.error({ err: error }, "Redis finalization consumer error");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  logger.info("Redis finalization queue consumer stopped");
}

let serviceBusReceiver: ReturnType<typeof createFinalizationReceiver> | undefined;
if (config.queue.mode === "servicebus") {
  serviceBusReceiver = runServiceBusWorker(config.queue);
} else {
  void runRedisWorker(config.queue);
}

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "Shutting down finalizer worker");

  if (config.queue.mode === "servicebus") {
    if (serviceBusReceiver) {
      await serviceBusReceiver.close();
    }
    await closeServiceBus();
  } else {
    redis.disconnect();
  }

  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

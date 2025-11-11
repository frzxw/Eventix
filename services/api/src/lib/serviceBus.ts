import { ServiceBusClient, type ServiceBusSender } from "@azure/service-bus";
import { randomUUID } from "crypto";
import { config, type ServiceBusQueueConfig } from "../config/environment";
import { logger } from "../config/logger";
import { redis } from "./redisClient";

export type FinalizationMessage = {
  orderId: string;
  holdToken: string;
  eventId: string;
  paymentMethod: string;
  paymentReference?: string;
  items: Array<{
    categoryId: string;
    quantity: number;
  }>;
};

type QueueEnvelope = {
  payload: FinalizationMessage;
  attempts: number;
  messageId: string;
  correlationId?: string;
  enqueuedAt: string;
};

type SendOptions = {
  correlationId?: string;
  messageId?: string;
  attempts?: number;
};

let client: ServiceBusClient | undefined;
let finalizationSender: ServiceBusSender | undefined;

function assertServiceBusEnabled(): ServiceBusQueueConfig {
  if (config.queue.mode !== "servicebus") {
    throw new Error("Service Bus queue mode is not enabled");
  }

  return config.queue;
}

function ensureServiceBusSender(): ServiceBusSender {
  const sbConfig = assertServiceBusEnabled();
  if (!client) {
    client = new ServiceBusClient(sbConfig.connectionString);
  }
  if (!finalizationSender) {
    finalizationSender = client.createSender(sbConfig.finalizationQueueName);
  }
  return finalizationSender;
}

export async function sendFinalizationMessage(payload: FinalizationMessage, options: SendOptions = {}): Promise<void> {
  const messageId = options.messageId ?? randomUUID();
  const correlationId = options.correlationId;

  if (config.queue.mode === "servicebus") {
    const sender = ensureServiceBusSender();
    await sender.sendMessages({
      body: payload,
      contentType: "application/json",
      correlationId,
      messageId,
    });
    logger.info({ messageId }, "Enqueued finalization event via Service Bus");
    return;
  }

  const envelope: QueueEnvelope = {
    payload,
    attempts: options.attempts ?? 0,
    messageId,
    correlationId,
    enqueuedAt: new Date().toISOString(),
  };

  await redis.rpush(config.queue.redisQueueKey, JSON.stringify(envelope));
  logger.info({ messageId }, "Enqueued finalization event via Redis queue");
}

export async function disposeServiceBus(): Promise<void> {
  if (config.queue.mode !== "servicebus") {
    return;
  }

  if (finalizationSender) {
    await finalizationSender.close();
    finalizationSender = undefined;
  }

  if (client) {
    await client.close();
    client = undefined;
  }
}

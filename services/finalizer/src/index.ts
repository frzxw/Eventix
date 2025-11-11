import type { ProcessErrorArgs, ServiceBusReceivedMessage } from "@azure/service-bus";
import { config } from "./config/environment";
import { logger } from "./config/logger";
import { createFinalizationReceiver, completeMessage, abandonMessage, deadLetterMessage, closeServiceBus } from "./lib/serviceBus";
import { processFinalizationMessage } from "./processors/finalizeOrder";
import { setupApplicationInsights } from "./telemetry/applicationInsights";

setupApplicationInsights();

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
  await processFinalizationMessage(payload);
  await completeMessage(receiver, message);
}

async function handleFailure(message: ServiceBusReceivedMessage, error: Error) {
  logger.error({ err: error, deliveryCount: message.deliveryCount }, "Failed to process finalization message");
  if (message.deliveryCount && message.deliveryCount >= 5) {
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

async function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down finalizer worker");
  await receiver.close();
  await closeServiceBus();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

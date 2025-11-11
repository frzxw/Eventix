import { ServiceBusClient, type ServiceBusReceivedMessage, type ServiceBusReceiver } from "@azure/service-bus";
import { config, type ServiceBusQueueConfig } from "../config/environment";

let client: ServiceBusClient | undefined;
let receiver: ServiceBusReceiver | undefined;

function assertServiceBusEnabled(): ServiceBusQueueConfig {
  if (config.queue.mode !== "servicebus") {
    throw new Error("Service Bus queue mode is not enabled");
  }
  return config.queue;
}

function ensureClient(): ServiceBusClient {
  const sbConfig = assertServiceBusEnabled();
  if (!client) {
    client = new ServiceBusClient(sbConfig.connectionString);
  }
  return client;
}

export function createFinalizationReceiver(): ServiceBusReceiver {
  const sbConfig = assertServiceBusEnabled();
  if (!receiver) {
    receiver = ensureClient().createReceiver(sbConfig.finalizationQueueName, {
      receiveMode: "peekLock",
    });
  }
  return receiver;
}

export async function completeMessage(activeReceiver: ServiceBusReceiver, message: ServiceBusReceivedMessage) {
  await activeReceiver.completeMessage(message);
}

export async function abandonMessage(activeReceiver: ServiceBusReceiver, message: ServiceBusReceivedMessage) {
  await activeReceiver.abandonMessage(message);
}

export async function deadLetterMessage(activeReceiver: ServiceBusReceiver, message: ServiceBusReceivedMessage, reason: string, description?: string) {
  await activeReceiver.deadLetterMessage(message, {
    deadLetterReason: reason,
    deadLetterErrorDescription: description ?? reason,
  });
}

export async function closeServiceBus(): Promise<void> {
  if (receiver) {
    await receiver.close();
    receiver = undefined;
  }
  if (client) {
    await client.close();
    client = undefined;
  }
}

import { ServiceBusClient, type ServiceBusReceivedMessage, type ServiceBusReceiver } from "@azure/service-bus";
import { config } from "../config/environment";

const client = new ServiceBusClient(config.serviceBus.connectionString);

export function createFinalizationReceiver(): ServiceBusReceiver {
  return client.createReceiver(config.serviceBus.finalizationQueueName, {
    receiveMode: "peekLock",
  });
}

export async function completeMessage(receiver: ServiceBusReceiver, message: ServiceBusReceivedMessage) {
  await receiver.completeMessage(message);
}

export async function abandonMessage(receiver: ServiceBusReceiver, message: ServiceBusReceivedMessage) {
  await receiver.abandonMessage(message);
}

export async function deadLetterMessage(receiver: ServiceBusReceiver, message: ServiceBusReceivedMessage, reason: string, description?: string) {
  await receiver.deadLetterMessage(message, {
    deadLetterReason: reason,
    deadLetterErrorDescription: description ?? reason,
  });
}

export async function closeServiceBus(): Promise<void> {
  await client.close();
}

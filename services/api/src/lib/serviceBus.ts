import { ServiceBusClient, type ServiceBusMessage } from "@azure/service-bus";
import { config } from "../config/environment";
import { logger } from "../config/logger";

const client = new ServiceBusClient(config.serviceBus.connectionString);
const finalizationSender = client.createSender(config.serviceBus.finalizationQueueName);

export async function sendFinalizationMessage(message: ServiceBusMessage): Promise<void> {
  await finalizationSender.sendMessages(message);
  logger.info({ messageId: message.messageId }, "Enqueued finalization event");
}

export async function disposeServiceBus(): Promise<void> {
  await finalizationSender.close();
  await client.close();
}

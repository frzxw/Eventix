import { ServiceBusClient, ServiceBusMessage } from '@azure/service-bus';

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const finalizationQueueName = process.env.SERVICE_BUS_FINALIZATION_QUEUE || 'order-queue';

let cachedClient: ServiceBusClient | null = null;

function getClient(): ServiceBusClient {
  if (!connectionString) {
    throw new Error('SERVICE_BUS_CONNECTION_STRING environment variable is not set');
  }

  if (!cachedClient) {
    cachedClient = new ServiceBusClient(connectionString);
  }

  return cachedClient;
}

export async function sendToFinalizationQueue(messageBody: Record<string, unknown>): Promise<void> {
  const client = getClient();

  const sender = client.createSender(finalizationQueueName);
  const message: ServiceBusMessage = {
    body: messageBody,
    contentType: 'application/json',
    subject: 'order.finalize',
    applicationProperties: {
      schemaVersion: '1.0.0',
    },
  };

  try {
    await sender.sendMessages(message);
  } finally {
    await sender.close();
  }
}

export async function closeServiceBus(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}

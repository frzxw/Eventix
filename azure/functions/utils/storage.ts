/**
 * Minimal Azure Blob Storage helper for Functions
 */
import { BlobServiceClient } from '@azure/storage-blob';

function getBlobServiceClient(): BlobServiceClient | null {
  const conn = process.env.BLOB_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage;
  if (!conn) return null;
  return BlobServiceClient.fromConnectionString(conn);
}

export async function uploadBufferToBlob(buffer: Buffer, container: string, blobName: string): Promise<string | null> {
  const client = getBlobServiceClient();
  if (!client) return null;
  const containerClient = client.getContainerClient(container);
  await containerClient.createIfNotExists({ access: 'blob' });
  const blockBlob = containerClient.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: 'image/png' } });
  return blockBlob.url;
}

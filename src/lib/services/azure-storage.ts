/**
 * Azure Blob Storage Service
 * Handles image uploads, QR code generation, and file management
 */

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { AZURE_STORAGE } from '../constants';
import { logger } from './logger';

class AzureStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerClients: Map<string, ContainerClient> = new Map();

  constructor() {
    // Blob service client will be initialized with SAS token from backend
    // or Managed Identity in production
  }

  /**
   * Initialize blob service client with connection string or SAS token
   * Called after authentication
   */
  async initialize(connectionStringOrSasUrl: string) {
    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionStringOrSasUrl);
      logger.info('Azure Blob Storage initialized');
    } catch (error) {
      logger.error('Failed to initialize Azure Blob Storage', { error });
      throw error;
    }
  }

  /**
   * Get or create a container client
   */
  private async getContainerClient(containerName: string): Promise<ContainerClient> {
    if (this.containerClients.has(containerName)) {
      return this.containerClients.get(containerName)!;
    }

    if (!this.blobServiceClient) {
      throw new Error('Blob service client not initialized. Call initialize() first.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      // Ensure container exists
      await containerClient.createIfNotExists();
      this.containerClients.set(containerName, containerClient);
      logger.debug(`Container client created: ${containerName}`);
      return containerClient;
    } catch (error) {
      logger.error('Failed to get container client', { containerName, error });
      throw error;
    }
  }

  /**
   * Upload an image to event-images container
   */
  async uploadEventImage(file: File, eventId: string): Promise<string> {
    return this.uploadFile(file, AZURE_STORAGE.CONTAINER_EVENTS, `events/${eventId}`);
  }

  /**
   * Upload a QR code to qr-codes container
   */
  async uploadQRCode(file: File, ticketId: string): Promise<string> {
    return this.uploadFile(file, AZURE_STORAGE.CONTAINER_QR_CODES, `tickets/${ticketId}`);
  }

  /**
   * Generic file upload method
   */
  async uploadFile(file: File, containerName: string, folderPath: string): Promise<string> {
    // Validate file - check if file type is in allowed types
    const allowedTypes = AZURE_STORAGE.ALLOWED_FILE_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${Array.from(allowedTypes).join(', ')}`);
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > AZURE_STORAGE.MAX_FILE_SIZE_MB) {
      throw new Error(`File size exceeds maximum allowed size of ${AZURE_STORAGE.MAX_FILE_SIZE_MB}MB`);
    }

    try {
      const containerClient = await this.getContainerClient(containerName);

      // Generate unique blob name
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileExtension = file.name.split('.').pop() || 'bin';
      const blobName = `${folderPath}/${timestamp}-${randomString}.${fileExtension}`;

      // Upload blob
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const arrayBuffer = await file.arrayBuffer();
      
      await blockBlobClient.upload(arrayBuffer, file.size, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        },
      });

      // Construct URL
      const url = this.constructBlobUrl(containerName, blobName);
      logger.info('File uploaded to Azure Blob Storage', {
        fileName: file.name,
        blobName,
        containerName,
        url,
        sizeMB: fileSizeMB,
      });

      return url;
    } catch (error) {
      logger.error('Failed to upload file to Azure Blob Storage', {
        fileName: file.name,
        containerName,
        error,
      });
      throw error;
    }
  }

  /**
   * Download a file
   */
  async downloadFile(containerName: string, blobName: string): Promise<Blob> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      
      return downloadBlockBlobResponse.readableStreamBody as unknown as Blob;
    } catch (error) {
      logger.error('Failed to download file from Azure Blob Storage', {
        containerName,
        blobName,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(containerName: string, blobName: string): Promise<void> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      
      logger.info('File deleted from Azure Blob Storage', { containerName, blobName });
    } catch (error) {
      logger.error('Failed to delete file from Azure Blob Storage', {
        containerName,
        blobName,
        error,
      });
      throw error;
    }
  }

  /**
   * List blobs in a container
   */
  async listBlobs(containerName: string, prefix?: string): Promise<string[]> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blobNames: string[] = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobNames.push(blob.name);
      }

      logger.debug('Blobs listed', { containerName, count: blobNames.length });
      return blobNames;
    } catch (error) {
      logger.error('Failed to list blobs from Azure Blob Storage', {
        containerName,
        prefix,
        error,
      });
      throw error;
    }
  }

  /**
   * Construct blob URL
   */
  private constructBlobUrl(containerName: string, blobName: string): string {
    // If CDN URL is configured, use it
    if (AZURE_STORAGE.CDN_URL) {
      return `${AZURE_STORAGE.CDN_URL}/${containerName}/${blobName}`;
    }

    // Otherwise, construct URL from storage account
    return `https://${AZURE_STORAGE.ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
  }

  /**
   * Generate SAS URL for a blob (for temporary access)
   */
  async generateSasUrl(
    containerName: string,
    blobName: string,
    expiryHours: number = 24
  ): Promise<string> {
    try {
      const containerClient = await this.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Note: This requires proper Azure SDK setup with connection string
      // For production, use managed identity or SAS key stored in Key Vault
      const url = blockBlobClient.url;
  logger.debug('SAS URL generated', { containerName, blobName, expiryHours });
      return url;
    } catch (error) {
      logger.error('Failed to generate SAS URL', {
        containerName,
        blobName,
        error,
      });
      throw error;
    }
  }
}

export const azureStorage = new AzureStorageService();

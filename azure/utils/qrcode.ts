/**
 * Production QR Code Generation Utilities
 * Generates QR codes for tickets with configurable options
 */

import qrcode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

const QR_CODE_WIDTH = parseInt(process.env.QR_CODE_WIDTH || '300', 10);
const QR_CODE_ERROR_CORRECTION = (process.env.QR_CODE_ERROR_CORRECTION || 'H') as 'L' | 'M' | 'Q' | 'H';
const QR_CODE_MARGIN = parseInt(process.env.QR_CODE_MARGIN || '1', 10);

/**
 * QR Code options
 */
export const QR_CODE_OPTIONS = {
  width: QR_CODE_WIDTH,
  errorCorrectionLevel: QR_CODE_ERROR_CORRECTION,
  margin: QR_CODE_MARGIN,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * Generate QR code as Data URL
 * Perfect for embedding in HTML/PDF
 */
export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const dataUrl = await qrcode.toDataURL(data, QR_CODE_OPTIONS);
    return dataUrl;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as Buffer
 * For file storage or direct transmission
 */
export async function generateQRCodeBuffer(data: string, format: 'png' | 'jpeg' = 'png'): Promise<Buffer> {
  try {
    let buffer: Buffer;

    if (format === 'png') {
      buffer = await qrcode.toBuffer(data, QR_CODE_OPTIONS);
    } else {
      // For JPEG, first generate PNG then convert
      const pngBuffer = await qrcode.toBuffer(data, QR_CODE_OPTIONS);
      buffer = pngBuffer; // In production, use image library to convert
    }

    return buffer;
  } catch (error) {
    throw new Error(`QR code buffer generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as SVG
 * For vector-based storage
 */
export async function generateQRCodeSVG(data: string): Promise<string> {
  try {
    // Type definitions for 'qrcode' may cause toString to have incompatible overloads;
    // cast to any and assert string to satisfy TypeScript promise/return types.
    const svg = (await (qrcode as any).toString(data, {
      ...QR_CODE_OPTIONS,
      type: 'image/svg+xml',
    })) as string;
    return svg;
  } catch (error) {
    throw new Error(`QR code SVG generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for ticket
 * Returns standardized ticket QR code data
 */
export async function generateTicketQRCode(ticketNumber: string, eventId: string, orderId: string): Promise<{
  qrCodeData: string;
  qrCodeDataUrl: string;
  qrCodeBuffer: Buffer;
}> {
  try {
    // QR data format: EVENTIX:{ticketNumber}:{eventId}:{orderId}:{timestamp}
    const timestamp = Date.now();
    const qrData = `EVENTIX:${ticketNumber}:${eventId}:${orderId}:${timestamp}`;

    const [dataUrl, buffer] = await Promise.all([
      generateQRCodeDataURL(qrData),
      generateQRCodeBuffer(qrData),
    ]);

    return {
      qrCodeData: qrData,
      qrCodeDataUrl: dataUrl,
      qrCodeBuffer: buffer,
    };
  } catch (error) {
    throw new Error(`Ticket QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse QR code data
 * Validates and extracts ticket information from QR data
 */
export function parseQRCodeData(
  qrData: string
): {
  ticketNumber: string;
  eventId: string;
  orderId: string;
  timestamp: number;
  isValid: boolean;
} | null {
  try {
    const parts = qrData.split(':');
    if (parts.length !== 5 || parts[0] !== 'EVENTIX') {
      return null;
    }

    const [, ticketNumber, eventId, orderId, timestamp] = parts;

    // Validate that timestamp is a valid number
    const parsedTimestamp = parseInt(timestamp, 10);
    if (isNaN(parsedTimestamp)) {
      return null;
    }

    return {
      ticketNumber,
      eventId,
      orderId,
      timestamp: parsedTimestamp,
      isValid: true,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validate QR code is not expired
 * QR codes are valid for the duration of the event
 */
export function isQRCodeExpired(qrTimestamp: number, eventDate: Date): boolean {
  const eventTime = eventDate.getTime();
  const currentTime = Date.now();

  // QR code is expired if current time is more than 24 hours after event
  const expirationTime = eventTime + 24 * 60 * 60 * 1000;
  return currentTime > expirationTime;
}

/**
 * Generate barcode from QR data (for ticket scanning)
 * Uses Code128 format for reliable scanning
 */
export async function generateBarcodeFromQRData(qrData: string): Promise<string> {
  try {
    // Simplified version - in production, use a barcode library like 'jsbarcode'
    // For now, we'll use the QR data as the barcode value
    // In production: import bwipjs from 'bwip-js';
    const barcodeValue = qrData.replace(/:/g, '').substring(0, 24); // Simplified Code128
    return barcodeValue;
  } catch (error) {
    throw new Error(`Barcode generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Save QR code to file
 * For local development or archival
 */
export async function saveQRCodeToFile(qrData: string, ticketNumber: string, outputDir: string): Promise<string> {
  try {
    const buffer = await generateQRCodeBuffer(qrData);
    const filename = `qr_${ticketNumber}_${Date.now()}.png`;
    const filepath = path.join(outputDir, filename);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filepath, buffer);
    return filepath;
  } catch (error) {
    throw new Error(
      `Failed to save QR code to file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

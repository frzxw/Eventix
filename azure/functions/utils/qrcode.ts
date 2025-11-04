/**
 * QR Code utilities for Azure Functions environment
 */
import qrcode from 'qrcode';

const QR_CODE_WIDTH = parseInt(process.env.QR_CODE_WIDTH || '300', 10);
const QR_CODE_ERROR_CORRECTION = (process.env.QR_CODE_ERROR_CORRECTION || 'H') as 'L' | 'M' | 'Q' | 'H';
const QR_CODE_MARGIN = parseInt(process.env.QR_CODE_MARGIN || '1', 10);

export const QR_CODE_OPTIONS = {
  width: QR_CODE_WIDTH,
  errorCorrectionLevel: QR_CODE_ERROR_CORRECTION,
  margin: QR_CODE_MARGIN,
  color: { dark: '#000000', light: '#FFFFFF' },
};

export async function generateQRCodeDataURL(data: string): Promise<string> {
  return qrcode.toDataURL(data, QR_CODE_OPTIONS);
}

export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  return qrcode.toBuffer(data, QR_CODE_OPTIONS);
}

export async function generateTicketQRCode(ticketNumber: string, eventId: string, orderId: string) {
  const ts = Date.now();
  const qrData = `EVENTIX:${ticketNumber}:${eventId}:${orderId}:${ts}`;
  const [dataUrl, buffer] = await Promise.all([
    generateQRCodeDataURL(qrData),
    generateQRCodeBuffer(qrData),
  ]);
  return { qrCodeData: qrData, qrCodeDataUrl: dataUrl, qrCodeBuffer: buffer };
}

export function parseQRCodeData(qrData: string) {
  const parts = qrData.split(':');
  if (parts.length !== 5 || parts[0] !== 'EVENTIX') return null;
  const [, ticketNumber, eventId, orderId, timestamp] = parts;
  const t = parseInt(timestamp, 10);
  if (Number.isNaN(t)) return null;
  return { ticketNumber, eventId, orderId, timestamp: t };
}

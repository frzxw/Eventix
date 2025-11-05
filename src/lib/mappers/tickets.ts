import type { Ticket } from "../types";

function toStr(v: any, def = ""): string { return (v ?? def).toString(); }

export function mapApiTicket(input: any): Ticket {
  // Support nested shape { ticket, event, order } or flattened fields
  const t = input?.ticket ?? input;
  const e = input?.event ?? input?.eventInfo ?? {};
  const o = input?.order ?? input?.orderInfo ?? {};

  const id = toStr(t?.id ?? t?.ticket_id ?? t?.ticketNumber ?? t?.ticket_number);
  const orderId = toStr(t?.order_id ?? t?.orderId ?? o?.id ?? "");
  const eventId = toStr(t?.event_id ?? t?.eventId ?? e?.id ?? "");
  const eventTitle = toStr(e?.title ?? e?.name ?? input?.eventTitle ?? "");
  const eventDate = toStr(e?.date ?? input?.eventDate ?? new Date().toISOString());
  const eventTime = toStr(e?.time ?? input?.eventTime ?? "19:00");
  const venue = toStr(e?.venue_name ?? e?.venue?.name ?? input?.venue ?? "");
  const category = toStr(input?.category ?? t?.category_name ?? t?.category ?? "GENERAL");
  const seat = t?.seat ?? undefined;
  const qrData = toStr(t?.qr_code_data ?? t?.qrData ?? "");
  const barcode = toStr((t?.ticket_number ?? t?.ticketNumber ?? (qrData || id)));
  const statusRaw = toStr(t?.status ?? input?.status ?? "valid").toLowerCase();
  const status = (statusRaw === 'used' || statusRaw === 'cancelled') ? (statusRaw as 'used' | 'cancelled') : 'valid';
  const customerName = [o?.attendee_first_name ?? o?.firstName, o?.attendee_last_name ?? o?.lastName]
    .filter(Boolean)
    .join(' ') || toStr(input?.customerName ?? "");

  return {
    id,
    orderId,
    eventId,
    eventTitle,
    eventDate,
    eventTime,
    venue,
    category,
    seat,
    qrCode: qrData,
    barcode,
    customerName,
    status,
  };
}

export function mapApiTickets(list: any[] | undefined | null): Ticket[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapApiTicket);
}

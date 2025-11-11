export type HoldEntry = {
  categoryId: string;
  eventId: string;
  quantity: number;
};

export type HoldRequest = {
  eventId: string;
  requesterId?: string;
  traceId?: string;
  entries: HoldEntry[];
};

export type HoldAcquisitionResult = {
  success: boolean;
  holdToken?: string;
  expiresAt?: string;
  expiresAtEpoch?: number;
  error?: string;
  categoryId?: string;
  available?: number;
  entries?: Array<{
    categoryId: string;
    available: number;
    pending: number;
    total: number;
  }>;
};

export type HoldClaimResult = {
  success: boolean;
  error?: string;
  status?: string;
  entries?: HoldEntry[];
  expiresAt?: string;
  expiresAtEpoch?: number;
};

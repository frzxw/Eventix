# Booking Queue & Hold Flow

Production guidance for the Eventix booking queue, hold, and checkout experience when running on Azure Container Apps with Azure Front Door and Azure Web PubSub.

---

## 🌐 Endpoint Contract (Azure Container Apps)

| Endpoint | Method | Description | Required Headers | Payload |
| --- | --- | --- | --- | --- |
| `/holds` | `POST` | Attempt to acquire a hold immediately | `x-correlation-id` | `{ eventId, requesterId?, selections[] }`
| `/holds/extend` | `POST` | Extend an existing hold | `x-correlation-id` | `{ holdToken }`
| `/queue/join` | `POST` | Join the managed queue (when hold not available) | `x-correlation-id` | `{ eventId, requesterId?, selections[] }`
| `/queue/status/{queueId}` | `GET` | Poll queue position/ETA | `x-correlation-id` | — |
| `/queue/claim` | `POST` | Claim a hold when queue signals ready | `x-correlation-id` | `{ queueId, claimToken? }`
| `/queue/leave/{queueId}` | `POST` | Leave queue and release pending slots | `x-correlation-id` | — |

**Response Expectations**
- **Hold Attempt**: `{ status: 'acquired', holdId, holdToken, expiresAt }` or `{ status: 'queued', queueId, position, etaSeconds }`
- **Queue Status**: `'queued'`, `'ready'`, `'expired'`, `'cancelled'` plus `holdToken`/`holdExpiresAt` when ready
- **Claim/Extend**: `success`, updated hold expiry metadata

---

## 🔄 Client State Machine

Stages and triggers:
1. `trying-hold` → optimistic hold attempt (`/holds`)
2. `in-queue` → queue join and real-time/poll subscription
3. `ready-with-hold` → hold token shared via Azure Web PubSub or claim API
4. `expired` → hold or queue expired (automatic retry requires a new `start`)
5. `error` → network/contract failures surfaced to the user

Minimal session context persisted in `sessionStorage`:
```json
{
  "eventId": "evt-123",
  "selections": [{ "categoryId": "vip", "quantity": 2 }],
  "queueId": "queue-abc",
  "holdId": "hold-xyz",
  "holdToken": "token",
  "holdExpiresAt": "2025-11-13T12:01:00Z",
  "correlationId": "trace-id"
}
```

---

## 📡 Realtime vs Polling

- **Primary**: Azure Web PubSub (or Azure SignalR Service) websocket endpoint injected via `VITE_REALTIME_URL`
- **Fallback**: Poll `/queue/status/{queueId}` using adaptive intervals (default 5s, shorter when ETA < 60s, up to 15s for deep queues)
- UI surfaces connection mode with accessible messaging.

---

## 📊 Telemetry (Azure Application Insights)

Events emitted with `correlationId`:
- `queue_join`
- `hold_acquired`
- `hold_expired`
- `checkout_attempt`
- `checkout_success`
- `checkout_failed`

Include queue/hold identifiers for troubleshooting without logging PII.

---

## ✅ Acceptance Criteria

- **No oversell**: queue/hold flow must prevent double allocation even under burst load.
- **Claim reliability**: ≥ 99% claim success rate (monitored via telemetry).
- **Latency targets**: p95 hold acquisition/claim ≤ 500 ms (excluding queue wait times).
- **Idempotent checkout**: every `/orders/create` call includes `Idempotency-Key` and `x-correlation-id` headers.
- **Queue UX**: clear position, ETA, cancel action, live-region updates, and hold countdown badge.
- **Queue status page**: `/queue` route provides persistent monitoring (mirrors modal data, safe to refresh).

---

## 🔐 Security Constraints

- Never store payment data in the browser or local/session storage.
- Load API base URLs, queue URLs, and realtime endpoints from Vite environment variables only.
- Backend secrets reside in Azure Key Vault; Container Apps authenticate using managed identity.
- All client requests include correlation identifiers for traceability without exposing sensitive data.
- Protect against CSRF/XSSI via existing Azure Front Door + WAF policies.

---

## 🚀 CI/CD (GitHub Actions)

1. **Build SPA**: `npm ci && npm run build`
2. **Upload** `dist/` to Azure Blob Storage static website container (`$web`) using `az storage blob upload-batch`
3. **Purge Front Door**: `az network front-door purge-endpoint --resource-group ... --name ... --content-paths '/*'`
4. **Container Apps**:
   - Build/push API image: `az acr build` or `docker buildx build` → `az acr repository show`
   - Deploy: `az containerapp update --name eventix-hold --image <registry>/<image>:tag`
5. **Queue Config**: ensure `VITE_QUEUE_API_URL`, `VITE_HOLD_API_URL`, `VITE_REALTIME_URL`, and `VITE_REALTIME_HUB` secrets are set before build.

Use staged workflow approvals when promoting from `staging` to `production` resource groups.

---

## 🧪 Testing Strategy

- **Unit**: Hook state-machine transitions (`useBookingStateMachine`)
- **Integration**: Simulated queue updates (join → ready → hold claim → checkout)
- **E2E**: Playwright (future) path from ticket selection to checkout using mock ACA endpoints

All tests must execute via `npm run test` with mocked Azure dependencies.

---

## 📦 Environment Variables

```env
VITE_API_URL=https://api.eventix.azurefd.net
VITE_HOLD_API_URL=https://booking-api.eventix.internal/holds
VITE_QUEUE_API_URL=https://booking-api.eventix.internal/queue
VITE_REALTIME_URL=wss://booking-realtime.eventix.internal/client
VITE_REALTIME_HUB=booking
VITE_QUEUE_POLL_INTERVAL_MS=5000
```

Keep secrets in GitHub Actions and local `.env` files that are excluded from version control.

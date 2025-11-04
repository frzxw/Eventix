# Environment setup (frontend + Azure Functions)

This project splits environment variables by concern:

- Frontend (Vite): variables prefixed with `VITE_` (exposed to the browser at build time)
- Backend (Azure Functions): variables in Function App Settings (or `local.settings.json` for local runs)
- Database/Secrets: stored in Azure Key Vault and referenced from Function App

## Quick start

1) Frontend (local)

- Copy and adjust:
  - `.env.development.example` -> `.env.development`

Key fields:

- `VITE_API_URL` (primary)
- `VITE_API_BASE_URL` (legacy fallback) — keep in sync with `VITE_API_URL`

2) Functions (local)

- Copy and adjust:
  - `azure/functions/local.settings.json.example` -> `azure/functions/local.settings.json`

Key fields under `Values`:

- `AzureWebJobsStorage`: `UseDevelopmentStorage=true` or a real connection string
- `BLOB_STORAGE_CONNECTION_STRING`: optional; falls back to `AzureWebJobsStorage`
- `DATABASE_URL`: SQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_EXPIRY`
- `BCRYPT_ROUNDS`
- `APPINSIGHTS_CONNECTION_STRING` (optional locally)

3) Production (Azure)

- Put secrets in Key Vault and reference them in the Function App App Settings:
  - `DATABASE_URL`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - `APPINSIGHTS_CONNECTION_STRING`
- Set non-secrets directly in Function App App Settings as needed:
  - `JWT_EXPIRY=15m`, `JWT_REFRESH_EXPIRY=7d`, `BCRYPT_ROUNDS=12`
  - `AzureWebJobsStorage` and `BLOB_STORAGE_CONNECTION_STRING`
- Frontend build env (via GitHub Actions or SWA portal):
  - `VITE_API_URL=https://<functionapp>.azurewebsites.net/api`
  - `VITE_APPINSIGHTS_CONNECTION_STRING=<from key vault>`

## Variable map

Frontend (Vite):

- `VITE_API_URL` (preferred)
- `VITE_API_BASE_URL` (fallback)
- `VITE_APPINSIGHTS_CONNECTION_STRING`, `VITE_APPINSIGHTS_INSTRUMENTATION_KEY`
- `VITE_STORAGE_*` (for resolving asset/CDN URLs)
- Feature flags: `VITE_ENABLE_*`, `VITE_ENVIRONMENT`, etc.

Backend (Functions):

- `DATABASE_URL` (Prisma)
- `AzureWebJobsStorage` and `BLOB_STORAGE_CONNECTION_STRING` (blob access)
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_EXPIRY`
- `BCRYPT_ROUNDS`
- `APPINSIGHTS_CONNECTION_STRING`

## Notes

- The frontend now prefers a single API variable (`VITE_API_URL`) with a fallback to `VITE_API_BASE_URL` to avoid drift.
- The backend storage helper reads `BLOB_STORAGE_CONNECTION_STRING` or falls back to `AzureWebJobsStorage` if not set.
- Use Key Vault for secrets; never commit them to the repo.

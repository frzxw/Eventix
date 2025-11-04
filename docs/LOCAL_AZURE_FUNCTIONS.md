# Run Azure Functions API locally (Windows)

Prerequisites:
- Node.js 18 LTS
- Azure Functions Core Tools v4
- Azure Storage Emulator (Azurite) or a real storage connection

## 1) Configure local settings

Copy the example and fill in secrets:

```cmd
copy azure\functions\local.settings.json.example azure\functions\local.settings.json
```

Edit `azure\functions\local.settings.json` and set at minimum:
- `DATABASE_URL` (Azure SQL connection string)
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- Optionally adjust `BCRYPT_ROUNDS`, `JWT_EXPIRY`, `JWT_REFRESH_EXPIRY`

## 2) Install dependencies and generate Prisma client

```cmd
cd azure\functions
npm ci
npm run prisma:generate
```

Note: The Prisma schema is at the repo root under `prisma/`.

## 3) Start the Functions host

Dev (TypeScript live-compile):
```cmd
npm run start:dev
```

Or build then run:
```cmd
npm run build
npm start
```

The API will be available at:
```
http://localhost:7071/api
```

## 4) Start the frontend in a second terminal

```cmd
npm run dev
```

By default, the frontend expects `VITE_API_URL=http://localhost:7071/api`.

## Available Auth routes (production handlers wired)
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/verify-email`
- POST `/api/auth/forgot-password`
- POST `/api/auth/logout`
- POST `/api/auth/refresh-token`

## CI/CD
This repo includes a GitHub Actions workflow `.github/workflows/azure-static-web-apps.yml` that builds the SPA and the Functions API (`api_location: azure/functions`). Set these repository secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `VITE_API_URL`
- `VITE_APPINSIGHTS_CONNECTION_STRING`

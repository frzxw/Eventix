# Container Apps Deployment Playbook

This guide explains how to build and ship the Eventix backend workloads to Azure Container Apps.

## Workloads

| Service | Path | Purpose |
|---------|------|---------|
| API | `services/api` | Fastify-based public API that manages holds, checkout, and event catalog access. |
| Finalizer | `services/finalizer` | Service Bus consumer that finalizes orders, commits inventory, and issues tickets. |
| Hold Cleaner | `services/hold-cleaner` | Scheduled job that returns expired holds to inventory. |

All three services share the same runtime stack:

- Node.js 20 (Alpine base image)
- TypeScript compiled output under `dist`
- `npm prune --omit=dev` to keep images lean

## Prerequisites

- Docker CLI or Azure CLI ≥ 2.53 with `containerapp` extension
- Azure Container Registry (ACR) created by `azure/infrastructure/main.bicep`
- Azure CLI logged in and set to the correct subscription
- `az acr login --name <ACR>`

## Build & push images

Each service ships with a multi-stage Dockerfile that handles install, build, and pruning. From the repository root:

```cmd
REM API service
cd services\api
npm install
npm run build
az acr build --registry %AZ_ACR% --image eventix-api:latest .

REM Finalizer worker
cd ..\finalizer
npm install
npm run build
az acr build --registry %AZ_ACR% --image eventix-finalizer:latest .

REM Hold cleaner job
cd ..\hold-cleaner
npm install
npm run build
az acr build --registry %AZ_ACR% --image eventix-hold-cleaner:latest .
```

After pushing, update the image parameters when running `10-az-provision-core.cmd` (or redeploy the Bicep template manually):

```cmd
set AZ_API_IMAGE=%AZ_ACR%.azurecr.io/eventix-api:2025-11-11
set AZ_FINALIZER_IMAGE=%AZ_ACR%.azurecr.io/eventix-finalizer:2025-11-11
set AZ_HOLD_CLEANER_IMAGE=%AZ_ACR%.azurecr.io/eventix-hold-cleaner:2025-11-11
az deployment group create --resource-group %AZ_RG% --template-file azure\infrastructure\main.bicep --parameters apiContainerImage=%AZ_API_IMAGE% finalizerContainerImage=%AZ_FINALIZER_IMAGE% holdCleanerContainerImage=%AZ_HOLD_CLEANER_IMAGE%
```

## Environment variables & secrets

The Bicep template injects the following configuration via secrets:

| Secret | Source |
|--------|--------|
| `POSTGRES_CONNECTION_STRING` | Azure Key Vault (`POSTGRES_CONNECTION_STRING`) |
| `SERVICE_BUS_CONNECTION_STRING` | Key Vault (`SERVICE_BUS_CONNECTION_STRING`) |
| `REDIS_PASSWORD` | Key Vault (`REDIS_PRIMARY_KEY`) |
| `APPLICATION_INSIGHTS_CONNECTION_STRING` | App Insights resource |

Additional application secrets (JWT signing keys, payment providers, etc.) can be seeded with `azure\scripts\20-az-keyvault-secrets.cmd` or managed directly in Key Vault.

## Deploying scheduled jobs

The hold cleaner runs as a Container Apps Job with a cron schedule (`holdCleanerCronSchedule` parameter in Bicep). Update the schedule string (six-field cron expression) before redeploying the template, e.g. `0 */2 * * * *` for every two minutes.

## Post-deployment checklist

1. Confirm Container Apps revisions are healthy:
   ```cmd
   az containerapp revision list --name %AZ_API_CONTAINER_APP% --resource-group %AZ_RG% --output table
   ```
2. Fetch the API FQDN:
   ```cmd
   az containerapp show --name %AZ_API_CONTAINER_APP% --resource-group %AZ_RG% --query properties.configuration.ingress.fqdn -o tsv
   ```
3. Update `VITE_API_URL` (frontend) and any external integrations to point at the new domain.
4. Retrieve the Postgres connection string from Key Vault and run `prisma migrate deploy` before serving traffic.
5. Configure alerts in Application Insights / Container Apps as needed (CPU, queue length, hold cleanup failures).

## Cleaning up

To remove the environment:

```cmd
az group delete --name %AZ_RG% --yes --no-wait
```

This will delete the Container Apps environment, Redis, Service Bus, PostgreSQL, and supporting resources provisioned by the Bicep template.

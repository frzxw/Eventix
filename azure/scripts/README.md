# Azure scripts (Windows cmd)

Windows-friendly wrappers for deploying the Eventix production stack to Azure Container Apps, Azure Database for PostgreSQL, Azure Cache for Redis, and Service Bus.

## Before you start

1. Copy `00-az-variables.local.cmd.example` to `00-az-variables.local.cmd` and fill in:
  - `AZ_SUBSCRIPTION_ID`, `AZ_LOCATION`, and (if you change it) `AZ_ENVIRONMENT`
  - Any resource names that differ from the defaults emitted by the Bicep deployment (Key Vault, Container Apps, etc.)
  - An **18+ character PostgreSQL admin password** (`AZ_PG_ADMIN_PASSWORD`)
  - Container image tags (`AZ_API_IMAGE`, etc.). Defaults point at GitHub Container Registry; override if you push to ACR or another registry.
2. Sign in to Azure CLI (`az login`).
3. Ensure `az` has the latest `containerapp` extension (`az extension add --name containerapp` if needed).

## Primary workflow

1. **Provision everything with Bicep**

  ```cmd
  azure\scripts\10-az-provision-core.cmd
  ```

  This script:
  - Logs in (device-code fallback supported)
  - Creates the resource group
  - Deploys `azure/infrastructure/main.bicep` with the parameters from `00-az-variables` (PostgreSQL, Redis, Service Bus, Container Apps, Key Vault, etc.)

2. **Upload application secrets (optional)**

  Managed infrastructure secrets (Postgres connection string, Redis key, Service Bus connection) are created automatically during the Bicep deployment. Use Key Vault directly or add custom automation for application-specific secrets (e.g., `JWT_SECRET`). A refreshed script will be added later.

3. **Build & push container images**

  ```cmd
  cd services\api
  npm install
  npm run build
  docker buildx build -t %AZ_API_IMAGE% .
  docker push %AZ_API_IMAGE%
  ```

  Repeat for `services/finalizer` and `services/hold-cleaner`, adjust `%AZ_FINALIZER_IMAGE%` / `%AZ_HOLD_CLEANER_IMAGE%`, then redeploy the Bicep template (or update the Container Apps directly) to roll out the new images.

4. **Run Prisma migrations**

  Retrieve the `POSTGRES_CONNECTION_STRING` secret from Key Vault and run:

  ```cmd
  set DATABASE_URL=<postgres-connection-string>
  npx prisma migrate deploy
  ```

  (Use `prisma/` schema with the new PostgreSQL provider.)

## Orchestrator (`run-all.bat`)

`run-all.bat` currently calls `10-az-provision-core.cmd`. Validation for Key Vault secret seeding / Function Apps will be modernized in a subsequent iteration; set `DEPLOY_FUNCTIONS`, `RUN_MIGRATIONS`, etc., only if you still rely on the legacy Azure Functions path.

## Notes & tips

- Use `az account show` to confirm the active subscription before deploying.
- When you need resource names with random suffixes (e.g., the storage account), run `az deployment group show --resource-group %AZ_RG% --name <deploymentName> --query properties.outputs` (use the name returned by `az deployment group create`) and copy the values into `00-az-variables.local.cmd`.
- Container Apps managed identities receive Key Vault access automatically through the Bicep template.
- Update `VITE_API_URL` with the external URL emitted by the API Container App output (`apiContainerAppName`).
- To change scaling or cron cadence, modify the parameters in `main.bicep` before re-running the deployment.
- Ensure your PostgreSQL password meets Azure’s complexity requirements (minimum length 16, mix of categories).
# Azure scripts (Windows cmd)

This folder provides Windows cmd helpers to stand up Eventix on Azure quickly.

## Quick start: one command (.bat)

Run everything with a single orchestrator:

- Create optional local overrides by copying `00-az-variables.local.cmd.example` to `00-az-variables.local.cmd` and editing values.
- Then execute one of:

```
azure\scripts\run-all.bat
```

Or include your Static Web App URL to also configure CORS:

```
azure\scripts\run-all.bat https://<your-swa>.azurestaticapps.net
```

Optional: allow your current public IP for SQL (needed for local Prisma migrations):

```
set ALLOW_MY_IP=true
azure\scripts\run-all.bat
```

Optional: run DB migrations by setting environment variables before the call (or inside your local overrides file):

```
set RUN_MIGRATIONS=true
set DATABASE_URL=Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;User Id=<user>;Password=<pwd>;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;
azure\scripts\run-all.bat
```

## Order of execution

1) Edit variables

- Open `00-az-variables.cmd` and fill in:
  - `AZ_SUBSCRIPTION_ID`, `AZ_LOCATION`
  - Resource names: `AZ_STORAGE`, `AZ_SQLSERVER`, `AZ_SQLPASSWORD`, `AZ_SQLDB`, `AZ_KEYVAULT`, `AZ_APPINSIGHTS`, `AZ_FUNCTIONAPP`, `AZ_SWA`
  - Frontend build env: `VITE_API_URL`, `VITE_APPINSIGHTS_CONNECTION_STRING` (optional)

2) Provision core

```
azure\scripts\10-az-provision-core.cmd
```

3) Set Key Vault secrets

```
azure\scripts\20-az-keyvault-secrets.cmd
```

4) Configure Function App settings (storage + KV references)

```
azure\scripts\30-az-func-settings.cmd
```

5) Allow CORS for your Static Web App URL

Once the SWA URL is known:

```
azure\scripts\40-az-cors.cmd https://<your-swa>.azurestaticapps.net
```

6) (Optional) Run Prisma migrations against the target DB

Set `DATABASE_URL` in your shell to the production DB connection string (or use Key Vault to retrieve it), then:

```
set DATABASE_URL=Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;User Id=<user>;Password=<pwd>;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;
azure\scripts\50-prisma-migrate.cmd

Optional: deploy Azure Functions code after configuring settings:

```
set DEPLOY_FUNCTIONS=true
azure\scripts\run-all.bat
```
```

## Notes

- If `az login` fails in a browser, try `az login --use-device-code`.
- If a resource already exists, the scripts will continue where possible.
- The Function App gets a system-assigned identity which is granted `get`/`list` on Key Vault secrets.
- App settings are wired to Key Vault using `@Microsoft.KeyVault(SecretUri=...)` syntax.
- Frontend should set `VITE_API_URL` to `https://<functionapp>.azurewebsites.net/api`.
 - Prisma migrations now run inside the `azure/functions` workspace automatically.
 - Application Insights setting name used: `APPLICATIONINSIGHTS_CONNECTION_STRING`.
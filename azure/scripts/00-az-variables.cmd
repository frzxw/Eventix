@echo off
REM Eventix Azure variables - EDIT THESE before running other scripts

REM Subscription, region, and environment suffix
set AZ_SUBSCRIPTION_ID=eb4cb08d-cfb0-4a96-b41d-26a5991b6103
set AZ_LOCATION=southeastasia
set AZ_ENVIRONMENT=prod

REM Core resource names
set AZ_RG=eventix-rg
REM Populate AZ_STORAGE after the first deployment using the storageAccountName output
set AZ_STORAGE=eventixfuncstore6ncpj7
set AZ_DEPLOYER_OBJECT_ID=
set AZ_KEYVAULT=eventix-kv-%AZ_ENVIRONMENT%
set AZ_APPINSIGHTS=eventix-insights-%AZ_ENVIRONMENT%
set AZ_CONTAINERAPPS_ENV=eventix-cae-%AZ_ENVIRONMENT%
set AZ_API_CONTAINER_APP=eventix-api-ca-%AZ_ENVIRONMENT%
set AZ_FINALIZER_CONTAINER_APP=eventix-finalizer-%AZ_ENVIRONMENT%
set AZ_HOLD_CLEANER_JOB=eventix-hold-cleaner-%AZ_ENVIRONMENT%
set AZ_WEBPUBSUB=eventix-wps-%AZ_ENVIRONMENT%
set AZ_REDIS=eventix-cache-%AZ_ENVIRONMENT%
set AZ_SERVICEBUS=eventix-sb-%AZ_ENVIRONMENT%
set AZ_POSTGRES_SERVER=eventix-pg-%AZ_ENVIRONMENT%
set AZ_POSTGRES_DB=eventix-db

REM Container image tags (override after pushing to ACR)
set AZ_API_IMAGE=eventixacr6ncpj7.azurecr.io/eventix-api:latest
set AZ_FINALIZER_IMAGE=eventixacr6ncpj7.azurecr.io/eventix-finalizer:latest
set AZ_HOLD_CLEANER_IMAGE=eventixacr6ncpj7.azurecr.io/eventix-hold-cleaner:latest

REM PostgreSQL credentials (set secure values in local override)
set AZ_PG_ADMIN_USER=eventix_admin
set AZ_PG_ADMIN_PASSWORD=

REM Frontend build env (update after Container App deploy)
set VITE_API_URL=
set VITE_APPINSIGHTS_CONNECTION_STRING=

REM Optional: load developer-local overrides (ignored by git)
if exist "%~dp0\00-az-variables.local.cmd" (
	call "%~dp0\00-az-variables.local.cmd"
)

echo Variables loaded. Use 00-az-variables.local.cmd for secrets; it is git-ignored.
exit /b 0

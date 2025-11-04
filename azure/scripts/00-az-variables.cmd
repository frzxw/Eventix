@echo off
REM Eventix Azure variables - EDIT THESE before running other scripts

REM Subscription and region
set AZ_SUBSCRIPTION_ID=eb4cb08d-cfb0-4a96-b41d-26a5991b6103
set AZ_LOCATION=southeastasia

REM Resource names (alphanumeric, 3-24 chars for storage)
set AZ_RG=eventix-rg
set AZ_STORAGE=eventixstorage
set AZ_SQLSERVER=eventix-sql-server
set AZ_SQLADMIN=sqladmin
set AZ_SQLPASSWORD=
set AZ_SQLDB=eventix-db
set AZ_KEYVAULT=eventix-keyvault
set AZ_APPINSIGHTS=eventix-ai
set AZ_FUNCTIONAPP=eventix-api
set AZ_SWA=eventix-swa

REM Frontend build env
set VITE_API_URL=https://%AZ_FUNCTIONAPP%.azurewebsites.net/api
set VITE_APPINSIGHTS_CONNECTION_STRING=

REM Optional: load developer-local overrides (ignored by git)
if exist "%~dp0\00-az-variables.local.cmd" (
	call "%~dp0\00-az-variables.local.cmd"
)

echo Variables loaded. Use 00-az-variables.local.cmd for secrets; it is git-ignored.
exit /b 0

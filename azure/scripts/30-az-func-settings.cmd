@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

echo Fetching storage connection string ...
for /f "usebackq tokens=*" %%i in (`az storage account show-connection-string --name %AZ_STORAGE% --resource-group %AZ_RG% --query connectionString -o tsv`) do set STORAGE_CONN=%%i
if "%STORAGE_CONN%"=="" (echo Failed to fetch storage connection. && exit /b 1)

echo Setting Function App app settings (storage + KV references) ...
az functionapp config appsettings set --name %AZ_FUNCTIONAPP% --resource-group %AZ_RG% --settings ^
  AzureWebJobsStorage="%STORAGE_CONN%" ^
  BLOB_STORAGE_CONNECTION_STRING="%STORAGE_CONN%" ^
  JWT_EXPIRY="15m" ^
  JWT_REFRESH_EXPIRY="7d" ^
  BCRYPT_ROUNDS="12" || exit /b 1

az functionapp config appsettings set --name %AZ_FUNCTIONAPP% --resource-group %AZ_RG% --settings ^
  DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://%AZ_KEYVAULT%.vault.azure.net/secrets/database-connection-string/)" ^
  JWT_SECRET="@Microsoft.KeyVault(SecretUri=https://%AZ_KEYVAULT%.vault.azure.net/secrets/jwt-secret/)" ^
  JWT_REFRESH_SECRET="@Microsoft.KeyVault(SecretUri=https://%AZ_KEYVAULT%.vault.azure.net/secrets/jwt-refresh-secret/)" ^
  APPLICATIONINSIGHTS_CONNECTION_STRING="@Microsoft.KeyVault(SecretUri=https://%AZ_KEYVAULT%.vault.azure.net/secrets/appinsights-connection-string/)" || exit /b 1

echo Enabling CORS placeholder (run 40-az-cors after SWA deploy for real URL) ...
az functionapp cors add --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP% --allowed-origins https://%AZ_SWA%.azurestaticapps.net || rem continue if not provisioned yet

echo Function App settings configured.
endlocal
exit /b 0

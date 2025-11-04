@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

REM Construct DATABASE_URL for SQL Login (adjust if using AAD)
set DATABASE_URL=Server=tcp:%AZ_SQLSERVER%.database.windows.net,1433;Initial Catalog=%AZ_SQLDB%;User Id=%AZ_SQLADMIN%;Password=%AZ_SQLPASSWORD%;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;

REM Generate random-ish defaults if not provided (Windows only rough fallback)
if "%JWT_SECRET%"=="" set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%_jwt_secret_change_me
if "%JWT_REFRESH_SECRET%"=="" set JWT_REFRESH_SECRET=%RANDOM%%RANDOM%%RANDOM%_jwt_refresh_change_me

echo Setting Key Vault secrets in %AZ_KEYVAULT% ...
az keyvault secret set --vault-name %AZ_KEYVAULT% --name database-connection-string --value "%DATABASE_URL%" || exit /b 1
az keyvault secret set --vault-name %AZ_KEYVAULT% --name jwt-secret --value "%JWT_SECRET%" || exit /b 1
az keyvault secret set --vault-name %AZ_KEYVAULT% --name jwt-refresh-secret --value "%JWT_REFRESH_SECRET%" || exit /b 1

REM App Insights connection string (optional): read from resource
for /f "usebackq tokens=*" %%i in (`az monitor app-insights component show --app %AZ_APPINSIGHTS% --resource-group %AZ_RG% --query connectionString -o tsv`) do set APPINSIGHTS_CONN=%%i
if not "%APPINSIGHTS_CONN%"=="" (
  az keyvault secret set --vault-name %AZ_KEYVAULT% --name appinsights-connection-string --value "%APPINSIGHTS_CONN%" || exit /b 1
) else (
  echo Warning: Could not auto-fetch App Insights connection string. Set it manually if needed.
)

echo Granting Function App managed identity access to Key Vault secrets ...
for /f "usebackq tokens=*" %%i in (`az functionapp identity show --name %AZ_FUNCTIONAPP% --resource-group %AZ_RG% --query principalId -o tsv`) do set FUNC_OBJID=%%i
az keyvault set-policy --name %AZ_KEYVAULT% --object-id %FUNC_OBJID% --secret-permissions get list || exit /b 1

echo Key Vault secrets configured.
endlocal
exit /b 0

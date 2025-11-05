@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

echo Logging into Azure (use az login --use-device-code if browser fails)...
az login || az login --use-device-code || (echo Login failed. && exit /b 1)

if not "%AZ_SUBSCRIPTION_ID%"=="" (
  echo Setting subscription %AZ_SUBSCRIPTION_ID% ...
  az account set --subscription %AZ_SUBSCRIPTION_ID% || (echo Failed to set subscription && exit /b 1)
)

REM Ensure Application Insights extension is available (older CLI requires it)
az extension show --name application-insights >NUL 2>&1 || az extension add --name application-insights || rem continue if built-in

echo Creating resource group %AZ_RG% in %AZ_LOCATION% ...
az group create --name %AZ_RG% --location %AZ_LOCATION% || exit /b 1

echo Creating storage account %AZ_STORAGE% ...
az storage account create --name %AZ_STORAGE% --resource-group %AZ_RG% --location %AZ_LOCATION% --sku Standard_LRS || exit /b 1

echo Creating SQL server %AZ_SQLSERVER% ...
if "%AZ_SQLPASSWORD%"=="" (
  echo ERROR: AZ_SQLPASSWORD is empty. Please set it in 00-az-variables.local.cmd and re-run.
  exit /b 1
)
az sql server create --name %AZ_SQLSERVER% --resource-group %AZ_RG% --location %AZ_LOCATION% --admin-user %AZ_SQLADMIN% --admin-password %AZ_SQLPASSWORD% || exit /b 1

echo Creating SQL database %AZ_SQLDB% ...
az sql db create --resource-group %AZ_RG% --server %AZ_SQLSERVER% --name %AZ_SQLDB% --service-objective S0 || exit /b 1

echo Allowing Azure services to access SQL ...
az sql server firewall-rule create --resource-group %AZ_RG% --server %AZ_SQLSERVER% --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0 || rem continue even if exists

echo Creating Key Vault %AZ_KEYVAULT% ...
az keyvault create --name %AZ_KEYVAULT% --resource-group %AZ_RG% --location %AZ_LOCATION% || exit /b 1

echo Creating Application Insights %AZ_APPINSIGHTS% ...
az monitor app-insights component create --app %AZ_APPINSIGHTS% --location %AZ_LOCATION% --resource-group %AZ_RG% || exit /b 1

echo Creating Function App %AZ_FUNCTIONAPP% ...
az functionapp create --resource-group %AZ_RG% --consumption-plan-location %AZ_LOCATION% --runtime node --runtime-version 18 --functions-version 4 --name %AZ_FUNCTIONAPP% --storage-account %AZ_STORAGE% || exit /b 1

echo Assigning managed identity to Function App ...
az functionapp identity assign --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP% || exit /b 1

echo Core provisioning complete.
endlocal
exit /b 0

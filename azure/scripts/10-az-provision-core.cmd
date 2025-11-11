@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

echo Logging into Azure (use az login --use-device-code if browser fails)...
az login || az login --use-device-code || (echo Login failed. && exit /b 1)

if not "%AZ_SUBSCRIPTION_ID%"=="" (
  echo Setting subscription %AZ_SUBSCRIPTION_ID% ...
  az account set --subscription %AZ_SUBSCRIPTION_ID% || (echo Failed to set subscription && exit /b 1)
)

if "%AZ_PG_ADMIN_PASSWORD%"=="" (
  echo ERROR: AZ_PG_ADMIN_PASSWORD is empty. Set it in 00-az-variables.local.cmd and re-run.
  exit /b 1
)

echo Creating resource group %AZ_RG% in %AZ_LOCATION% ...
az group create --name %AZ_RG% --location %AZ_LOCATION% || exit /b 1

echo Deploying infrastructure via Bicep template ...
az deployment group create ^
  --resource-group %AZ_RG% ^
  --template-file "%~dp0..\infrastructure\main.bicep" ^
  --parameters ^
    location=%AZ_LOCATION% ^
    projectName=eventix ^
    environment=prod ^
    apiContainerImage=%AZ_API_IMAGE% ^
    finalizerContainerImage=%AZ_FINALIZER_IMAGE% ^
    holdCleanerContainerImage=%AZ_HOLD_CLEANER_IMAGE% ^
    postgresAdminUser=%AZ_PG_ADMIN_USER% ^
    postgresAdminPassword=%AZ_PG_ADMIN_PASSWORD% || exit /b 1

echo Provisioning complete. Review outputs above for resource names and endpoints.
endlocal
exit /b 0

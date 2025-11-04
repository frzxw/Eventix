@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

if "%1"=="" (
  echo Usage: 40-az-cors.cmd https://<your-swa>.azurestaticapps.net
  echo Or set AZ_SWA and it will use https://%AZ_SWA%.azurestaticapps.net
)

set ORIGIN=%1
if "%ORIGIN%"=="" set ORIGIN=https://%AZ_SWA%.azurestaticapps.net

echo Adding CORS origin %ORIGIN% to Function App %AZ_FUNCTIONAPP% ...
az functionapp cors add --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP% --allowed-origins %ORIGIN% || exit /b 1

echo Current CORS origins:
az functionapp cors show --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP%

endlocal
exit /b 0

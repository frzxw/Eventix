@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

if "%1"=="" (
  echo Usage: 40-az-cors.cmd [https://your-swa.azurestaticapps.net]
  echo   - If omitted, the script will try AZ_STATIC_WEB_APP or fall back to https://*.azurestaticapps.net
)

set ORIGIN=%~1
if "%ORIGIN%"=="" (
  if not "%AZ_STATIC_WEB_APP%"=="" (
    set ORIGIN=https://%AZ_STATIC_WEB_APP%.azurestaticapps.net
  ) else (
    set ORIGIN=https://*.azurestaticapps.net
  )
)

if "%AZ_FUNCTIONAPP%"=="" (
  echo ERROR: AZ_FUNCTIONAPP is not set. Update 00-az-variables.cmd or the local override.
  exit /b 1
)

echo Adding CORS origin %ORIGIN% to Function App %AZ_FUNCTIONAPP% ...
az functionapp cors add --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP% --allowed-origins %ORIGIN% || exit /b 1

echo Current CORS origins:
az functionapp cors show --resource-group %AZ_RG% --name %AZ_FUNCTIONAPP%

endlocal
exit /b 0

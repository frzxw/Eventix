@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

REM Build and deploy Azure Functions to Function App
pushd "%~dp0..\functions" || (echo Failed to change directory to azure\functions && exit /b 1)

echo Installing dependencies ...
npm ci || (popd & exit /b 1)

echo Building functions ...
npm run build || (popd & exit /b 1)

echo Publishing to Azure Function App %AZ_FUNCTIONAPP% ...
func azure functionapp publish %AZ_FUNCTIONAPP% || (popd & exit /b 1)

echo Functions deployed.
popd
endlocal
exit /b 0

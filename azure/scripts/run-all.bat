@echo off
setlocal

REM Orchestrates full Azure setup for Eventix
REM Usage:
REM   run-all.bat                # runs core steps (no CORS)
REM   run-all.bat https://your-swa.azurestaticapps.net  # also sets CORS
REM Optional env:
REM   set RUN_MIGRATIONS=true
REM   set DATABASE_URL=...   (required when RUN_MIGRATIONS=true)
REM   set DEPLOY_FUNCTIONS=true
REM   set ALLOW_MY_IP=true

call "%~dp0\00-az-variables.cmd" || goto :fail

echo.
echo [1/1] Provisioning Azure resources via Bicep...
call "%~dp0\10-az-provision-core.cmd" || goto :fail

echo.
echo ✅ All steps completed successfully.
goto :eof

:fail
echo.
echo ❌ Script failed with errorlevel %errorlevel%.
exit /b %errorlevel%

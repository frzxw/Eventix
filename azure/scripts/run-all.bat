@echo off
setlocal

REM Orchestrates full Azure setup for Eventix
REM Usage:
REM   run-all.bat                # runs core steps (no CORS)
REM   run-all.bat https://your-swa.azurestaticapps.net  # also sets CORS
REM Optional env:
REM   set RUN_MIGRATIONS=true
REM   set DATABASE_URL=...   (required when RUN_MIGRATIONS=true)

set SWA_URL=%1

call "%~dp0\00-az-variables.cmd" || goto :fail

echo.
echo [1/4] Provisioning core Azure resources...
call "%~dp0\10-az-provision-core.cmd" || goto :fail

echo.
echo [2/4] Creating Key Vault secrets and granting access...
call "%~dp0\20-az-keyvault-secrets.cmd" || goto :fail

echo.
echo [3/4] Configuring Function App settings and storage...
call "%~dp0\30-az-func-settings.cmd" || goto :fail

if not "%SWA_URL%"=="" (
  echo.
  echo [3b/4] Adding CORS origin: %SWA_URL%
  call "%~dp0\40-az-cors.cmd" %SWA_URL% || goto :fail
)

if /I "%RUN_MIGRATIONS%"=="true" (
  echo.
  if "%DATABASE_URL%"=="" (
    echo [WARN] RUN_MIGRATIONS=true but DATABASE_URL not set. Skipping migrations.
  ) else (
    echo [4/4] Running Prisma migrate deploy against target database...
    call "%~dp0\50-prisma-migrate.cmd" || goto :fail
  )
)

echo.
echo ✅ All steps completed successfully.
goto :eof

:fail
echo.
echo ❌ Script failed with errorlevel %errorlevel%.
exit /b %errorlevel%

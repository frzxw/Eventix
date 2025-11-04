@echo off
REM Convenience wrapper to run the full Azure setup from repo root
REM For optional CORS, pass your SWA URL as the first arg, e.g.:
REM   setup-azure.bat https://<your-swa>.azurestaticapps.net
REM To include DB migrations, set RUN_MIGRATIONS=true and DATABASE_URL first.

call "%~dp0azure\scripts\run-all.bat" %*
exit /b %errorlevel%

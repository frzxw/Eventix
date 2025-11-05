@echo off
setlocal

REM Use DATABASE_URL from env or prompt
if "%DATABASE_URL%"=="" (
  echo DATABASE_URL is not set.
  echo Set it in your environment or run this script from a shell where it is defined.
  exit /b 1
)

REM Move to Azure Functions workspace
pushd "%~dp0..\functions" || (echo Failed to change directory to azure\functions && exit /b 1)

echo Installing dependencies (if needed) ...
npm ci || (popd & exit /b 1)

echo Running Prisma migrate deploy ...
npx prisma migrate deploy || (popd & exit /b 1)

echo Prisma migrations applied.
popd
endlocal
exit /b 0

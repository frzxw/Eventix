@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

REM Generate fallback secrets if none provided (do not use in production)
if "%JWT_SECRET%"=="" set JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%_jwt_secret_change_me
if "%JWT_REFRESH_SECRET%"=="" set JWT_REFRESH_SECRET=%RANDOM%%RANDOM%%RANDOM%_jwt_refresh_change_me
if "%PAYMENT_ENCRYPTION_KEY%"=="" set PAYMENT_ENCRYPTION_KEY=%RANDOM%%RANDOM%%RANDOM%_paykey_change_me

echo Seeding application secrets in %AZ_KEYVAULT% ...
az keyvault secret set --vault-name %AZ_KEYVAULT% --name JWT_SECRET --value "%JWT_SECRET%" || exit /b 1
az keyvault secret set --vault-name %AZ_KEYVAULT% --name JWT_REFRESH_SECRET --value "%JWT_REFRESH_SECRET%" || exit /b 1
az keyvault secret set --vault-name %AZ_KEYVAULT% --name PAYMENT_ENCRYPTION_KEY --value "%PAYMENT_ENCRYPTION_KEY%" || exit /b 1

echo Application secrets updated. Container Apps already have get/list permissions via Bicep deployment.
endlocal
exit /b 0

@echo off
setlocal
call "%~dp0\00-az-variables.cmd"

REM Try to detect current public IP using PowerShell (no external dependencies)
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing http://ifconfig.me/ip).Content.Trim()}catch{''}"`) do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
  echo Could not automatically detect your public IP. You can set a firewall rule manually:
  echo   az sql server firewall-rule create --resource-group %AZ_RG% --server %AZ_SQLSERVER% --name AllowClientIP --start-ip-address <YOUR_IP> --end-ip-address <YOUR_IP>
  exit /b 0
)

echo Adding SQL firewall rule for client IP: %PUBLIC_IP% ...
az sql server firewall-rule create --resource-group %AZ_RG% --server %AZ_SQLSERVER% --name AllowClientIP --start-ip-address %PUBLIC_IP% --end-ip-address %PUBLIC_IP% || rem continue if exists

echo SQL firewall rule configured.
endlocal
exit /b 0

@echo off
echo ================================
echo Testing SSH Key from Azure
echo ================================
echo.

echo Fetching SSH key from Azure Key Vault...
az keyvault secret show --vault-name stocker-kv-prod --name docker-management-ssh-key --query value -o tsv > %TEMP%\docker_key.txt

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to fetch SSH key from Azure Key Vault
    exit /b 1
)

echo SSH key retrieved successfully!
echo.
echo Testing connection to server...
ssh -i %TEMP%\docker_key.txt -o StrictHostKeyChecking=no root@95.217.219.4 "echo SSH connection successful && docker --version"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: SSH connection works with Azure Key Vault key!
) else (
    echo.
    echo ERROR: SSH connection failed
)

del %TEMP%\docker_key.txt 2>nul
echo.
echo ================================
echo Test Complete
echo ================================
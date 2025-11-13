@echo off
echo =====================================
echo Docker Cache Cleanup on Server
echo =====================================
echo.

echo Fetching SSH key from Azure Key Vault...
az keyvault secret show --vault-name stocker-kv-prod --name docker-management-ssh-key --query value -o tsv > %TEMP%\docker_clean.key

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to fetch SSH key from Azure Key Vault
    exit /b 1
)

echo SSH key retrieved successfully!
echo.

echo =====================================
echo Disk usage BEFORE cleanup:
echo =====================================
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "df -h / && echo && docker system df"
echo.

echo =====================================
echo Starting Docker cleanup...
echo =====================================
echo.

echo 1. Cleaning Docker build cache...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker builder prune -af"
echo.

echo 2. Cleaning unused images...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker image prune -af"
echo.

echo 3. Cleaning stopped containers...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker container prune -f"
echo.

echo 4. Cleaning unused volumes...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker volume prune -f"
echo.

echo 5. Cleaning unused networks...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker network prune -f"
echo.

echo 6. Running comprehensive system prune...
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "docker system prune -af --volumes"
echo.

echo =====================================
echo Disk usage AFTER cleanup:
echo =====================================
ssh -i %TEMP%\docker_clean.key -o StrictHostKeyChecking=no root@95.217.219.4 "df -h / && echo && docker system df"

del %TEMP%\docker_clean.key 2>nul

echo.
echo =====================================
echo Docker Cleanup Complete!
echo =====================================
@echo off
echo SSH Key to Base64 Encoder for Docker Management
echo ================================================
echo.

:: Check if PowerShell is available
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PowerShell is not available
    exit /b 1
)

:: Run PowerShell command to encode SSH key
echo Enter the path to your SSH private key:
set /p SSH_KEY_PATH="Path (e.g., C:\Users\%USERNAME%\.ssh\id_rsa): "

if not exist "%SSH_KEY_PATH%" (
    echo Error: File not found at %SSH_KEY_PATH%
    exit /b 1
)

echo.
echo Encoding SSH key to Base64...

:: Use PowerShell to encode
powershell -Command "$content = Get-Content '%SSH_KEY_PATH%' -Raw; $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content)); $base64 | Out-File 'ssh_key_base64.txt' -NoNewline -Encoding ASCII; Write-Host 'Success! Base64 encoded key saved to ssh_key_base64.txt' -ForegroundColor Green; Write-Host 'Length:' $base64.Length 'characters' -ForegroundColor Cyan"

echo.
echo ========================================
echo Next Steps:
echo 1. Open ssh_key_base64.txt
echo 2. Copy the entire content (it's one long line)
echo 3. Go to Coolify dashboard
echo 4. Add environment variable:
echo    Key: DockerManagement__SshKeyBase64
echo    Value: [paste the base64 content]
echo.
echo Also add these variables if not present:
echo    DockerManagement__SshHost = 95.217.219.4
echo    DockerManagement__SshUser = root
echo ========================================
pause
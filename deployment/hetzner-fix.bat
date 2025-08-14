@echo off
echo =====================================
echo  Hetzner VPS SSH Connection Helper
echo =====================================
echo.
echo VPS IP: 91.98.36.110
echo.
echo Trying different connection methods...
echo.

echo 1. Trying standard SSH connection...
echo Command: ssh root@91.98.36.110
ssh root@91.98.36.110

echo.
echo 2. If that failed, trying with password authentication forced...
echo Command: ssh -o PreferredAuthentications=password root@91.98.36.110
ssh -o PreferredAuthentications=password root@91.98.36.110

echo.
echo 3. Trying without key authentication...
echo Command: ssh -o PubkeyAuthentication=no root@91.98.36.110
ssh -o PubkeyAuthentication=no root@91.98.36.110

echo.
echo =====================================
echo If all methods failed, try:
echo 1. Check Hetzner email for correct credentials
echo 2. Use Hetzner Web Console
echo 3. Try PuTTY instead
echo =====================================
pause
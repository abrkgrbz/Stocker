@echo off
echo Starting Stocker Portal...
echo.
echo Make sure you have added these entries to your hosts file:
echo 127.0.0.1    tenant1.stocker.local
echo 127.0.0.1    tenant2.stocker.local
echo.
echo Portal will be available at:
echo - http://tenant1.stocker.local:5232
echo - http://tenant2.stocker.local:5232
echo - http://localhost:5232
echo.
dotnet run --urls "http://*:5232"
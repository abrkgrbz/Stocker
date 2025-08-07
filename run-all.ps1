## Çalıştırmak için: powershell -ExecutionPolicy Bypass -File .\run-all.ps1

# Script to run both API and Web Portal
Write-Host "Starting Stocker Multi-Tenant Application..." -ForegroundColor Green
Write-Host ""

# Check if hosts file is configured
Write-Host "Checking hosts file configuration..." -ForegroundColor Yellow
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue

$requiredHosts = @(
    "127.0.0.1       stocker.local",
    "127.0.0.1       test001.stocker.local",
    "127.0.0.1       abc001.stocker.local",
    "127.0.0.1       demo.stocker.local"
)

$missingHosts = @()
foreach ($host in $requiredHosts) {
    if ($hostsContent -notcontains $host) {
        $missingHosts += $host
    }
}

if ($missingHosts.Count -gt 0) {
    Write-Host "WARNING: The following entries are missing from your hosts file:" -ForegroundColor Red
    $missingHosts | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Please add them to: $hostsPath" -ForegroundColor Yellow
    Write-Host ""
}

# Start API in new window
Write-Host "Starting API (http://localhost:5104)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src\API\Stocker.API; dotnet run"

# Wait a bit for API to start
Start-Sleep -Seconds 3

# Start Web Portal in new window
Write-Host "Starting Web Portal (http://localhost:5232)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src\Web\Stocker.Web.Portal; dotnet run"

Write-Host ""
Write-Host "Applications are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Test URLs:" -ForegroundColor Yellow
Write-Host "  API Health Check: http://localhost:5104/api/test/health" -ForegroundColor White
Write-Host "  Portal (no tenant): http://localhost:5232" -ForegroundColor White
Write-Host "  Portal (test001): http://test001.stocker.local:5232" -ForegroundColor White
Write-Host "  Portal (abc001): http://abc001.stocker.local:5232" -ForegroundColor White
Write-Host "  Portal (demo): http://demo.stocker.local:5232" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open test page in browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open test page in default browser
Start-Process "http://test001.stocker.local:5232/login"
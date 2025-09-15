# Simple API Test Script
# Tests the API without authentication first

param(
    [string]$BaseUrl = "https://localhost:7001"
)

Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Simple API Test" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# Test 1: Health Check (No Auth Required)
Write-Host "`nTesting Health Endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ Health Check: API is running!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
}

# Test 2: Try to get login page or public endpoint
Write-Host "`nTesting Public Endpoints..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/public/packages" -Method GET -SkipCertificateCheck
    Write-Host "✅ Public Packages endpoint accessible" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Public endpoint not accessible: $_" -ForegroundColor Yellow
}

Write-Host "`n============================================" -ForegroundColor Yellow
Write-Host "Performance Test Önerileri:" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. API'yi development modda başlatın:" -ForegroundColor Cyan
Write-Host "   cd src/API/Stocker.API" -ForegroundColor White
Write-Host "   dotnet run --environment Development" -ForegroundColor White
Write-Host ""
Write-Host "2. Swagger UI'dan token alın:" -ForegroundColor Cyan
Write-Host "   Tarayıcıda: $BaseUrl/swagger" -ForegroundColor White
Write-Host "   - Authorize butonuna tıklayın" -ForegroundColor Gray
Write-Host "   - Test kullanıcı bilgileriyle giriş yapın" -ForegroundColor Gray
Write-Host "   - Token'ı kopyalayın" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Performance testini çalıştırın:" -ForegroundColor Cyan
Write-Host "   .\scripts\performance-test.ps1 -Token 'your-jwt-token'" -ForegroundColor White
Write-Host ""
Write-Host "4. Veya manuel test için:" -ForegroundColor Cyan
Write-Host "   # Customer listesi (pagination testi)" -ForegroundColor Gray
Write-Host "   Invoke-RestMethod -Uri '$BaseUrl/api/tenants/{tenantId}/customers?page=1&pageSize=20' -Headers @{Authorization='Bearer YOUR_TOKEN'}" -ForegroundColor White
Write-Host ""
Write-Host "   # Customer by ID (cache testi)" -ForegroundColor Gray
Write-Host "   Invoke-RestMethod -Uri '$BaseUrl/api/tenants/{tenantId}/customers/{customerId}' -Headers @{Authorization='Bearer YOUR_TOKEN'}" -ForegroundColor White
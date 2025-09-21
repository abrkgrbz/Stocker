# Test Hangfire authentication with cookie-based approach

$token = "YOUR_JWT_TOKEN_HERE"
$baseUrl = "https://localhost:7230"

# First request with token in query string (should set cookie)
Write-Host "1. Testing initial request with token in query string..." -ForegroundColor Yellow
$response1 = Invoke-WebRequest -Uri "$baseUrl/hangfire?access_token=$token" -UseBasicParsing -SkipCertificateCheck -SessionVariable session
Write-Host "Response Status: $($response1.StatusCode)" -ForegroundColor Green
Write-Host "Cookies set: $($session.Cookies.GetCookies($baseUrl) | ForEach-Object { $_.Name })" -ForegroundColor Cyan

# Second request to API endpoint (should use cookie)
Write-Host "`n2. Testing API request with cookie..." -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/hangfire/stats" -UseBasicParsing -SkipCertificateCheck -WebSession $session
    Write-Host "Response Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Stats endpoint accessible with cookie!" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Authentication failed - cookie not working" -ForegroundColor Red
    }
}

# Third request to static resources
Write-Host "`n3. Testing static resource access..." -ForegroundColor Yellow
try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/hangfire/css" -UseBasicParsing -SkipCertificateCheck -WebSession $session
    Write-Host "Response Status: $($response3.StatusCode)" -ForegroundColor Green
    Write-Host "Static resources accessible!" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Magenta
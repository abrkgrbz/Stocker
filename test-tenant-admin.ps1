# Test Tenant Admin Login Script

$baseUrl = "http://localhost:5104"
$tenantCode = "test001"

Write-Host "Testing Tenant Admin Login..." -ForegroundColor Green

# 1. Login with tenantadmin user
Write-Host "`n1. Logging in with tenantadmin user to tenant: $tenantCode" -ForegroundColor Yellow

$loginBody = @{
    username = "tenantadmin"
    password = "Admin123!"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Tenant-Code" = $tenantCode
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -Headers $headers
    
    if ($response.success) {
        Write-Host "✓ Login successful!" -ForegroundColor Green
        Write-Host "Access Token: $($response.data.accessToken.Substring(0, 50))..." -ForegroundColor Cyan
        Write-Host "User Info:" -ForegroundColor Yellow
        Write-Host "  - ID: $($response.data.user.id)"
        Write-Host "  - Username: $($response.data.user.username)"
        Write-Host "  - Email: $($response.data.user.email)"
        Write-Host "  - Tenant ID: $($response.data.user.tenantId)"
        Write-Host "  - Tenant Name: $($response.data.user.tenantName)"
        Write-Host "  - Is Master User: $($response.data.user.isMasterUser)"
        Write-Host "  - Roles: $($response.data.user.roles -join ', ')"
        
        # 2. Test authenticated endpoint
        Write-Host "`n2. Testing authenticated endpoint..." -ForegroundColor Yellow
        
        $authHeaders = @{
            "Authorization" = "Bearer $($response.data.accessToken)"
            "X-Tenant-Code" = $tenantCode
        }
        
        $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $authHeaders
        
        if ($meResponse.success) {
            Write-Host "✓ Authenticated endpoint test successful!" -ForegroundColor Green
            Write-Host "Current user verified: $($meResponse.data.username)" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "✗ Login failed!" -ForegroundColor Red
        Write-Host "Errors: $($response.errors -join ', ')" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Error occurred during login!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed." -ForegroundColor Green
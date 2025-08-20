# PowerShell script to test Stocker API
$baseUrl = "http://95.217.219.4:5000"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Stocker API on Coolify" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Write-Host "Health Status: " -NoNewline
Write-Host $response.status -ForegroundColor Green

# 2. Register a new user/tenant
Write-Host "`n2. Registering new tenant..." -ForegroundColor Yellow
$registerBody = @{
    email = "test$(Get-Random -Maximum 9999)@company.com"
    password = "Test123!@#"
    firstName = "Test"
    lastName = "User"
    companyName = "Test Company $(Get-Random -Maximum 9999)"
    companyCode = "test$(Get-Random -Maximum 9999)"
    phoneNumber = "+905551234567"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.userId)"
    Write-Host "Email: $($registerBody | ConvertFrom-Json | Select -ExpandProperty email)"
    $testEmail = $registerBody | ConvertFrom-Json | Select -ExpandProperty email
    $testPassword = "Test123!@#"
} catch {
    Write-Host "Registration failed: $_" -ForegroundColor Red
    # Use existing credentials
    $testEmail = "test@company.com"
    $testPassword = "Test123!@#"
}

# 3. Login to get JWT token
Write-Host "`n3. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Save user info
    if ($loginResponse.tenantId) {
        $tenantId = $loginResponse.tenantId
        Write-Host "Tenant ID: $tenantId" -ForegroundColor Cyan
    }
    if ($loginResponse.tenantCode) {
        $tenantCode = $loginResponse.tenantCode
        Write-Host "Tenant Code: $tenantCode" -ForegroundColor Cyan
        Write-Host "Tenant Domain: $tenantCode.stocker.app" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Get current user info
Write-Host "`n4. Getting current user info..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $userInfo = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
    Write-Host "User Info Retrieved:" -ForegroundColor Green
    Write-Host "Name: $($userInfo.firstName) $($userInfo.lastName)"
    Write-Host "Email: $($userInfo.email)"
    Write-Host "User Type: $($userInfo.userType)"
} catch {
    Write-Host "Failed to get user info: $_" -ForegroundColor Red
}

# 5. Test tenant database creation
if ($tenantId) {
    Write-Host "`n5. Checking tenant database..." -ForegroundColor Yellow
    try {
        $dbStatus = Invoke-RestMethod -Uri "$baseUrl/api/admin/tenants/$tenantId/database/status" -Method Get -Headers $headers
        Write-Host "Database Status: $($dbStatus.status)" -ForegroundColor Green
    } catch {
        Write-Host "Could not check database status: $_" -ForegroundColor Red
    }
}

# 6. Test CRM module
if ($tenantId) {
    Write-Host "`n6. Testing CRM Module..." -ForegroundColor Yellow
    
    # Add tenant header
    $crmHeaders = @{
        "Authorization" = "Bearer $token"
        "X-Tenant-Id" = $tenantId
    }
    
    # Create a customer
    $customerBody = @{
        name = "Test Customer $(Get-Random -Maximum 999)"
        email = "customer$(Get-Random -Maximum 9999)@test.com"
        phone = "+905551234567"
        address = "Test Address"
        city = "Istanbul"
        country = "Turkey"
        postalCode = "34000"
        taxNumber = "1234567890"
    } | ConvertTo-Json
    
    try {
        $customer = Invoke-RestMethod -Uri "$baseUrl/api/crm/customers" -Method Post -Body $customerBody -Headers $crmHeaders -ContentType "application/json"
        Write-Host "Customer created successfully!" -ForegroundColor Green
        Write-Host "Customer ID: $($customer.id)"
    } catch {
        Write-Host "Failed to create customer: $_" -ForegroundColor Red
    }
    
    # Get all customers
    try {
        $customers = Invoke-RestMethod -Uri "$baseUrl/api/crm/customers" -Method Get -Headers $crmHeaders
        Write-Host "Total customers: $($customers.Count)" -ForegroundColor Green
    } catch {
        Write-Host "Failed to get customers: $_" -ForegroundColor Red
    }
}

# 7. Test tenant resolution via subdomain
if ($tenantCode) {
    Write-Host "`n7. Testing tenant resolution via subdomain..." -ForegroundColor Yellow
    $subdomainHeaders = @{
        "Host" = "$tenantCode.stocker.app"
    }
    
    try {
        $tenantInfo = Invoke-RestMethod -Uri "$baseUrl/api/tenant/info" -Method Get -Headers $subdomainHeaders
        Write-Host "Tenant resolved via subdomain!" -ForegroundColor Green
        Write-Host "Tenant Name: $($tenantInfo.name)"
    } catch {
        Write-Host "Subdomain resolution failed: $_" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
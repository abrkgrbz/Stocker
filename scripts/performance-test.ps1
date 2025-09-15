# Performance Test Script for Stocker API
# Tests key endpoints to measure performance improvements

param(
    [string]$BaseUrl = "https://localhost:7001",
    [string]$TenantId = "00000000-0000-0000-0000-000000000001",
    [string]$Token = "",
    [int]$TestIterations = 10
)

# Performance test results storage
$results = @{
    TestName = "Performance Optimization Test"
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Results = @()
}

# Helper function to measure endpoint performance
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Cyan
    
    $times = @()
    $errors = 0
    
    for ($i = 1; $i -le $TestIterations; $i++) {
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            $params = @{
                Uri = "$BaseUrl$Endpoint"
                Method = $Method
                Headers = $Headers
                ContentType = "application/json"
                SkipCertificateCheck = $true
            }
            
            if ($Body) {
                $params.Body = $Body
            }
            
            $response = Invoke-RestMethod @params
            $stopwatch.Stop()
            
            $times += $stopwatch.ElapsedMilliseconds
            Write-Host "  Iteration $i: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Gray
        }
        catch {
            $errors++
            Write-Host "  Iteration $i: ERROR - $_" -ForegroundColor Red
        }
    }
    
    if ($times.Count -gt 0) {
        $avg = ($times | Measure-Object -Average).Average
        $min = ($times | Measure-Object -Minimum).Minimum
        $max = ($times | Measure-Object -Maximum).Maximum
        
        $result = @{
            Endpoint = $Name
            Method = $Method
            Path = $Endpoint
            AverageMs = [math]::Round($avg, 2)
            MinMs = $min
            MaxMs = $max
            Errors = $errors
            Iterations = $TestIterations
        }
        
        Write-Host "  Average: $([math]::Round($avg, 2))ms | Min: ${min}ms | Max: ${max}ms" -ForegroundColor Green
        if ($errors -gt 0) {
            Write-Host "  Errors: $errors" -ForegroundColor Yellow
        }
    }
    else {
        $result = @{
            Endpoint = $Name
            Method = $Method
            Path = $Endpoint
            AverageMs = -1
            MinMs = -1
            MaxMs = -1
            Errors = $errors
            Iterations = $TestIterations
        }
        Write-Host "  All iterations failed!" -ForegroundColor Red
    }
    
    Write-Host ""
    return $result
}

# Main test execution
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Stocker API Performance Test" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Base URL: $BaseUrl"
Write-Host "Tenant ID: $TenantId"
Write-Host "Test Iterations: $TestIterations"
Write-Host ""

# Set up headers
$headers = @{
    "Accept" = "application/json"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

# Test 1: Get Users List (Pagination Test)
$results.Results += Test-Endpoint `
    -Name "Get Users List (Page 1, Size 20)" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/users?page=1&pageSize=20" `
    -Headers $headers

# Test 2: Get Users with Search (N+1 Query Test)
$results.Results += Test-Endpoint `
    -Name "Get Users with Search" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/users?page=1&pageSize=10&searchTerm=admin" `
    -Headers $headers

# Test 3: Get Customer by ID (Cache Test - First Request)
$customerId = "00000000-0000-0000-0000-000000000001"
$results.Results += Test-Endpoint `
    -Name "Get Customer by ID (First Request - No Cache)" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/customers/$customerId" `
    -Headers $headers

# Test 4: Get Customer by ID (Cache Test - Cached Request)
$results.Results += Test-Endpoint `
    -Name "Get Customer by ID (Cached Request)" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/customers/$customerId" `
    -Headers $headers

# Test 5: Get Customers List (Pagination + Search)
$results.Results += Test-Endpoint `
    -Name "Get Customers List (Page 1, Size 50)" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/customers?page=1&pageSize=50" `
    -Headers $headers

# Test 6: Get Invoices List (Complex Query with Filters)
$results.Results += Test-Endpoint `
    -Name "Get Invoices List with Filters" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/invoices?page=1&pageSize=20&status=Sent" `
    -Headers $headers

# Test 7: Get User by ID (N+1 Query Test)
$userId = "00000000-0000-0000-0000-000000000001"
$results.Results += Test-Endpoint `
    -Name "Get User Details by ID" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/users/$userId" `
    -Headers $headers

# Test 8: Get Roles (N+1 Query Test)
$results.Results += Test-Endpoint `
    -Name "Get Roles List" `
    -Method "GET" `
    -Endpoint "/api/tenants/$TenantId/users/roles" `
    -Headers $headers

# Generate Summary Report
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Performance Test Summary" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

$totalAvg = 0
$totalTests = 0
$failedTests = 0

foreach ($result in $results.Results) {
    if ($result.AverageMs -gt 0) {
        $totalAvg += $result.AverageMs
        $totalTests++
        
        # Performance categorization
        $performance = "Good"
        $color = "Green"
        
        if ($result.AverageMs -gt 500) {
            $performance = "Poor"
            $color = "Red"
        }
        elseif ($result.AverageMs -gt 200) {
            $performance = "Fair"
            $color = "Yellow"
        }
        
        Write-Host "$($result.Endpoint): $($result.AverageMs)ms - $performance" -ForegroundColor $color
    }
    else {
        $failedTests++
        Write-Host "$($result.Endpoint): FAILED" -ForegroundColor Red
    }
}

if ($totalTests -gt 0) {
    $overallAvg = [math]::Round($totalAvg / $totalTests, 2)
    Write-Host ""
    Write-Host "Overall Average Response Time: ${overallAvg}ms" -ForegroundColor Cyan
    Write-Host "Successful Tests: $totalTests" -ForegroundColor Green
    if ($failedTests -gt 0) {
        Write-Host "Failed Tests: $failedTests" -ForegroundColor Red
    }
}

# Save results to JSON file
$outputFile = "performance-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$results | ConvertTo-Json -Depth 10 | Out-File $outputFile
Write-Host ""
Write-Host "Results saved to: $outputFile" -ForegroundColor Gray

# Performance Recommendations
Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Performance Analysis" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

# Check cache effectiveness
$noCacheResult = $results.Results | Where-Object { $_.Endpoint -like "*No Cache*" } | Select-Object -First 1
$cachedResult = $results.Results | Where-Object { $_.Endpoint -like "*Cached Request*" } | Select-Object -First 1

if ($noCacheResult -and $cachedResult) {
    $cacheImprovement = [math]::Round((($noCacheResult.AverageMs - $cachedResult.AverageMs) / $noCacheResult.AverageMs) * 100, 2)
    if ($cacheImprovement -gt 0) {
        Write-Host "✅ Cache Effectiveness: ${cacheImprovement}% improvement on cached requests" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Cache may not be working properly" -ForegroundColor Yellow
    }
}

# Check pagination performance
$paginationResults = $results.Results | Where-Object { $_.Path -like "*page=*" }
if ($paginationResults) {
    $avgPagination = ($paginationResults | Measure-Object -Property AverageMs -Average).Average
    if ($avgPagination -lt 200) {
        Write-Host "✅ Pagination Performance: Good (Avg: $([math]::Round($avgPagination, 2))ms)" -ForegroundColor Green
    }
    elseif ($avgPagination -lt 500) {
        Write-Host "⚠️ Pagination Performance: Fair (Avg: $([math]::Round($avgPagination, 2))ms)" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Pagination Performance: Poor (Avg: $([math]::Round($avgPagination, 2))ms)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
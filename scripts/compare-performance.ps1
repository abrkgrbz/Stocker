# Performance Comparison Script
# Compares two performance test result files to show improvements

param(
    [Parameter(Mandatory=$true)]
    [string]$BeforeFile,
    
    [Parameter(Mandatory=$true)]
    [string]$AfterFile
)

# Load the JSON files
if (-not (Test-Path $BeforeFile)) {
    Write-Host "Error: Before file not found: $BeforeFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $AfterFile)) {
    Write-Host "Error: After file not found: $AfterFile" -ForegroundColor Red
    exit 1
}

$before = Get-Content $BeforeFile | ConvertFrom-Json
$after = Get-Content $AfterFile | ConvertFrom-Json

Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Performance Comparison Report" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "Before: $($before.Timestamp)"
Write-Host "After:  $($after.Timestamp)"
Write-Host ""

# Create comparison table
$comparisons = @()

foreach ($beforeResult in $before.Results) {
    $afterResult = $after.Results | Where-Object { $_.Endpoint -eq $beforeResult.Endpoint } | Select-Object -First 1
    
    if ($afterResult) {
        $improvement = if ($beforeResult.AverageMs -gt 0 -and $afterResult.AverageMs -gt 0) {
            [math]::Round((($beforeResult.AverageMs - $afterResult.AverageMs) / $beforeResult.AverageMs) * 100, 2)
        } else { 0 }
        
        $comparison = [PSCustomObject]@{
            Endpoint = $beforeResult.Endpoint
            Before = "$($beforeResult.AverageMs)ms"
            After = "$($afterResult.AverageMs)ms"
            Improvement = "${improvement}%"
            Status = if ($improvement -gt 20) { "🚀 Excellent" } 
                    elseif ($improvement -gt 10) { "✅ Good" }
                    elseif ($improvement -gt 0) { "👍 Better" }
                    elseif ($improvement -eq 0) { "➖ No Change" }
                    else { "⚠️ Slower" }
        }
        
        $comparisons += $comparison
    }
}

# Display results
Write-Host "Endpoint Performance Comparison:" -ForegroundColor Cyan
Write-Host ""

$comparisons | Format-Table -AutoSize

# Calculate overall statistics
$totalBefore = 0
$totalAfter = 0
$count = 0

foreach ($comp in $comparisons) {
    $beforeMs = [double]($comp.Before -replace 'ms', '')
    $afterMs = [double]($comp.After -replace 'ms', '')
    
    if ($beforeMs -gt 0 -and $afterMs -gt 0) {
        $totalBefore += $beforeMs
        $totalAfter += $afterMs
        $count++
    }
}

if ($count -gt 0) {
    $avgBefore = [math]::Round($totalBefore / $count, 2)
    $avgAfter = [math]::Round($totalAfter / $count, 2)
    $overallImprovement = [math]::Round((($avgBefore - $avgAfter) / $avgBefore) * 100, 2)
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Yellow
    Write-Host "Overall Statistics" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Yellow
    Write-Host "Average Response Time Before: ${avgBefore}ms" -ForegroundColor Red
    Write-Host "Average Response Time After:  ${avgAfter}ms" -ForegroundColor Green
    Write-Host "Overall Improvement:          ${overallImprovement}%" -ForegroundColor Cyan
    
    # Performance optimization breakdown
    Write-Host ""
    Write-Host "Optimization Impact Analysis:" -ForegroundColor Yellow
    
    # Check cache impact
    $cacheEndpoints = $comparisons | Where-Object { $_.Endpoint -like "*Customer*ID*" }
    if ($cacheEndpoints) {
        $cacheImprovements = $cacheEndpoints | ForEach-Object {
            [double]($_.Improvement -replace '%', '')
        }
        $avgCacheImprovement = ($cacheImprovements | Measure-Object -Average).Average
        Write-Host "  🔄 Redis Cache Impact: $([math]::Round($avgCacheImprovement, 2))% average improvement" -ForegroundColor Green
    }
    
    # Check pagination impact
    $paginationEndpoints = $comparisons | Where-Object { $_.Endpoint -like "*List*" -or $_.Endpoint -like "*Page*" }
    if ($paginationEndpoints) {
        $pagImprovements = $paginationEndpoints | ForEach-Object {
            [double]($_.Improvement -replace '%', '')
        }
        $avgPagImprovement = ($pagImprovements | Measure-Object -Average).Average
        Write-Host "  📄 Pagination Impact: $([math]::Round($avgPagImprovement, 2))% average improvement" -ForegroundColor Green
    }
    
    # Check N+1 query fixes
    $queryEndpoints = $comparisons | Where-Object { $_.Endpoint -like "*User*" -or $_.Endpoint -like "*Role*" }
    if ($queryEndpoints) {
        $queryImprovements = $queryEndpoints | ForEach-Object {
            [double]($_.Improvement -replace '%', '')
        }
        $avgQueryImprovement = ($queryImprovements | Measure-Object -Average).Average
        Write-Host "  🔍 N+1 Query Fixes: $([math]::Round($avgQueryImprovement, 2))% average improvement" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # Final verdict
    if ($overallImprovement -gt 30) {
        Write-Host "🎉 EXCELLENT: Performance optimizations were highly successful!" -ForegroundColor Green
        Write-Host "   The application is now significantly faster." -ForegroundColor Gray
    }
    elseif ($overallImprovement -gt 15) {
        Write-Host "✅ GOOD: Performance optimizations showed meaningful improvements." -ForegroundColor Green
        Write-Host "   Users will notice faster response times." -ForegroundColor Gray
    }
    elseif ($overallImprovement -gt 5) {
        Write-Host "👍 MODERATE: Some performance improvements achieved." -ForegroundColor Yellow
        Write-Host "   Consider additional optimizations for better results." -ForegroundColor Gray
    }
    elseif ($overallImprovement -gt 0) {
        Write-Host "📊 MINIMAL: Small performance improvements detected." -ForegroundColor Yellow
        Write-Host "   More aggressive optimizations may be needed." -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️ NO IMPROVEMENT: Performance did not improve or got worse." -ForegroundColor Red
        Write-Host "   Review the optimization implementation." -ForegroundColor Gray
    }
}

# Save comparison report
$reportFile = "performance-comparison-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report = @{
    BeforeFile = $BeforeFile
    AfterFile = $AfterFile
    BeforeTimestamp = $before.Timestamp
    AfterTimestamp = $after.Timestamp
    Comparisons = $comparisons
    OverallImprovement = "${overallImprovement}%"
    AverageBefore = "${avgBefore}ms"
    AverageAfter = "${avgAfter}ms"
}

$report | ConvertTo-Json -Depth 10 | Out-File $reportFile
Write-Host ""
Write-Host "Comparison report saved to: $reportFile" -ForegroundColor Gray
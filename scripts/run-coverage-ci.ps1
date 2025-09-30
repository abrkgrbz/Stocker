# PowerShell script for CI/CD coverage with threshold checking
param(
    [int]$MinimumCoverage = 30,
    [string]$TestFilter = ""
)

Write-Host "CI/CD Coverage Check" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Minimum Coverage Threshold: $MinimumCoverage%" -ForegroundColor Yellow

# Clean previous coverage data
if (Test-Path "./coverage") {
    Remove-Item -Recurse -Force "./coverage"
}
New-Item -ItemType Directory -Force -Path "./coverage" | Out-Null

# Run tests with coverage
Write-Host "`nRunning tests with coverage..." -ForegroundColor Cyan

$testArgs = @(
    "test",
    "/p:CollectCoverage=true",
    "/p:CoverletOutputFormat=json%2ccobertura",
    "/p:CoverletOutput=./coverage/",
    "/p:MergeWith=./coverage/coverage.json",
    "/p:Exclude=`"[xunit*]*,[*.Tests]*,[*.IntegrationTests]*,[*.TestUtilities]*,[*.Migrations]*`"",
    "/p:ExcludeByAttribute=`"Obsolete,GeneratedCode,CompilerGenerated`"",
    "--no-build",
    "--verbosity", "minimal"
)

if ($TestFilter -ne "") {
    $testArgs += "--filter", $TestFilter
}

$output = & dotnet $testArgs 2>&1
$testResult = $LASTEXITCODE

# Display test output
Write-Host $output

if ($testResult -ne 0) {
    Write-Host "`nTests failed!" -ForegroundColor Red
    exit 1
}

# Parse coverage results
$coveragePattern = "Total\s+\|\s+(\d+\.?\d*)"
$coverageMatch = $output | Select-String -Pattern $coveragePattern

if ($coverageMatch) {
    $coverage = [double]($coverageMatch.Matches[0].Groups[1].Value)

    Write-Host "`n======================================" -ForegroundColor Cyan
    Write-Host "Coverage Result: $coverage%" -ForegroundColor $(if ($coverage -ge $MinimumCoverage) { "Green" } else { "Red" })
    Write-Host "Minimum Required: $MinimumCoverage%" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Cyan

    if ($coverage -lt $MinimumCoverage) {
        Write-Host "`nCoverage is below minimum threshold!" -ForegroundColor Red
        Write-Host "Please add more tests to improve coverage." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "`nCoverage meets minimum threshold!" -ForegroundColor Green
    }

    # Generate simple coverage report for CI artifacts
    @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Coverage = $coverage
        MinimumThreshold = $MinimumCoverage
        Status = if ($coverage -ge $MinimumCoverage) { "PASSED" } else { "FAILED" }
    } | ConvertTo-Json | Out-File -FilePath "./coverage/coverage-summary.json"

} else {
    Write-Host "`nCould not determine coverage percentage!" -ForegroundColor Red
    exit 1
}

Write-Host "`nCI coverage check completed successfully!" -ForegroundColor Green
exit 0
# Simple PowerShell script for quick coverage checks
param(
    [switch]$UnitOnly,
    [switch]$IntegrationOnly
)

Write-Host "Quick Coverage Check" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Cyan

# Clean previous coverage data
if (Test-Path "./coverage-result.txt") {
    Remove-Item -Force "./coverage-result.txt"
}

# Determine which tests to run
$testCommand = ""
if ($UnitOnly) {
    Write-Host "Running Unit Tests Only" -ForegroundColor Yellow
    $testCommand = "dotnet test tests/Stocker.UnitTests/Stocker.UnitTests.csproj"
} elseif ($IntegrationOnly) {
    Write-Host "Running Integration Tests Only" -ForegroundColor Yellow
    $testCommand = "dotnet test tests/Stocker.IntegrationTests/Stocker.IntegrationTests.csproj"
} else {
    Write-Host "Running All Tests" -ForegroundColor Yellow
    $testCommand = "dotnet test"
}

# Run tests with coverage
Write-Host "`nExecuting tests with coverage..." -ForegroundColor Cyan

$output = & cmd /c "$testCommand /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:Exclude=`"[xunit*]*,[*.Tests]*,[*.IntegrationTests]*`" --no-build --verbosity minimal 2>&1"

# Filter and display coverage results
$coverageInfo = $output | Select-String -Pattern "Coverage|Line|Branch|Method" | Out-String

if ($coverageInfo) {
    Write-Host "`nCoverage Results:" -ForegroundColor Green
    Write-Host $coverageInfo -ForegroundColor Yellow

    # Save to file
    $coverageInfo | Out-File -FilePath "./coverage-result.txt"
    Write-Host "`nResults saved to coverage-result.txt" -ForegroundColor Cyan
} else {
    Write-Host "`nNo coverage information found in output" -ForegroundColor Red
    Write-Host "Full output:" -ForegroundColor Yellow
    Write-Host $output
}

Write-Host "`nDone!" -ForegroundColor Green
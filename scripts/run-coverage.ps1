# PowerShell script to run test coverage analysis
param(
    [switch]$UnitOnly,
    [switch]$IntegrationOnly,
    [string]$OutputFormat = "cobertura"
)

Write-Host "Starting Test Coverage Analysis..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Clean previous coverage data
if (Test-Path "./coverage") {
    Remove-Item -Recurse -Force "./coverage"
}
New-Item -ItemType Directory -Force -Path "./coverage" | Out-Null

# Set up test projects
$testProjects = @()

if ($UnitOnly) {
    $testProjects += "tests/Stocker.UnitTests/Stocker.UnitTests.csproj"
    Write-Host "Running Unit Tests Only" -ForegroundColor Yellow
} elseif ($IntegrationOnly) {
    $testProjects += "tests/Stocker.IntegrationTests/Stocker.IntegrationTests.csproj"
    Write-Host "Running Integration Tests Only" -ForegroundColor Yellow
} else {
    $testProjects += "tests/Stocker.UnitTests/Stocker.UnitTests.csproj"
    $testProjects += "tests/Stocker.IntegrationTests/Stocker.IntegrationTests.csproj"
    Write-Host "Running All Tests" -ForegroundColor Yellow
}

# Install ReportGenerator if not already installed
Write-Host "`nChecking for ReportGenerator tool..." -ForegroundColor Cyan
$reportGeneratorInstalled = dotnet tool list -g | Select-String "dotnet-reportgenerator"
if (-not $reportGeneratorInstalled) {
    Write-Host "Installing ReportGenerator..." -ForegroundColor Yellow
    dotnet tool install -g dotnet-reportgenerator-globaltool
} else {
    Write-Host "ReportGenerator is already installed." -ForegroundColor Green
}

$allPassed = $true
$coverageFiles = @()

foreach ($project in $testProjects) {
    Write-Host "`nRunning tests for: $project" -ForegroundColor Cyan

    $projectName = [System.IO.Path]::GetFileNameWithoutExtension($project)

    # Run tests with coverage
    $output = dotnet test $project `
        /p:CollectCoverage=true `
        /p:CoverletOutputFormat=$OutputFormat `
        /p:CoverletOutput="../../coverage/$projectName-" `
        /p:Exclude="[xunit*]*,[*.Tests]*,[*.IntegrationTests]*,[*.TestUtilities]*" `
        /p:ExcludeByAttribute="Obsolete,GeneratedCode,CompilerGenerated" `
        --no-build `
        --verbosity minimal 2>&1

    $testResult = $LASTEXITCODE

    # Display test results
    Write-Host $output

    if ($testResult -ne 0) {
        Write-Host "Tests failed for $projectName" -ForegroundColor Red
        $allPassed = $false
    } else {
        Write-Host "Tests passed for $projectName" -ForegroundColor Green
    }

    # Add coverage file to list
    $coverageFile = "./coverage/$projectName-coverage.$OutputFormat"
    if (Test-Path $coverageFile) {
        $coverageFiles += $coverageFile
    }
}

# Generate HTML report if coverage files exist
if ($coverageFiles.Count -gt 0) {
    Write-Host "`nGenerating HTML Coverage Report..." -ForegroundColor Cyan

    $reportPath = "./coverage/report"
    $coverageFilesString = $coverageFiles -join ";"

    reportgenerator `
        -reports:$coverageFilesString `
        -targetdir:$reportPath `
        -reporttypes:Html

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Coverage report generated successfully!" -ForegroundColor Green
        Write-Host "Open: $reportPath\index.html" -ForegroundColor Yellow

        # Display coverage summary
        Write-Host "`nCoverage Summary:" -ForegroundColor Cyan
        $summaryFile = "$reportPath\Summary.txt"
        if (Test-Path $summaryFile) {
            Get-Content $summaryFile | Write-Host
        }
    } else {
        Write-Host "Failed to generate coverage report" -ForegroundColor Red
    }
} else {
    Write-Host "No coverage files found!" -ForegroundColor Red
}

if ($allPassed) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed!" -ForegroundColor Red
    exit 1
}
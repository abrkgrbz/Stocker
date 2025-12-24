# Stocker Stress Test Runner
# Usage: .\run-tests.ps1 -Test <smoke|load|stress|spike|full> -ApiUrl <url> -FrontendUrl <url>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("smoke", "load", "stress", "spike", "api", "frontend", "full")]
    [string]$Test = "smoke",

    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "https://api.stockerapp.com",

    [Parameter(Mandatory=$false)]
    [string]$FrontendUrl = "https://app.stockerapp.com",

    [Parameter(Mandatory=$false)]
    [string]$TestEmail = "test@example.com",

    [Parameter(Mandatory=$false)]
    [string]$TestPassword = "TestPassword123!",

    [Parameter(Mandatory=$false)]
    [string]$TenantCode = "test-tenant"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "             STOCKER STRESS TEST RUNNER                     " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Type:    $Test" -ForegroundColor Yellow
Write-Host "API URL:      $ApiUrl" -ForegroundColor Yellow
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Yellow
Write-Host "Tenant:       $TenantCode" -ForegroundColor Yellow
Write-Host ""

# Check if k6 is installed
$k6Path = Get-Command k6 -ErrorAction SilentlyContinue
if (-not $k6Path) {
    Write-Host "❌ k6 is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   choco install k6" -ForegroundColor Gray
    Write-Host "   or download from https://k6.io/docs/getting-started/installation/" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ k6 found at: $($k6Path.Source)" -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:API_URL = $ApiUrl
$env:FRONTEND_URL = $FrontendUrl
$env:TEST_EMAIL = $TestEmail
$env:TEST_PASSWORD = $TestPassword
$env:TENANT_CODE = $TenantCode

# Change to script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Create results directory if not exists
if (-not (Test-Path "results")) {
    New-Item -ItemType Directory -Path "results" | Out-Null
}

# Run appropriate test
switch ($Test) {
    "smoke" {
        Write-Host "🔥 Running Smoke Test (10 users, 2 minutes)..." -ForegroundColor Magenta
        # Modify config for smoke test
        $env:K6_STAGES = "smoke"
        k6 run --out json=results/smoke-result.json api-stress-test.js
    }
    "load" {
        Write-Host "📊 Running Load Test (100 users, 9 minutes)..." -ForegroundColor Magenta
        $env:K6_STAGES = "load"
        k6 run --out json=results/load-result.json api-stress-test.js
    }
    "stress" {
        Write-Host "💪 Running Stress Test (1000 users, 18 minutes)..." -ForegroundColor Magenta
        $env:K6_STAGES = "stress"
        k6 run --out json=results/stress-result.json api-stress-test.js
    }
    "spike" {
        Write-Host "⚡ Running Spike Test (sudden 1000 users)..." -ForegroundColor Magenta
        $env:K6_STAGES = "spike"
        k6 run --out json=results/spike-result.json api-stress-test.js
    }
    "api" {
        Write-Host "🔌 Running API-only Stress Test..." -ForegroundColor Magenta
        k6 run --out json=results/api-stress-result.json api-stress-test.js
    }
    "frontend" {
        Write-Host "🌐 Running Frontend Stress Test..." -ForegroundColor Magenta
        k6 run --out json=results/frontend-stress-result.json frontend-stress-test.js
    }
    "full" {
        Write-Host "🚀 Running Full Stack Test (API + Frontend, 1000 users)..." -ForegroundColor Magenta
        k6 run --out json=results/full-stack-result.json full-stack-stress-test.js
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    TEST COMPLETE                           " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results saved to: $scriptDir\results\" -ForegroundColor Green
Write-Host ""

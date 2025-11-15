# PowerShell script to add Docker Management SSH key to Azure Key Vault
# Run this after getting the SSH key from the server

param(
    [Parameter(Mandatory=$false)]
    [string]$KeyVaultName = "stocker-kv-prod",

    [Parameter(Mandatory=$false)]
    [string]$SecretName = "docker-management-ssh-key",

    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath = ""
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Azure Key Vault SSH Key Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
$azVersion = az version 2>$null
if (-not $azVersion) {
    Write-Host "Error: Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
$account = az account show 2>$null | ConvertFrom-Json

if (-not $account) {
    Write-Host "Not logged in to Azure. Logging in..." -ForegroundColor Yellow
    az login
    $account = az account show | ConvertFrom-Json
}

Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "Subscription: $($account.name)" -ForegroundColor Green
Write-Host ""

# Get SSH key content
if ($SshKeyPath -eq "") {
    Write-Host "Enter the path to your SSH private key file:" -ForegroundColor Yellow
    Write-Host "(This should be the key you got from the server)" -ForegroundColor Gray
    $SshKeyPath = Read-Host "SSH Key Path"
}

# Check if file exists
if (-not (Test-Path $SshKeyPath)) {
    Write-Host "Error: SSH key file not found at: $SshKeyPath" -ForegroundColor Red
    exit 1
}

# Read SSH key content
$sshKeyContent = Get-Content $SshKeyPath -Raw

# Verify it's a valid SSH key
if (-not ($sshKeyContent -match "BEGIN.*PRIVATE KEY")) {
    Write-Host "Warning: This doesn't look like a valid private key" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 0
    }
}

Write-Host ""
Write-Host "Adding SSH key to Azure Key Vault..." -ForegroundColor Yellow
Write-Host "Key Vault: $KeyVaultName" -ForegroundColor Gray
Write-Host "Secret Name: $SecretName" -ForegroundColor Gray

# Add to Key Vault
try {
    # Create a temporary file (Azure CLI needs file input for multiline secrets)
    $tempFile = [System.IO.Path]::GetTempFileName()
    $sshKeyContent | Out-File $tempFile -NoNewline -Encoding UTF8

    # Set the secret in Key Vault
    $result = az keyvault secret set `
        --vault-name $KeyVaultName `
        --name $SecretName `
        --file $tempFile `
        2>&1

    # Clean up temp file
    Remove-Item $tempFile -Force

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SSH key successfully added to Azure Key Vault!" -ForegroundColor Green
        Write-Host ""

        # Parse result to get secret URI
        $secretInfo = $result | ConvertFrom-Json
        Write-Host "Secret URI: $($secretInfo.id)" -ForegroundColor Cyan
        Write-Host ""

        Write-Host "====================================" -ForegroundColor Green
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. The SSH key is now in Azure Key Vault" -ForegroundColor White
        Write-Host "2. Your application will automatically use it" -ForegroundColor White
        Write-Host "3. No need to add it to Coolify environment variables" -ForegroundColor White
        Write-Host ""
        Write-Host "The key will be accessed as:" -ForegroundColor Yellow
        Write-Host "  Configuration['docker-management-ssh-key']" -ForegroundColor Cyan
        Write-Host "====================================" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add SSH key to Key Vault" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error adding SSH key to Key Vault: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
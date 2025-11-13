# Complete SSH Key Setup Script for Azure Key Vault
# This script helps you get SSH key from server and add to Azure Key Vault

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SSH Key Setup for Azure Key Vault" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate SSH command to run on server
Write-Host "Step 1: Create SSH Key on Server" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Run this command on your server (95.217.219.4):" -ForegroundColor Green
Write-Host ""
Write-Host @"
ssh root@95.217.219.4 '
# Check if key exists
if [ -f ~/.ssh/docker_management_key ]; then
    echo "Key already exists. Showing existing key:"
    cat ~/.ssh/docker_management_key
else
    echo "Creating new SSH key..."
    ssh-keygen -t ed25519 -f ~/.ssh/docker_management_key -N "" -C "docker@stocker"
    cat ~/.ssh/docker_management_key.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "New key created. Here is the private key:"
    cat ~/.ssh/docker_management_key
fi
'
"@ -ForegroundColor White

Write-Host ""
Write-Host "Press Enter after you've copied the SSH key from above command..." -ForegroundColor Yellow
Read-Host

# Step 2: Get the SSH key from user
Write-Host ""
Write-Host "Step 2: Save SSH Key Locally" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Paste the SSH private key here (including BEGIN and END lines):" -ForegroundColor Green
Write-Host "When done, press Enter, then Ctrl+Z, then Enter again:" -ForegroundColor Gray

$sshKey = @()
while ($true) {
    $line = Read-Host
    if ($line -eq "^Z" -or $line -match "^\x1A") {
        break
    }
    $sshKey += $line
}

$sshKeyContent = $sshKey -join "`n"

# Save to temporary file
$tempFile = ".\temp_ssh_key.txt"
$sshKeyContent | Out-File $tempFile -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "SSH key saved to temporary file." -ForegroundColor Green

# Step 3: Add to Azure Key Vault
Write-Host ""
Write-Host "Step 3: Add to Azure Key Vault" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host ""

# Check Azure CLI
$azVersion = az version 2>$null
if (-not $azVersion) {
    Write-Host "Error: Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://aka.ms/installazurecliwindows" -ForegroundColor Yellow
    exit 1
}

# Check Azure login
Write-Host "Checking Azure login..." -ForegroundColor Gray
$account = az account show 2>$null | ConvertFrom-Json

if (-not $account) {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login
    $account = az account show | ConvertFrom-Json
}

Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green

# Add to Key Vault
Write-Host ""
Write-Host "Adding SSH key to Azure Key Vault..." -ForegroundColor Yellow

try {
    $result = az keyvault secret set `
        --vault-name stocker-kv-prod `
        --name docker-management-ssh-key `
        --file $tempFile `
        2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ SSH key successfully added to Azure Key Vault!" -ForegroundColor Green

        # Clean up temp file
        Remove-Item $tempFile -Force
        Write-Host "✓ Temporary file cleaned up" -ForegroundColor Green

        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "SETUP COMPLETE!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "The SSH key is now in Azure Key Vault." -ForegroundColor White
        Write-Host "Your application will automatically use it." -ForegroundColor White
        Write-Host ""
        Write-Host "No need to add to Coolify environment variables!" -ForegroundColor Yellow
        Write-Host "=====================================" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add SSH key to Key Vault" -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "You can try manually:" -ForegroundColor Yellow
        Write-Host "az keyvault secret set --vault-name stocker-kv-prod --name docker-management-ssh-key --file $tempFile" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
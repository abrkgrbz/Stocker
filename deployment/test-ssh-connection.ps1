# Test SSH Connection using Key from Azure Key Vault
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing SSH Connection" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get the SSH key from Azure Key Vault
Write-Host "Fetching SSH key from Azure Key Vault..." -ForegroundColor Yellow
$sshKey = az keyvault secret show `
    --vault-name stocker-kv-prod `
    --name docker-management-ssh-key `
    --query value `
    --output tsv

if (-not $sshKey) {
    Write-Host "Error: Could not fetch SSH key from Azure Key Vault" -ForegroundColor Red
    exit 1
}

Write-Host "✓ SSH key retrieved successfully" -ForegroundColor Green

# Save to temporary file
$tempKeyFile = "$env:TEMP\test_docker_key"
$sshKey | Out-File $tempKeyFile -NoNewline -Encoding UTF8

# Set correct permissions (Windows equivalent)
icacls $tempKeyFile /inheritance:r /grant:r "${env:USERNAME}:R"

Write-Host ""
Write-Host "Testing SSH connection to server..." -ForegroundColor Yellow

# Test SSH connection
$sshResult = ssh -i $tempKeyFile -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@95.217.219.4 "echo 'SSH connection successful!'; docker --version" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSH connection test successful!" -ForegroundColor Green
    Write-Host $sshResult -ForegroundColor White
}
else {
    Write-Host "✗ SSH connection test failed" -ForegroundColor Red
    Write-Host $sshResult -ForegroundColor Yellow
}

# Clean up
Remove-Item $tempKeyFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Test Complete" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
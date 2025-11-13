# Docker Cache Cleanup Script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Docker Cache Cleanup on Server" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get SSH key from Azure Key Vault
Write-Host "Getting SSH key from Azure Key Vault..." -ForegroundColor Yellow
$sshKey = az keyvault secret show `
    --vault-name stocker-kv-prod `
    --name docker-management-ssh-key `
    --query value `
    --output tsv

if (-not $sshKey) {
    Write-Host "Error: Could not fetch SSH key from Azure Key Vault" -ForegroundColor Red
    exit 1
}

# Save to temporary file
$tempKeyFile = "$env:TEMP\docker_clean_key"
$sshKey | Out-File $tempKeyFile -NoNewline -Encoding UTF8

Write-Host "✓ SSH key retrieved" -ForegroundColor Green
Write-Host ""

# Show disk usage before cleanup
Write-Host "Current disk usage:" -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "df -h /"
Write-Host ""

# Show Docker disk usage
Write-Host "Docker disk usage before cleanup:" -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker system df"
Write-Host ""

# Clean build cache
Write-Host "Cleaning Docker build cache..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker builder prune -af"
Write-Host "✓ Build cache cleaned" -ForegroundColor Green
Write-Host ""

# Clean unused images
Write-Host "Cleaning unused Docker images..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker image prune -af"
Write-Host "✓ Unused images cleaned" -ForegroundColor Green
Write-Host ""

# Clean stopped containers
Write-Host "Cleaning stopped containers..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker container prune -f"
Write-Host "✓ Stopped containers cleaned" -ForegroundColor Green
Write-Host ""

# Clean unused volumes
Write-Host "Cleaning unused volumes..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker volume prune -f"
Write-Host "✓ Unused volumes cleaned" -ForegroundColor Green
Write-Host ""

# Clean unused networks
Write-Host "Cleaning unused networks..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker network prune -f"
Write-Host "✓ Unused networks cleaned" -ForegroundColor Green
Write-Host ""

# Alternative: Clean everything at once
Write-Host "Running comprehensive system prune..." -ForegroundColor Yellow
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker system prune -af --volumes"
Write-Host "✓ Comprehensive cleanup completed" -ForegroundColor Green
Write-Host ""

# Show Docker disk usage after cleanup
Write-Host "Docker disk usage after cleanup:" -ForegroundColor Green
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "docker system df"
Write-Host ""

# Show disk usage after cleanup
Write-Host "Disk usage after cleanup:" -ForegroundColor Green
ssh -i $tempKeyFile -o StrictHostKeyChecking=no root@95.217.219.4 "df -h /"

# Clean up temp file
Remove-Item $tempKeyFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Docker Cleanup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
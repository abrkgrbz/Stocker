# Simple SSH Key to Base64 Encoder
param(
    [string]$KeyPath = ""
)

Write-Host "SSH Key to Base64 Encoder" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# If no path provided, ask for it
if ($KeyPath -eq "") {
    # Try to find common SSH key locations
    $commonPaths = @(
        "$env:USERPROFILE\.ssh\id_rsa",
        "$env:USERPROFILE\.ssh\id_ed25519"
    )

    $foundKey = ""
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $foundKey = $path
            Write-Host "Found SSH key at: $path" -ForegroundColor Green
            break
        }
    }

    if ($foundKey -ne "") {
        $useFound = Read-Host "Use this key? (y/n)"
        if ($useFound -eq "y") {
            $KeyPath = $foundKey
        }
    }

    if ($KeyPath -eq "") {
        $KeyPath = Read-Host "Enter SSH key path"
    }
}

# Check if file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "Error: File not found at $KeyPath" -ForegroundColor Red
    exit 1
}

# Encode to Base64
try {
    $content = Get-Content $KeyPath -Raw
    $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))

    # Save to file
    $base64 | Out-File "ssh_key_base64.txt" -NoNewline -Encoding ASCII

    Write-Host "`nSuccess!" -ForegroundColor Green
    Write-Host "Base64 encoded key saved to: ssh_key_base64.txt" -ForegroundColor Yellow
    Write-Host "Length: $($base64.Length) characters" -ForegroundColor Yellow

    # Show preview
    if ($base64.Length -gt 100) {
        $preview = $base64.Substring(0, 40) + "..." + $base64.Substring($base64.Length - 40)
        Write-Host "`nPreview: $preview" -ForegroundColor Gray
    }

    Write-Host "`n========== NEXT STEPS ==========" -ForegroundColor Cyan
    Write-Host "1. Copy content from ssh_key_base64.txt"
    Write-Host "2. Add to Coolify environment:"
    Write-Host "   DockerManagement__SshKeyBase64 = [paste content]" -ForegroundColor Yellow
    Write-Host "   DockerManagement__SshHost = 95.217.219.4" -ForegroundColor Yellow
    Write-Host "   DockerManagement__SshUser = root" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Cyan

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
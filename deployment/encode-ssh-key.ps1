# PowerShell script to encode SSH key to Base64 for Coolify
# Usage: .\encode-ssh-key.ps1

Write-Host "SSH Key to Base64 Encoder for Docker Management" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Common SSH key locations
$commonPaths = @(
    "$env:USERPROFILE\.ssh\id_rsa",
    "$env:USERPROFILE\.ssh\id_ed25519",
    "$env:USERPROFILE\.ssh\stocker_key",
    "$env:USERPROFILE\.ssh\docker_key"
)

# Check for existing keys
Write-Host "Checking for SSH keys..." -ForegroundColor Yellow
$foundKeys = @()

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $foundKeys += $path
        Write-Host "✓ Found: $path" -ForegroundColor Green
    }
}

if ($foundKeys.Count -eq 0) {
    Write-Host "✗ No SSH keys found in common locations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please enter the full path to your SSH private key:" -ForegroundColor Yellow
    $keyPath = Read-Host "SSH Key Path"
} else {
    Write-Host ""
    Write-Host "Select a key to encode:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $foundKeys.Count; $i++) {
        Write-Host "[$($i+1)] $($foundKeys[$i])"
    }
    Write-Host "[0] Enter custom path"

    $selection = Read-Host "Selection"

    if ($selection -eq "0") {
        $keyPath = Read-Host "Enter SSH Key Path"
    } else {
        $keyPath = $foundKeys[$selection - 1]
    }
}

# Verify key exists
if (-not (Test-Path $keyPath)) {
    Write-Host "✗ Error: File not found at $keyPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Encoding SSH key..." -ForegroundColor Yellow

try {
    # Read the key content
    $keyContent = Get-Content $keyPath -Raw

    # Convert to Base64
    $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))

    # Save to file
    $outputPath = "ssh_key_base64.txt"
    $base64 | Out-File $outputPath -NoNewline -Encoding ASCII

    Write-Host "✓ Key encoded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Base64 encoded key saved to: $outputPath" -ForegroundColor Cyan
    Write-Host "Length: $($base64.Length) characters" -ForegroundColor Cyan

    # Show first and last 20 characters for verification
    $preview = $base64.Substring(0, [Math]::Min(30, $base64.Length)) + "..." + $base64.Substring([Math]::Max(0, $base64.Length - 30))
    Write-Host "Preview: $preview" -ForegroundColor Gray

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the content of $outputPath" -ForegroundColor White
    Write-Host "2. Go to Coolify dashboard" -ForegroundColor White
    Write-Host "3. Add environment variable:" -ForegroundColor White
    Write-Host "   Key: DockerManagement__SshKeyBase64" -ForegroundColor Cyan
    Write-Host "   Value: [paste the base64 content]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Also add these variables if not present:" -ForegroundColor Yellow
    Write-Host "   DockerManagement__SshHost = 95.217.219.4" -ForegroundColor Cyan
    Write-Host "   DockerManagement__SshUser = root" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green

    # Ask if user wants to copy to clipboard
    Write-Host ""
    $copyToClipboard = Read-Host "Copy to clipboard? (y/n)"
    if ($copyToClipboard -eq 'y') {
        $base64 | Set-Clipboard
        Write-Host "✓ Copied to clipboard!" -ForegroundColor Green
    }

} catch {
    Write-Host "✗ Error encoding key: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
# PowerShell script to generate correct hash for Test123456!

$password = "Test123456!"
$saltBase64 = "Km7J5qY8xX0qT9mZvL3hZg=="

# Convert salt from Base64
$saltBytes = [Convert]::FromBase64String($saltBase64)

Add-Type -AssemblyName System.Security.Cryptography

# Create PBKDF2
$pbkdf2 = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($password, $saltBytes, 600000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
$hashBytes = $pbkdf2.GetBytes(32)
$hashBase64 = [Convert]::ToBase64String($hashBytes)

Write-Host "Password: $password"
Write-Host "Salt (Base64): $saltBase64"  
Write-Host "Generated Hash (Base64): $hashBase64"
Write-Host ""
Write-Host "SQL Update Command:"
Write-Host "UPDATE [master].[MasterUsers] SET PasswordHash = '$hashBase64' WHERE Email = 'anilberk1997@hotmail.com';"
Write-Host ""
Write-Host "Expected from your log: hE7kPtTW1DzXr5r7VlwFzN5pXgE6pMqVxLPzKN6WXRY="
Write-Host "Actually generated: $hashBase64"
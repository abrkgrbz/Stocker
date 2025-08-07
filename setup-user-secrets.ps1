# Setup User Secrets for Stocker API
# Run this script from the repository root directory

Write-Host "Setting up User Secrets for Stocker API..." -ForegroundColor Green

# Navigate to API project
Set-Location "src/API/Stocker.API"

# Set Connection String
dotnet user-secrets set "ConnectionStrings:MasterConnection" "Server=DESKTOP-A1C2AO3;Database=StockerMasterDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;Encrypt=False"

# Set JWT Secret (Generate a secure random key in production)
$jwtSecret = "ThisIsADevelopmentSecretKeyMinimum32CharactersLongForJwtTokenGeneration"
dotnet user-secrets set "JwtSettings:Secret" $jwtSecret

# Set Admin Credentials
dotnet user-secrets set "AdminCredentials:DefaultAdminEmail" "admin@stocker.com"
dotnet user-secrets set "AdminCredentials:DefaultAdminPassword" "Admin@123456"

# Set Database Settings
dotnet user-secrets set "DatabaseSettings:ServerName" "DESKTOP-A1C2AO3"
dotnet user-secrets set "DatabaseSettings:MasterDatabaseName" "StockerMasterDb"
dotnet user-secrets set "DatabaseSettings:UseWindowsAuthentication" "true"

# List all secrets to verify
Write-Host "`nCurrent User Secrets:" -ForegroundColor Yellow
dotnet user-secrets list

Write-Host "`nUser Secrets setup complete!" -ForegroundColor Green
Write-Host "Note: In production, use more secure values and consider using Azure Key Vault or similar." -ForegroundColor Yellow

# Return to root directory
Set-Location "../../../"
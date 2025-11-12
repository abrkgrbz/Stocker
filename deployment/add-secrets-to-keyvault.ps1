# Azure Key Vault Secret Setup Script
# ⚠️ UYARI: Bu scripti çalıştırdıktan sonra SİLİN!

$keyVaultName = "stocker-kv-prod"

Write-Host "🔐 Adding secrets to Azure Key Vault: $keyVaultName" -ForegroundColor Green

# Database Secrets
az keyvault secret set --vault-name $keyVaultName --name "db-password" --value "YourNewSecureDbPassword2024!"
az keyvault secret set --vault-name $keyVaultName --name "db-user" --value "sa"
az keyvault secret set --vault-name $keyVaultName --name "db-host" --value "your-db-server.database.windows.net"

# JWT Secrets
az keyvault secret set --vault-name $keyVaultName --name "jwt-secret" --value "ThisIsAVerySecureJWTSecretKeyForStocker2024MustBeAtLeast256BitsLong!"
az keyvault secret set --vault-name $keyVaultName --name "data-protection-key" --value "ThisIsASecureDataProtectionKeyForStockerApp2024MustBeAtLeast32CharsLong!"

# Email/SMTP Secrets
az keyvault secret set --vault-name $keyVaultName --name "smtp-password" --value "YourNewSmtpPassword2024!"
az keyvault secret set --vault-name $keyVaultName --name "smtp-username" --value "info@stoocker.app"
az keyvault secret set --vault-name $keyVaultName --name "smtp-host" --value "mail.privateemail.com"

# MinIO Secrets
az keyvault secret set --vault-name $keyVaultName --name "minio-access-key" --value "minioadmin"
az keyvault secret set --vault-name $keyVaultName --name "minio-secret-key" --value "YourNewMinioSecretKey2024!"

# RabbitMQ Secrets
az keyvault secret set --vault-name $keyVaultName --name "rabbitmq-password" --value "YourNewRabbitMQPassword2024!"
az keyvault secret set --vault-name $keyVaultName --name "rabbitmq-user" --value "stocker"
az keyvault secret set --vault-name $keyVaultName --name "rabbitmq-host" --value "95.217.219.4"

# Redis Configuration
az keyvault secret set --vault-name $keyVaultName --name "redis-connection" --value "localhost:6379"

# Seq API Key (Monitoring)
az keyvault secret set --vault-name $keyVaultName --name "seq-api-key" --value "YourNewSeqApiKey2024!"

# SSH Credentials (for Docker management)
az keyvault secret set --vault-name $keyVaultName --name "ssh-password" --value "YourNewSshPassword2024!"
az keyvault secret set --vault-name $keyVaultName --name "ssh-user" --value "root"
az keyvault secret set --vault-name $keyVaultName --name "ssh-host" --value "95.217.219.4"

Write-Host "✅ All secrets have been added to Key Vault!" -ForegroundColor Green
Write-Host "⚠️ IMPORTANT: Delete this script file after running!" -ForegroundColor Yellow
Write-Host "📋 Key Vault URI: https://$keyVaultName.vault.azure.net/" -ForegroundColor Cyan
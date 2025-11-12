# Azure Key Vault Setup Guide

## 🔐 Overview

This guide documents the Azure Key Vault implementation for the Stocker application, including configuration for local development and Coolify deployment.

## 📋 Prerequisites

- Azure account with active subscription
- Azure CLI installed (`winget install -e --id Microsoft.AzureCLI`)
- .NET 8.0 SDK
- Coolify instance for deployment

## 🚀 Quick Setup

### 1. Azure Resources Created

| Resource | Name | Location | Purpose |
|----------|------|----------|---------|
| Resource Group | `stocker-rg` | West Europe | Container for all resources |
| Key Vault | `stocker-kv-prod` | West Europe | Secret storage |
| Service Principal | `stocker-coolify-sp` | N/A | Coolify access |

### 2. Key Vault Secrets

The following secrets have been added to the Key Vault:

- `db-password` - Database password
- `jwt-secret` - JWT authentication secret
- `smtp-password` - Email service password
- `rabbitmq-password` - RabbitMQ password

### 3. Service Principal Credentials

```json
{
  "appId": "a453fe7e-8edf-4a82-929d-81357b266c77",
  "displayName": "stocker-coolify-sp",
  "tenant": "3ab0756a-679c-49a0-8818-4712ab51c16e"
}
```

**⚠️ IMPORTANT**: Store the Service Principal password securely (obtain from Azure Portal)

## 💻 Local Development Configuration

### Environment Variables

Set these environment variables for local development:

```bash
# Windows (PowerShell)
$env:AZURE_KEY_VAULT_URI="https://stocker-kv-prod.vault.azure.net/"
$env:AZURE_TENANT_ID="3ab0756a-679c-49a0-8818-4712ab51c16e"
$env:AZURE_CLIENT_ID="a453fe7e-8edf-4a82-929d-81357b266c77"
$env:AZURE_CLIENT_SECRET="your-service-principal-password"

# Linux/Mac
export AZURE_KEY_VAULT_URI="https://stocker-kv-prod.vault.azure.net/"
export AZURE_TENANT_ID="3ab0756a-679c-49a0-8818-4712ab51c16e"
export AZURE_CLIENT_ID="a453fe7e-8edf-4a82-929d-81357b266c77"
export AZURE_CLIENT_SECRET="your-service-principal-password"
```

### Testing Locally

```bash
cd src/API/Stocker.API
dotnet run --environment Development
```

The application will:
1. Skip Key Vault in Development (uses User Secrets)
2. Use Key Vault in Production/Staging

## 🚢 Coolify Deployment Configuration

### 1. Add Environment Variables in Coolify

Navigate to your Coolify application settings and add these environment variables:

```env
# Azure Key Vault Configuration
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=3ab0756a-679c-49a0-8818-4712ab51c16e
AZURE_CLIENT_ID=a453fe7e-8edf-4a82-929d-81357b266c77
AZURE_CLIENT_SECRET=your-service-principal-password-here

# Application Environment
ASPNETCORE_ENVIRONMENT=Production
```

### 2. Docker Compose Configuration

If using Docker Compose in Coolify:

```yaml
version: '3.8'
services:
  api:
    image: stocker-api:latest
    environment:
      - AZURE_KEY_VAULT_URI=${AZURE_KEY_VAULT_URI}
      - AZURE_TENANT_ID=${AZURE_TENANT_ID}
      - AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
      - AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
      - ASPNETCORE_ENVIRONMENT=Production
    ports:
      - "5000:80"
```

### 3. Dockerfile Configuration

Ensure your Dockerfile includes:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet build -c Release
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Key Vault will be accessed at runtime using environment variables
ENTRYPOINT ["dotnet", "Stocker.API.dll"]
```

## 🔧 Application Configuration

### Program.cs Integration

```csharp
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables()
    .AddAzureKeyVault(builder.Environment); // Custom extension method
```

### KeyVaultExtensions.cs

The extension method handles:
- Development environment detection (skips Key Vault)
- Automatic credential selection (Service Principal or Managed Identity)
- Secret naming convention conversion (kebab-case to PascalCase)
- 5-minute secret refresh interval

## 🔑 Secret Management

### Adding New Secrets

```bash
# Add a new secret
az keyvault secret set --vault-name "stocker-kv-prod" --name "new-secret" --value "secret-value"

# List all secrets
az keyvault secret list --vault-name "stocker-kv-prod"

# Update a secret
az keyvault secret set --vault-name "stocker-kv-prod" --name "existing-secret" --value "new-value"
```

### Secret Naming Convention

Key Vault secrets use kebab-case and are automatically converted:

| Key Vault Name | Configuration Key |
|----------------|------------------|
| `connectionstrings-defaultconnection` | `ConnectionStrings:DefaultConnection` |
| `jwt-secret` | `JwtSettings:Secret` |
| `email-smtphost` | `EmailSettings:SmtpHost` |
| `rabbitmq-hostname` | `RabbitMQ:HostName` |

## 🛡️ Security Best Practices

### 1. Access Control

- Use separate Service Principals for different environments
- Grant minimum required permissions (Get, List for secrets)
- Rotate Service Principal credentials regularly

### 2. Secret Rotation

```bash
# Generate new Service Principal password
az ad sp credential reset --id "a453fe7e-8edf-4a82-929d-81357b266c77"

# Update in Coolify environment variables
```

### 3. Monitoring

- Enable diagnostic logs in Azure Key Vault
- Monitor access patterns
- Set up alerts for unauthorized access attempts

## 🐛 Troubleshooting

### Common Issues

#### 1. "No Azure Key Vault URI configured"
- **Solution**: Set `AZURE_KEY_VAULT_URI` environment variable

#### 2. "Failed to configure Azure Key Vault: Unauthorized"
- **Solution**: Verify Service Principal credentials and permissions

#### 3. "Secret not found in Key Vault"
- **Solution**: Check secret name and naming convention

### Debug Commands

```bash
# Verify Service Principal
az ad sp show --id "a453fe7e-8edf-4a82-929d-81357b266c77"

# Check Key Vault access policies
az keyvault show --name "stocker-kv-prod" --query "properties.accessPolicies"

# Test secret access
az keyvault secret show --vault-name "stocker-kv-prod" --name "db-password"
```

## 📊 Cost Optimization

- **Key Vault Standard**: ~$0.03/10,000 transactions
- **Secret Operations**: ~$0.03/10,000 operations
- **Estimated Monthly Cost**: < $1 for typical usage

## 🔄 Migration from .env Files

### Before (Coolify .env)
```env
DB_PASSWORD=MyPassword123
JWT_SECRET=MyJwtSecret456
SMTP_PASSWORD=MySmtpPass789
```

### After (Azure Key Vault)
```env
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=3ab0756a-679c-49a0-8818-4712ab51c16e
AZURE_CLIENT_ID=a453fe7e-8edf-4a82-929d-81357b266c77
AZURE_CLIENT_SECRET=your-service-principal-password-here
```

## 📝 Checklist for Production Deployment

- [ ] Azure Key Vault created and configured
- [ ] Service Principal created with proper permissions
- [ ] All secrets migrated to Key Vault
- [ ] Coolify environment variables configured
- [ ] Application tested with Key Vault integration
- [ ] Monitoring and alerts configured
- [ ] Secret rotation schedule established
- [ ] Documentation shared with team

## 🔗 Related Resources

- [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)
- [.NET Configuration with Key Vault](https://docs.microsoft.com/aspnet/core/security/key-vault-configuration)
- [Coolify Documentation](https://coolify.io/docs)
- [Service Principal Best Practices](https://docs.microsoft.com/azure/active-directory/develop/howto-create-service-principal-portal)

## 📞 Support

For issues or questions:
- Check Azure Portal > Key Vault > Diagnostic Logs
- Review application logs in Coolify
- Contact DevOps team with error details

---

**Last Updated**: November 12, 2025
**Author**: Stocker Development Team
**Version**: 1.0
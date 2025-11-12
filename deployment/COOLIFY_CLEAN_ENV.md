# Coolify Environment Variables - Cleaned Version

## ✅ KEEP These Variables (Azure Key Vault & Public Settings)

```env
# ==================================
# AZURE KEY VAULT (REQUIRED)
# ==================================
AZURE_KEY_VAULT_URI=https://stocker-kv-prod.vault.azure.net/
AZURE_TENANT_ID=3ab0756a-679c-49a0-8818-4712ab51c16e
AZURE_CLIENT_ID=a453fe7e-8edf-4a82-929d-81357b266c77
AZURE_CLIENT_SECRET=your-service-principal-password-here

# ==================================
# URLs & ENDPOINTS
# ==================================
ADMIN_URL=https://admin.stoocker.app
API_URL=https://api.stoocker.app
AUTH_URL=https://auth.stoocker.app
WEB_URL=https://stoocker.app
S3_URL=https://s3.stoocker.app
SEQ_URL=https://seq.stoocker.app
MINIO_CONSOLE_URL=https://minio-console.stoocker.app

# ==================================
# APPLICATION SETTINGS
# ==================================
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_SWAGGER_ENABLED=true
ASPNETCORE_URLS=http://+:5000

# ==================================
# DATABASE CONNECTIONS
# ==================================
# Note: SA_PASSWORD is now in Key Vault as 'sa-password'
# Update connection strings to use Key Vault value
ConnectionStrings__DefaultConnection=Server=mssql,1433;Database=StockerMasterDb;User Id=sa;TrustServerCertificate=True;MultipleActiveResultSets=True;
ConnectionStrings__HangfireConnection=Server=mssql,1433;Database=StockerHangfireDb;User Id=sa;TrustServerCertificate=True;MultipleActiveResultSets=True;
ConnectionStrings__MasterConnection=Server=mssql,1433;Database=StockerMasterDb;User Id=sa;TrustServerCertificate=True;MultipleActiveResultSets=True;
ConnectionStrings__TenantConnection=Server=mssql,1433;User Id=sa;TrustServerCertificate=True;MultipleActiveResultSets=True;

# ==================================
# JWT SETTINGS (NON-SECRET)
# ==================================
JwtSettings__AccessTokenExpirationMinutes=60
JwtSettings__Audience=Stoocker
JwtSettings__Issuer=Stoocker
JwtSettings__RefreshTokenExpirationDays=7

# ==================================
# EMAIL SETTINGS (NON-SECRET)
# ==================================
EmailSettings__BaseUrl=https://stoocker.app
EmailSettings__EnableEmail=true
EmailSettings__EnableSsl=true
EmailSettings__FromEmail=info@stoocker.app
EmailSettings__FromName=Stoocker
EmailSettings__SmtpHost=mail.privateemail.com
EmailSettings__SmtpPort=465
EmailSettings__SmtpUsername=info@stoocker.app
EmailSettings__TemplatesPath=EmailTemplates
EmailSettings__UseStartTls=false

# ==================================
# HANGFIRE SETTINGS
# ==================================
Hangfire__DashboardPath=/hangfire
Hangfire__Queues=critical,default,low
Hangfire__RetryAttempts=3
Hangfire__ServerName=Stocker-API-Server
Hangfire__WorkerCount=4

# ==================================
# LOGGING SETTINGS
# ==================================
Logging__Seq__MinimumLevel=Information
Logging__Seq__ServerUrl=https://seq.stoocker.app

# ==================================
# STORAGE SETTINGS (NON-SECRET)
# ==================================
Storage__Provider=MinIO
Storage__MinIO__AccessKey=stocker-minio-admin
Storage__MinIO__BucketName=stocker-files
Storage__MinIO__Endpoint=minio:9000
Storage__MinIO__PublicEndpoint=https://s3.stoocker.app
Storage__MinIO__UseSSL=false
MINIO_ROOT_USER=stoocker-minio
MINIO_HOST=minio

# ==================================
# REDIS SETTINGS (NON-SECRET)
# ==================================
Redis__ConnectionString=redis:6379
Redis__ConnectTimeout=5000
Redis__DefaultDatabase=0
Redis__SyncTimeout=5000
REDIS_HOST=redis

# ==================================
# RABBITMQ SETTINGS (NON-SECRET)
# ==================================
RabbitMQ__Host=rabbitmq
RabbitMQ__Username=admin
RabbitMQ__VirtualHost=/

# ==================================
# PASSWORD POLICY
# ==================================
PasswordPolicy__LockoutDurationMinutes=15
PasswordPolicy__MaxFailedAccessAttempts=5
PasswordPolicy__MaximumLength=128
PasswordPolicy__MinimumLength=8
PasswordPolicy__MinimumStrengthScore=3
PasswordPolicy__PasswordExpirationDays=90
PasswordPolicy__PasswordHistoryCount=5
PasswordPolicy__PreventCommonPasswords=true
PasswordPolicy__PreventUserInfoInPassword=true
PasswordPolicy__RequireDigit=true
PasswordPolicy__RequiredUniqueChars=4
PasswordPolicy__RequireLowercase=true
PasswordPolicy__RequireNonAlphanumeric=true
PasswordPolicy__RequireUppercase=true

# ==================================
# SECURITY HEADERS
# ==================================
SecurityHeaders__AddContentSecurityPolicy=true
SecurityHeaders__AddReferrerPolicy=true
SecurityHeaders__AddStrictTransportSecurity=true
SecurityHeaders__AddXContentTypeOptions=true
SecurityHeaders__AddXFrameOptions=true
SecurityHeaders__AddXXssProtection=true
SecurityHeaders__HstsIncludeSubDomains=true
SecurityHeaders__HstsMaxAge=31536000
SecurityHeaders__HstsPreload=false
SecurityHeaders__ReferrerPolicyValue=strict-origin-when-cross-origin
SecurityHeaders__XFrameOptionsValue=DENY

# ==================================
# RATE LIMITING
# ==================================
TenantRateLimiting__Algorithm=SlidingWindow
TenantRateLimiting__PermitLimit=100
TenantRateLimiting__QueueLimit=5
TenantRateLimiting__ReplenishmentPeriodSeconds=1
TenantRateLimiting__SegmentsPerWindow=4
TenantRateLimiting__TokensPerPeriod=10
TenantRateLimiting__WindowSeconds=60

# ==================================
# MISC
# ==================================
MSSQL_HOST=mssql
SEQ_HOST=seq
```

## ❌ REMOVE These Variables (Now in Azure Key Vault)

These secrets are now managed by Azure Key Vault and should be removed from Coolify environment:

```env
# REMOVE - Managed by Key Vault as 'jwt-secret'
JWT_SECRET=...
JwtSettings__Secret=...

# REMOVE - Managed by Key Vault as 'smtp-password'
SMTP_PASSWORD=...
EmailSettings__SmtpPassword=...

# REMOVE - Managed by Key Vault as 'rabbitmq-password'
RabbitMQ__Password=...
RABBITMQ_PASSWORD=...

# REMOVE - Managed by Key Vault as 'sa-password'
SA_PASSWORD=...

# REMOVE - Managed by Key Vault as 'redis-password'
REDIS_PASSWORD=...
Redis__Password=...

# REMOVE - Managed by Key Vault as 'minio-root-password'
MINIO_ROOT_PASSWORD=...

# REMOVE - Managed by Key Vault as 'minio-secret-key'
Storage__MinIO__SecretKey=...

# REMOVE - Managed by Key Vault as 'seq-api-key'
SEQ_API_KEY=...
Logging__Seq__ApiKey=...
```

## 🔐 Secrets Now in Azure Key Vault

| Key Vault Secret Name | Maps To Configuration | Value |
|----------------------|----------------------|-------|
| `jwt-secret` | `JwtSettings:Secret` | Stored securely |
| `smtp-password` | `EmailSettings:SmtpPassword` | Stored securely |
| `rabbitmq-password` | `RabbitMQ:Password` | Stored securely |
| `sa-password` | `SAPassword` | `YourStrongPassword123!` |
| `redis-password` | `Redis:Password` | `StockerRedisPassword2025!` |
| `minio-root-password` | `Storage:MinIO:RootPassword` | Stored securely |
| `minio-secret-key` | `Storage:MinIO:SecretKey` | Stored securely |
| `seq-api-key` | `Logging:Seq:ApiKey` | Stored securely |
| `db-password` | Database connections | Stored securely |

## 📝 Notes

1. **SSH Key**: The `DockerManagement__SshKeyBase64` should also be moved to Key Vault for better security
2. **Database Connections**: Update connection strings to reference Key Vault secrets dynamically
3. **Application will automatically**:
   - Fetch all secrets from Azure Key Vault on startup
   - Refresh secrets every 5 minutes
   - Map kebab-case names to proper configuration paths

## 🚀 After Cleanup

Your Coolify environment will be much cleaner and more secure with only:
- Azure Key Vault credentials
- Public configuration values
- Non-sensitive application settings

All sensitive data will be centrally managed in Azure Key Vault!
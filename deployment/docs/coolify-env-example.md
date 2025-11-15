# Coolify Environment Variables Configuration

## 📋 Required Environment Variables

Add these to your Coolify application settings:

### Database
```env
DB_HOST=your-db-server
DB_USER=sa
DB_PASSWORD=YourSecurePassword123!
DB_NAME_MASTER=StockerMasterDb
DB_NAME_TENANT=StockerTenantDb
DB_NAME_HANGFIRE=StockerHangfireDb
```

### JWT Authentication
```env
JWT_SECRET=ThisIsAVerySecureSecretKeyThatShouldBeAtLeast256BitsLongForHS256Algorithm2024!
JWT_ISSUER=Stocker
JWT_AUDIENCE=Stocker
DATA_PROTECTION_KEY=ThisIsASecureDataProtectionKeyForStockerApplication2024!MustBeAtLeast32Chars
```

### Email (SMTP)
```env
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USERNAME=info@stoocker.app
SMTP_PASSWORD=YourSmtpPassword
SMTP_FROM_EMAIL=info@stoocker.app
SMTP_FROM_NAME=Stocker
```

### MinIO (File Storage)
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=YourMinioSecretKey
MINIO_BUCKET_NAME=stocker-files
```

### RabbitMQ
```env
RABBITMQ_HOST=95.217.219.4
RABBITMQ_PORT=5672
RABBITMQ_USER=stocker
RABBITMQ_PASSWORD=YourRabbitMQPassword
RABBITMQ_VHOST=/
```

### Redis
```env
REDIS_CONNECTION=localhost:6379
```

### Monitoring (Optional)
```env
SEQ_URL=http://localhost:5341
SEQ_API_KEY=YourSeqApiKey
```

### SSH Access (for Docker management)
```env
SSH_HOST=95.217.219.4
SSH_PORT=22
SSH_USER=root
SSH_PASSWORD=YourSshPassword
SSH_PRIVATE_KEY_PATH=/root/.ssh/id_rsa
```

## 🔧 How to Configure in Coolify

1. **Go to your Coolify dashboard**
2. **Select your application**
3. **Click on "Environment Variables"**
4. **Add each variable above**
5. **Click "Save"**
6. **Redeploy the application**

## 🔐 Security Best Practices

1. **Never commit these values to Git**
2. **Use strong, unique passwords**
3. **Rotate passwords regularly**
4. **Use different passwords for each environment**
5. **Enable 2FA on Coolify account**

## 📝 Application Configuration

Your `appsettings.json` should use placeholders:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=${DB_HOST};Database=${DB_NAME_TENANT};User Id=${DB_USER};Password=${DB_PASSWORD}"
  },
  "JwtSettings": {
    "Secret": "${JWT_SECRET}"
  },
  "EmailSettings": {
    "SmtpPassword": "${SMTP_PASSWORD}"
  }
}
```

Or use environment variables directly in .NET:

```csharp
// Program.cs
builder.Configuration.AddEnvironmentVariables();

// Access in code
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
var jwtSecret = Configuration["JWT_SECRET"];
```

## 🚀 Deployment Checklist

- [ ] All sensitive values removed from appsettings.json
- [ ] Environment variables added to Coolify
- [ ] Application tested with env vars
- [ ] Old .env files removed from Git
- [ ] Git history cleaned (if needed)
- [ ] Documentation updated
# Stocker API - Environment Configuration

## Quick Start

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file and update these REQUIRED values:**

### 🔴 CRITICAL - Must Change

```env
# Database Password
SA_PASSWORD=YourStrongSAPassword123!

# JWT Secret (minimum 32 characters)
# Generate with: openssl rand -base64 32
JWT_SECRET=YourSuperSecretJWTKey_MustBeAtLeast32CharactersLong_ChangeThisInProduction!

# Email Credentials
SMTP_USERNAME=info@stoocker.app
SMTP_PASSWORD=YourEmailPassword123!

# MinIO S3 Storage
MINIO_ROOT_USER=stocker-minio-admin
MINIO_ROOT_PASSWORD=StockerMinIOSecretKey2025!

# Redis Cache
REDIS_PASSWORD=StockerRedisPassword2025!

# Seq Logging (Generate from Seq dashboard: Settings -> API Keys)
SEQ_API_KEY=GenerateYourSeqApiKeyFromSeqDashboard
```

### 🟡 OPTIONAL - Review and Adjust

```env
# Password Policy - Adjust based on your security requirements
PasswordPolicy__MinimumLength=8
PasswordPolicy__PasswordExpirationDays=90
PasswordPolicy__MaxFailedAccessAttempts=5

# Rate Limiting - Adjust based on expected traffic
TenantRateLimiting__PermitLimit=100
TenantRateLimiting__WindowSeconds=60

# JWT Token Expiration
JwtSettings__AccessTokenExpirationMinutes=60
JwtSettings__RefreshTokenExpirationDays=7
```

## Password Generation

Generate strong passwords using one of these methods:

### Method 1: OpenSSL (Linux/Mac/Git Bash)
```bash
# JWT Secret (32 bytes = 44 characters base64)
openssl rand -base64 32

# General Password (16 bytes = 24 characters base64)
openssl rand -base64 16
```

### Method 2: PowerShell (Windows)
```powershell
# Generate 32-character password
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Method 3: Online Generator
- https://passwordsgenerator.net/
- Length: 32 characters minimum for JWT_SECRET
- Include: Uppercase, Lowercase, Numbers, Special Characters

## Seq API Key Generation

1. Open Seq dashboard: https://seq.stoocker.app
2. Go to **Settings** → **API Keys**
3. Click **Add API Key**
4. Name: `Stocker-API`
5. Copy the generated key
6. Paste into `.env` file as `SEQ_API_KEY`

## Email Configuration

### Namecheap Private Email

1. Login to Namecheap
2. Go to **Private Email** → **Manage**
3. Create email account: `info@stoocker.app`
4. Set strong password
5. SMTP Settings:
   - Host: `mail.privateemail.com`
   - Port: `465` (SSL)
   - Username: `info@stoocker.app`
   - Password: [Your email password]

## MinIO Configuration

### First Time Setup

1. Deploy MinIO container first
2. Access console: https://minio-console.stoocker.app
3. Login with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
4. Create bucket: `stocker-files`
5. Set bucket policy to **public read** (for file downloads)

### Bucket Policy (Optional - Public Read)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::stocker-files/*"]
    }
  ]
}
```

## SQL Server Configuration

### Database Initialization

Databases are created automatically on first run:
- `Stocker_Master` - Main application database
- `Stocker_Hangfire` - Background jobs database

### Manual Database Creation (if needed)

```sql
-- Connect to SQL Server as SA
CREATE DATABASE Stocker_Master;
CREATE DATABASE Stocker_Hangfire;
GO

-- Verify databases
SELECT name FROM sys.databases WHERE name LIKE 'Stocker%';
GO
```

## Redis Configuration

Redis is configured with password authentication. No additional setup required.

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SA_PASSWORD` | SQL Server SA password | ✅ Yes | - |
| `JWT_SECRET` | JWT signing key (min 32 chars) | ✅ Yes | - |
| `SMTP_USERNAME` | Email account username | ✅ Yes | - |
| `SMTP_PASSWORD` | Email account password | ✅ Yes | - |
| `MINIO_ROOT_USER` | MinIO admin username | ✅ Yes | minioadmin |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | ✅ Yes | - |
| `REDIS_PASSWORD` | Redis password | ✅ Yes | - |
| `SEQ_API_KEY` | Seq logging API key | ✅ Yes | - |
| `ASPNETCORE_ENVIRONMENT` | ASP.NET environment | ❌ No | Production |
| `JwtSettings__AccessTokenExpirationMinutes` | JWT token lifetime | ❌ No | 60 |
| `PasswordPolicy__MinimumLength` | Min password length | ❌ No | 8 |
| `TenantRateLimiting__PermitLimit` | Rate limit threshold | ❌ No | 100 |

## Docker Compose Usage

### Start API with dependencies

```bash
# Start infrastructure first
cd deployment/compose/infrastructure
docker-compose -f database/docker-compose.yml up -d
docker-compose -f redis/docker-compose.yml up -d
docker-compose -f seq/docker-compose.yml up -d
docker-compose -f minio/docker-compose.yml up -d

# Wait 30 seconds for databases to initialize

# Start API
cd ../services/api
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f api
```

### Restart API

```bash
docker-compose restart api
```

### Stop API

```bash
docker-compose down
```

## Coolify Deployment

1. Create new resource: **Docker Compose**
2. Repository: `abrkgrbz/Stocker`
3. Branch: `master`
4. Compose file path: `deployment/compose/services/api/docker-compose.yml`
5. Go to **Environment Variables** tab
6. Import from `.env` file or add manually
7. Click **Deploy**

## Health Checks

- API Health: https://api.stoocker.app/health
- Swagger UI: https://api.stoocker.app/swagger
- Hangfire Dashboard: https://api.stoocker.app/hangfire

## Troubleshooting

### API won't start

1. Check logs: `docker-compose logs api`
2. Verify database is running: `docker ps | grep mssql`
3. Test database connection: `docker exec -it mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourPassword'`

### Email not sending

1. Verify SMTP credentials in `.env`
2. Check logs for SMTP errors
3. Test SMTP connection: `telnet mail.privateemail.com 465`

### MinIO connection failed

1. Verify MinIO is running: `docker ps | grep minio`
2. Check MinIO credentials match in `.env`
3. Access console: https://minio-console.stoocker.app

### Redis connection failed

1. Verify Redis is running: `docker ps | grep redis`
2. Check Redis password in `.env`
3. Test Redis: `docker exec -it redis redis-cli -a YourPassword PING`

## Security Best Practices

✅ **DO:**
- Use strong passwords (min 16 characters, mixed case, numbers, special chars)
- Rotate secrets every 90 days
- Use different passwords for each service
- Keep `.env` file out of version control (already in .gitignore)
- Restrict `.env` file permissions: `chmod 600 .env`
- Use environment-specific `.env` files (`.env.production`, `.env.staging`)

❌ **DON'T:**
- Commit `.env` to Git
- Share passwords in plain text (use password manager)
- Reuse passwords across services
- Use default passwords in production
- Store secrets in application code

## Support

For issues or questions:
- GitHub Issues: https://github.com/abrkgrbz/Stocker/issues
- Email: info@stoocker.app

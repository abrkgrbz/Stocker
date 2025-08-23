# Coolify Deployment Guide for Stocker

## 📋 Prerequisites
- Coolify installed and configured
- Domain setup (stoocker.app)
- SSL certificates configured

## 🐳 Docker Compose Files

### 1. Infrastructure (docker-compose.infrastructure.yml)
- **MSSQL Server 2022**: Database server
- **Redis**: Cache and SignalR backplane
- Deploy this first to ensure database is ready

### 2. API (docker-compose.api.yml)
- **.NET API**: Backend services
- **Hangfire**: Background job processing
- Depends on Infrastructure services

### 3. Frontend (docker-compose.frontend.yml)
- **React App**: User interface
- Depends on API service

## 🔧 Environment Variables to Set in Coolify

### Required Variables:
```env
# Database
SA_PASSWORD=YourSecurePasswordHere!
DB_CONNECTION=Server=your-db-server,1433;Database=StockerMasterDb;User Id=sa;Password=YourSecurePasswordHere!;TrustServerCertificate=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-2024

# Email
EMAIL_PASSWORD=YourEmailPassword

# Redis
REDIS_CONNECTION=your-redis-server:6379

# Admin Credentials
ADMIN_DEFAULT_PASSWORD=SecureAdminPassword123!
```

## 🚀 Deployment Steps

### Step 1: Deploy Infrastructure
1. Create new service in Coolify
2. Choose Docker Compose
3. Upload `docker-compose.infrastructure.yml`
4. Set environment variables
5. Deploy

### Step 2: Initialize Databases
After infrastructure is running, the API will automatically:
- Create StockerMasterDb
- Create StockerTenantDb
- Run migrations
- Seed admin users
- Create Hangfire tables

### Step 3: Deploy API
1. Create new service in Coolify
2. Upload `docker-compose.api.yml`
3. Set environment variables
4. Configure networking to connect to infrastructure
5. Deploy

### Step 4: Deploy Frontend
1. Create new service in Coolify
2. Upload `docker-compose.frontend.yml`
3. Deploy

## 🔍 Health Checks

### API Health
- Main: https://api.stoocker.app/health
- Detailed: https://api.stoocker.app/health/detailed (Admin only)
- Ready: https://api.stoocker.app/health/ready
- Live: https://api.stoocker.app/health/live

### Hangfire Dashboard
- URL: https://api.stoocker.app/hangfire
- Requires authentication (Admin/TenantAdmin role)

## 📊 Features with Hangfire

### Background Jobs
1. **Email Queue**: Async email processing with retry
2. **Tenant Provisioning**: Database creation for new tenants
3. **Scheduled Jobs**: Recurring tasks

### Queue Priorities
- **critical**: Important emails (verification, password reset)
- **default**: Regular operations
- **low**: Batch operations, maintenance

## 🔐 Security Notes

1. **Change default passwords** immediately after deployment
2. **JWT Secret** must be unique and secure (min 32 chars)
3. **Database password** should be complex
4. **Hangfire Dashboard** is protected by authentication

## 📝 Default Admin Credentials

After deployment, you can login with:
- Email: `admin@stocker.com`
- Password: `Admin123!` (or value from ADMIN_DEFAULT_PASSWORD env var)

**Important**: Change this password immediately after first login!

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MSSQL is running and healthy
- Check connection string format
- Verify firewall rules

### Hangfire Not Working
- Check Redis connection
- Verify Hangfire tables exist in MasterDb
- Check logs for initialization errors

### Email Not Sending
- Verify SMTP credentials
- Check Hangfire dashboard for failed jobs
- Review email queue in Hangfire

## 📈 Monitoring

### Logs
- API logs: Check Coolify service logs
- Hangfire logs: Available in Hangfire dashboard
- Database logs: MSSQL container logs

### Performance
- Hangfire dashboard shows job processing stats
- Redis memory usage
- Database connection pool status

## 🔄 Updates

To update the application:
1. Push new code to repository
2. Rebuild Docker images in Coolify
3. Rolling deployment (zero downtime)

## 📞 Support

For issues:
1. Check logs in Coolify
2. Review Hangfire dashboard
3. Verify all services are healthy
4. Check PROJECT_STATUS.md for known issues
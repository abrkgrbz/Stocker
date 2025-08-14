# Coolify Test Environment Setup for Stocker

## 1. VPS Setup (Hetzner)

### Option A: Hetzner Cloud (Önerilen)
1. Go to: https://www.hetzner.com/cloud
2. Register account
3. Create new project: "Stocker Test"
4. Add Server:
   - Location: Falkenstein (or Helsinki for Turkey)
   - Image: Ubuntu 22.04
   - Type: CX21 (2 vCPU, 4GB RAM, 40GB SSD) - €5.83/month
   - Name: stocker-test
   - Click "Create & Buy"

### Option B: Alternative VPS Providers
- **DigitalOcean**: $6/month (Basic Droplet)
- **Linode**: $5/month (Nanode)
- **Vultr**: $6/month (Regular Cloud Compute)

## 2. Initial Server Access

```bash
# SSH into your server (replace with your server IP)
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git
```

## 3. Install Coolify

```bash
# One-line install
curl -fsSL https://get.coolify.io | bash

# This will:
# - Install Docker & Docker Compose
# - Setup Coolify
# - Configure firewall
# - Setup SSL certificates
# - Start Coolify on port 8000
```

## 4. Access Coolify Dashboard

After installation:
1. Open browser: `http://YOUR_SERVER_IP:8000`
2. Create admin account
3. Set instance name: "Stocker Test Environment"

## 5. Configure Domain (Optional but Recommended)

### If you have a domain:
1. Add A record: `test.yourdomain.com` → `YOUR_SERVER_IP`
2. Add wildcard: `*.test.yourdomain.com` → `YOUR_SERVER_IP`

### Free subdomain alternative:
Use a service like nip.io: `YOUR_SERVER_IP.nip.io`

## 6. Setup GitHub Integration

In Coolify Dashboard:
1. Go to "Settings" → "Source"
2. Add GitHub source
3. Generate GitHub token with repo access
4. Connect your Stocker repository

## 7. Create Test Environment

### 7.1 Add New Project
1. Click "New Project"
2. Name: "Stocker Test"
3. Description: "Multi-tenant SaaS Test Environment"

### 7.2 Add Resources

#### PostgreSQL Database:
1. Click "New Resource" → "Database"
2. Select PostgreSQL 15
3. Name: `stocker-db`
4. Root password: Generate strong password
5. Database: `stocker_test`

#### Redis Cache:
1. Click "New Resource" → "Database"
2. Select Redis 7
3. Name: `stocker-redis`
4. Password: Generate strong password

#### API Application:
1. Click "New Resource" → "Application"
2. Source: GitHub
3. Repository: `yourusername/stocker`
4. Branch: `main` (or `develop`)
5. Build Pack: Dockerfile
6. Dockerfile location: `/src/API/Stocker.API/Dockerfile`
7. Port: 5104

#### Web Application:
1. Click "New Resource" → "Application"
2. Source: GitHub
3. Repository: `yourusername/stocker`
4. Branch: `main`
5. Build Pack: Dockerfile
6. Dockerfile location: `/stocker-web/Dockerfile`
7. Port: 3000

## 8. Environment Variables

### For API Application:
```env
ASPNETCORE_ENVIRONMENT=Test
ConnectionStrings__MasterDb=Host=stocker-db;Database=stocker_master;Username=postgres;Password=YOUR_DB_PASSWORD
ConnectionStrings__Redis=stocker-redis:6379,password=YOUR_REDIS_PASSWORD
JwtSettings__SecretKey=YOUR_GENERATED_SECRET_KEY_MIN_32_CHARS
JwtSettings__Issuer=stocker-test
JwtSettings__Audience=stocker-test
SignalR__EnableDetailedErrors=true
CORS__Origins=http://localhost:3000,https://test.stocker.app
```

### For Web Application:
```env
REACT_APP_API_URL=https://api.test.stocker.app
REACT_APP_SIGNALR_URL=https://api.test.stocker.app/hubs
REACT_APP_ENVIRONMENT=test
```

## 9. Deploy Configuration

### API Deployment Settings:
- Health Check Path: `/health`
- Health Check Interval: 30s
- Restart Policy: Unless Stopped
- Resource Limits: 1 CPU, 1GB RAM

### Web Deployment Settings:
- Health Check Path: `/`
- Restart Policy: Unless Stopped
- Resource Limits: 0.5 CPU, 512MB RAM

## 10. Networking & Domains

Coolify will automatically:
- Generate SSL certificates (Let's Encrypt)
- Configure reverse proxy (Traefik)
- Setup subdomains

Your URLs will be:
- API: `https://stocker-api.YOUR_SERVER_IP.nip.io`
- Web: `https://stocker-web.YOUR_SERVER_IP.nip.io`
- Database: Internal network only

## 11. Post-Deployment Tasks

```bash
# SSH into API container
coolify exec stocker-api bash

# Run database migrations
dotnet ef database update --context MasterDbContext
dotnet ef database update --context TenantDbContext

# Seed test data
dotnet run --project DataSeeder
```

## 12. Monitoring & Logs

In Coolify Dashboard:
- View logs: Applications → Your App → Logs
- Monitor resources: Applications → Your App → Metrics
- Check deployments: Applications → Your App → Deployments

## 13. Backup Strategy (Optional)

```bash
# Create backup script
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec stocker-db pg_dump -U postgres stocker_test > /backups/stocker_$DATE.sql
find /backups -name "*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Add to crontab (daily at 3 AM)
echo "0 3 * * * /root/backup.sh" | crontab -
```

## 14. Test Data Generator

Create test data script:
```bash
# In your local machine
cat > test-data.sh << 'EOF'
#!/bin/bash
API_URL="https://stocker-api.YOUR_SERVER_IP.nip.io"

# Create test tenants
for i in {1..3}; do
  curl -X POST $API_URL/api/public/register \
    -H "Content-Type: application/json" \
    -d '{
      "companyName": "Test Company '$i'",
      "companyCode": "test'$i'",
      "contactEmail": "test'$i'@example.com",
      "contactName": "Test User '$i'",
      "contactPhone": "555123000'$i'",
      "password": "Test@123456",
      "packageId": "basic-package-id"
    }'
done
EOF
```

## 15. Troubleshooting

### Common Issues:

1. **Port 8000 not accessible:**
```bash
ufw allow 8000/tcp
ufw reload
```

2. **Docker permission issues:**
```bash
usermod -aG docker $USER
newgrp docker
```

3. **SSL certificate issues:**
```bash
coolify ssl:renew
```

4. **Database connection issues:**
Check internal network:
```bash
docker network ls
docker network inspect coolify
```

## 16. Useful Commands

```bash
# View all containers
docker ps -a

# View logs
docker logs stocker-api -f

# Restart application
coolify restart stocker-api

# Update Coolify
coolify self-update

# Backup Coolify configuration
coolify backup:config
```

## 17. Access URLs

Once deployed, your test environment will be available at:

- **Web App**: https://stocker-web.YOUR_SERVER_IP.nip.io
- **API**: https://stocker-api.YOUR_SERVER_IP.nip.io
- **API Swagger**: https://stocker-api.YOUR_SERVER_IP.nip.io/swagger
- **SignalR Test**: https://stocker-web.YOUR_SERVER_IP.nip.io/signalr-test

## 18. Team Access

Share with your team:
1. Create user accounts in Coolify
2. Assign roles (Admin, Developer, Viewer)
3. Share test URLs
4. Setup webhook for auto-deploy on push

## Next Steps

1. Configure CI/CD pipeline
2. Setup staging branch auto-deploy
3. Add monitoring (Uptime Kuma)
4. Configure backup automation
5. Setup email notifications for deployments

---

**Support Resources:**
- Coolify Docs: https://coolify.io/docs
- Discord: https://discord.gg/coolify
- GitHub: https://github.com/coollabsio/coolify
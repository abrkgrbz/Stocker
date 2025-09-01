# GitHub App Setup for Private Repository Deployment

## 1. Create GitHub App

### Go to GitHub Settings
1. GitHub → Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"

### App Configuration
```yaml
GitHub App name: Stocker-Coolify
Homepage URL: https://stoocker.app
Webhook URL: https://coolify.stoocker.app/webhooks/github

# Permissions (Repository)
- Contents: Read
- Metadata: Read
- Pull requests: Read
- Actions: Read (optional)
- Webhooks: Read & Write

# Subscribe to events:
- Push
- Pull request
- Release

# Where can this GitHub App be installed?
- Only on this account
```

### After Creation
1. Note down the **App ID**
2. Generate a **Private Key** (will download .pem file)
3. Install the app on your repository

## 2. Configure in Coolify

### Add GitHub App Source
1. Coolify → Sources → Add New Source
2. Select "GitHub App (Private Repositories)"
3. Enter:
   - App ID: `<your-app-id>`
   - Private Key: `<paste-content-of-pem-file>`
   - Webhook Secret: `<your-webhook-secret>`
4. Test Connection

### Repository Access
After connecting, you'll see all repositories the app has access to.

## 3. Deploy Infrastructure Services

Since infrastructure services use Docker images (not built from repo), we'll use Docker Compose directly in Coolify.

### Option A: Direct Docker Compose (Recommended for Infrastructure)

1. **Coolify → Projects → New Resource → Docker Compose**
2. **Name:** `infrastructure-mssql`
3. **Copy content from:** `deployment/coolify/infrastructure/01-database.yml`
4. **Deploy**

Repeat for:
- `02-redis.yml`
- `03-seq.yml`
- `04-minio.yml` (optional)

### Option B: From GitHub Repository

1. **Coolify → Projects → New Resource → Docker Compose**
2. **Source:** GitHub App
3. **Repository:** abrkgrbz/Stocker
4. **Branch:** master
5. **Docker Compose Path:** `deployment/coolify/infrastructure/01-database.yml`
6. **Deploy**

## 4. Service Configuration

### SQL Server (01-database.yml)
```yaml
Environment Variables:
SA_PASSWORD=YourStrongPassword123!
MSSQL_PID=Express
```

### Redis (02-redis.yml)
```yaml
Environment Variables:
REDIS_PASSWORD=RedisPassword123!
REDIS_MAX_MEMORY=256mb
```

### Seq (03-seq.yml)
```yaml
Environment Variables:
SEQ_PASSWORD=StockerSeq2024!
```

### MinIO (04-minio.yml)
```yaml
Environment Variables:
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=MinioPassword123!
```

## 5. Network Configuration

All services must be on the same network:

```bash
# Create network if not exists (Coolify usually creates this)
docker network create coolify
```

## 6. Deployment Order

Deploy in this exact order:
1. ✅ SQL Server (01-database.yml)
2. ✅ Redis (02-redis.yml)
3. ✅ Seq (03-seq.yml)
4. ✅ MinIO (04-minio.yml) - Optional

Wait for each service to be healthy before proceeding.

## 7. Verify Deployment

### Check Service Health
```bash
# SSH to server
ssh root@95.217.219.4

# Check containers
docker ps --filter "label=com.stocker.tier=infrastructure"

# Check SQL Server
docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -Q "SELECT 1"

# Check Redis
docker exec redis redis-cli --pass RedisPassword123! ping

# Check Seq
curl http://localhost:5341/api/health
```

### Create Databases
```bash
# Create databases after SQL Server is running
docker exec mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrongPassword123!' \
  -Q "CREATE DATABASE StockerMasterDb; CREATE DATABASE StockerTenantDb;"
```

## 8. Troubleshooting

### Container not starting
- Check logs: `docker logs <container-name>`
- Verify environment variables
- Check disk space: `df -h`

### Network issues
- Ensure all containers on same network: `docker network inspect coolify`
- Check firewall rules

### Permission denied
- GitHub App needs proper permissions
- Check webhook delivery in GitHub

## 9. Next Steps

After infrastructure is running:
1. Deploy API (`applications/01-api.yml`)
2. Deploy Web (`applications/02-web.yml`)
3. Configure domains and SSL
4. Set up backups

---

## Security Notes

⚠️ **IMPORTANT:**
- Change all default passwords
- Store passwords in Coolify's secret management
- Enable SSL for all services
- Restrict firewall rules
- Regular backups are critical
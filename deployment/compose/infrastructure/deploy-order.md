# Infrastructure Deployment Order for Coolify

## 🚀 Quick Deploy Commands

```bash
# SSH to your server
ssh root@95.217.219.4

# Navigate to deployment folder (after cloning repo)
cd /opt/stocker/deployment/coolify/infrastructure
```

## 📋 Deployment Steps

### Step 1: SQL Server (REQUIRED)
```yaml
Service: 01-database.yml
Container Name: mssql
Ports: 1433
Health Check: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -Q 'SELECT 1'
```

**Coolify Setup:**
1. New Resource → Docker Compose
2. Name: `mssql`
3. Copy content from `01-database.yml`
4. Environment Variables:
   - `SA_PASSWORD=YourStrongPassword123!`
5. Deploy and wait for healthy status

**Post-Deploy:**
```bash
# Create databases
docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' \
  -Q "CREATE DATABASE StockerMasterDb;"
  
docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' \
  -Q "CREATE DATABASE StockerTenantDb;"
```

### Step 2: Redis (REQUIRED)
```yaml
Service: 02-redis.yml
Container Name: redis
Ports: 6379
Health Check: redis-cli --pass RedisPassword123! ping
```

**Coolify Setup:**
1. New Resource → Docker Compose
2. Name: `redis`
3. Copy content from `02-redis.yml`
4. Environment Variables:
   - `REDIS_PASSWORD=RedisPassword123!`
5. Deploy

### Step 3: Seq Logging (REQUIRED)
```yaml
Service: 03-seq.yml
Container Name: seq
Ports: 5341 (API), 5342 (Ingestion)
Health Check: curl http://localhost:80/api/health
```

**Coolify Setup:**
1. New Resource → Docker Compose
2. Name: `seq`
3. Copy content from `03-seq.yml`
4. Environment Variables:
   - `SEQ_PASSWORD=StockerSeq2024!`
5. Deploy
6. Access at: http://your-server-ip:5341

### Step 4: MinIO (OPTIONAL)
```yaml
Service: 04-minio.yml
Container Name: minio
Ports: 9000 (API), 9001 (Console)
Health Check: curl http://localhost:9000/minio/health/live
```

**Coolify Setup:**
1. New Resource → Docker Compose
2. Name: `minio`
3. Copy content from `04-minio.yml`
4. Environment Variables:
   - `MINIO_ROOT_USER=admin`
   - `MINIO_ROOT_PASSWORD=MinioPassword123!`
5. Deploy
6. Access console at: http://your-server-ip:9001

## ✅ Verification Script

Create this script on your server:

```bash
#!/bin/bash
# verify-infrastructure.sh

echo "Checking Infrastructure Services..."
echo "===================================="

# Check SQL Server
echo -n "SQL Server: "
if docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrongPassword123!' -Q "SELECT 1" &>/dev/null; then
    echo "✅ Running"
else
    echo "❌ Failed"
fi

# Check Redis
echo -n "Redis: "
if docker exec redis redis-cli --pass RedisPassword123! ping &>/dev/null; then
    echo "✅ Running"
else
    echo "❌ Failed"
fi

# Check Seq
echo -n "Seq: "
if curl -s http://localhost:5341/api/health &>/dev/null; then
    echo "✅ Running"
else
    echo "❌ Failed"
fi

# Check MinIO (if deployed)
echo -n "MinIO: "
if curl -s http://localhost:9000/minio/health/live &>/dev/null; then
    echo "✅ Running"
else
    echo "⏭️  Skipped"
fi

echo "===================================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

## 🔧 Coolify-Specific Settings

### Network Configuration
All services must use network: `coolify` (external)

### Volume Persistence
Volumes are created automatically and persist across deployments

### Environment Variables
Can be set in Coolify UI or in the compose file

### Health Checks
Coolify monitors health checks and shows status in UI

## 🚨 Common Issues

### Issue: Container keeps restarting
**Solution:** Check logs in Coolify UI or `docker logs <container-name>`

### Issue: Cannot connect between services
**Solution:** Ensure all services use the same network (`coolify`)

### Issue: Permission denied
**Solution:** Check file permissions and Docker socket access

### Issue: Disk space
**Solution:** Clean up old images: `docker system prune -a`

## 📝 Notes

- Deploy order is critical: Database → Cache → Logging → Storage
- Wait for each service to be healthy before deploying the next
- Use service names (not IPs) for inter-service communication
- All passwords should be changed in production
- Enable SSL/TLS for production deployments
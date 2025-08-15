# Coolify Deployment Guide for Stocker

## 📋 Prerequisites
- Coolify installed on VPS
- GitHub repository connected to Coolify
- Docker and Docker Compose on VPS

## 🚀 Quick Setup

### Step 1: Coolify Dashboard Configuration

1. **Create New Application**
   - Type: `Docker Compose`
   - Source: Your GitHub repository

2. **Build Configuration**
   - Docker Compose Location: `docker-compose.yml` (root directory)
   - Base Directory: ` ` (leave empty)
   - Build Pack: `Docker Compose`

3. **Environment Variables**
   ```env
   DB_PASSWORD=StockerDb2024!
   REDIS_PASSWORD=Redis2024!
   ENVIRONMENT=Development
   JWT_SECRET=ThisIsAVerySecureSecretKeyForStockerTestEnvironment2024!
   ```

4. **Network Configuration**
   - Exposed Port: `5104` (API)
   - Additional Ports: `8090` (Adminer), `3000` (Web)

### Step 2: Deploy

1. Click **Deploy** button in Coolify
2. Monitor deployment logs
3. Wait for health checks to pass

## 🔧 Troubleshooting

### "lstat /artifacts/deployment: no such file or directory"
**Solution**: Use `docker-compose.yml` in root, not `deployment/docker-compose.yml`

### Build fails with .NET errors
**Solution**: Try simplified Dockerfile
```bash
# In docker-compose.yml, change:
dockerfile: ./deployment/Dockerfile.api
# To:
dockerfile: ./deployment/Dockerfile.api.simple
```

### Port already in use
**Solution**: Change ports in environment variables or docker-compose.yml

### Database connection fails
**Solution**: Ensure postgres service is healthy before API starts
```yaml
depends_on:
  postgres:
    condition: service_healthy
```

## 📁 File Structure Required

```
/
├── docker-compose.yml          # Main compose file (root)
├── deployment/
│   ├── Dockerfile.api          # API Dockerfile
│   ├── Dockerfile.api.simple   # Fallback Dockerfile
│   ├── Dockerfile.web          # Frontend Dockerfile
│   ├── init-db.sql            # Database initialization
│   ├── nginx/
│   │   └── default.conf       # Nginx config
│   └── .env.coolify           # Environment template
├── src/
│   └── API/
│       └── Stocker.API/
└── stocker-web/
```

## 🌐 Access URLs

After successful deployment:
- API: `http://YOUR_VPS_IP:5104`
- Swagger: `http://YOUR_VPS_IP:5104/swagger`
- Adminer: `http://YOUR_VPS_IP:8090`
- Web App: `http://YOUR_VPS_IP:3000`

## 🗄️ Database Access

**Adminer Login:**
- System: PostgreSQL
- Server: `postgres`
- Username: `postgres`
- Password: `StockerDb2024!`
- Database: `stocker_master`

## 🔍 Health Checks

```bash
# API Health
curl http://YOUR_VPS_IP:5104/health

# Database
docker exec stocker-db pg_isready -U postgres

# Redis
docker exec stocker-redis redis-cli -a Redis2024! ping
```

## 📝 Manual Deployment (if Coolify fails)

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Clone repository
cd /opt
git clone https://github.com/YOUR_USERNAME/Stocker.git stocker
cd stocker

# Start services
docker compose up -d

# Check status
docker ps
```

## 🆘 Common Issues

### Issue: Coolify can't find files
- Ensure all paths in docker-compose.yml are relative to root
- Don't use absolute paths
- Check Coolify's working directory

### Issue: Build takes too long
- Use pre-built images when possible
- Implement multi-stage builds
- Cache Docker layers properly

### Issue: Services can't communicate
- Ensure all services are on same network
- Use service names for internal communication
- Check firewall rules

## 📊 Monitoring

```bash
# View logs
docker compose logs -f

# Check resource usage
docker stats

# Service status
docker compose ps
```

## 🔐 Security Notes

For production:
1. Change all default passwords
2. Use secrets management
3. Enable HTTPS/SSL
4. Restrict port access
5. Regular backups

## 💡 Tips

1. **Use profiles** to separate dev/prod services
2. **Health checks** prevent cascading failures  
3. **Volume mounts** for persistent data
4. **Resource limits** prevent memory issues
5. **Logging** to external service for production

---

**Last Updated**: 2024
**Version**: 1.0.0
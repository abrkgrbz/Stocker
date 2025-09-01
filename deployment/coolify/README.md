# Stocker Coolify Deployment

Professional deployment structure for Stocker application on Coolify.

## 📁 Directory Structure

```
deployment/coolify/
├── infrastructure/          # Core infrastructure services
│   ├── 01-database.yml     # SQL Server
│   ├── 02-redis.yml        # Redis Cache
│   ├── 03-seq.yml          # Centralized Logging
│   └── 04-minio.yml        # Object Storage (Optional)
├── applications/           # Application services
│   ├── 01-api.yml         # Backend API
│   └── 02-web.yml         # Frontend Web App
├── monitoring/            # Monitoring stack
│   ├── prometheus.yml     # Metrics collection
│   └── grafana.yml        # Dashboard visualization
├── backup/               # Backup solutions
│   └── backup.yml        # Automated backup service
├── scripts/              # Deployment scripts
│   ├── deploy.sh         # Main deployment script
│   ├── backup.sh         # Backup script
│   └── health-check.sh   # Health check script
└── docs/                 # Documentation
    └── troubleshooting.md
```

## 🚀 Quick Start

### 1. Deploy via Coolify UI

1. Login to Coolify
2. Create new Docker Compose service for each file
3. Deploy in order:
   - Infrastructure (01-database, 02-redis, 03-seq)
   - Applications (01-api, 02-web)
   - Monitoring (optional)

### 2. Deploy via Script

```bash
cd /deployment/coolify
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 📋 Service Order

Deploy services in this specific order:

1. **Infrastructure Layer**
   - SQL Server (01-database.yml)
   - Redis (02-redis.yml)
   - Seq (03-seq.yml)
   - MinIO (04-minio.yml) - Optional

2. **Application Layer**
   - API (01-api.yml)
   - Web (02-web.yml)

3. **Monitoring Layer** (Optional)
   - Prometheus
   - Grafana

## 🔧 Configuration

### Environment Variables

Each service has its own environment variables. Key variables:

- `SA_PASSWORD`: SQL Server admin password
- `REDIS_PASSWORD`: Redis authentication
- `JWT_SECRET`: JWT token secret
- `SENDGRID_API_KEY`: Email service API key

### Network

All services use the `coolify` network (external).

### Volumes

Data is persisted in Docker volumes:
- `mssql_data`: Database files
- `redis_data`: Cache data
- `seq_data`: Log storage
- `minio_data`: Object storage

## 🌐 Domains

Configure these domains in DNS:

- `stoocker.app` - Main application
- `api.stoocker.app` - API backend
- `seq.stoocker.app` - Logging dashboard
- `minio.stoocker.app` - MinIO console
- `s3.stoocker.app` - MinIO S3 API
- `grafana.stoocker.app` - Monitoring dashboard
- `metrics.stoocker.app` - Prometheus

## 🔒 Security

1. **Change default passwords** before production deployment
2. Enable **SSL/TLS** for all services
3. Configure **firewall rules** for ports
4. Set up **backup strategy**
5. Enable **rate limiting** on API

## 📊 Monitoring

Access dashboards:
- Seq: https://seq.stoocker.app
- Grafana: https://grafana.stoocker.app
- MinIO: https://minio.stoocker.app

## 🔄 Backup

Automated backups run daily at 2 AM. Manual backup:

```bash
./scripts/backup.sh
```

## 🆘 Troubleshooting

### Check service health
```bash
docker ps --filter "label=com.stocker.service"
```

### View logs
```bash
docker logs <container-name> --tail 100 -f
```

### Database connection issues
- Ensure services are on same network
- Use service names, not IPs
- Check firewall rules

### WebSocket issues
- Check Traefik labels for WebSocket support
- Verify CORS configuration
- Test with Long Polling as fallback

## 📝 Notes

- Services are configured for production use
- Adjust resource limits based on server capacity
- Regular backups are critical
- Monitor disk space usage

## 📧 Support

For issues, check:
1. Service logs
2. Health endpoints
3. Network connectivity
4. Resource usage

---

Last updated: 2024
Version: 1.0.0
# Stocker Coolify Deployment

Complete deployment configuration for Stocker application on Coolify platform.

## 📁 Directory Structure

```
deployment/coolify/
├── README.md                          # This file
├── docker-compose.yml                 # Main orchestration file
├── .env.example                       # Template for environment variables
├── .env                              # Actual environment variables (gitignored)
│
├── services/                         # Individual service configurations
│   ├── api/
│   │   ├── docker-compose.yml       # API service
│   │   ├── .env.example
│   │   └── Dockerfile
│   ├── web/
│   │   ├── docker-compose.yml       # Web service
│   │   ├── .env.example
│   │   └── Dockerfile
│   ├── admin/
│   │   ├── docker-compose.yml       # Admin panel
│   │   ├── .env.example
│   │   └── Dockerfile
│   └── auth/
│       ├── docker-compose.yml       # Auth service (Next.js)
│       ├── .env.example
│       └── Dockerfile
│
├── infrastructure/                   # Infrastructure services
│   ├── database/
│   │   ├── docker-compose.yml       # SQL Server
│   │   └── .env.example
│   ├── redis/
│   │   ├── docker-compose.yml       # Redis cache
│   │   └── .env.example
│   ├── seq/
│   │   ├── docker-compose.yml       # Logging
│   │   └── .env.example
│   └── minio/
│       ├── docker-compose.yml       # Object storage
│       └── .env.example
│
├── monitoring/                       # Monitoring stack
│   ├── prometheus/
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   └── prometheus.yml
│   └── grafana/
│       ├── docker-compose.yml
│       └── .env.example
│
└── traefik/                         # Reverse proxy
    ├── docker-compose.yml
    └── traefik.yml
```

## 🚀 Quick Start

### 1. Clone and Setup
```bash
cd deployment/coolify
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file with your actual values:
```bash
nano .env
```

### 3. Deploy Infrastructure First
```bash
# Database
docker-compose -f infrastructure/database/docker-compose.yml up -d

# Redis
docker-compose -f infrastructure/redis/docker-compose.yml up -d

# Logging
docker-compose -f infrastructure/seq/docker-compose.yml up -d

# Storage
docker-compose -f infrastructure/minio/docker-compose.yml up -d
```

### 4. Deploy Application Services
```bash
# API
docker-compose -f services/api/docker-compose.yml up -d

# Web
docker-compose -f services/web/docker-compose.yml up -d

# Admin
docker-compose -f services/admin/docker-compose.yml up -d

# Auth
docker-compose -f services/auth/docker-compose.yml up -d
```

### 5. Deploy Monitoring (Optional)
```bash
docker-compose -f monitoring/prometheus/docker-compose.yml up -d
docker-compose -f monitoring/grafana/docker-compose.yml up -d
```

### 6. Deploy Everything at Once
```bash
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables

Each service has its own `.env.example` file. Copy and configure:

```bash
# For each service
cd services/api
cp .env.example .env
nano .env
```

### Service URLs

After deployment, services will be available at:

- **API**: https://api.stoocker.app
- **Web**: https://stoocker.app
- **Admin**: https://admin.stoocker.app
- **Auth**: https://auth.stoocker.app
- **Seq Logs**: https://seq.stoocker.app
- **MinIO**: https://minio.stoocker.app
- **Grafana**: https://grafana.stoocker.app

## 📊 Monitoring

Access monitoring dashboards:

- **Grafana**: https://grafana.stoocker.app
  - Username: admin
  - Password: (set in .env)

- **Seq Logs**: https://seq.stoocker.app
  - API Key: (set in .env)

## 🔐 Security

### Secrets Management

1. **Never commit `.env` files** to git
2. **Use strong passwords** for all services
3. **Rotate secrets regularly**
4. **Use Coolify's secrets management** for production

### SSL/TLS

Coolify automatically provisions Let's Encrypt certificates for all domains.

## 🛠️ Maintenance

### View Logs
```bash
# Specific service
docker-compose -f services/api/docker-compose.yml logs -f

# All services
docker-compose logs -f
```

### Restart Services
```bash
# Specific service
docker-compose -f services/api/docker-compose.yml restart

# All services
docker-compose restart
```

### Update Services
```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d
```

### Backup Database
```bash
docker exec stocker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $SA_PASSWORD \
  -Q "BACKUP DATABASE [Stocker_Master] TO DISK = N'/var/opt/mssql/backups/master.bak'"
```

## 🐛 Troubleshooting

### Check Service Health
```bash
docker-compose ps
```

### View Service Logs
```bash
docker-compose logs [service-name]
```

### Restart Failed Service
```bash
docker-compose restart [service-name]
```

### Database Connection Issues
```bash
# Check SQL Server is running
docker exec stocker-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P $SA_PASSWORD -Q "SELECT @@VERSION"
```

## 📝 Notes

- All services use named volumes for persistence
- Networks are automatically created and managed
- Health checks ensure service availability
- Automatic restarts configured for all services

## 🔗 Links

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

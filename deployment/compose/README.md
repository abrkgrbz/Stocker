# Docker Compose Deployment

Modular Docker Compose configurations for Stocker application.

## 📁 Structure

```
compose/
├── services/              # Application layer
│   ├── api/              # Backend API (.NET Core)
│   ├── web/              # Frontend Web (Next.js)
│   ├── admin/            # Admin Panel (React)
│   └── auth/             # Auth Service (Next.js)
└── infrastructure/        # Infrastructure layer
    ├── database/         # SQL Server
    ├── redis/            # Redis Cache
    ├── seq/              # Centralized Logging
    └── minio/            # Object Storage
```

## 🚀 Quick Start

### 1. Deploy Infrastructure

```bash
# Database
cd infrastructure/database
cp .env.example .env
# Edit .env with your values
docker-compose up -d

# Redis
cd ../redis
cp .env.example .env
docker-compose up -d

# Seq (Logging)
cd ../seq
cp .env.example .env
docker-compose up -d

# MinIO (Storage)
cd ../minio
cp .env.example .env
docker-compose up -d
```

### 2. Deploy Services

```bash
# API
cd ../../services/api
cp .env.example .env
# Configure database connection and other settings
docker-compose up -d

# Web
cd ../web
cp .env.example .env
docker-compose up -d

# Admin
cd ../admin
cp .env.example .env
docker-compose up -d

# Auth
cd ../auth
cp .env.example .env
docker-compose up -d
```

## 📝 Configuration

Each service requires environment variables. Copy `.env.example` to `.env` and configure:

### Required Variables

**Database**:
- `SA_PASSWORD`: SQL Server SA password

**Redis**:
- `REDIS_PASSWORD`: Redis password

**API**:
- `ConnectionStrings__MasterConnection`: Database connection
- `JWT_SECRET`: JWT signing key
- `SMTP_USERNAME`, `SMTP_PASSWORD`: Email settings
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`: Storage credentials
- `REDIS_PASSWORD`: Redis password
- `SEQ_API_KEY`: Logging API key

**Web/Admin/Auth**:
- `NEXT_PUBLIC_API_URL` or `VITE_API_URL`: API endpoint
- `NEXTAUTH_SECRET`: NextAuth secret (for Next.js apps)

## 🔍 Monitoring

### View Logs

```bash
# Specific service
cd services/api
docker-compose logs -f

# All containers
docker-compose logs -f
```

### Health Checks

```bash
# Check running containers
docker ps

# Check service health
docker-compose ps
```

## 🔧 Maintenance

### Update Services

```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d
```

### Restart Service

```bash
docker-compose restart
```

### Stop Service

```bash
docker-compose down
```

### Remove Everything (including volumes)

```bash
docker-compose down -v
```

## 🌐 Networks

All services use the `coolify` network for inter-service communication.

## 💾 Volumes

Persistent data is stored in named volumes:
- `stocker-sqlserver-data`: Database data
- `stocker-redis-data`: Redis data
- `stocker-seq-data`: Log data
- `stocker-minio-data`: Object storage data

## 🔐 Security Notes

- Never commit `.env` files
- Use strong passwords (min 16 characters)
- Change default credentials
- Enable SSL/TLS in production
- Restrict network access
- Regular backups

## 📊 Resource Requirements

Minimum:
- CPU: 2 cores
- RAM: 4GB
- Disk: 20GB

Recommended:
- CPU: 4 cores
- RAM: 8GB
- Disk: 50GB SSD

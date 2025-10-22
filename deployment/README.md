# Stocker Deployment

Production-ready deployment configurations for Stocker application.

## 📁 Directory Structure

```
deployment/
├── compose/                    # Docker Compose configurations
│   ├── services/              # Application services
│   │   ├── api/              # .NET Core API
│   │   ├── web/              # Next.js Web App
│   │   ├── admin/            # React Admin Panel
│   │   └── auth/             # Next.js Auth Service
│   └── infrastructure/        # Infrastructure services
│       ├── database/         # SQL Server
│       ├── redis/            # Redis Cache
│       ├── seq/              # Logging (Seq)
│       └── minio/            # Object Storage (MinIO)
│
├── coolify/                   # Coolify platform specific
│   ├── apps/                 # Coolify app definitions
│   └── env/                  # Environment templates
│
└── README.md                  # This file
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Local/VPS)

For manual deployment using Docker Compose:

```bash
cd compose

# Deploy infrastructure first
cd infrastructure/database && docker-compose up -d
cd ../redis && docker-compose up -d
cd ../seq && docker-compose up -d
cd ../minio && docker-compose up -d

# Deploy application services
cd ../../services/api && docker-compose up -d
cd ../web && docker-compose up -d
cd ../admin && docker-compose up -d
cd ../auth && docker-compose up -d
```

### Option 2: Coolify Platform

For deployment on Coolify:

1. Use app definitions from \`coolify/apps/\`
2. Configure environment variables from \`coolify/env/\`
3. Deploy through Coolify dashboard

See [Coolify Deployment Guide](./coolify/README.md)

## 📋 Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- 4GB RAM minimum
- 20GB disk space

## 🔧 Configuration

Each service has its own \`.env.example\` file. Copy and configure:

```bash
# For compose-based deployment
cd compose/services/api
cp .env.example .env
nano .env
```

## 🌐 Service URLs

After deployment:

- **API**: https://api.stoocker.app
- **Web**: https://stoocker.app
- **Admin**: https://admin.stoocker.app
- **Auth**: https://auth.stoocker.app
- **Seq**: https://seq.stoocker.app
- **MinIO**: https://s3.stoocker.app

## 📊 Monitoring

- **Seq Logs**: https://seq.stoocker.app
- **MinIO Console**: https://s3.stoocker.app (port 9001)

## 🔐 Security

- All \`.env\` files are gitignored
- Use strong passwords for all services
- Enable SSL/TLS for production
- Rotate secrets regularly

## 📚 Documentation

- [Coolify Deployment](./coolify/README.md)
- [Docker Compose Guide](./compose/README.md)

## 🆘 Support

For issues and questions, please open an issue on GitHub.

# Coolify Deployment Files

Simplified deployment structure for Coolify platform.

## 📁 Structure

```
coolify-deploys/
├── infrastructure/     # Infrastructure services
│   ├── database.yml   # SQL Server
│   ├── redis.yml      # Redis Cache
│   ├── seq.yml        # Seq Logging
│   └── minio.yml      # MinIO Object Storage
└── apps/              # Application services
    ├── api.yml        # .NET API
    ├── web.yml        # Next.js Web App
    ├── admin.yml      # Admin Panel
    └── auth.yml       # Auth Service
```

## 🚀 Usage in Coolify

### Deploy Infrastructure First

1. **Database**
   - Path: `coolify-deploys/infrastructure/database.yml`

2. **Redis**
   - Path: `coolify-deploys/infrastructure/redis.yml`

3. **Seq**
   - Path: `coolify-deploys/infrastructure/seq.yml`

4. **MinIO**
   - Path: `coolify-deploys/infrastructure/minio.yml`

### Deploy Applications

1. **API**
   - Path: `coolify-deploys/apps/api.yml`

2. **Web**
   - Path: `coolify-deploys/apps/web.yml`

3. **Admin**
   - Path: `coolify-deploys/apps/admin.yml`

4. **Auth**
   - Path: `coolify-deploys/apps/auth.yml`

## ⚙️ Coolify Settings

- **Repository**: `abrkgrbz/Stocker`
- **Branch**: `master`
- **Base Directory**: Leave empty
- **Compose File Location**: Use paths above

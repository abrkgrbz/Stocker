# Stocker Deployment Guide

## 📋 İçindekiler
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Dosya Yapısı](#dosya-yapısı)
- [Deployment Seçenekleri](#deployment-seçenekleri)
- [Coolify Deployment](#coolify-deployment)
- [Manuel VPS Deployment](#manuel-vps-deployment)
- [Komutlar](#komutlar)
- [Troubleshooting](#troubleshooting)

## 🚀 Hızlı Başlangıç

### Local Development
```bash
cd deployment
./deploy.sh development up
```

### Coolify Deployment
```bash
cd deployment
./deploy.sh coolify up
```

### Production Deployment
```bash
cd deployment
./deploy.sh production up
```

## 📁 Dosya Yapısı

```
deployment/
├── Dockerfile.api              # API için Dockerfile
├── Dockerfile.web              # Frontend için Dockerfile
├── docker-compose.coolify.yml  # Coolify için basit compose
├── docker-compose.production.yml # Production compose
├── .env.development            # Development environment
├── .env.production            # Production environment
├── nginx.conf                 # Nginx configuration
├── init-scripts/              # Database initialization
├── deploy.sh                  # Deployment script
├── Makefile                   # Make commands
└── README.md                  # Bu dosya
```

## 🔧 Deployment Seçenekleri

### 1. Coolify ile Deployment

#### Coolify Dashboard Ayarları:

1. **Application Type**: Docker Compose
2. **Docker Compose File**: `deployment/docker-compose.coolify.yml`
3. **Base Directory**: `/`

#### Environment Variables:
```env
ASPNETCORE_ENVIRONMENT=Development
DB_PASSWORD=StockerDb2024!
REDIS_PASSWORD=Redis2024!
JWT_SECRET=ThisIsAVerySecureSecretKeyForStockerTestEnvironment2024!
```

#### Deploy Komutu:
```bash
# GitHub'a push
git add -A
git commit -m "Update deployment configuration"
git push origin main

# Coolify Dashboard'da Deploy butonuna tıklayın
```

### 2. Manuel VPS Deployment

#### VPS Hazırlık:
```bash
# VPS'e bağlan
ssh root@YOUR_VPS_IP

# Repository'yi clone et
git clone https://github.com/YOUR_USERNAME/Stocker.git /opt/stocker
cd /opt/stocker/deployment

# Deploy script'ini çalıştır
chmod +x deploy.sh
./deploy.sh coolify up
```

### 3. Docker Compose ile Deploy

#### Development:
```bash
docker compose -f docker-compose.coolify.yml up -d
```

#### Production:
```bash
docker compose -f docker-compose.production.yml --env-file .env.production up -d
```

## 📝 Komutlar

### Makefile Komutları:
```bash
make help          # Yardım
make dev-up        # Development başlat
make dev-down      # Development durdur
make dev-logs      # Logları göster
make prod-up       # Production başlat
make db-migrate    # Migration çalıştır
make health        # Health check
make clean         # Temizlik
```

### Deploy Script Komutları:
```bash
./deploy.sh development up      # Dev ortamı başlat
./deploy.sh development down    # Dev ortamı durdur
./deploy.sh development logs    # Logları göster
./deploy.sh production build    # Production build
./deploy.sh coolify rebuild     # Rebuild ve restart
```

## 🔍 Health Check

### API Health:
```bash
curl http://localhost:5104/health
```

### Database:
```bash
docker exec stocker-db pg_isready -U postgres
```

### Redis:
```bash
docker exec stocker-redis redis-cli -a Redis2024! ping
```

## 🌐 Erişim URL'leri

| Servis | Development | Production |
|--------|------------|------------|
| API | http://localhost:5104 | https://api.yourdomain.com |
| Swagger | http://localhost:5104/swagger | https://api.yourdomain.com/swagger |
| Web App | http://localhost:3000 | https://yourdomain.com |
| Adminer | http://localhost:8090 | - |

## 🗄️ Database

### Bağlantı Bilgileri:
- **Host**: postgres (container) / localhost (external)
- **Port**: 5432
- **Database**: stocker_master
- **Username**: postgres
- **Password**: StockerDb2024! (dev) / .env'den (prod)

### Migration Çalıştırma:
```bash
docker exec stocker-api dotnet ef database update --context MasterDbContext
docker exec stocker-api dotnet ef database update --context TenantDbContext
```

### Backup:
```bash
docker exec stocker-db pg_dumpall -U postgres > backup_$(date +%Y%m%d).sql
```

## 🔧 Troubleshooting

### Container başlamıyor:
```bash
# Logları kontrol et
docker logs stocker-api --tail 50

# Container durumunu kontrol et
docker ps -a

# Network'leri kontrol et
docker network ls
```

### Port çakışması:
```bash
# Kullanılan portları kontrol et
netstat -tulpn | grep -E "(3000|5104|5432|6379|8090)"

# Process'i bul ve durdur
lsof -i :5104
kill -9 <PID>
```

### Database bağlantı hatası:
```bash
# Database'e manuel bağlan
docker exec -it stocker-db psql -U postgres

# Database'i kontrol et
\l
\c stocker_master
\dt
```

### Build hatası:
```bash
# Cache'i temizle ve rebuild
docker compose -f docker-compose.coolify.yml build --no-cache

# Tüm sistemi temizle
docker system prune -af --volumes
```

## 🔐 Güvenlik

### Production İçin:
1. `.env.production` dosyasındaki şifreleri değiştirin
2. JWT Secret'ı güçlü bir değerle değiştirin
3. CORS origins'i kendi domain'inizle değiştirin
4. Firewall kurallarını ayarlayın
5. SSL sertifikası ekleyin

### SSL Ekleme:
```bash
# Let's Encrypt ile SSL
apt install certbot
certbot certonly --standalone -d yourdomain.com
```

## 📊 Monitoring

### Container İstatistikleri:
```bash
docker stats
```

### Log Aggregation:
```bash
docker compose logs -f --tail 100
```

### Resource Usage:
```bash
docker system df
```

## 🆘 Destek

Sorun yaşarsanız:
1. Bu dokümandaki Troubleshooting bölümünü kontrol edin
2. Logs'ları inceleyin: `docker logs stocker-api`
3. GitHub Issues: https://github.com/YOUR_USERNAME/Stocker/issues

---

**Version**: 1.0.0
**Last Updated**: 2024
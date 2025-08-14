# Stocker Test Environment Deployment

Bu dokümantasyon, Stocker uygulamasının Coolify ile test ortamına nasıl deploy edileceğini açıklar.

## 🚀 Hızlı Başlangıç

### 1. VPS Kiralama

Hetzner'den bir VPS kiralayın:
- **Minimum**: 2 vCPU, 4GB RAM, 40GB SSD
- **Önerilen**: 4 vCPU, 8GB RAM, 80GB SSD
- **OS**: Ubuntu 22.04 LTS

### 2. Coolify Kurulumu

VPS'e SSH ile bağlanın ve setup scriptini çalıştırın:

```bash
# Script'i indirin ve çalıştırın
wget https://raw.githubusercontent.com/yourusername/stocker/main/deployment/setup-coolify.sh
chmod +x setup-coolify.sh
sudo ./setup-coolify.sh
```

### 3. Coolify Dashboard Erişimi

Script tamamlandıktan sonra:
1. Tarayıcınızda `http://YOUR_VPS_IP:8000` adresine gidin
2. Admin hesabı oluşturun
3. Dashboard'a giriş yapın

### 4. GitHub Repository Bağlantısı

Coolify Dashboard'da:
1. **Sources** → **Add Source** → **GitHub**
2. GitHub App oluşturun veya Personal Access Token kullanın
3. Repository'yi seçin: `yourusername/stocker`

### 5. Uygulama Oluşturma

1. **Projects** → **Create Project** → "Stocker Test"
2. **Applications** → **Add Application**
3. Source olarak GitHub repository'nizi seçin
4. Branch: `main` veya `develop`
5. Build Pack: **Docker Compose**
6. Docker Compose File: `deployment/docker-compose.coolify.yml`

### 6. Environment Variables

Coolify'da environment variables ekleyin:
- **Secrets** bölümünden hassas bilgileri ekleyin
- `deployment/coolify.env` dosyasındaki değerleri kullanın

### 7. Deploy

1. **Deploy** butonuna tıklayın
2. Build ve deployment loglarını takip edin
3. Tamamlandığında URL'leri kontrol edin

## 📁 Dosya Yapısı

```
deployment/
├── setup-coolify.sh        # Coolify kurulum scripti
├── docker-compose.coolify.yml  # Coolify için Docker Compose
├── coolify.env            # Environment variables
├── init-db.sql           # Database initialization
├── monitor.sh            # Monitoring script
├── backup.sh            # Backup script (otomatik oluşturulur)
└── README.md            # Bu dosya
```

## 🔗 Erişim URL'leri

Deployment sonrası erişebileceğiniz servisler:

- **Web App**: https://test.stocker.app
- **API**: https://api.test.stocker.app
- **Swagger**: https://api.test.stocker.app/swagger
- **SignalR Test**: https://test.stocker.app/signalr-test

## 📊 Monitoring

### Health Check
```bash
ssh root@YOUR_VPS_IP
/app/stocker/health-check.sh
```

### Continuous Monitoring
```bash
ssh root@YOUR_VPS_IP
/app/stocker/monitor.sh --continuous
```

### Logs
```bash
# API logs
docker logs stocker-api -f

# Web logs
docker logs stocker-web -f

# Database logs
docker logs stocker-db -f
```

## 🔧 Maintenance

### Manuel Backup
```bash
ssh root@YOUR_VPS_IP
/app/stocker/backup.sh
```

### Database Erişimi
```bash
docker exec -it stocker-db psql -U postgres -d stocker_master
```

### Redis Erişimi
```bash
docker exec -it stocker-redis redis-cli -a Redis2024!
```

### Update Deployment
```bash
ssh root@YOUR_VPS_IP
cd /app/stocker
git pull origin main
docker-compose -f deployment/docker-compose.coolify.yml down
docker-compose -f deployment/docker-compose.coolify.yml up -d --build
```

## 🔐 Güvenlik

### Firewall Kuralları
- SSH (22): Sadece sizin IP'niz
- HTTP (80): Public
- HTTPS (443): Public
- Coolify (8000): Sadece sizin IP'niz

### SSL Sertifikası

Coolify otomatik olarak Let's Encrypt SSL sertifikası sağlar. Domain ayarlarınızı yaptıktan sonra:
1. Coolify Dashboard → Application → Settings
2. **SSL/TLS** bölümünü açın
3. **Enable SSL** seçeneğini aktifleştirin

### Secrets Management

Hassas bilgileri Coolify Secrets'da saklayın:
- Database passwords
- JWT secrets
- API keys
- Webhook URLs

## 🚨 Troubleshooting

### Coolify Dashboard'a erişemiyorum
```bash
# Coolify status kontrol
docker ps | grep coolify

# Firewall kontrol
ufw status

# Port dinleniyor mu?
netstat -tulpn | grep 8000
```

### API'ye bağlanamıyorum
```bash
# Container çalışıyor mu?
docker ps | grep stocker-api

# Logs kontrol
docker logs stocker-api --tail 50

# Health check
curl http://localhost:5104/health
```

### Database bağlantı hatası
```bash
# PostgreSQL çalışıyor mu?
docker ps | grep stocker-db

# Connection test
docker exec stocker-db pg_isready -U postgres

# Logs
docker logs stocker-db --tail 50
```

### SignalR bağlantı hatası
```bash
# CORS ayarları kontrol
docker exec stocker-api cat appsettings.json | grep -A5 "CORS"

# SignalR hub erişimi
curl http://localhost:5104/hubs/validation
```

## 📈 Performance Tuning

### Docker Resources
```yaml
# docker-compose.coolify.yml içinde resource limits ekleyin
services:
  stocker-api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Database Optimization
```sql
-- Connection pool ayarları
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
SELECT pg_reload_conf();
```

### Redis Optimization
```bash
# Redis config
docker exec stocker-redis redis-cli CONFIG SET maxmemory 512mb
docker exec stocker-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## 🔄 CI/CD Pipeline

GitHub Actions ile otomatik deployment:

1. GitHub repository Settings → Secrets
2. Aşağıdaki secret'ları ekleyin:
   - `COOLIFY_WEBHOOK_URL`: Coolify webhook URL
   - `TEST_API_URL`: https://api.test.stocker.app
   - `TEST_WEB_URL`: https://test.stocker.app

3. Push to main/develop → Otomatik deployment

## 📝 Notlar

- Test ortamı production değildir, hassas veri saklamayın
- Günlük backup'lar otomatik alınır (03:00 AM)
- Monitoring her dakika çalışır
- Rate limiting aktiftir (60 req/min)
- Test admin hesabı: admin@stocker.test / Admin@2024!

## 🆘 Destek

Sorun yaşarsanız:
1. Önce bu dokümandaki Troubleshooting bölümünü kontrol edin
2. Logs'ları inceleyin
3. GitHub Issues açın
4. Discord/Slack kanalından yardım isteyin

---

**Güncelleme**: Bu dokümantasyon son olarak deployment script'leriyle birlikte güncellenmiştir.
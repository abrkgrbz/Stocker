# Coolify Deployment Guide for Stocker

## Ön Gereksinimler

- Coolify kurulu bir sunucu
- PostgreSQL veritabanı (Coolify üzerinden oluşturulabilir)
- Domain adı (opsiyonel)

## Deployment Adımları

### 1. GitHub Repository Bağlantısı

1. Coolify dashboard'a giriş yapın
2. "New Project" butonuna tıklayın
3. "New Service" seçin
4. "Docker Compose" seçeneğini seçin
5. GitHub repository URL'inizi girin

### 2. Environment Variables

Coolify üzerinde aşağıdaki environment variable'ları tanımlayın:

```env
# Database (Coolify PostgreSQL service kullanıyorsanız otomatik doldurulur)
DATABASE_URL=postgresql://user:password@postgres:5432/stocker_master

# JWT Configuration
JWT_SECRET_KEY=your-very-secure-secret-key-min-256-bits

# Email Configuration (Opsiyonel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Stocker

# Domain (Coolify otomatik doldurur)
FQDN=https://your-app.domain.com

# Ports
PORT=80
WEB_PORT=3000
```

### 3. Docker Compose Yapılandırması

Coolify'da Docker Compose dosyası olarak `docker-compose.coolify.yml` dosyasını seçin.

### 4. Build & Deploy Ayarları

- **Build Pack**: Docker Compose
- **Base Directory**: `/`
- **Docker Compose File**: `docker-compose.coolify.yml`
- **Auto Deploy**: Enabled (otomatik deployment için)

### 5. Network & Domain Ayarları

1. Domain ayarlarına gidin
2. Custom domain ekleyin (varsa)
3. SSL sertifikası için "Generate SSL" seçeneğini aktifleştirin

### 6. Database Migration

İlk deployment'tan sonra:

```bash
# Coolify terminal üzerinden veya SSH ile
docker exec -it <api-container-id> dotnet ef database update --context MasterDbContext
```

### 7. Healthcheck & Monitoring

Coolify otomatik olarak healthcheck'leri takip eder. Dashboard üzerinden:
- Container durumları
- Log'lar
- Resource kullanımı

izlenebilir.

## Deployment Komutları

### Manuel Deployment
```bash
# Coolify CLI üzerinden
coolify deploy
```

### Rollback
```bash
# Önceki versiona dönmek için
coolify rollback
```

## Troubleshooting

### Database Bağlantı Hatası
- DATABASE_URL formatını kontrol edin
- PostgreSQL service'in çalıştığından emin olun
- Network bağlantılarını kontrol edin

### Build Hataları
- Docker cache'i temizleyin
- Build log'larını kontrol edin
- Memory limitlerini artırın

### SSL Sertifika Sorunları
- Domain DNS ayarlarını kontrol edin
- Coolify SSL ayarlarını yeniden yapılandırın

## Monitoring & Logs

### Application Logs
```bash
# API logs
docker logs <api-container-id> -f

# Web logs
docker logs <web-container-id> -f
```

### Database Backup
```bash
# Backup oluştur
docker exec <postgres-container> pg_dump -U stocker stocker_master > backup.sql

# Backup'ı geri yükle
docker exec -i <postgres-container> psql -U stocker stocker_master < backup.sql
```

## Güvenlik Önerileri

1. **Environment Variables**: Hassas bilgileri Coolify secrets olarak saklayın
2. **Database**: Regular backup alın
3. **SSL**: Her zaman HTTPS kullanın
4. **Firewall**: Sadece gerekli portları açın
5. **Updates**: Düzenli güvenlik güncellemeleri yapın

## Performans Optimizasyonu

1. **Resource Limits**: Container'lar için CPU ve memory limitleri belirleyin
2. **Caching**: Redis ekleyerek performansı artırın
3. **CDN**: Static dosyalar için CDN kullanın
4. **Database Indexing**: Veritabanı index'lerini optimize edin

## Destek

Sorun yaşarsanız:
1. Coolify logs'larını kontrol edin
2. Container logs'larını inceleyin
3. GitHub Issues'da sorun bildirin
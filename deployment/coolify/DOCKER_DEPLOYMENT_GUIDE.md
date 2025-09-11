# 🚀 Docker Deployment Güvenlik Rehberi

## ✅ Tamamlanan Güvenlik Güncellemeleri

Tüm Docker compose yml dosyalarındaki hardcoded şifreler kaldırıldı ve environment variables ile değiştirildi!

### Güncellenen Dosyalar:
- ✅ `infrastructure/01-database.yml` - MSSQL şifreleri
- ✅ `infrastructure/02-redis.yml` - Redis şifreleri
- ✅ `infrastructure/03-seq.yml` - Seq admin şifreleri
- ✅ `infrastructure/04-minio.yml` - MinIO şifreleri
- ✅ `applications/01-api.yml` - API tüm şifreleri
- ✅ `applications/01-api-backup.yml` - Backup API şifreleri

## 📋 Deployment Adımları

### 1. Environment Variables Dosyası Oluştur

```bash
# .env.coolify dosyasını kopyala ve .env olarak kaydet
cp .env.coolify .env

# .env dosyasını düzenle
nano .env
```

### 2. Şifreleri Güncelle

⚠️ **ÖNEMLİ**: `.env` dosyasındaki TÜM şifreleri değiştir!

```env
# MUTLAKA DEĞİŞTİR - Örnek güçlü şifreler:
SA_PASSWORD=MyStr0ng$qlP@ssw0rd2024!
JWT_SECRET=your-very-long-random-string-at-least-256-bits-for-security-2024
MINIO_ROOT_PASSWORD=M1n10$ecureP@ss2024!
REDIS_PASSWORD=R3d1s$tr0ngP@ss2024!
SEQ_ADMIN_PASSWORD=S3q@dm1nP@ss2024!
SMTP_PASSWORD=your-actual-email-password
```

### 3. Docker Network Oluştur

```bash
# Coolify network'ü oluştur (bir kere yapılacak)
docker network create coolify
```

### 4. Servisleri Başlat

```bash
# 1. Önce database'i başlat
cd deployment/coolify/infrastructure
docker-compose -f 01-database.yml --env-file ../.env up -d

# Database'in hazır olmasını bekle (60 saniye)
sleep 60

# 2. Redis'i başlat
docker-compose -f 02-redis.yml --env-file ../.env up -d

# 3. Seq'i başlat
docker-compose -f 03-seq.yml --env-file ../.env up -d

# 4. MinIO'yu başlat
docker-compose -f 04-minio.yml --env-file ../.env up -d

# 5. API'yi başlat
cd ../applications
docker-compose -f 01-api.yml --env-file ../.env up -d

# 6. Web uygulamalarını başlat
docker-compose -f 02-web.yml --env-file ../.env up -d
docker-compose -f 04-admin.yml --env-file ../.env up -d
```

## 🔐 Güvenlik Kontrol Listesi

### Deployment Öncesi
- [ ] `.env` dosyası oluşturuldu
- [ ] TÜM şifreler değiştirildi (default değerler kullanılmadı)
- [ ] `.env` dosyası `.gitignore`'a eklendi
- [ ] SSL sertifikaları hazır (production için)

### Deployment Sonrası
- [ ] Tüm servisler çalışıyor (`docker ps` ile kontrol)
- [ ] Database bağlantısı başarılı
- [ ] Seq logging çalışıyor (https://seq.stoocker.app)
- [ ] MinIO erişilebilir (https://console.minio.stoocker.app)
- [ ] API health check başarılı (https://api.stoocker.app/health)

## 🛡️ Production Güvenlik Önerileri

### 1. Docker Secrets Kullanımı (Önerilen)
```yaml
# docker-compose.yml içinde
services:
  api:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - SA_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

### 2. Azure Key Vault Entegrasyonu
```bash
# Azure Key Vault'tan secrets çek
az keyvault secret show --vault-name stocker-vault --name SA-PASSWORD
```

### 3. Güvenlik Taraması
```bash
# Docker image güvenlik taraması
docker scan stocker-api:latest

# Trivy ile güvenlik taraması
trivy image stocker-api:latest
```

## 📊 Monitoring ve Logging

### Seq Dashboard
- URL: https://seq.stoocker.app
- Username: admin
- Password: `.env` dosyasındaki SEQ_ADMIN_PASSWORD

### MinIO Console
- URL: https://console.minio.stoocker.app
- Username: `.env` dosyasındaki MINIO_ROOT_USER
- Password: `.env` dosyasındaki MINIO_ROOT_PASSWORD

## 🚨 Troubleshooting

### Database Bağlantı Hatası
```bash
# Database container'ı kontrol et
docker logs mssql

# Database'e manuel bağlan
docker exec -it mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "$SA_PASSWORD" \
  -Q "SELECT name FROM sys.databases"
```

### Redis Bağlantı Hatası
```bash
# Redis'i test et
docker exec -it redis redis-cli --pass "$REDIS_PASSWORD" ping
```

### Environment Variables Görünmüyor
```bash
# Container içindeki env variables'ı kontrol et
docker exec stocker-api printenv | grep -E "SA_PASSWORD|JWT_SECRET"
```

## 📝 Notlar

1. **GIT'e Eklemeyin**: `.env` dosyasını ASLA Git'e eklemeyin!
2. **Backup**: `.env` dosyasının yedeğini güvenli bir yerde saklayın
3. **Rotation**: Şifreleri düzenli olarak değiştirin (90 günde bir)
4. **Monitoring**: Seq üzerinden unauthorized access attempt'leri takip edin

## 🔄 Güncelleme Prosedürü

```bash
# 1. Yeni image'ı build et
docker-compose -f 01-api.yml build

# 2. Servisi güncelle (zero-downtime)
docker-compose -f 01-api.yml up -d --no-deps --build api

# 3. Health check
curl https://api.stoocker.app/health
```

## ✅ Tamamlandı!

Artık tüm Docker compose dosyalarınız güvenli environment variables kullanıyor. Production deployment için yukarıdaki adımları takip edin ve güvenlik önerilerini uygulayın.

---
**SON GÜNCELLEME**: Tüm hardcoded şifreler kaldırıldı ve environment variables ile değiştirildi.
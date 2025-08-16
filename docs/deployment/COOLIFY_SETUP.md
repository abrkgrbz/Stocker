# Coolify Deployment Guide - Stocker

## 🚀 Hızlı Kurulum

### 1. Coolify'da Yeni Proje Oluşturma

1. Coolify Dashboard'a giriş yapın
2. **"New Project"** → **"New Service"** tıklayın
3. **"Docker Compose"** seçeneğini seçin
4. GitHub repository URL'nizi girin

### 2. Docker Compose Dosyası Seçimi

- **Docker Compose File**: `docker-compose.coolify.yml`
- **Base Directory**: `/`

### 3. Environment Variables (Coolify Dashboard'da)

```env
# ZORUNLU - Güçlü bir şifre belirleyin
SA_PASSWORD=YourStrongPassword123!

# ZORUNLU - En az 256 bit uzunluğunda
JWT_SECRET_KEY=your-very-long-and-secure-secret-key-minimum-256-bits

# Opsiyonel
MSSQL_PID=Developer
ASPNETCORE_ENVIRONMENT=Production
API_PORT=5000
WEB_PORT=80
```

### 4. Domain Ayarları

Coolify otomatik olarak FQDN değişkenini doldurur:
- Web servisine domain bağlayın
- SSL sertifikası için "Force HTTPS" aktifleştirin

## 📦 Servisler

### MSSQL Database
- **Port**: 1433
- **User**: sa
- **Password**: Environment'ta tanımlı
- **Database**: StockerMaster (otomatik oluşturulur)

### API Service
- **Port**: 5000 (veya Coolify'ın atadığı)
- **Healthcheck**: `/health` endpoint
- **Logs**: `/app/logs` klasöründe

### Web Frontend
- **Port**: 80 (veya Coolify'ın atadığı)
- **Type**: React SPA (Nginx)
- **API Proxy**: `/api` ve `/hubs` yönlendirmeli

## 🔧 İlk Kurulum Sonrası

### Database Migration
```bash
# Coolify terminal veya SSH üzerinden
docker exec -it stocker-api sh -c "dotnet ef database update --context MasterDbContext"
```

### Admin Kullanıcı Oluşturma
API'ye POST request gönderin:
```bash
curl -X POST https://your-domain.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stocker.com",
    "password": "Admin123!"
  }'
```

## 🔍 Monitoring & Debugging

### Container Logları
```bash
# API logs
docker logs stocker-api -f

# MSSQL logs
docker logs stocker-mssql -f

# Web logs
docker logs stocker-web -f
```

### Database Bağlantı Testi
```bash
docker exec stocker-mssql /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourPassword" \
  -Q "SELECT name FROM sys.databases"
```

## 🚨 Troubleshooting

### MSSQL Bağlantı Hatası
- SA_PASSWORD en az 8 karakter, büyük/küçük harf, sayı ve özel karakter içermeli
- TrustServerCertificate=true connection string'de olmalı
- Container'lar aynı network'te olmalı

### API Başlamıyor
- Database bağlantısını kontrol edin
- JWT_SECRET_KEY tanımlı mı kontrol edin
- Migration'ları çalıştırdığınızdan emin olun

### Web API'ye Bağlanamıyor
- FQDN değişkeni doğru mu kontrol edin
- API health check'i geçiyor mu kontrol edin
- CORS ayarlarını kontrol edin

## 🔐 Güvenlik Önerileri

1. **SA_PASSWORD**: Güçlü ve unique olmalı
2. **JWT_SECRET_KEY**: En az 256 bit, rastgele üretilmeli
3. **HTTPS**: Her zaman Force HTTPS kullanın
4. **Firewall**: Sadece gerekli portları açın (80, 443)
5. **Backup**: Düzenli database backup alın

## 📊 Performance Tuning

### MSSQL Optimizasyonu
```yaml
environment:
  MSSQL_MEMORY_LIMIT_MB: 2048
  MSSQL_AGENT_ENABLED: "true"
```

### API Resource Limits
Coolify'da container resource limitleri ayarlayın:
- CPU: 1-2 cores
- Memory: 512MB-1GB

## 🔄 Update & Rollback

### Güncelleme
1. GitHub'a yeni kod push'layın
2. Coolify otomatik deploy edecek (auto-deploy aktifse)
3. Veya manuel: "Redeploy" butonuna tıklayın

### Rollback
1. Coolify Dashboard → Deployments
2. Önceki başarılı deployment'ı seçin
3. "Rollback" tıklayın

## 📝 Notlar

- Development için MSSQL_PID=Developer kullanın
- Production'da Express, Standard veya Enterprise lisans gerekli
- Email gönderimi için SMTP ayarları opsiyonel
- SignalR için WebSocket desteği gerekli

## 🆘 Destek

Sorun yaşarsanız:
1. Container loglarını kontrol edin
2. Coolify deployment loglarını inceleyin
3. Environment variables'ları doğrulayın
4. Network bağlantılarını test edin
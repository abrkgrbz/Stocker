# Stocker Infrastructure Components

Bu dokümantasyon, Stocker uygulaması için gerekli tüm infrastructure component'lerini içerir.

## 📋 Component Listesi

### Temel Servisler (Zaten Kurulu)
- ✅ **MS SQL Server** - Ana veritabanı
- ✅ **Redis** - Cache ve session yönetimi
- ✅ **Seq** - Log management
- ✅ **API** - .NET 9 Web API
- ✅ **Web** - React/Vite Frontend

### Ek Infrastructure Components

#### 1. 📦 MinIO (Object Storage)
```bash
docker-compose -f docker-compose.minio.yml up -d
```
- **Port:** 9000 (API), 9001 (Console)
- **URL:** http://localhost:9001
- **Default Login:** admin / StockerMinio2024!
- **Buckets:** stocker-files, stocker-backups, stocker-temp

#### 2. 📧 Mailhog (Email Testing)
```bash
docker-compose -f docker-compose.mailhog.yml up -d
```
- **SMTP Port:** 1025
- **Web UI:** http://localhost:8025
- Development ve staging ortamları için

#### 3. 🔍 ElasticSearch + Kibana
```bash
docker-compose -f docker-compose.elasticsearch.yml up -d
```
- **ElasticSearch:** http://localhost:9200
- **Kibana:** http://localhost:5601
- Full-text search ve log analizi için

#### 4. 📊 Monitoring Stack (Prometheus + Grafana)
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3001
- **Login:** admin / StockerGrafana2024!
- **AlertManager:** http://localhost:9093

#### 5. 🐰 RabbitMQ (Message Queue)
```bash
docker-compose -f docker-compose.rabbitmq.yml up -d
```
- **AMQP Port:** 5672
- **Management UI:** http://localhost:15672
- **Login:** admin / StockerRabbit2024!
- **Queues:** email.notifications, tenant.provisioning, inventory.updates

#### 6. 💾 Backup Solution (Restic)
```bash
docker-compose -f docker-compose.backup.yml up -d
```
- **REST Server:** http://localhost:8000
- **UI:** http://localhost:8001
- Otomatik günlük backup (02:00)
- 7 günlük, 4 haftalık, 12 aylık retention

## 🚀 Kurulum Sırası

1. **Network oluştur:**
```bash
docker network create stocker-network
```

2. **Environment dosyasını kopyala:**
```bash
cp .env.infrastructure .env
# .env dosyasını düzenleyip API key'leri ekleyin
```

3. **Servisleri başlat (önerilen sıra):**
```bash
# 1. Storage
docker-compose -f docker-compose.minio.yml up -d

# 2. Message Queue
docker-compose -f docker-compose.rabbitmq.yml up -d

# 3. Search Engine
docker-compose -f docker-compose.elasticsearch.yml up -d

# 4. Monitoring
docker-compose -f docker-compose.monitoring.yml up -d

# 5. Email Testing (development için)
docker-compose -f docker-compose.mailhog.yml up -d

# 6. Backup (son olarak)
docker-compose -f docker-compose.backup.yml up -d
```

## 🔧 Coolify Deployment

Coolify'da her bir docker-compose dosyası ayrı bir service olarak deploy edilebilir:

1. **Her service için ayrı ayrı:**
   - New Service → Docker Compose
   - İlgili docker-compose.yml dosyasını yapıştır
   - Environment variables ekle
   - Deploy

2. **Network bağlantısı:**
   - Tüm servisler aynı network'e bağlanmalı
   - Coolify'da internal network kullan

3. **Domain routing:**
   ```
   minio.stoocker.app → MinIO Console
   rabbitmq.stoocker.app → RabbitMQ Management
   kibana.stoocker.app → Kibana
   grafana.stoocker.app → Grafana
   seq.stoocker.app → Seq UI
   ```

## 📝 Environment Variables

`.env.infrastructure` dosyasındaki değişkenleri Coolify'da tanımla:

### Kritik Production Değişkenleri:
- `SENDGRID_API_KEY` - Email gönderimi için
- `SA_PASSWORD` - SQL Server şifresi
- `JWT_SECRET` - Token güvenliği için
- Tüm admin şifreleri güçlü olmalı

## 🔍 Health Checks

Tüm servisler health check'lere sahip:

```bash
# Tüm servislerin durumunu kontrol et
docker-compose ps

# Logs kontrol
docker-compose logs -f [service-name]
```

## 📊 Monitoring Dashboard'ları

Grafana'da otomatik olarak yüklenecek dashboard'lar:
- System Overview
- Container Metrics
- Application Performance
- Database Performance
- Message Queue Stats

## 🔐 Güvenlik Notları

1. Production'da tüm default şifreleri değiştirin
2. SSL/TLS sertifikaları ekleyin (Coolify otomatik yapar)
3. Firewall kurallarını yapılandırın
4. Backup'ları düzenli test edin
5. Log retention policy'leri belirleyin

## 🆘 Troubleshooting

### Service başlamıyor:
```bash
docker-compose -f docker-compose.[service].yml logs
```

### Port çakışması:
- docker-compose dosyasında port'ları değiştirin

### Memory/CPU sorunu:
- Docker resource limit'lerini artırın

## 📚 Dokümantasyon Linkleri

- [MinIO Docs](https://docs.min.io/)
- [RabbitMQ Docs](https://www.rabbitmq.com/documentation.html)
- [ElasticSearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Grafana Docs](https://grafana.com/docs/)
- [Prometheus Docs](https://prometheus.io/docs/)
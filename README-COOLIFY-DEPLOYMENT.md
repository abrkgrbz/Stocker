# Coolify Deployment Guide

## Script Çalıştırma Yöntemleri

### Yöntem 1: SSH ile Manuel Çalıştırma
```bash
# Sunucuya bağlan
ssh root@your-server-ip

# Coolify service dizinine git (Coolify dashboard'dan service ID'yi alın)
cd /data/coolify/services/[service-id]/

# Script'leri çalıştır
bash scripts/setup-coolify-services.sh
bash scripts/init-ssl-coolify.sh
```

### Yöntem 2: Coolify Dashboard'dan
1. Coolify'da service'e gidin
2. "Execute Command" sekmesini açın
3. Şu komutları çalıştırın:
```bash
cd /app && bash scripts/setup-coolify-services.sh
```

### Yöntem 3: Docker Compose ile Otomatik
1. Coolify'da yeni bir service oluşturun
2. `docker-compose.init-coolify.yml` dosyasını seçin
3. Deploy edin (script otomatik çalışacak)

### Yöntem 4: Build Hook ile Otomatik
1. `coolify-build-hook.sh` dosyası root dizinde
2. Coolify'da service settings'e gidin
3. "Build Command" alanına ekleyin:
```bash
bash coolify-build-hook.sh
```

### Yöntem 5: GitHub Actions ile CI/CD
1. GitHub repository settings'e gidin
2. Secrets ekleyin:
   - `SSH_PRIVATE_KEY`: Sunucu SSH private key
   - `SSH_HOST`: Sunucu IP adresi
   - `SSH_USER`: SSH kullanıcı (genelde root)
   - `COOLIFY_SERVICE_PATH`: Service dizin yolu
   - `DOCKER_REGISTRY`: Docker registry URL (opsiyonel)
   - `DOCKER_USERNAME`: Docker username (opsiyonel)
   - `DOCKER_PASSWORD`: Docker password (opsiyonel)

3. Actions sekmesinden workflow'u manuel tetikleyin veya kod push'layın

## Environment Variables

Coolify'da şu environment variable'ları eklemeyi unutmayın:

```env
# Database
POSTGRES_CONNECTION=your_postgres_connection_string
REDIS_CONNECTION=your_redis_connection_string

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@stoocker.app

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# S3/MinIO
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_BUCKET_NAME=stocker

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_secure_password
```

## Service Deployment Sırası

1. **Network oluştur** (otomatik veya manuel):
```bash
docker network create stocker-network
```

2. **Database servisleri** (eğer Coolify'da yoksa):
   - PostgreSQL
   - Redis

3. **Storage servisleri**:
   - MinIO (`docker-compose.minio.yml`)

4. **Message Queue**:
   - RabbitMQ (`docker-compose.rabbitmq.yml`)

5. **Monitoring**:
   - Monitoring Stack (`docker-compose.monitoring-coolify.yml`)
   - Veya sadece Grafana (`docker-compose.grafana.yml`)

6. **Logging**:
   - ElasticSearch & Kibana (`docker-compose.elasticsearch.yml`)
   - Veya Seq (`docker-compose.seq.yml`)

7. **API ve Web**:
   - API service
   - Web service

8. **Reverse Proxy**:
   - Nginx (`docker-compose.nginx-coolify.yml`)

## DNS Ayarları

Domain DNS ayarlarında şu A kayıtlarını ekleyin:

```
stoocker.app              -> Sunucu IP
www.stoocker.app          -> Sunucu IP
api.stoocker.app          -> Sunucu IP
minio.stoocker.app        -> Sunucu IP
s3.stoocker.app           -> Sunucu IP
grafana.stoocker.app      -> Sunucu IP
prometheus.stoocker.app   -> Sunucu IP
alerts.stoocker.app       -> Sunucu IP
rabbitmq.stoocker.app     -> Sunucu IP
kibana.stoocker.app       -> Sunucu IP
seq.stoocker.app          -> Sunucu IP
mail.stoocker.app         -> Sunucu IP
```

## Troubleshooting

### Script çalışmıyor
```bash
# Permission hatası alıyorsanız
chmod +x scripts/*.sh
```

### Docker network bulunamıyor
```bash
docker network create stocker-network
```

### Service'ler birbirini bulamıyor
- Tüm service'lerin aynı network'te olduğundan emin olun
- Service isimlerinin docker-compose dosyalarında doğru olduğunu kontrol edin

### SSL sertifikası alınamıyor
- DNS kayıtlarının doğru olduğundan emin olun
- Coolify'ın Traefik ayarlarını kontrol edin
- Port 80 ve 443'ün açık olduğundan emin olun
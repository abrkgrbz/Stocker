# Nginx Reverse Proxy ve SSL Yapılandırması

Bu dokümantasyon, Stocker uygulaması için Nginx reverse proxy ve SSL sertifika kurulumunu açıklar.

## 📋 Subdomain Listesi

Aşağıdaki subdomain'ler yapılandırılmıştır:

| Subdomain | Servis | Port | Açıklama |
|-----------|--------|------|----------|
| stoocker.app | Web Frontend | 80 | Ana uygulama |
| api.stoocker.app | API Backend | 5000 | REST API |
| minio.stoocker.app | MinIO Console | 9001 | Object storage yönetimi |
| s3.stoocker.app | MinIO S3 API | 9000 | S3-compatible API |
| grafana.stoocker.app | Grafana | 3000 | Monitoring dashboard |
| prometheus.stoocker.app | Prometheus | 9090 | Metrics (Auth korumalı) |
| alerts.stoocker.app | AlertManager | 9093 | Alert yönetimi (Auth korumalı) |
| rabbitmq.stoocker.app | RabbitMQ | 15672 | Message queue yönetimi |
| kibana.stoocker.app | Kibana | 5601 | Log analizi |
| seq.stoocker.app | Seq | 80 | Structured logging |
| mail.stoocker.app | Mailhog | 8025 | Email testing (Auth korumalı) |

## 🚀 Kurulum Adımları

### 1. DNS Kayıtlarını Yapılandırın

Domain sağlayıcınızda aşağıdaki A kayıtlarını oluşturun:

```
stoocker.app          → Sunucu IP
*.stoocker.app        → Sunucu IP (Wildcard)
```

Veya her subdomain için ayrı ayrı:

```
stoocker.app          → Sunucu IP
www.stoocker.app      → Sunucu IP
api.stoocker.app      → Sunucu IP
minio.stoocker.app    → Sunucu IP
# ... diğer subdomain'ler
```

### 2. Network Oluşturun

```bash
docker network create stocker-network
```

### 3. Tüm Servisleri Başlatın

```bash
# Infrastructure services
docker-compose -f docker-compose.infrastructure.yml up -d
docker-compose -f docker-compose.minio.yml up -d
docker-compose -f docker-compose.rabbitmq.yml up -d
docker-compose -f docker-compose.elasticsearch.yml up -d
docker-compose -f docker-compose.monitoring.yml up -d

# Application services
docker-compose -f docker-compose.api.yml up -d
```

### 4. SSL Sertifikalarını Alın

```bash
# Script'leri çalıştırılabilir yapın
chmod +x scripts/init-ssl.sh
chmod +x scripts/generate-htpasswd.sh

# SSL sertifikalarını başlatın
sudo ./scripts/init-ssl.sh
```

Script otomatik olarak:
- Let's Encrypt'ten SSL sertifikası alır
- Tüm subdomain'leri tek sertifikada toplar
- Basic authentication için htpasswd dosyası oluşturur
- Nginx'i SSL ile yeniden başlatır

### 5. Nginx'i Başlatın

```bash
docker-compose -f docker-compose.nginx.yml up -d
```

## 🔐 Basic Authentication

Bazı servisler (Prometheus, AlertManager, Mailhog) basic auth ile korunur.

### Yeni Kullanıcı Ekleme

```bash
./scripts/generate-htpasswd.sh [username] [password]
```

Password belirtmezseniz otomatik oluşturulur.

### Mevcut Kullanıcıyı Güncelleme

```bash
docker run --rm -i httpd:alpine htpasswd -b ./nginx/.htpasswd username newpassword
```

## 📜 SSL Sertifika Yönetimi

### Otomatik Yenileme

Certbot container'ı her 12 saatte bir sertifikaları kontrol eder ve gerekirse yeniler.

### Manuel Yenileme

```bash
./scripts/renew-ssl.sh
```

### Sertifika Durumunu Kontrol

```bash
docker-compose -f docker-compose.nginx.yml exec certbot certbot certificates
```

## 🔧 Nginx Yapılandırması

### Config Dosyaları

```
nginx/
├── nginx.conf                 # Ana nginx config
├── conf.d/
│   ├── 00-default.conf       # HTTP → HTTPS redirect
│   ├── 01-main-app.conf      # Ana uygulama
│   ├── 02-api.conf           # API backend
│   ├── 03-minio.conf         # MinIO storage
│   ├── 04-monitoring.conf    # Monitoring araçları
│   └── 05-services.conf      # Diğer servisler
├── snippets/                  # Paylaşılan config parçaları
└── logs/                      # Nginx logları
```

### Yeni Subdomain Ekleme

1. `nginx/conf.d/` dizinine yeni config dosyası ekleyin
2. SSL sertifikasını güncelleyin:
```bash
./scripts/init-ssl.sh
```
3. Nginx'i yeniden yükleyin:
```bash
docker-compose -f docker-compose.nginx.yml exec nginx nginx -s reload
```

## 🚨 Troubleshooting

### SSL Sertifikası Alınamıyor

1. DNS kayıtlarının doğru olduğundan emin olun:
```bash
nslookup stoocker.app
nslookup api.stoocker.app
```

2. 80 ve 443 portlarının açık olduğundan emin olun:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. Let's Encrypt rate limit'e takılmış olabilirsiniz. Staging server kullanın:
```bash
# scripts/init-ssl.sh dosyasında STAGING=1 yapın
```

### 502 Bad Gateway Hatası

Hedef servisin çalıştığından emin olun:
```bash
docker ps
docker-compose -f docker-compose.[service].yml logs
```

### Nginx Config Hatası

Config'i test edin:
```bash
docker-compose -f docker-compose.nginx.yml exec nginx nginx -t
```

### Log Kontrolü

```bash
# Nginx error logs
docker-compose -f docker-compose.nginx.yml logs nginx

# Access logs
tail -f nginx/logs/access.log

# Specific service logs
tail -f nginx/logs/api.stoocker.app.error.log
```

## 🔒 Güvenlik Önerileri

1. **Firewall Kuralları**: Sadece gerekli portları açın
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

2. **Rate Limiting**: nginx.conf'ta rate limiting aktif

3. **Security Headers**: Tüm config'lerde güvenlik header'ları tanımlı

4. **SSL Configuration**: Sadece TLS 1.2 ve 1.3 desteklenir

5. **Basic Auth**: Kritik servisler şifre korumalı

## 📊 Monitoring

### Nginx Metrikleri

Prometheus'ta nginx metrikleri için nginx-exporter ekleyin:

```yaml
# docker-compose.monitoring.yml'e ekleyin
nginx-exporter:
  image: nginx/nginx-prometheus-exporter:latest
  container_name: stocker-nginx-exporter
  command:
    - -nginx.scrape-uri=http://nginx/nginx_status
  ports:
    - "9113:9113"
  networks:
    - stocker-network
```

### Access Log Analizi

GoAccess ile gerçek zamanlı log analizi:

```bash
docker run --rm -v $(pwd)/nginx/logs:/logs allinurl/goaccess \
  goaccess /logs/access.log -o /logs/report.html --log-format=COMBINED
```

## 📝 Notlar

- Production'da wildcard SSL sertifikası kullanmanızı öneririz
- CloudFlare kullanıyorsanız, SSL mode'u "Full (strict)" yapın
- Backup'larınıza SSL sertifikalarını da dahil edin
- Basic auth password'larını güvenli bir yerde saklayın
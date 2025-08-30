# Coolify Deployment Guide

Coolify, GitHub'dan otomatik deployment yapabilen ve SSL sertifikalarını otomatik yöneten bir self-hosted PaaS çözümüdür.

## 🚀 Coolify'da Deployment Stratejisi

### Coolify'ın Sağladığı Özellikler:
- ✅ **Otomatik SSL**: Let's Encrypt ile otomatik SSL sertifikası
- ✅ **Subdomain Yönetimi**: Her servis için otomatik subdomain
- ✅ **GitHub Entegrasyonu**: Push ile otomatik deployment
- ✅ **Environment Variables**: Web UI üzerinden yönetim
- ✅ **Built-in Traefik**: Reverse proxy otomatik yapılandırılır

## 📋 Deployment Adımları

### 1. Ana Servisler (docker-compose.infrastructure.yml)

Coolify'da yeni bir proje oluşturun ve aşağıdaki servisleri ekleyin:

#### Database + Redis + Seq Stack
1. **New Resource → Docker Compose**
2. **Source:** GitHub Repository
3. **Compose File:** `docker-compose.infrastructure.yml`
4. **Environment Variables:**
```env
SA_PASSWORD=YourStrongPassword123!
SEQ_FIRSTRUN_ADMINPASSWORD=StockerSeq2024!
```

### 2. Her Servis İçin Ayrı Resource

Her docker-compose dosyası için ayrı resource oluşturun:

#### MinIO Object Storage
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.minio.yml
Domain: minio.stoocker.app (Console)
Additional Domain: s3.stoocker.app (S3 API)
Environment:
  MINIO_ROOT_USER=admin
  MINIO_ROOT_PASSWORD=<güvenli-şifre>
```

#### RabbitMQ
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.rabbitmq.yml
Domain: rabbitmq.stoocker.app
Environment:
  RABBITMQ_USER=admin
  RABBITMQ_PASSWORD=<güvenli-şifre>
```

#### ElasticSearch + Kibana
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.elasticsearch.yml
Domain: kibana.stoocker.app
Environment:
  ELASTIC_PASSWORD=<güvenli-şifre>
```

#### Monitoring Stack
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.monitoring.yml
Domain: grafana.stoocker.app
Additional Domains:
  - prometheus.stoocker.app
  - alerts.stoocker.app
Environment:
  GRAFANA_ADMIN_USER=admin
  GRAFANA_ADMIN_PASSWORD=<güvenli-şifre>
  SENDGRID_API_KEY=<your-api-key>
```

#### Backup Solution
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.backup.yml
Environment:
  RESTIC_PASSWORD=<güvenli-şifre>
  BACKUP_SCHEDULE=0 2 * * *
```

### 3. Ana Uygulamalar

#### API Service
```yaml
Service Type: Docker Compose
Source: GitHub → docker-compose.api.yml
Domain: api.stoocker.app
Environment: (Tüm API environment variables)
```

#### Web Frontend
```yaml
Service Type: Dockerfile
Source: GitHub → stocker-web/Dockerfile
Domain: stoocker.app
Environment:
  VITE_API_URL=https://api.stoocker.app
  VITE_APP_NAME=Stoocker
```

## 🔐 SSL Yapılandırması (Coolify Otomatik)

Coolify, Traefik kullanarak otomatik SSL sağlar:

1. **Domain Settings**'e gidin
2. **Enable HTTPS** seçeneğini aktif edin
3. **Force HTTPS** seçeneğini aktif edin
4. Email adresinizi girin (Let's Encrypt için)

Coolify otomatik olarak:
- Let's Encrypt'ten SSL sertifikası alır
- 90 günde bir otomatik yeniler
- HTTP'yi HTTPS'e yönlendirir

## 🌐 Network Yapılandırması

### Coolify'da Internal Network

1. Tüm servisler için aynı **Project** altında olduğundan emin olun
2. **Internal Network Name:** `stocker-network`
3. Her serviste network'ü belirtin:

```yaml
networks:
  - stocker-network
```

### External Access

Sadece bu servislere external access verin:
- stoocker.app (Web)
- api.stoocker.app (API)
- Yönetim panelleri (isteğe bağlı)

## 📝 Environment Variables Yönetimi

### Coolify UI'da Environment Variables

1. Service → Settings → Environment Variables
2. **Bulk Edit** modunu kullanın
3. `.env.infrastructure` dosyasından kopyalayın

### Secrets için Coolify Secrets

Hassas bilgiler için Coolify Secrets kullanın:

1. Project → Secrets
2. Add Secret:
```
Name: SENDGRID_API_KEY
Value: <your-actual-key>
```
3. Service'de kullanım:
```
SENDGRID_API_KEY=${SECRET_SENDGRID_API_KEY}
```

## 🔄 Deployment Workflow

### Otomatik Deployment (Recommended)

1. **GitHub Webhook** otomatik kurulur
2. `master` branch'e push → Otomatik deployment
3. Build logs'ları Coolify UI'da görünür

### Manuel Deployment

1. Service → Deployments
2. **Redeploy** butonuna tıklayın
3. Veya **Force Rebuild** için yeniden build

## 🎯 Subdomain Routing (Nginx Yerine Traefik)

Coolify'ın built-in Traefik'i otomatik routing yapar:

| Subdomain | Service Name | Coolify Domain Setting |
|-----------|--------------|------------------------|
| stoocker.app | stocker-web | Primary domain |
| api.stoocker.app | stocker-api | Primary domain |
| minio.stoocker.app | stocker-minio | Primary domain |
| s3.stoocker.app | stocker-minio | Additional domain |
| grafana.stoocker.app | stocker-grafana | Primary domain |
| prometheus.stoocker.app | stocker-prometheus | Additional domain |
| rabbitmq.stoocker.app | stocker-rabbitmq | Primary domain |
| kibana.stoocker.app | stocker-kibana | Primary domain |
| seq.stoocker.app | stocker-seq | Primary domain |

## 🔒 Basic Authentication (Traefik Middleware)

Coolify'da basic auth için:

1. **Service → Advanced → Custom Labels**
2. Aşağıdaki label'ları ekleyin:

```yaml
traefik.http.middlewares.auth.basicauth.users=admin:$2y$10$... # htpasswd hash
traefik.http.routers.prometheus.middlewares=auth
```

Veya Coolify UI'da:
1. Service → Security
2. Enable Basic Authentication
3. Username ve Password girin

## 🚨 Monitoring ve Logs

### Coolify UI'da Monitoring

- **Deployments:** Build ve deployment history
- **Logs:** Real-time container logs
- **Metrics:** CPU, Memory, Network usage
- **Health Checks:** Service durumu

### External Monitoring

Grafana dashboard'ınızı Coolify metriklerine bağlayın:
- Prometheus endpoint: `http://coolify-prometheus:9090`
- Coolify metrics exporter ekleyin

## 📊 Backup Stratejisi

### Coolify Backup

1. **Settings → Backup**
2. S3 veya MinIO destination ekleyin
3. Schedule belirleyin
4. Database + Volumes backup

### Uygulama Backup

Restic backup service'i Coolify volume'lerini yedekler:
```yaml
volumes:
  - coolify_db:/backup/sources/database:ro
  - coolify_data:/backup/sources/data:ro
```

## 🆘 Troubleshooting

### SSL Sertifikası Alınamıyor

1. DNS kayıtlarını kontrol edin
2. Coolify → Settings → Traefik logs
3. Rate limit'e takıldıysanız 1 saat bekleyin

### Service Başlamıyor

1. Service → Logs
2. Environment variables kontrol
3. Health check endpoint doğru mu?

### Network İletişimi Yok

1. Aynı project'te mi?
2. Internal network name doğru mu?
3. Service discovery: `http://service-name:port`

## 📋 Deployment Checklist

- [ ] DNS A kayıtları yapıldı
- [ ] Coolify'da project oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Environment variables eklendi
- [ ] Domain'ler yapılandırıldı
- [ ] SSL aktif edildi
- [ ] Health check'ler çalışıyor
- [ ] Backup yapılandırıldı
- [ ] Monitoring aktif

## 🎉 Avantajlar

1. **Script çalıştırmaya gerek yok** - Coolify otomatik yönetir
2. **Otomatik SSL** - Let's Encrypt entegrasyonu
3. **GitHub Actions gerek yok** - Webhook ile otomatik
4. **UI üzerinden yönetim** - Terminal gerekmez
5. **Built-in monitoring** - Ek tool gerekmez

## 📚 Kaynaklar

- [Coolify Documentation](https://coolify.io/docs)
- [Traefik Labels](https://doc.traefik.io/traefik/routing/providers/docker/)
- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
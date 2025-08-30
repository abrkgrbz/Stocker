# Coolify Monitoring Stack Deployment

## 🚨 Önemli Not
Coolify'da mount sorunları nedeniyle monitoring servislerini **ayrı ayrı** deploy etmeniz gerekiyor.

## 📋 Deployment Sırası

### 1. Prometheus
```yaml
Service Type: Docker Compose
Compose File: docker-compose.prometheus.yml
Port: 9090
```

**Dikkat:** 
- Config dosyası Dockerfile ile image'a gömülüdür
- Volume mount hatası alırsanız, sadece data volume'ü mount edildiğinden emin olun

### 2. Grafana
```yaml
Service Type: Docker Compose
Compose File: docker-compose.grafana.yml
Port: 3001
Environment Variables:
  GRAFANA_ADMIN_USER=admin
  GRAFANA_ADMIN_PASSWORD=<güvenli-şifre>
```

### 3. AlertManager
```yaml
Service Type: Docker Compose
Compose File: docker-compose.alertmanager.yml
Port: 9093
```

**Not:** İlk olarak `Dockerfile.simple` kullanılıyor. Çalıştıktan sonra ana `Dockerfile`'a geçebilirsiniz.

## 🔧 Troubleshooting

### Mount Error Alıyorsanız

**Hata:** 
```
cannot create subdirectories... not a directory
```

**Çözüm:**
1. Config dosyalarının mount edilmediğinden emin olun
2. Sadece data volume'leri mount edin
3. Dockerfile'ların config'leri image'a gömdüğünden emin olun

### Restart Loop

**Kontrol Listesi:**
1. Container logs'larını kontrol edin:
   ```bash
   docker logs stocker-prometheus
   docker logs stocker-grafana
   docker logs stocker-alertmanager
   ```

2. Config dosyalarının doğru kopyalandığını kontrol edin:
   ```bash
   docker exec stocker-prometheus cat /etc/prometheus/prometheus.yml
   ```

3. Health check endpoint'lerini test edin:
   ```bash
   curl http://localhost:9090/-/healthy
   curl http://localhost:3001/api/health
   curl http://localhost:9093/-/healthy
   ```

## 🎯 Alternatif: Tek Compose Dosyası

Eğer ayrı deployment yapmak istemezseniz:
- `docker-compose.monitoring-coolify.yml` kullanın
- **AMA** Coolify'da doğru dosyayı seçtiğinizden emin olun
- `docker-compose.monitoring.yml` değil, `-coolify` uzantılı olanı kullanın

## 📊 Monitoring Stack Bileşenleri

| Servis | Port | Amaç |
|--------|------|------|
| Prometheus | 9090 | Metrik toplama |
| Grafana | 3001 | Dashboard ve görselleştirme |
| AlertManager | 9093 | Alert yönetimi |
| Node Exporter | 9100 | Host metrikleri |
| cAdvisor | 8081 | Container metrikleri |

## 🔗 Grafana Datasource Yapılandırması

Grafana otomatik olarak Prometheus'u datasource olarak ekler:
- URL: `http://prometheus:9090`
- Provisioning ile otomatik yapılandırılmış

## 📧 AlertManager Email Yapılandırması

Environment variables ile email ayarları:
```env
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=alerts@stoocker.app
ALERT_EMAIL=admin@stoocker.app
```

## ✅ Başarılı Deployment Kontrolü

1. Tüm servisler "Running" durumunda
2. Health check'ler "Healthy"
3. Grafana'ya login olabiliyorsunuz
4. Prometheus target'ları "UP" durumunda
5. AlertManager web UI açılıyor
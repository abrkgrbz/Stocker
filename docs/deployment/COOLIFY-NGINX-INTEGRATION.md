# Coolify + Nginx Integration Guide

Bu dokümantasyon, Coolify'ın Traefik proxy'si ile birlikte Nginx kullanımını açıklar.

## 🎯 Neden Traefik + Nginx?

- **Traefik**: SSL yönetimi, otomatik sertifika yenileme
- **Nginx**: Gelişmiş caching, rate limiting, özel routing kuralları

## 🏗️ Mimari

```
Internet → Coolify Traefik (80/443) → Nginx (8090) → Backend Services
```

## 📋 Kurulum Adımları

### 1. Coolify'da Traefik'i Aktif Tutun

Coolify Settings'de Traefik'i **KAPATAMAYIN**. Traefik SSL yönetimini yapacak.

### 2. Nginx Service'i Ekleyin

Coolify'da yeni bir service ekleyin:

```yaml
Type: Docker Compose
Source: GitHub Repository
Compose File: docker-compose.nginx.yml
```

### 3. Port Yapılandırması

Nginx alternatif portlarda çalışıyor:
- **8090**: HTTP (Traefik'ten gelen)
- **8453**: HTTPS (opsiyonel, internal)

### 4. Network Yapılandırması

Tüm servisler aynı network'te olmalı:
```yaml
networks:
  - stocker-network
```

## 🔧 Nginx Konfigürasyonu

### Dizin Yapısı

```
nginx/
├── nginx-coolify.conf      # Ana nginx config (8090 portu)
├── conf.d-coolify/         # Site config'leri
│   └── default.conf        # Routing kuralları
└── logs/                   # Nginx logları
```

### Routing Mantığı

Nginx, Traefik'ten gelen `X-Forwarded-Host` header'ına göre routing yapar:

```nginx
if ($original_host = api.stoocker.app) {
    proxy_pass http://api_backend;
}
```

## 🚀 Deployment

### Coolify'da Environment Variables

```env
NGINX_HTTP_PORT=8090
NGINX_HTTPS_PORT=8453
```

### Docker Compose Labels

Traefik otomatik olarak docker-compose.nginx.yml'deki label'ları okur:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.nginx-main.rule=Host(`stoocker.app`)"
  - "traefik.http.routers.nginx-main.entrypoints=websecure"
  - "traefik.http.routers.nginx-main.tls=true"
  - "traefik.http.routers.nginx-main.tls.certresolver=letsencrypt"
  - "traefik.http.services.nginx-main.loadbalancer.server.port=8090"
```

## 🔐 SSL Yönetimi

- **Traefik**: Let's Encrypt ile SSL sertifikalarını otomatik alır ve yeniler
- **Nginx**: Traefik'ten gelen HTTPS trafiğini işler (SSL termination Traefik'te)

## 📊 Avantajlar

### Traefik Sağlıyor:
- ✅ Otomatik SSL/TLS
- ✅ Let's Encrypt entegrasyonu
- ✅ Otomatik service discovery
- ✅ Load balancing

### Nginx Sağlıyor:
- ✅ Gelişmiş caching
- ✅ Rate limiting
- ✅ Custom rewrite rules
- ✅ Static file optimization
- ✅ Detaylı access logs

## 🔍 Monitoring

### Nginx Logs

```bash
# Coolify UI'dan
Service → Logs

# SSH ile
docker logs stocker-nginx

# Detaylı loglar
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log
```

### Traefik Dashboard

Coolify → Settings → Traefik Dashboard

## 🚨 Troubleshooting

### Problem: 502 Bad Gateway

**Çözüm:**
1. Nginx container'ının çalıştığını kontrol edin
2. Network bağlantısını kontrol edin
3. Backend servislerin çalıştığını kontrol edin

### Problem: SSL Sertifikası Çalışmıyor

**Çözüm:**
1. DNS kayıtlarını kontrol edin
2. Traefik logs'larını kontrol edin
3. Coolify → Settings → Domains kısmını kontrol edin

### Problem: Port Çakışması

**Çözüm:**
1. Nginx'in 8090 portunda çalıştığından emin olun
2. Başka bir servis 8090 kullanıyor mu kontrol edin

## 📝 Özel Routing Eklemek

Yeni bir subdomain eklemek için:

1. `nginx/conf.d-coolify/default.conf` dosyasına routing ekleyin:
```nginx
if ($original_host = yeni.stoocker.app) {
    proxy_pass http://yeni-servis:3000;
}
```

2. `docker-compose.nginx.yml` dosyasına Traefik label ekleyin:
```yaml
- "traefik.http.routers.nginx-yeni.rule=Host(`yeni.stoocker.app`)"
- "traefik.http.routers.nginx-yeni.entrypoints=websecure"
- "traefik.http.routers.nginx-yeni.tls=true"
```

3. Coolify'da redeploy yapın

## 🎯 Best Practices

1. **Cache Static Files**: Nginx'te static dosyaları cache'leyin
2. **Rate Limiting**: API endpoint'leri için rate limiting uygulayın
3. **Health Checks**: Her servis için health endpoint tanımlayın
4. **Logs**: Access ve error log'ları düzenli kontrol edin
5. **Backup**: Nginx config'lerini backup'layın

## 📊 Performance Tuning

### Nginx Worker Processes
```nginx
worker_processes auto;
worker_connections 2048;
```

### Keep-Alive Connections
```nginx
keepalive_timeout 65;
upstream backend {
    server api:5000;
    keepalive 32;
}
```

### Caching
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m max_size=1g;
proxy_cache cache;
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404 1m;
```

## ✅ Kontrol Listesi

- [ ] Traefik aktif ve çalışıyor
- [ ] Nginx 8090 portunda çalışıyor
- [ ] Tüm servisler aynı network'te
- [ ] DNS kayıtları doğru
- [ ] SSL sertifikaları alındı
- [ ] Health check'ler çalışıyor
- [ ] Logs kontrol edildi

## 🎉 Sonuç

Bu yapılandırma ile:
- Traefik SSL yönetimini otomatik yapar
- Nginx gelişmiş proxy özellikleri sağlar
- İki sistem birbirini tamamlar
- Coolify'ın kolaylığından faydalanırsınız
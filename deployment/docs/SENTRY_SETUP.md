# Sentry Kurulumu ve Sorun Giderme

## 📋 Genel Bakış

Sentry, production ortamında hataları takip etmek ve performansı izlemek için kullanılıyor. Bu dokümantasyon Sentry'nin doğru çalışması için gerekli adımları açıklar.

## ✅ Başarılı Kurulum Kontrol Listesi

### 1. Environment Variables (Production)

Coolify veya deployment ortamınızda **mutlaka** şu değişkenlerin tanımlı olması gerekir:

```bash
# Client-side (tarayıcıda çalışan kod için - ZORUNLU)
NEXT_PUBLIC_SENTRY_DSN=https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888

# Server-side (Node.js sunucu tarafında - ZORUNLU)
SENTRY_DSN=https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888

# Organization ve Project (build zamanı için - ZORUNLU)
SENTRY_ORG=stocker-0p
SENTRY_PROJECT=stocker-nextjs
SENTRY_ENVIRONMENT=production

# Auth Token (source map upload için - OPSİYONEL ama ÖNERİLİR)
# SENTRY_AUTH_TOKEN=your-auth-token-here
```

### 2. Coolify'da Environment Variable Ekleme

1. Coolify dashboard'a giriş yapın
2. Stocker Web uygulamasını seçin
3. **Environment Variables** sekmesine gidin
4. Yukarıdaki değişkenleri ekleyin
5. **Deploy** butonuna tıklayın (uygulama yeniden başlatılmalı)

### 3. Konfigürasyon Dosyaları

Aşağıdaki dosyaların mevcut ve doğru yapılandırılmış olduğundan emin olun:

- ✅ `stocker-nextjs/sentry.client.config.ts` - Client-side config
- ✅ `stocker-nextjs/sentry.server.config.ts` - Server-side config
- ✅ `stocker-nextjs/sentry.edge.config.ts` - Edge runtime config
- ✅ `stocker-nextjs/src/app/api/monitoring/route.ts` - Tunnel endpoint
- ✅ `stocker-nextjs/next.config.mjs` - Sentry webpack plugin

## 🔍 Sorun Giderme

### Problem 1: Production'da Log Gelmiyor

**Semptom**: `stoocker.app` üzerinden giriş yapıldığında Sentry'ye log gitmiyor.

**Çözüm**:
```bash
# 1. Environment variables kontrol et
curl https://stoocker.app/api/monitoring/status

# Beklenen çıktı:
# {
#   "sentry": {
#     "publicDsnConfigured": true,
#     "serverDsnConfigured": true,
#     ...
#   },
#   "ready": true
# }

# 2. Eğer "publicDsnConfigured": false ise:
# - Coolify'da NEXT_PUBLIC_SENTRY_DSN eklenmiş mi kontrol et
# - Deploy yapıldı mı kontrol et
# - Container'ı restart et

# 3. Detaylı environment check (geçici debug endpoint)
# Coolify'da bu flag'i ekle: ALLOW_ENV_DEBUG=true
# Deploy yap, sonra:
curl https://stoocker.app/api/debug/env
# Environment variable'ların yüklenip yüklenmediğini gösterir
# ⚠️ Test sonrası ALLOW_ENV_DEBUG flag'ini SİL (güvenlik riski)

# 4. Test error gönder
curl https://stoocker.app/api/test-sentry-error

# 5. Sentry dashboard'u kontrol et
# https://stocker-0p.sentry.io/issues/
```

**Yaygın Nedenler**:
- Environment variable'lar Coolify'da eklenmemiş
- Deploy sonrası container restart edilmemiş
- Variable ismi yanlış (NEXT_PUBLIC_ prefix'i eksik)
- Variable value'da whitespace/yeni satır var

### Problem 2: Debug Logları Göremiyorum

**Semptom**: Browser console'da Sentry ile ilgili log yok.

**Çözüm**: Debug mode'u aktif et:

```typescript
// sentry.client.config.ts
Sentry.init({
  debug: true,  // Development için true, production için false
  // ...
});
```

**Uyarı**: Production'da `debug: false` yapın, aksi halde console çok fazla log ile dolacak.

### Problem 3: Ad Blocker Sentry'yi Engelliyor

**Semptom**: Network tab'da Sentry istekleri bloklanıyor.

**Çözüm**: Tunnel kullanıyoruz, bu yüzden sorun olmamalı. Kontrol:

```bash
# Browser Network tab'da şunları arayın:
# POST /api/monitoring  (Sentry tunnel endpoint)
# DEĞİL: POST sentry.io (direkt istek bloklanabilir)
```

Tunnel konfigürasyonu:
```typescript
// sentry.client.config.ts
Sentry.init({
  tunnel: "/api/monitoring",  // İstekler kendi domain'imizden gider
  // ...
});
```

### Problem 4: Subdomain Bilgisi Gelmiyor

**Semptom**: Sentry'de hangi tenant'tan geldiğini ayırt edemiyoruz.

**Çözüm**: `beforeSend` hook'u subdomain bilgisini otomatik ekliyor:

```typescript
// Her error şu tag'leri içeriyor:
{
  tags: {
    subdomain: "company1",     // tenant subdomain
    hostname: "company1.stoocker.app",
    full_url: "https://company1.stoocker.app/crm/leads"
  },
  contexts: {
    subdomain: {
      name: "company1",
      hostname: "company1.stoocker.app",
      pathname: "/crm/leads"
    }
  }
}
```

## 🧪 Test Senaryoları

### 1. Production Test (Canlı Ortam)

```bash
# Status kontrolü
curl https://stoocker.app/api/monitoring/status | jq

# Test hatası gönder
curl https://stoocker.app/api/test-sentry-error

# Tunnel çalışıyor mu kontrol et
curl https://stoocker.app/api/monitoring
# Beklenen: { "status": "Sentry tunnel endpoint is working", ... }
```

### 2. Browser Console Test

Herhangi bir sayfada browser console'da:

```javascript
// Test hatası
throw new Error("Test Sentry - Production");

// Veya Sentry API'yi direkt kullan
import * as Sentry from '@sentry/nextjs';
Sentry.captureMessage("Test message from console");
```

### 3. Subdomain Test

Farklı subdomain'lerden test edin:

```bash
# Tenant 1
curl https://company1.stoocker.app/api/test-sentry-error

# Tenant 2
curl https://company2.stoocker.app/api/test-sentry-error

# Main domain
curl https://stoocker.app/api/test-sentry-error
```

Sentry dashboard'da her birinin `subdomain` tag'i ile filtrelenebilmesi gerekir.

## 📊 Monitoring Dashboard

### Sentry Dashboard Linkleri

- **Issues**: https://stocker-0p.sentry.io/issues/
- **Performance**: https://stocker-0p.sentry.io/performance/
- **Releases**: https://stocker-0p.sentry.io/releases/
- **Settings**: https://sentry.io/settings/stocker-0p/projects/stocker-nextjs/

### Sentry'de Filtreler

Subdomain'e göre filtrele:
```
tags.subdomain:company1
```

Environment'a göre filtrele:
```
environment:production
environment:production-company1
```

URL'e göre filtrele:
```
url:"*/crm/workflows*"
```

## 🔐 Güvenlik

### DSN Güvenliği

DSN (Data Source Name) **public** bir key'dir ve browser'da görülebilir. Bu normaldir ve güvenlik riski oluşturmaz çünkü:

1. Sadece **event gönderme** yetkisi vardır
2. Sentry dashboard'a erişim sağlamaz
3. Rate limiting vardır
4. IP whitelist (opsiyonel) eklenebilir

### Private Key (Secret Key)

Asla browser'a göndermeyin:
- ❌ `SENTRY_SECRET_KEY` - Asla public environment variable yapmayın
- ✅ `NEXT_PUBLIC_SENTRY_DSN` - Browser'da görülebilir (güvenli)
- ✅ `SENTRY_AUTH_TOKEN` - Sadece build zamanında kullanılır

## 📈 Best Practices

### 1. Environment Tag'leri

Her subdomain için farklı environment:
```typescript
environment: `production-${subdomain}`
// Örnek: production-company1, production-company2
```

### 2. Sample Rate

Production'da maliyeti düşürmek için:
```typescript
tracesSampleRate: 0.1,  // %10 transaction sample
replaysSessionSampleRate: 0.1,  // %10 session replay
replaysOnErrorSampleRate: 1.0,  // %100 error replay
```

### 3. PII Filtering

Hassas veriyi maskeleme:
```typescript
beforeSend(event) {
  // Email maskeleme
  if (event.user?.email) {
    event.user.email = event.user.email.replace(/(.{2}).*(@.*)/, '$1***$2');
  }
  return event;
}
```

## 🚀 Deployment Checklist

Yeni deployment öncesi:

- [ ] Environment variables Coolify'da tanımlı
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set edilmiş
- [ ] `SENTRY_ORG` ve `SENTRY_PROJECT` set edilmiş
- [ ] Debug mode production'da `false`
- [ ] Tunnel endpoint çalışıyor
- [ ] Test error başarıyla gönderildi
- [ ] Sentry dashboard'da görüntülendi
- [ ] Subdomain tag'leri doğru

## 🔗 Yararlı Linkler

- **Sentry Dashboard**: https://stocker-0p.sentry.io/
- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Tunnel Setup**: https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option
- **Performance Monitoring**: https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/

## ⚠️ Yaygın Hatalar

### 1. "Sentry is not initialized"

**Neden**: Environment variable eksik
**Çözüm**: `NEXT_PUBLIC_SENTRY_DSN` kontrol et

### 2. Events görünmüyor ama status 200

**Neden**: Yanlış DSN veya project ID
**Çözüm**: DSN'i Sentry dashboard'dan kopyala

### 3. Source maps yüklenmiyor

**Neden**: `SENTRY_AUTH_TOKEN` eksik
**Çözüm**: Auth token oluştur ve ekle

### 4. Subdomain tag'i "unknown"

**Neden**: `beforeSend` hook çalışmıyor
**Çözüm**: Config dosyalarını kontrol et

## 📞 Destek

Sorun devam ediyorsa:

1. `npm run dev` ile local test edin
2. Browser console'da Sentry debug loglarına bakın
3. `/api/monitoring/status` endpoint'ini kontrol edin
4. Network tab'da `/api/monitoring` POST isteklerini kontrol edin
5. Sentry dashboard'da "Project Settings > Client Keys" kontrol edin

---

**Son Güncelleme**: 2025-11-15
**Versiyon**: 1.0
**Sorumlular**: DevOps, Backend Team

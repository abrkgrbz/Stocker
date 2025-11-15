# Coolify Sentry Environment Variables Setup

## 📋 Hızlı Kurulum Rehberi

Sentry'nin production'da çalışması için Coolify'da yapılması gerekenler.

---

## ✅ Adım 1: Coolify Dashboard'a Giriş

1. Coolify dashboard'a giriş yap: https://your-coolify-url.com
2. **Stocker Web** uygulamasını bul ve seç
3. **Environment Variables** tab'ına tıkla

---

## ✅ Adım 2: Sentry Variables Ekle

Aşağıdaki 5 environment variable'ı **tam olarak bu isimlerle** ekle:

### 🔑 Zorunlu Variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888` |
| `SENTRY_DSN` | `https://a70b942af7e82a02c637a852f0782226@o4510349217431552.ingest.de.sentry.io/4510349218807888` |
| `SENTRY_ORG` | `stocker-0p` |
| `SENTRY_PROJECT` | `stocker-nextjs` |
| `SENTRY_ENVIRONMENT` | `production` |

### 📸 Coolify Screenshot Örneği

```
┌─────────────────────────────┬────────────────────────────────────────────┐
│ Key                         │ Value                                      │
├─────────────────────────────┼────────────────────────────────────────────┤
│ NEXT_PUBLIC_SENTRY_DSN      │ https://a70b942af7e82a02c637a852f0782... │
│ SENTRY_DSN                  │ https://a70b942af7e82a02c637a852f0782... │
│ SENTRY_ORG                  │ stocker-0p                                 │
│ SENTRY_PROJECT              │ stocker-nextjs                             │
│ SENTRY_ENVIRONMENT          │ production                                 │
└─────────────────────────────┴────────────────────────────────────────────┘
```

### ⚠️ Önemli Notlar

- **NEXT_PUBLIC_** prefix'i şart! (client-side için)
- **SENTRY_DSN** de ayrıca eklenmeli (server-side için)
- Value'larda başında/sonunda boşluk olmamalı
- Copy-paste yaparken satır sonu karakterlerine dikkat

---

## ✅ Adım 3: Deploy & Restart

1. Coolify'da **Save** butonuna tıkla
2. **Redeploy** butonuna tıkla (veya **Restart** butonu varsa)
3. Deployment loglarını izle - hata olmamalı
4. Build tamamlandığında container restart olacak

**Beklenen süre**: 3-5 dakika

---

## ✅ Adım 4: Doğrulama

Deployment tamamlandıktan sonra test et:

### Test 1: Status Check

```bash
curl https://stoocker.app/api/monitoring/status | jq
```

**Beklenen sonuç**:
```json
{
  "sentry": {
    "publicDsnConfigured": true,    ← ZORUNLU: true olmalı
    "serverDsnConfigured": true,    ← ZORUNLU: true olmalı
    "ready": true                   ← ZORUNLU: true olmalı
  }
}
```

❌ **Eğer `false` dönüyorsa**:
- Environment variable'lar doğru eklendi mi kontrol et
- Container restart edildi mi kontrol et
- Logs'larda hata var mı bak

### Test 2: Debug Endpoint (Opsiyonel)

Eğer status `false` dönüyorsa, detaylı debug için:

1. Coolify'da geçici flag ekle:
   ```
   Key: ALLOW_ENV_DEBUG
   Value: true
   ```

2. Redeploy yap

3. Test et:
   ```bash
   curl https://stoocker.app/api/debug/env | jq
   ```

4. Environment variable'ların yüklendiğini göreceksin

5. **ÖNEMLİ**: Test sonrası `ALLOW_ENV_DEBUG` flag'ini SİL (güvenlik riski)

### Test 3: Sentry'ye Test Error Gönder

```bash
curl https://stoocker.app/api/test-sentry-error
```

**Beklenen sonuç**:
```json
{
  "success": true,
  "sentryEnabled": true,           ← ZORUNLU: true olmalı
  "message": "Test error sent to Sentry"
}
```

### Test 4: Sentry Dashboard Kontrolü

1. Sentry dashboard aç: https://stocker-0p.sentry.io/issues/
2. Son 5 dakikada "Test error from Stocker application" hatası görünmeli
3. Error'a tıkla ve subdomain tag'lerini kontrol et

---

## ✅ Adım 5: Debug Mode'u Kapat (Opsiyonel)

Sentry çalışmaya başladıktan sonra debug loglarını kapat:

1. Repository'de:
   - `stocker-nextjs/sentry.client.config.ts` → `debug: false`
   - `stocker-nextjs/sentry.server.config.ts` → `debug: false`

2. Commit & push

3. Coolify otomatik redeploy yapacak

**Neden**: Debug mode production'da console'u kirletir, performans etkisi var

---

## 🔍 Sorun Giderme

### Sorun: "publicDsnConfigured": false

**Muhtemel nedenler**:
1. `NEXT_PUBLIC_SENTRY_DSN` eksik veya yanlış yazılmış
2. Container restart edilmemiş
3. Value'da whitespace var

**Çözüm**:
```bash
# Coolify'da variable'ı kontrol et
# Redeploy yap
# Logs'a bak: docker logs <container-id>
```

### Sorun: "sentryEnabled": false

**Neden**: Environment variable Next.js uygulamasına ulaşmamış

**Çözüm**:
1. Coolify'da variable'lar var mı kontrol et
2. Restart yaptın mı emin ol
3. Build logs'unda hata var mı bak
4. Debug endpoint kullan (ALLOW_ENV_DEBUG=true)

### Sorun: Sentry Dashboard'da Event Yok

**Neden**: Tunnel veya network sorunu

**Çözüm**:
```bash
# 1. Tunnel çalışıyor mu
curl https://stoocker.app/api/monitoring

# 2. Browser console'da network tab'a bak
# POST /api/monitoring istekleri görünmeli

# 3. Browser console'da Sentry debug loglarına bak
# "Sentry is initialized" mesajını araştır
```

---

## 📊 Final Checklist

Deploy tamamlandığında tüm bunları kontrol et:

- [ ] `curl https://stoocker.app/api/monitoring/status` → `ready: true`
- [ ] `curl https://stoocker.app/api/test-sentry-error` → `sentryEnabled: true`
- [ ] Sentry dashboard'da test error görünüyor
- [ ] Subdomain tag'leri doğru (örn: `subdomain:company1`)
- [ ] Browser console'da "Sentry initialized" logu var
- [ ] Network tab'da `/api/monitoring` POST istekleri başarılı

Hepsi ✅ ise **Sentry başarıyla kuruldu**! 🎉

---

## 🔗 İlgili Dökümanlar

- **Detaylı Setup**: [SENTRY_SETUP.md](./SENTRY_SETUP.md)
- **Troubleshooting**: [SENTRY_SETUP.md#sorun-giderme](./SENTRY_SETUP.md#🔍-sorun-giderme)
- **Sentry Dashboard**: https://stocker-0p.sentry.io/

---

## 📞 Yardım Lazımsa

1. Status endpoint kontrol et
2. Debug endpoint kullan (geçici flag ile)
3. Coolify deployment logs'ları incele
4. Browser console ve network tab'a bak
5. Sentry documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/

---

**Güncelleme**: 2025-11-15
**Versiyon**: 1.0
**Test Edildi**: ✅ Local, ⏳ Production (environment variables bekleniyor)

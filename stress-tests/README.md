# Stocker Stress Tests

k6 tabanlı yük ve stres testleri - 1000 eşzamanlı kullanıcı simülasyonu.

## Kurulum

```bash
# Windows (Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Hızlı Başlangıç

### PowerShell ile (Önerilen)

```powershell
cd stress-tests

# Smoke test (hızlı kontrol - 10 kullanıcı, 2 dakika)
.\run-tests.ps1 -Test smoke

# Load test (normal yük - 100 kullanıcı, 9 dakika)
.\run-tests.ps1 -Test load

# Stress test (1000 kullanıcı, 18 dakika)
.\run-tests.ps1 -Test stress

# Spike test (ani yük artışı)
.\run-tests.ps1 -Test spike

# Full stack test (Frontend + API birlikte)
.\run-tests.ps1 -Test full
```

### Özel URL'ler ile

```powershell
.\run-tests.ps1 -Test stress `
    -ApiUrl "https://api.stockerapp.com" `
    -FrontendUrl "https://app.stockerapp.com" `
    -TenantCode "my-tenant" `
    -TestEmail "test@example.com" `
    -TestPassword "MyPassword123!"
```

### Doğrudan k6 ile

```bash
# API testi
k6 run --env API_URL=https://api.stockerapp.com api-stress-test.js

# Frontend testi
k6 run --env FRONTEND_URL=https://app.stockerapp.com frontend-stress-test.js

# Full stack testi
k6 run full-stack-stress-test.js
```

## Test Senaryoları

### 1. Smoke Test
- **Amaç**: Sistemin temel işlevselliğini kontrol
- **Kullanıcı**: 10
- **Süre**: 2 dakika
- **Ne zaman**: Her deployment öncesi

### 2. Load Test
- **Amaç**: Normal yük altında performans
- **Kullanıcı**: 100
- **Süre**: 9 dakika
- **Ne zaman**: Haftalık

### 3. Stress Test ⭐
- **Amaç**: 1000 kullanıcı altında sistem davranışı
- **Kullanıcı**: 1000 (kademeli artış)
- **Süre**: 18 dakika
- **Ne zaman**: Büyük güncellemeler öncesi

### 4. Spike Test
- **Amaç**: Ani yük artışına tepki
- **Kullanıcı**: 100 → 1000 (aniden)
- **Süre**: 6 dakika
- **Ne zaman**: Kampanya/promosyon öncesi

### 5. Soak Test
- **Amaç**: Uzun süreli stabilite
- **Kullanıcı**: 500
- **Süre**: 40 dakika
- **Ne zaman**: Aylık

## Test Metrikleri

### Hedef Değerler (Thresholds)

| Metrik | Hedef | Açıklama |
|--------|-------|----------|
| API P95 Response | < 2000ms | API çağrılarının %95'i 2 saniyenin altında |
| API P99 Response | < 5000ms | API çağrılarının %99'u 5 saniyenin altında |
| Page P95 Load | < 3000ms | Sayfa yüklemelerinin %95'i 3 saniyenin altında |
| Error Rate | < 5% | Hata oranı %5'in altında |
| Login Success | > 95% | Login başarı oranı %95'in üstünde |

### Ölçülen Metrikler

- **api_response_time**: API yanıt süreleri
- **page_load_time**: Sayfa yükleme süreleri
- **login_time**: Login işlem süreleri
- **time_to_first_byte**: İlk byte süresi (TTFB)
- **total_requests**: Toplam istek sayısı
- **api_errors / page_errors**: Hata oranları

## Sonuçlar

Testler `results/` klasörüne kaydedilir:

```
results/
├── api-stress-result.json       # API test sonuçları
├── frontend-stress-result.json  # Frontend test sonuçları
├── full-stack-result.json       # Full stack sonuçları
└── full-stack-report.txt        # İnsan okunabilir rapor
```

## Konfigürasyon

`config.js` dosyasını düzenleyerek ayarları değiştirebilirsiniz:

```javascript
export const CONFIG = {
  API_BASE_URL: 'https://api.stockerapp.com',
  FRONTEND_URL: 'https://app.stockerapp.com',
  TEST_EMAIL: 'test@example.com',
  TEST_PASSWORD: 'TestPassword123!',
  TENANT_CODE: 'test-tenant',
};
```

## Dikkat Edilecekler

1. **Production'da dikkatli olun**: Stres testleri gerçek sunuculara yük bindirir
2. **Test kullanıcısı kullanın**: Gerçek kullanıcı hesaplarını kullanmayın
3. **Off-peak saatlerde çalıştırın**: Yoğun olmayan saatlerde test yapın
4. **Rate limiting**: Test kullanıcısı için rate limit'i geçici olarak artırın
5. **Monitoring**: Test sırasında sunucu metriklerini izleyin

## Sorun Giderme

### "Connection refused" hatası
```bash
# Sunucunun çalıştığından emin olun
curl https://api.stockerapp.com/health
```

### "401 Unauthorized" hatası
```bash
# Test credentials'ı kontrol edin
# config.js'de email/password doğru mu?
```

### Çok fazla 429 hatası
```bash
# Rate limiting aktif
# TenantRateLimitingMiddleware'de test tenant için limit artırın
```

## Grafana Dashboard

k6 sonuçlarını Grafana'da görselleştirmek için:

```bash
# InfluxDB çıktısı ile
k6 run --out influxdb=http://localhost:8086/k6 api-stress-test.js

# Prometheus çıktısı ile
k6 run --out experimental-prometheus-rw api-stress-test.js
```

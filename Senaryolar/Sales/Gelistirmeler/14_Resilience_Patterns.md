# İyileştirme 14: Resilience Patterns (Dayanıklılık Desenleri)

**İlgili Senaryo:** Kargo Fiyat Hesaplama Servisinin Çökmesi, E-posta Gönderim Servisinin Hata Vermesi (Level 5)
**Öncelik:** Yüksek (P1)

## Sorun
Dış servislere (Kargo, Ödeme, E-posta API'leri) yapılan çağrılar şu anda doğrudan yapılmaktadır. Servis geçici olarak yanıt vermezse veya hata döndürürse, bu hata zincirleme olarak çağrıyı yapan ana servisimize de yansır (Cascading Failure). Ayrıca, anlık ağ hatalarında (`Transient Errors`) işlem hemen başarısız sayılır, oysa ki tekrar denense başarılı olabilir.

## Çözüm Önerisi
Http Client factory konfigürasyonunda `Microsoft.Extensions.Http.Resilience` veya `Polly` kütüphanesi kullanılarak Retry, Circuit Breaker ve Timeout politikaları tanımlanmalı.

### Teknik Adımlar
1.  **Retry Policy:** 5xx hataları veya 408 (Timeout) için "Exponential Backoff" ile 3 kez tekrar deneme.
2.  **Circuit Breaker:** Arka arkaya 5 hata alınırsa devreyi kes (Open State) ve 30 saniye boyunca servise gitme, direkt hata dön veya fallback uygula.
3.  **Timeout:** Her istek için makul bir zaman aşımı (örn: 10sn) belirle.

```csharp
// Program.cs
services.AddHttpClient("CargoApi")
    .AddStandardResilienceHandler(options => 
    {
        options.Retry.MaxRetryAttempts = 3;
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
        options.CircuitBreaker.FailureRatio = 0.5;
    });
```

# İyileştirme 15: Bayat Veri Koruması (Stale Data Protection)

**İlgili Senaryo:** Para Birimi Çevrim Kurunun Güncellenmemesi (Level 5)
**Öncelik:** Yüksek (P1) - Finansal

## Sorun
Döviz kurları gibi dışarıdan belirli aralıklarla çekilen verilerin güncelliği kontrol edilmemektedir. Eğer entegrasyon servisi çalışmazsa, sistem veritabanındaki son (eski) kuru kullanarak işlem yapmaya devam eder. Bu durum ciddi kur dalgalanmalarında finansal zarara yol açar.

## Çözüm Önerisi
Kritik veri tablolarında (`CurrencyRates`) `LastUpdated` alanı kontrol edilmeli ve belirli bir eşik değerden (örn: 24 saat) daha eski verilerle işlem yapılması engellenmeli veya yönetici onayı istenmelidir.

### Teknik Adımlar
1.  **Staleness Check:** Kur çevrimi yapan serviste `if (rate.LastUpdated < DateTime.Now.AddHours(-24))` kontrolü eklenmeli.
2.  **Alerting:** Bayat veri tespit edildiğinde, Slack/Email üzerinden operasyon ekibine "Kur servisi çalışmıyor!" alarmı gönderilmeli.
3.  **Fallback/Block:** İş kuralına göre, ya satış durdurulmalı ya da güvenli bir marj (%5 ekle) ile işlem yapılmalı.

```csharp
// CurrencyConverter.cs
if (rate.UpdatedAt < DateTime.UtcNow.AddHours(-4))
{
    _logger.LogCritical("KUR VERİSİ GÜNCEL DEĞİL! Son Güncelleme: {LastUpdate}", rate.UpdatedAt);
    throw new StaleDataException("Döviz kurları güncel olmadığı için işlem yapılamıyor.");
}
```

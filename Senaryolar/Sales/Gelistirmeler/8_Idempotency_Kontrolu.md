# İyileştirme 8: Idempotency (Tekillik) Kontrolü

**İlgili Senaryo:** "Siparişi Onayla" Butonuna Çift Tıklama ile Mükerrer Sipariş (Level 3)
**Öncelik:** Yüksek (P1)

## Sorun
Sistem, aynı isteğin (Request) birden fazla kez gönderilmesi durumunda (ağ hatası, çift tıklama vb.) her seferinde yeni bir sipariş oluşturmaktadır. Bu durum çifte ödeme çekimine ve mükerrer kayıtlara yol açar.

## Çözüm Önerisi
API seviyesinde "Idempotency Key" desenini uygulamak. Client, her sipariş denemesi için benzersiz bir anahtar (Guid) üretir ve Header'da gönderir. Sunucu, bu anahtarı Redis'te saklar; aynı anahtarla ikinci bir istek gelirse işlemi yapmaz, ilk işlemin sonucunu döner.

### Teknik Adımlar
1.  **Header Kontrolü:** `X-Idempotency-Key` header'ının varlığı kontrol edilir.
2.  **Redis Cache:** Anahtar daha önce işlenmiş mi diye Redis'e bakılır.
3.  **Atomik İşlem:** İşlenmediyse key Redis'e "Processing" durumuyla yazılır. İşlem bitince sonuç güncellenir.

```csharp
// IdempotencyMiddleware.cs (Basitleştirilmiş)
if (await _cache.ExistsAsync(key)) 
{
    return await _cache.GetResultAsync(key);
}
await _cache.SetProcessingAsync(key);
```

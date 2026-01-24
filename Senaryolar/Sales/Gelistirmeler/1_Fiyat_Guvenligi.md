# İyileştirme 1: Fiyat Güvenliği (Server-Side Price Validation)

**İlgili Senaryo:** Fiyat Değişikliği ve Ödeme Anı Arasındaki Milisaniyelik Yarış (Level 10)
**Öncelik:** Kritik (P0)

## Sorun
Sistem şu anda `CreateSalesOrderHandler` içerisinde sipariş tutarını hesaplarken, Client'tan (Frontend) gelen istekteki `UnitPrice` bilgisini kullanmaktadır. Bu durum, kötü niyetli kullanıcıların veya güncel olmayan tarayıcı sekmelerinin hatalı/düşük fiyatla sipariş oluşturmasına olanak tanır.

## Çözüm Önerisi
Sipariş oluşturma sürecinde (`CreateSalesOrderHandler`), fiyat bilgisi Client'tan alınmak yerine Backend'de doğrulanmalıdır.

### Teknik Adımlar
1.  **PriceService Entegrasyonu:** `IPriceService` veya benzeri bir arayüz ile Fiyatlandırma modülünden güncel ürün fiyatını çeken bir mekanizma kurulmalı.
2.  **Validasyon:** Client'tan gelen fiyat ile sistemdeki güncel fiyat karşılaştırılmalı.
    *   Eğer fark varsa ve bu fark kabul edilebilir toleransın üzerindeyse (örn: %1'den fazla), işlem reddedilmeli (`PriceChangedException`).
    *   Veya, Client fiyatı tamamen yoksayılıp direkt sistem fiyatı kullanılmalı (iş kuralına göre değişir).
3.  **Optimizasyon:** Fiyat sorguları Redis gibi bir cache üzerinden yapılmalı, ancak ödeme anında veritabanına gidilmesi daha güvenlidir.

```csharp
// Current (Riskli)
var unitPrice = itemCmd.UnitPrice;

// Proposed (Güvenli)
var productPrice = await _priceService.GetPriceAsync(itemCmd.ProductId);
if (productPrice.Value != itemCmd.UnitPrice) 
{
    return Result.Failure(Error.Validation("PriceChanged", "Ürün fiyatı değişti, lütfen sayfayı yenileyin."));
}
```

# İyileştirme 18: Para Birimi Tutarlılık Kontrolü (Currency Consistency)

**İlgili Senaryo:** Hatalı Para Birimiyle Kaydedilen Sipariş (Level 6)
**Öncelik:** Yüksek (P1) - Finansal

## Sorun
Sipariş oluşturma isteğinde (`CreateSalesOrderCommand`) gelen para birimi ve tutar bilgisi, backend tarafında bir çapraz kontrolden geçirilmemektedir. Frontend USD gösterip backend'e TL gönderirse, sistem bunu kabul eder ve ciddi finansal kayıp oluşur.

## Çözüm Önerisi
Sipariş oluşturulurken ürünlerin fiyatları o anki döviz kuru üzerinden doğrulanmalı veya Client'ın gönderdiği para birimi ile ürünün/sistemin para birimi uyumlu mu kontrol edilmelidir.

### Teknik Adımlar
1.  **Currency Validation:** Handler içinde, `item.UnitPrice` ile veritabanındaki `product.UnitPrice` karşılaştırılırken para birimi dönüşümü yapılmalı.
2.  **Explicit Currency:** `Money` value object kullanımı yaygınlaştırılarak, tutarın yanında her zaman para birimi de taşınmalı.

```csharp
// CreateSalesOrderHandler.cs
if (request.Currency != product.UnitPrice.Currency)
{
    // Kur dönüşümü yap veya hata fırlat
    return Result.Failure(Error.Validation("CurrencyMismatch", 
        $"Sipariş para birimi ({request.Currency}) ile ürün para birimi ({product.UnitPrice.Currency}) uyuşmuyor."));
}
```

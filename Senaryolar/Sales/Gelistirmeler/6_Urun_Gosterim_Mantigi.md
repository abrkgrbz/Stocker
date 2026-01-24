# İyileştirme 6: Ürün Gösterim Mantığı (New Badge & Strikethrough Price)

**İlgili Senaryo:** "Yeni Ürün" Rozeti Hiç Kaybolmuyor, İndirimli Fiyatın Üzeri Çizilmemiş (Level 2)
**Öncelik:** Düşük (P3) - Satış Artırıcı (UX)

## Sorun
1.  **Yeni Rozeti:** Ürünlerin ne kadar süre "Yeni" kalacağı manuel veya hatalı cron joblara bırakılmış.
2.  **Çizili Fiyat:** Ürünün indirimsiz "Liste Fiyatı" (ListPrice/MSRP) veritabanında tutulmuyor. İndirim yapıldığında sadece `UnitPrice` düşürülüyor, eski fiyat kayboluyor.

## Çözüm Önerisi
Bu mantıkların Backend tarafında Computed Property veya DTO mapping sırasında dinamik olarak hesaplanması gerekir.

### Teknik Adımlar
1.  **ListPrice Alanı:** `Product` tablosuna `ListPrice` (Liste Fiyatı) kolonu eklenmeli. `UnitPrice` her zaman satış fiyatı olmalı.
2.  **IsNew Hesaplaması:** DTO seviyesinde, ürünün oluşturulma tarihine bakılarak dinamik bir property belirlenmeli.

```csharp
// ProductDto.cs
public class ProductDto 
{
    public decimal UnitPrice { get; set; } // Satış Fiyatı (80 TL)
    public decimal? ListPrice { get; set; } // Liste Fiyatı (100 TL)
    
    // Server-side calculation
    public bool HasDiscount => ListPrice.HasValue && ListPrice > UnitPrice;
    public int DiscountPercentage => HasDiscount ? (int)((ListPrice - UnitPrice) / ListPrice * 100) : 0;
    
    // Dinamik "Yeni" kontrolü (Örn: Son 30 gün)
    public bool IsNew => CreatedAt > DateTime.UtcNow.AddDays(-30);
}
```

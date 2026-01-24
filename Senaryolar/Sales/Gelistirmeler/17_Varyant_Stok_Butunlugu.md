# İyileştirme 17: Varyant Stok Bütünlüğü (Variant Stock Consistency)

**İlgili Senaryo:** Varyant Stoğunun Ana Ürün Stoğu ile Tutarsızlığı (Level 6)
**Öncelik:** Orta (P2)

## Sorun
Sistemde hem Ana Ürün (Parent Product) hem de onun Varyantları (Child Products) aynı `Product` tablosunda ve `Stock` tablosunda tutulabilmektedir. Eğer bir ürünün varyantları varsa (örn: Beden/Renk), mantıken ana ürünün kendine ait bir stoğu olmamalıdır ("Soyut Ürün"). Ancak şu anki yapıda, yanlışlıkla ana ürüne stok girişi yapılabilir veya satılabilir.

## Çözüm Önerisi
Inventory modülünde bir iş kuralı (Domain Rule) uygulanarak, varyant sahibi ürünlerin stok takibinin `IsStockTracked = false` olması zorlanmalı veya `Stock` tablosuna kayıt atılması engellenmelidir.

### Teknik Adımlar
1.  **Domain Rule:** `Product.AddVariant` metodu çağrıldığında, `IsStockTracked` otomatik olarak `false` yapılmalı.
2.  **Stock Guard:** `Stock.IncreaseStock` metodunda, eğer ürünün varyantları varsa işlem reddedilmeli.

```csharp
// Product.cs
public void AddVariant(ProductVariant variant) 
{
    // Varyant eklenen ürün "Soyut" duruma geçer, kendi stoğu olamaz.
    this.IsStockTracked = false; 
    _variants.Add(variant);
}
```

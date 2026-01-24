# İyileştirme 21: Birim ve Maliyet Yönetimi (Unit & Cost Integrity)

**İlgili Senaryolar:**
*   Level 7: Ürün Biriminin Değiştirilmesinin Zincirleme Etkisi
*   Level 7: İade Edilen Ürünün Maliyetinin Belirlenememesi
*   Level 9: Tarihsel Satınalma Faturasının Fiyatını Değiştirme

**Öncelik:** Yüksek (P1) - Muhasebe

## Sorun
Ürünlerin temel özellikleri (Birim, Maliyet) değiştiğinde, sistem geçmiş verileri korumakta yetersiz kalmaktadır. Birim değişikliği (Adet -> Koli) envanteri 10 kat şişirebilir. Geçmiş bir faturadaki maliyet güncellemesi, o malın kullanıldığı tüm satışların kar/zarar durumunu bozar.

## Çözüm Önerisi
1.  **Immutable Unit:** Ürün birimi oluşturulduktan sonra değiştirilemez olmalı. Gerekirse "Yeni Ürün" olarak açılmalı veya "Birim Dönüşüm Tablosu" kullanılmalı.
2.  **Maliyet İzlenebilirliği:** Satış kalemlerinde (`SalesOrderItem`), ürünün o anki maliyeti (`CostPrice`) snapshot olarak saklanmalı. İade işlemlerinde bu maliyet kullanılmalı.
3.  **Maliyet Versiyonlama:** Maliyetler zamana bağlı (Temporal Table) tutulmalı. Geriye dönük düzeltme yapılırsa, "Cost Recalculation Job" tetiklenip ilgili dönemin raporları güncellenmeli.

### Teknik Adımlar
*   **Entity Configuration:** `Product.Unit` alanı `readonly` veya sadece migration ile değiştirilebilir olmalı.
*   **SalesOrderItem:** `OriginalCostPrice` kolonu eklenmeli.

```csharp
// SalesOrderItem.cs
public decimal OriginalCostPrice { get; private set; } // Satış anındaki maliyet
public decimal UnitPrice { get; private set; }         // Satış fiyatı
```

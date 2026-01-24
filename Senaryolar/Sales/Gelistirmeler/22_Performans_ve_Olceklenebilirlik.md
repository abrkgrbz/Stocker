# İyileştirme 22: Performans ve Ölçeklenebilirlik (Performance & Scalability)

**İlgili Senaryolar:**
*   Level 8: Yıl Sonu Envanter Raporu (Killer Query)
*   Level 8: Veritabanı Deadlock'u
*   Level 9: Black Friday Read Bottleneck

**Öncelik:** Yüksek (P1) - Performans

## Sorun
Sistem, yoğun yük altında (Black Friday) veya ağır raporlama sorgularında (Yıl Sonu) darboğaza girmektedir. Okuma (Read) istekleri veritabanını kilitler, yazma (Write) işlemleri deadlock oluşturur.

## Çözüm Önerisi
1.  **Read/Write Splitting:** Raporlama ve Listeleme işlemleri `Read Replica` veritabanına yönlendirilmeli. CQRS pattern tam olarak uygulanmalı.
2.  **Resource Locking Strategy:** Deadlock'ları önlemek için tüm toplu işlemlerde "ID Sıralı Kilitleme" (Ordered Locking) standardı uygulanmalı.
3.  **Caching Strategy:** Stok gibi sık okunan - az değişen veriler Redis üzerinde "Short-TTL" (5-10 saniye) ile cache'lenmeli.

### Teknik Adımlar
*   **EF Core:** `db.SalesOrders.AsNoTracking().TagWith("Reporting")` kullanımı.
*   **Redis:** `GetStockAsync` önce Redis'e bakmalı.
*   **Deadlock Prevention:** `products.OrderBy(p => p.Id)` yaparak güncelleme sırasını sabitle.

```csharp
// StockService.cs
var sortedItems = items.OrderBy(i => i.ProductId); // Deadlock önleme
foreach(var item in sortedItems) {
    // Kilitle ve güncelle
}
```

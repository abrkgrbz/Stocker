# İyileştirme 3: Stok "Yarış Durumu" (Race Condition Prevention)

**İlgili Senaryo:** Çok Kanallı Satış ve Stok Replikasyon Gecikmesi (Level 10)
**Öncelik:** Yüksek (P1)

## Sorun
Sipariş oluşturma sürecinde, stok kontrolü (`Check`) ile stok düşümü (`Reserve`) arasında zaman farkı bulunmaktadır. Bu "Time-of-Check to Time-of-Use" (TOCTOU) açığı, yoğun trafikte son ürünün birden fazla kişiye satılmasına (Overselling) neden olabilir.

## Çözüm Önerisi
Stok kontrolü ve rezervasyonu tek bir atomik işlemde yapılmalı veya "İyimser Kilitleme" (Optimistic Concurrency) kullanılmalıdır.

### Teknik Adımlar
1.  **Reserve-First Approach:** "Önce kontrol et sonra rezerve et" yerine, direkt "Rezerve etmeye çalış" yaklaşımı benimsenmeli.
    *   `InventoryService.ReserveStockAsync` metodu, stok yeterliyse rezerve edip `Success` dönmeli, yetersizse `Failure` dönmeli.
    *   Sipariş handler'ı sadece bu sonuca göre hareket etmeli, önceden "stok var mı?" diye sormamalı.
2.  **Database Lock:** Veritabanı seviyesinde `UPDATE ... WHERE Quantity >= RequestedQuantity` sorgusu ile atomik update sağlanmalı.
3.  **Optimistic Locking:** Stok tablosunda `RowVersion` kolonu kullanılarak eşzamanlı güncellemeler yönetilmeli.

```sql
-- Atomik Update Örneği
UPDATE Inventory 
SET Quantity = Quantity - @Amount 
WHERE ProductId = @Id AND Quantity >= @Amount;
-- Etkilenen satır sayısı 0 ise stok yok demektir.
```

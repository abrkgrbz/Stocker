# İyileştirme 25: Veri ve İşlem Güvenliği (Data & Process Safety)

**İlgili Senaryolar:**
*   Level 9: Mesaj Kuyruğu Zehirlenmesi (Poison Message)
*   Level 10: Özyineli Paket Siparişi (Recursive Loop)
*   Level 10: Fiyat Değişikliği Yarış Durumu

**Öncelik:** Yüksek (P1) - Sistem Kararlılığı

## Sorun
Sistemi sonsuz döngüye sokabilecek veri yapıları (Paket içinde Paket) engellenmemiştir. Hatalı mesajlar kuyruğu tıkayabilir. Fiyat değişiklikleri işlem anında tutarsızlık yaratabilir.

## Çözüm Önerisi
1.  **Cycle Detection:** Ürün/Paket tanımlarında ebeveyn-çocuk ilişkisi kurulurken döngüsel bağımlılık (Graph Cycle Check) kontrolü yapılmalı.
2.  **Dead Letter Queue (DLQ):** 3 kez hata veren mesajlar otomatik olarak DLQ'ya taşınmalı ve operasyon ekibine alarm gönderilmeli.
3.  **Optimistic Concurrency:** Kritik güncellemelerde (Fiyat) `RowVersion` kontrolü yapılmalı. Sipariş anında fiyat snapshot'ı alınmalı.

### Teknik Adımlar
*   **Cycle Checker Service:** Bir ürün pakete eklenirken, paketin o ürünü içerip içermediği (recursive) kontrol edilmeli.
*   **MassTransit Config:** `r.UseMessageRetry(R => R.Interval(3, 1000));` konfigürasyonu.

```csharp
// ProductService.cs
if (await DetectCycleAsync(parentId, childId)) 
{
    throw new ValidationException("Döngüsel paket yapısı oluşturulamaz!");
}
```

# İyileştirme 19: Soft Delete Stratejisi

**İlgili Senaryo:** Kategori Silinmesi, Kullanıcı Silindiğinde Anonimleşmeyen Yorumlar (Level 6)
**Öncelik:** Orta (P2) - Veri Güvenliği

## Sorun
Verilerin fiziksel olarak silinmesi (Hard Delete), ilişkisel bütünlük sorunlarına ve veri kaybına yol açabilir. Ayrıca yanlışlıkla silinen kayıtların geri getirilmesi imkansızlaşır. Kategori silindiğinde ürünlerin veya kullanıcı silindiğinde yorumların durumu belirsizleşebilir.

## Çözüm Önerisi
Tüm kritik entity'lerde (`BaseEntity` zaten destekliyor) `IsDeleted` filtresi (Global Query Filter) aktif edilmeli ve silme işlemleri `Soft Delete` (İşaretleme) olarak yapılmalıdır.

### Teknik Adımlar
1.  **Global Query Filter:** `DbContext` seviyesinde `modelBuilder.Entity<T>().HasQueryFilter(e => !e.IsDeleted)` uygulanmalı.
2.  **Cascade Soft Delete:** Bir Aggregate Root (örn: Sipariş) soft delete olduğunda, child elemanları (OrderItems) da soft delete olmalı.

```csharp
// DbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
    // ... diğer entityler
}
```

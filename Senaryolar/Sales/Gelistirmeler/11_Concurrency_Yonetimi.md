# İyileştirme 11: Concurrency (Eşzamanlılık) Yönetimi

**İlgili Senaryo:** Stok Güncelleme Yarışı, Yönetici ve Kullanıcının Aynı Anda Ürün Bilgisi Güncellemesi (Level 4)
**Öncelik:** Kritik (P0)

## Sorun
Sistemin veritabanı entity'lerinde (`BaseEntity`) `RowVersion` alanı bulunmasına rağmen, bu alan Entity Framework Core konfigürasyonlarında (`IEntityTypeConfiguration`) bir **Concurrency Token** olarak işaretlenmemiştir. Bu nedenle, EF Core iyimser kilitleme (Optimistic Locking) yapmaz ve "Son Yazan Kazanır" (Last-Write-Wins) stratejisini uygular. Bu durum veri kayıplarına ve stok tutarsızlıklarına (Overselling) neden olur.

## Çözüm Önerisi
Kritik entitylerin konfigürasyonlarına `.IsRowVersion()` eklenmeli ve Application katmanında `DbUpdateConcurrencyException` hatası yakalanarak kullanıcıya anlamlı mesajlar verilmelidir.

### Teknik Adımlar
1.  **Configuration Update:** `ProductConfiguration`, `StockConfiguration` ve `SalesOrderConfiguration` dosyalarındaki `RowVersion` property'si güncellenmeli.
2.  **Exception Handling:** Handler'larda `DbUpdateConcurrencyException` yakalanıp, "Veri sizden önce başkası tarafından değiştirildi" hatası dönülmeli.

```csharp
// Entity Configuration
builder.Property(x => x.RowVersion)
    .IsRowVersion()
    .IsConcurrencyToken();

// Handler Logic
try {
    await _unitOfWork.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException) {
    return Result.Failure(Error.Conflict("Concurrency", "Veri güncellenirken bir çakışma oldu. Lütfen sayfayı yenileyip tekrar deneyin."));
}
```

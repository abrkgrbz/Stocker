# İyileştirme 5: Görsel Verisi Taşıma (Image Data)

**İlgili Senaryo:** Ürün Görseli Yüklenemiyor (Level 1)
**Öncelik:** Düşük (P3) - UX İyileştirmesi

## Sorun
`SalesOrderItem` ve `SalesOrderItemDto` nesnelerinde ürünün görseline (Image URL) dair bir bilgi bulunmamaktadır. Frontend, sipariş geçmişini gösterirken her satır için ayrıca ürün detay servisine gitmek zorunda kalır veya hiç görsel gösteremez.

## Çözüm Önerisi
Sipariş oluşturulurken ürünün o anki ana görsel URL'si de (Snapshot mantığıyla) `SalesOrderItem` tablosuna kaydedilmeli veya en azından `SalesOrderItemDto` dönüşünde Product modülünden (Join/Include ile) getirilmelidir.

### Teknik Adımlar
1.  **Şema Değişikliği:** `SalesOrderItem` tablosuna `ThumbnailUrl` kolonu eklenebilir. (Bu, ürün görseli değişse bile siparişte o anki halini saklamayı sağlar).
2.  **DTO Güncellemesi:** `SalesOrderItemDto`'ya `ImageUrl` alanı eklenmeli.
3.  **Mapping:** Handler içerisinde ürün bilgisi çekilirken URL de doldurulmalı.

```csharp
// SalesOrderItemDto.cs
public string? ImageUrl { get; init; }
```

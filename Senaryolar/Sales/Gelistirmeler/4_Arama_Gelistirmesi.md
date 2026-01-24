# İyileştirme 4: Akıllı Arama (Smart Search)

**İlgili Senaryo:** Arama Çubuğu Özel Karakterleri Yoksayıyor (Level 1)
**Öncelik:** Orta (P2)

## Sorun
Mevcut arama mantığı `String.Contains` (SQL `LIKE %term%`) kullanmaktadır. Bu yöntem:
*   Büyük/küçük harf duyarlılığı sorunları yaşatabilir (Collation'a bağlı).
*   "&", "-" gibi özel karakterleri doğru yorumlayamaz.
*   Yazım hatalarını (typo) tolere etmez.

## Çözüm Önerisi
PostgreSQL Full-Text Search veya daha gelişmiş bir arama servisi entegrasyonu.

### Teknik Adımlar
1.  **Full-Text Index:** Veritabanında (PostgreSQL) ürün adı ve açıklama alanları için `tsvector` indexleri oluşturulmalı.
2.  **WebSearchToTsQuery:** Entity Framework Core tarafında `EF.Functions.WebSearchToTsQuery` kullanılarak daha doğal dil araması yapılmalı.
3.  **Normalization:** Arama terimi backend'e geldiğinde normalize edilmeli (örn: "İ" -> "i", "&" -> "ve").

```csharp
// Örnek LINQ değişikliği
query = query.Where(o => EF.Functions.ToTsVector("turkish", o.OrderNumber + " " + o.CustomerName)
    .Matches(EF.Functions.WebSearchToTsQuery("turkish", searchTerm)));
```

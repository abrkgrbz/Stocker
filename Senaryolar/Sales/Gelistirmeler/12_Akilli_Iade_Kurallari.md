# İyileştirme 12: Akıllı İade Kuralları (Smart Return Policy)

**İlgili Senaryo:** Süresi Dolan İade Hakkı ve İş Mantığı Gecikmesi (Level 4)
**Öncelik:** Orta (P2) - UX

## Sorun
Bir siparişin iade edilebilir olup olmadığına dair iş kuralları (örn: 14 veya 30 gün kuralı, siparişin durumu) sadece işlem anında Backend'de kontrol edilmektedir. Frontend'e bu bilgi bir "durum" (state) olarak gönderilmediği için, kullanıcı süresi dolmuş siparişler için bile "İade Et" butonunu aktif görebilmektedir.

## Çözüm Önerisi
Sipariş sorgulamalarında DTO içerisine `ReturnPolicy` ile ilgili hesaplanmış alanlar eklenmelidir.

### Teknik Adımlar
1.  **DTO Update:** `SalesOrderDto` içerisine `IsReturnable`, `ReturnDeadline` ve `ReturnIneligibilityReason` (Neden iade edilemez?) alanları eklenmeli.
2.  **Domain Logic:** `SalesOrder` entity'sinde `CheckReturnEligibility()` metodu yazılarak kurallar merkezileştirilmeli.

```csharp
// SalesOrderDto.cs
public bool IsReturnable { get; init; }
public DateTime? ReturnDeadline { get; init; }
public string? ReturnIneligibilityReason { get; init; } // "İade süresi doldu", "Kargo henüz teslim edilmedi" vb.
```

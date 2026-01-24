# İyileştirme 10: Güvenli İndirim Uygulama (Secure Discount Logic)

**İlgili Senaryo:** İki Farklı İndirim Kuponunu Aynı Anda Uygulamaya Çalışma (Level 3)
**Öncelik:** Yüksek (P1) - Finansal

## Sorun
`CreateSalesOrderCommand`, indirim tutarını (`DiscountAmount`) ve oranını (`DiscountRate`) dışarıdan parametre olarak kabul etmektedir. Kötü niyetli bir kullanıcı, geçerli bir kupon kodu göndermeden direkt olarak bu alanlara değer girip indirim alabilir.

## Çözüm Önerisi
İndirim bilgisi asla Client'tan manuel alınmamalıdır. Client sadece `CouponCode` göndermeli, Backend (CreateSalesOrderHandler) bu kodu doğrulayıp indirimi kendisi hesaplamalıdır.

### Teknik Adımlar
1.  **DTO Değişikliği:** Command içerisinden `DiscountAmount`, `DiscountRate` alanları kaldırılmalı. Yerine `CouponCode` eklenmeli.
2.  **Handler Logic:** Sipariş oluşturulurken `CouponCode` varsa `DiscountService` çağrılmalı ve indirim backend tarafında hesaplanıp siparişe yansıtılmalı.

```csharp
// CreateSalesOrderHandler.cs
if (!string.IsNullOrEmpty(request.CouponCode))
{
    var discountResult = await _discountService.ValidateAsync(request.CouponCode);
    if (discountResult.IsValid) 
    {
        order.ApplyDiscount(discountResult.Amount, discountResult.Rate);
    }
}
```

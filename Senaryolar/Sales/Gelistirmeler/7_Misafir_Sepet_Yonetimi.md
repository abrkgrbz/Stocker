# İyileştirme 7: Misafir Sepet Yönetimi (Redis)

**İlgili Senaryo:** Misafir Kullanıcının Sepeti Cihazda Kalıyor (Level 2)
**Öncelik:** Orta (P2) - Dönüşüm Oranı (Conversion)

## Sorun
Misafir kullanıcılar (Guest Users) için sepet verisi şu an sunucuda tutulmamaktadır (muhtemelen LocalStorage). Bu nedenle kullanıcı telefona geçtiğinde veya tarayıcı değiştirdiğinde sepetini kaybeder.

## Çözüm Önerisi
Misafir sepetleri için Redis üzerinde geçici (TTL'li) bir saklama alanı oluşturulmalı ve kullanıcıya bir `Guest-Session-ID` cooki'si atanmalıdır.

### Teknik Adımlar
1.  **Anonymous ID:** Siteye giren her anonim kullanıcıya (giriş yapmamış) unique bir Guid (GuestId) atanıp HTTP-Only Cookie olarak verilmeli.
2.  **Redis Cart Store:** Sepet işlemleri, veritabanı yerine Redis'te `Cart:{GuestId}` anahtarı altında tutulmalı.
3.  **Merge Strategy:** Kullanıcı giriş yaptığında (Login/Register), Redis'teki misafir sepeti ile veritabanındaki kayıtlı kullanıcı sepeti birleştirilmeli (Merge).

```csharp
// CartService.cs (Pseudo)
public async Task AddItemToCartAsync(Guid? userId, Guid? guestId, CartItem item)
{
    string cartKey = userId.HasValue ? $"Cart:User:{userId}" : $"Cart:Guest:{guestId}";
    await _redisCache.SetAsync(cartKey, item, TimeSpan.FromDays(30));
}
```

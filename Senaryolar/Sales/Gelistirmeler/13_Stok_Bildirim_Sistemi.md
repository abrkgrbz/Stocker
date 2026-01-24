# İyileştirme 13: Stok Bildirim Sistemi (Back-in-Stock Notifications)

**İlgili Senaryo:** Abone Olunan Stok Bildirimi Gönderilmiyor (Level 4)
**Öncelik:** Düşük (P3) - Satış Fırsatı

## Sorun
Kullanıcılar "Gelince Haber Ver" butonuna bastığında bir abonelik kaydı oluşturulsa da, ürün stoğa girdiğinde bu abonelere otomatik e-posta gönderen bir mekanizma (veya olay dinleyici) eksiktir veya çalışmamaktadır.

## Çözüm Önerisi
Domain Event tabanlı bir bildirim akışı kurulmalıdır. `Inventory` modülü stok artışını yayınlamalı (`StockIncreasedEvent`), `Sales` veya `Notification` modülü bunu dinleyip e-posta göndermelidir.

### Teknik Adımlar
1.  **Event Handler:** `StockIncreasedDomainEventHandler` yazılarak `Inventory` modülündeki stok artışları dinlenmeli.
2.  **Notification Service:** Stok artışı olan ürün için `StockSubscription` tablosunda bekleyen kullanıcılar bulunup e-posta kuyruğuna atılmalı.
3.  **Background Job:** E-postalar `Hangfire` veya `MassTransit` üzerinden asenkron olarak gönderilmeli (API'yi yavaşlatmamak için).

```csharp
// StockIncreasedEventHandler.cs
public async Task Handle(StockIncreasedDomainEvent notification, CancellationToken cancellationToken)
{
    // 1. Aboneleri bul
    var subscribers = await _repo.GetSubscribersForProduct(notification.ProductId);
    
    // 2. Bildirim gönder
    foreach (var sub in subscribers) 
    {
        await _emailService.SendStockAlertAsync(sub.Email, notification.ProductName);
    }
}
```

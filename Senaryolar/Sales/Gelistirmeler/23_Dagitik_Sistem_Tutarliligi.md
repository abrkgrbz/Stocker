# İyileştirme 23: Dağıtık Sistem Tutarlılığı (Distributed Consistency)

**İlgili Senaryolar:**
*   Level 8: Satış Modülü ile Envanter Arasında Gecikme
*   Level 9: Depolar Arası Transfer Sırasında Ağ Bölünmesi
*   Level 10: Ödeme Ağ Geçidi Geri Dönüşü (Zombie Orders)

**Öncelik:** Kritik (P0) - Mimari

## Sorun
Modüller arası (Satış -> Envanter -> Ödeme) işlemler asenkron yürütüldüğü için, ağ hatalarında veya servis çökmelerinde veri tutarsız kalmaktadır (Arafta Kalan Stok, Zombi Sipariş).

## Çözüm Önerisi
1.  **Saga Pattern:** Uzun süren işlemler için (Sipariş, Transfer) "Orkestrasyon Bazlı Saga" uygulanmalı. Her adımın bir "Telafi" (Compensate) işlemi olmalı.
2.  **Outbox Pattern:** Veritabanı değişikliği ile Event yayınlama işleminin atomik olması sağlanmalı.
3.  **State Machine:** Sipariş ve Transfer gibi varlıklar, durum geçişlerini katı bir State Machine (Stateless kütüphanesi vb.) ile yönetmeli.

### Teknik Adımlar
*   **MassTransit State Machine:** Sipariş sürecini yöneten bir Saga State Machine tasarlanmalı.
*   **Compensating Actions:** `InventoryService.ReleaseReservation` gibi metodlar, sipariş iptalinde veya ödeme hatasında otomatik çağrılmalı.

```csharp
// OrderStateMachine.cs
Event(() => OrderSubmit, x => x.CorrelateById(c => c.Message.OrderId));
During(Submitted,
    When(PaymentFailed)
        .Then(context => context.Publish(new ReleaseStockCommand(context.Message.OrderId)))
        .TransitionTo(Cancelled)
);
```

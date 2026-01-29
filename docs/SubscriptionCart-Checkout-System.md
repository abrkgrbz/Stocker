# Subscription Cart & Checkout Sistemi

Bu doküman, Stocker SaaS platformunun abonelik sepeti ve ödeme sisteminin teknik detaylarını içerir.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mimari Yapı](#mimari-yapı)
3. [Domain Modelleri](#domain-modelleri)
4. [API Endpoints](#api-endpoints)
5. [Checkout Flow](#checkout-flow)
6. [Iyzico Entegrasyonu](#iyzico-entegrasyonu)
7. [Feature Unlocking Mekanizması](#feature-unlocking-mekanizması)
8. [Domain Events](#domain-events)

---

## Genel Bakış

Sistem, tenant'ların modül, paket, eklenti ve diğer abonelik öğelerini sepete ekleyip satın almasını sağlar. Ödeme işlemi Iyzico üzerinden gerçekleştirilir ve başarılı ödeme sonrası satın alınan özellikler otomatik olarak aktifleştirilir.

### Temel Akış

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sepet      │ ──► │  Checkout   │ ──► │  Ödeme      │ ──► │  Aktivasyon │
│  Oluştur    │     │  Başlat     │     │  (Iyzico)   │     │  (Unlock)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
   CartDto           OrderDto +          Callback            Subscription
                   CheckoutForm          Handler              Activated
```

---

## Mimari Yapı

### Katmanlar

```
┌────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
│  SubscriptionCartController.cs                                  │
│  - 14 REST endpoint                                             │
│  - Request validation                                           │
│  - Response mapping                                             │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    Application Layer                            │
│  Commands:                      │  Queries:                     │
│  - CreateCartCommand            │  - GetCartQuery               │
│  - AddModuleToCartCommand       │  - GetOrderQuery              │
│  - AddBundleToCartCommand       │                               │
│  - AddAddOnToCartCommand        │  DTOs:                        │
│  - AddStoragePlanToCartCommand  │  - CartDto                    │
│  - AddUsersToCartCommand        │  - CartItemDto                │
│  - UpdateItemQuantityCommand    │  - OrderDto                   │
│  - RemoveItemFromCartCommand    │  - OrderItemDto               │
│  - ClearCartCommand             │  - CheckoutInitResponse       │
│  - InitiateCheckoutCommand      │  - BillingAddressDto          │
│  - ProcessPaymentCallbackCommand│                               │
│  - CompleteCheckoutCommand      │                               │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      Domain Layer                               │
│  Entities:                      │  Enums:                       │
│  - SubscriptionCart             │  - CartStatus                 │
│  - SubscriptionCartItem         │  - CartItemType               │
│  - SubscriptionOrder            │  - OrderStatus                │
│  - SubscriptionOrderItem        │  - PaymentMethod              │
│  - Subscription                 │  - BillingCycle               │
│  - SubscriptionModule           │                               │
│  - SubscriptionAddOn            │  Events:                      │
│                                 │  - SubscriptionActivatedEvent │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                           │
│  - IMasterDbContext                                             │
│  - IIyzicoService                                               │
│  - EF Configurations                                            │
└────────────────────────────────────────────────────────────────┘
```

---

## Domain Modelleri

### SubscriptionCart (Sepet)

```csharp
public sealed class SubscriptionCart : AggregateRoot
{
    public Guid TenantId { get; }              // Sepet sahibi tenant
    public Guid? UserId { get; }               // İşlemi yapan kullanıcı
    public CartStatus Status { get; }          // Active, CheckingOut, Completed, Abandoned, Expired
    public BillingCycle BillingCycle { get; }  // Aylik, Yillik
    public string Currency { get; }            // TRY, USD, EUR

    // Fiyatlandırma
    public Money SubTotal { get; }             // Ara toplam
    public Money DiscountTotal { get; }        // İndirim toplamı
    public Money Total { get; }                // Genel toplam

    // Kupon
    public string? CouponCode { get; }
    public decimal DiscountPercent { get; }

    // Zaman damgaları
    public DateTime CreatedAt { get; }
    public DateTime? ExpiresAt { get; }        // 24 saat sonra

    // Öğeler
    public IReadOnlyList<SubscriptionCartItem> Items { get; }
}
```

**Durumlar (CartStatus):**
| Durum | Açıklama |
|-------|----------|
| `Active` | Sepet aktif, öğe eklenebilir |
| `CheckingOut` | Ödeme sürecinde |
| `Completed` | Ödeme tamamlandı |
| `Abandoned` | Kullanıcı terk etti |
| `Expired` | 24 saat geçti, sepet süresi doldu |

### SubscriptionCartItem (Sepet Öğesi)

```csharp
public sealed class SubscriptionCartItem : Entity
{
    public CartItemType ItemType { get; }      // Module, Bundle, AddOn, StoragePlan, Users
    public Guid ItemId { get; }                // Referans ID
    public string ItemCode { get; }            // Ürün kodu (INV, SALES, vb.)
    public string ItemName { get; }            // Görüntüleme adı

    // Fiyatlandırma
    public Money UnitPrice { get; }
    public int Quantity { get; }
    public Money LineTotal { get; }            // UnitPrice * Quantity

    // Öğeye özel metadata
    public int? TrialDays { get; }             // Deneme süresi
    public decimal? DiscountPercent { get; }   // Öğe indirimi
    public List<string>? IncludedModuleCodes { get; }  // Bundle için
    public string? RequiredModuleCode { get; }         // AddOn bağımlılığı
    public int? StorageGB { get; }             // Depolama planı için
}
```

**Öğe Türleri (CartItemType):**
| Tür | Açıklama | Örnek |
|-----|----------|-------|
| `Module` | Tek modül | Envanter, Satış, Finans |
| `Bundle` | Modül paketi | Starter Pack (3 modül) |
| `AddOn` | Eklenti | SMS Paketi, E-Fatura |
| `StoragePlan` | Depolama planı | 100GB, 500GB |
| `Users` | Kullanıcı kotası | +10 kullanıcı |

### SubscriptionOrder (Sipariş)

```csharp
public sealed class SubscriptionOrder : AggregateRoot
{
    public string OrderNumber { get; }         // ORD-20260129-A1B2C3D4
    public Guid TenantId { get; }
    public Guid CartId { get; }
    public Guid? SubscriptionId { get; }       // Aktivasyon sonrası
    public OrderStatus Status { get; }

    // Ödeme bilgileri
    public PaymentMethodEnum? PaymentMethod { get; }
    public string? PaymentProviderOrderId { get; }
    public string? PaymentProviderToken { get; }
    public DateTime? PaymentInitiatedAt { get; }
    public DateTime? PaymentCompletedAt { get; }
    public string? PaymentFailureReason { get; }

    // Fatura adresi
    public string? BillingName { get; }
    public string? BillingAddress { get; }
    public string? BillingCity { get; }
    public string? TaxId { get; }
}
```

**Sipariş Durumları (OrderStatus):**
| Durum | Açıklama |
|-------|----------|
| `Pending` | Ödeme bekleniyor |
| `PaymentProcessing` | Ödeme işleniyor |
| `PaymentCompleted` | Ödeme alındı |
| `PaymentFailed` | Ödeme başarısız |
| `Activating` | Özellikler aktifleştiriliyor |
| `Completed` | Sipariş tamamlandı |
| `Cancelled` | İptal edildi |
| `RefundRequested` | İade talep edildi |
| `Refunded` | İade yapıldı |

---

## API Endpoints

### Base URL
```
/api/tenant/cart
```

### 1. Sepet Yönetimi

#### GET /api/tenant/cart
**Açıklama:** Mevcut aktif sepeti getirir.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "tenantId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "Active",
    "statusDisplay": "Aktif",
    "billingCycle": "Aylik",
    "billingCycleDisplay": "Aylık",
    "subTotal": 1500.00,
    "discountTotal": 150.00,
    "total": 1350.00,
    "currency": "TRY",
    "couponCode": "WELCOME10",
    "discountPercent": 10,
    "itemCount": 3,
    "createdAt": "2026-01-29T10:00:00Z",
    "expiresAt": "2026-01-30T10:00:00Z",
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "itemType": "Module",
        "itemTypeDisplay": "Modül",
        "itemCode": "INV",
        "itemName": "Envanter Modülü",
        "unitPrice": 500.00,
        "quantity": 1,
        "lineTotal": 500.00,
        "currency": "TRY"
      }
    ]
  }
}
```

**Error (404 Not Found):**
```json
{
  "type": "https://datatracker.ietf.org/doc/html/rfc7231",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Aktif sepet bulunamadı.",
  "errorCode": "Sepet.Bulunamadi"
}
```

---

#### POST /api/tenant/cart
**Açıklama:** Yeni sepet oluşturur.

**Request Body:**
```json
{
  "billingCycle": "Aylik",  // Aylik | Yillik
  "currency": "TRY"         // TRY | USD | EUR
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "Active",
    "billingCycle": "Aylik",
    "total": 0,
    "currency": "TRY",
    "itemCount": 0,
    "items": []
  }
}
```

---

### 2. Sepete Öğe Ekleme

#### POST /api/tenant/cart/modules
**Açıklama:** Sepete modül ekler.

**Request Body:**
```json
{
  "moduleCode": "INV"  // Modül kodu
}
```

**Response (200 OK):** Güncellenmiş CartDto

**Errors:**
- `404` - Modül bulunamadı
- `400` - Modül zaten sepette

---

#### POST /api/tenant/cart/bundles
**Açıklama:** Sepete paket ekler.

**Request Body:**
```json
{
  "bundleCode": "STARTER"  // Paket kodu
}
```

**Response (200 OK):** Güncellenmiş CartDto

---

#### POST /api/tenant/cart/addons
**Açıklama:** Sepete eklenti ekler.

**Request Body:**
```json
{
  "addOnCode": "SMS_PACK",
  "quantity": 1
}
```

**Response (200 OK):** Güncellenmiş CartDto

**Errors:**
- `404` - Eklenti bulunamadı
- `400` - Gerekli modül sepette değil

---

#### POST /api/tenant/cart/storage
**Açıklama:** Sepete depolama planı ekler.

**Request Body:**
```json
{
  "planCode": "STORAGE_100GB"
}
```

---

#### POST /api/tenant/cart/users
**Açıklama:** Sepete kullanıcı kotası ekler.

**Request Body:**
```json
{
  "tierCode": "USER_TIER_1",
  "userCount": 10
}
```

---

### 3. Sepet Öğesi Yönetimi

#### PUT /api/tenant/cart/items/{itemId}/quantity
**Açıklama:** Öğe miktarını günceller.

**Request Body:**
```json
{
  "quantity": 5
}
```

**Errors:**
- `400` - Miktar 0 veya negatif olamaz
- `404` - Öğe bulunamadı

---

#### DELETE /api/tenant/cart/items/{itemId}
**Açıklama:** Sepetten öğe kaldırır.

**Response (200 OK):** Güncellenmiş CartDto

---

#### DELETE /api/tenant/cart
**Açıklama:** Tüm sepeti temizler.

**Response (204 No Content)**

---

### 4. Checkout (Ödeme)

#### POST /api/tenant/cart/checkout
**Açıklama:** Ödeme sürecini başlatır, Iyzico checkout formu oluşturur.

**Request Body:**
```json
{
  "billingAddress": {
    "name": "Acme Ltd.",
    "address": "Atatürk Cad. No:123",
    "city": "İstanbul",
    "country": "Türkiye",
    "zipCode": "34000",
    "taxId": "1234567890"
  },
  "callbackUrl": "https://app.stocker.com/billing/callback"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20260129-A1B2C3D4",
    "total": 1350.00,
    "currency": "TRY",
    "checkoutFormContent": "<div id=\"iyzipay-checkout-form\">...</div>",
    "checkoutPageUrl": "https://www.iyzipay.com/checkout/...",
    "paymentToken": "abc123xyz..."
  }
}
```

**Kullanım:**
```html
<!-- Frontend'de Iyzico checkout formunu render et -->
<div id="payment-container"></div>
<script>
  document.getElementById('payment-container').innerHTML = response.checkoutFormContent;
</script>
```

**Errors:**
- `404` - Sepet bulunamadı
- `400` - Sepet boş
- `400` - Sepet süresi dolmuş
- `500` - Ödeme formu oluşturulamadı

---

#### POST /api/tenant/cart/orders/{orderId}/callback
**Açıklama:** Iyzico ödeme sonucunu işler. (AllowAnonymous - Iyzico tarafından çağrılır)

**Request (Form Data):**
```
token=abc123xyz...
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20260129-A1B2C3D4",
    "redirectUrl": "/billing/orders/3fa85f64.../status=success"
  }
}
```

**Failed Payment Response:**
```json
{
  "success": true,
  "data": {
    "success": false,
    "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20260129-A1B2C3D4",
    "errorMessage": "Kart limiti yetersiz",
    "redirectUrl": "/billing/orders/3fa85f64.../status=failed"
  }
}
```

---

#### POST /api/tenant/cart/orders/{orderId}/complete
**Açıklama:** Ödeme tamamlandıktan sonra özellikleri aktifleştirir.

**Request Body (Opsiyonel):**
```json
{
  "paymentProviderTransactionId": "12345678"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "orderNumber": "ORD-20260129-A1B2C3D4",
    "status": "Completed",
    "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "items": [
      {
        "itemCode": "INV",
        "itemName": "Envanter Modülü",
        "isActivated": true,
        "activatedAt": "2026-01-29T10:05:00Z"
      }
    ]
  }
}
```

---

#### GET /api/tenant/cart/orders/{orderId}
**Açıklama:** Sipariş detaylarını getirir.

**Response (200 OK):** OrderDto

---

## Checkout Flow

### Sequence Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │     │   API    │     │ Handler  │     │  Iyzico  │     │ Database │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │                │
     │ POST /checkout │                │                │                │
     │───────────────►│                │                │                │
     │                │ InitiateCheckoutCommand         │                │
     │                │───────────────►│                │                │
     │                │                │ Get Cart       │                │
     │                │                │───────────────────────────────►│
     │                │                │◄───────────────────────────────│
     │                │                │                │                │
     │                │                │ Create Order   │                │
     │                │                │───────────────────────────────►│
     │                │                │◄───────────────────────────────│
     │                │                │                │                │
     │                │                │ CreateCheckoutForm              │
     │                │                │───────────────►│                │
     │                │                │◄───────────────│                │
     │                │                │                │                │
     │                │◄───────────────│                │                │
     │◄───────────────│                │                │                │
     │                │                │                │                │
     │ Render Form    │                │                │                │
     │────────────────────────────────────────────────►│                │
     │                │                │                │                │
     │ User Pays      │                │                │                │
     │────────────────────────────────────────────────►│                │
     │                │                │                │                │
     │                │ POST /callback (token)          │                │
     │                │◄────────────────────────────────│                │
     │                │ ProcessPaymentCallback          │                │
     │                │───────────────►│                │                │
     │                │                │ GetCheckoutFormResult           │
     │                │                │───────────────►│                │
     │                │                │◄───────────────│                │
     │                │                │                │                │
     │                │                │ Update Order   │                │
     │                │                │───────────────────────────────►│
     │                │◄───────────────│                │                │
     │◄───────────────│ Redirect URL   │                │                │
     │                │                │                │                │
     │ POST /complete │                │                │                │
     │───────────────►│                │                │                │
     │                │ CompleteCheckoutCommand         │                │
     │                │───────────────►│                │                │
     │                │                │ Activate Features               │
     │                │                │───────────────────────────────►│
     │                │                │                │                │
     │                │                │ Publish Event  │                │
     │                │◄───────────────│                │                │
     │◄───────────────│                │                │                │
     │                │                │                │                │
```

### Durum Akışı

```
Cart: Active ──► CheckingOut ──► Completed
                     │
                     └──► Abandoned (hata durumunda)

Order: Pending ──► PaymentProcessing ──► PaymentCompleted ──► Activating ──► Completed
                          │
                          └──► PaymentFailed
```

---

## Iyzico Entegrasyonu

### Konfigürasyon

```json
// appsettings.json
{
  "Iyzico": {
    "ApiKey": "sandbox-xxx",
    "SecretKey": "sandbox-yyy",
    "BaseUrl": "https://sandbox-api.iyzipay.com"
  }
}
```

### Checkout Request Oluşturma

```csharp
var iyzicoRequest = new IyzicoCheckoutRequest
{
    TenantId = tenantId,
    CustomerEmail = tenant.ContactEmail.Value,
    CustomerName = billingAddress.Name,
    Price = order.Total.Amount,
    Currency = order.Total.Currency,
    BasketId = order.OrderNumber,
    PaymentGroup = "SUBSCRIPTION",
    CallbackUrl = $"/api/tenant/cart/orders/{order.Id}/callback",
    BillingAddress = new IyzicoAddress
    {
        ContactName = billingAddress.Name,
        City = billingAddress.City,
        Country = billingAddress.Country,
        Address = billingAddress.Address,
        ZipCode = billingAddress.ZipCode
    },
    BasketItems = cart.Items.Select(item => new IyzicoBasketItem
    {
        Id = item.Id.ToString(),
        Name = item.ItemName,
        Category1 = item.ItemType.ToString(),
        ItemType = "VIRTUAL",
        Price = item.LineTotal.Amount
    }).ToList(),
    EnableInstallment = true,
    Enable3DSecure = true
};
```

### Ödeme Sonucu Doğrulama

```csharp
// Callback handler'da
var paymentResult = await _iyzicoService.GetCheckoutFormResultAsync(token);

if (paymentResult.Value.IsSuccess)
{
    order.CompletePayment();
    // Başarılı - aktivasyona devam
}
else
{
    order.FailPayment(paymentResult.Value.ErrorMessage);
    // Başarısız - hata sayfasına yönlendir
}
```

---

## Feature Unlocking Mekanizması

### Aktivasyon Süreci

Ödeme tamamlandıktan sonra `CompleteCheckoutCommand` handler'ı çalışır:

```csharp
public async Task<Result<OrderDto>> Handle(CompleteCheckoutCommand request, ...)
{
    // 1. Siparişi getir
    var order = await _context.SubscriptionOrders
        .Include(o => o.Items)
        .FirstOrDefaultAsync(o => o.Id == request.OrderId);

    // 2. Ödeme durumunu doğrula
    if (order.Status != OrderStatus.PaymentProcessing &&
        order.Status != OrderStatus.PaymentCompleted)
    {
        return Result.Failure("Geçersiz sipariş durumu");
    }

    // 3. Ödemeyi tamamla
    if (order.Status == OrderStatus.PaymentProcessing)
    {
        order.CompletePayment();
    }

    // 4. Aktivasyon başlat
    order.StartActivation();

    // 5. Abonelik al veya oluştur
    var subscription = await GetOrCreateSubscriptionAsync(order);

    // 6. Her öğeyi aktifleştir
    foreach (var item in order.Items)
    {
        await ActivateOrderItemAsync(subscription, item);
        item.MarkAsActivated();
    }

    // 7. Siparişi tamamla
    order.Complete(subscription.Id);

    // 8. Event yayınla
    await _publisher.Publish(new SubscriptionActivatedEvent { ... });

    return Result.Success(CartMapper.MapToDto(order));
}
```

### Aktivasyon Türleri

#### Modül Aktivasyonu
```csharp
private Task ActivateModuleAsync(Subscription subscription, SubscriptionOrderItem item)
{
    if (!subscription.Modules.Any(m => m.ModuleCode == item.ItemCode))
    {
        subscription.AddModule(item.ItemCode, item.ItemName);
    }
    return Task.CompletedTask;
}
```

#### Bundle Aktivasyonu
```csharp
private Task ActivateBundleAsync(Subscription subscription, SubscriptionOrderItem item)
{
    var moduleCodes = item.IncludedModuleCodes ?? new List<string>();
    foreach (var moduleCode in moduleCodes)
    {
        if (!subscription.Modules.Any(m => m.ModuleCode == moduleCode))
        {
            subscription.AddModule(moduleCode, moduleCode);
        }
    }
    return Task.CompletedTask;
}
```

#### AddOn Aktivasyonu
```csharp
private async Task ActivateAddOnAsync(Subscription subscription, SubscriptionOrderItem item)
{
    var addOn = await _context.AddOns
        .FirstOrDefaultAsync(a => a.Code == item.ItemCode);

    if (addOn != null)
    {
        var subscriptionAddOn = new SubscriptionAddOn(
            subscription.Id,
            addOn.Id,
            addOn.Code,
            addOn.Name,
            item.UnitPrice,
            item.Quantity);

        _context.SubscriptionAddOns.Add(subscriptionAddOn);
    }
}
```

#### Storage Plan Aktivasyonu
```csharp
private Task ActivateStoragePlanAsync(Subscription subscription, SubscriptionOrderItem item)
{
    if (item.StorageGB.HasValue)
    {
        var bucketName = $"tenant-{subscription.TenantId:N}";
        subscription.SetStorageBucket(bucketName, item.StorageGB.Value);
    }
    return Task.CompletedTask;
}
```

#### Users Aktivasyonu
```csharp
private Task ActivateUsersAsync(Subscription subscription, SubscriptionOrderItem item)
{
    subscription.UpdateUserCount(item.Quantity);
    return Task.CompletedTask;
}
```

---

## Domain Events

### SubscriptionActivatedEvent

Abonelik aktivasyonu tamamlandığında yayınlanır:

```csharp
public sealed record SubscriptionActivatedEvent : IDomainEvent
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public DateTime OccurredOnUtc { get; init; } = DateTime.UtcNow;
    public Guid SubscriptionId { get; init; }
    public Guid TenantId { get; init; }
    public Guid OrderId { get; init; }
    public string OrderNumber { get; init; }
    public List<ActivatedFeature> ActivatedFeatures { get; init; }
}

public record ActivatedFeature
{
    public string FeatureType { get; init; }  // Module, Bundle, AddOn, etc.
    public string Code { get; init; }
    public string Name { get; init; }
    public int Quantity { get; init; }
}
```

### Event Handler Örneği

```csharp
public class SubscriptionActivatedEventHandler
    : INotificationHandler<SubscriptionActivatedEvent>
{
    private readonly INotificationService _notificationService;
    private readonly IAuditLogService _auditLog;

    public async Task Handle(SubscriptionActivatedEvent notification, CancellationToken ct)
    {
        // 1. Kullanıcıya bildirim gönder
        await _notificationService.SendAsync(new NotificationRequest
        {
            TenantId = notification.TenantId,
            Title = "Aboneliğiniz Aktifleştirildi",
            Message = $"Sipariş #{notification.OrderNumber} başarıyla tamamlandı."
        });

        // 2. Audit log kaydet
        await _auditLog.LogAsync(new AuditEntry
        {
            TenantId = notification.TenantId,
            Action = "SubscriptionActivated",
            Details = $"Aktifleştirilen özellikler: {string.Join(", ",
                notification.ActivatedFeatures.Select(f => f.Code))}"
        });

        // 3. Analytics'e gönder
        // ...
    }
}
```

---

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `Sepet.Bulunamadi` | Aktif sepet bulunamadı |
| `Sepet.Bos` | Sepet boş, checkout yapılamaz |
| `Sepet.SuresiDolmus` | 24 saat geçti, sepet expired |
| `Sepet.OgeBulunamadi` | Sepet öğesi bulunamadı |
| `Sepet.ModulZatenVar` | Modül zaten sepette |
| `Sepet.GecersizMiktar` | Miktar 0 veya negatif |
| `Modul.Bulunamadi` | Modül kodu geçersiz |
| `Paket.Bulunamadi` | Bundle kodu geçersiz |
| `Eklenti.Bulunamadi` | AddOn kodu geçersiz |
| `Eklenti.GerekliModulYok` | AddOn için gerekli modül yok |
| `DepolamaPlan.Bulunamadi` | Storage plan kodu geçersiz |
| `KullaniciTier.Bulunamadi` | User tier kodu geçersiz |
| `Tenant.Bulunamadi` | Tenant bulunamadı |
| `Siparis.Bulunamadi` | Sipariş bulunamadı |
| `Siparis.GecersizDurum` | Sipariş durumu işleme uygun değil |
| `Odeme.FormOlusturulamadi` | Iyzico checkout formu oluşturulamadı |
| `Odeme.GecersizToken` | Geçersiz ödeme token'ı |
| `Odeme.BaslatilamadiHata` | Ödeme başlatma hatası |
| `Odeme.TamamlanamadiHata` | Ödeme tamamlama hatası |
| `Odeme.CallbackHatasi` | Callback işleme hatası |

---

## Güvenlik Notları

1. **Tenant İzolasyonu:** Tüm işlemler `TenantId` ile filtrelenir
2. **Token Doğrulama:** Callback'de Iyzico token'ı siparişle eşleştirilir
3. **HTTPS:** Tüm ödeme iletişimi HTTPS üzerinden
4. **3D Secure:** Tüm ödemelerde 3D Secure aktif
5. **Rate Limiting:** API endpoint'lerinde rate limit uygulanmalı

---

## Performans Önerileri

1. **Sepet Caching:** Aktif sepetler Redis'te cache'lenebilir
2. **Eager Loading:** Include ile gerekli ilişkiler önceden yüklenir
3. **Async Operations:** Tüm I/O işlemleri async
4. **Background Jobs:** Ağır aktivasyon işlemleri background'da yapılabilir

---

*Son güncelleme: 29 Ocak 2026*

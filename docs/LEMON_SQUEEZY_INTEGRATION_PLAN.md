# Lemon Squeezy Entegrasyon Planı

## Genel Bakış

Stocker SaaS platformu için Lemon Squeezy entegrasyonu. Mevcut Iyzico entegrasyonunun yerine geçecek ve uluslararası ödeme altyapısı sağlayacak.

## Neden Lemon Squeezy?

- **Merchant of Record**: Fatura kesme, KDV/vergi yönetimi Lemon Squeezy tarafından yapılır
- **Şirket gerekmez**: Bireysel olarak kullanılabilir
- **Hızlı onay**: 1-2 gün içinde aktif
- **SaaS odaklı**: Abonelik yönetimi için optimize edilmiş

## Mevcut Yapı Analizi

### Paket Tipleri (PackageType)
```
Trial/Free     → Lemon Squeezy'de oluşturulmayacak (ücretsiz)
Starter        → LS Product: stocker-starter
Professional   → LS Product: stocker-professional
Business       → LS Product: stocker-business
Enterprise     → LS Product: stocker-enterprise
Custom         → Manuel yönetim
```

### Faturalandırma Dönemleri (BillingCycle)
```
Aylik (Monthly)      → LS Variant: monthly
UcAylik (Quarterly)  → LS Variant: quarterly (10% indirim)
AltiAylik (6-month)  → LS Variant: semiannual (15% indirim)
Yillik (Annual)      → LS Variant: annual (20% indirim)
```

### Subscription Status Mapping
```
Mevcut Status          → Lemon Squeezy Status
─────────────────────────────────────────────
Beklemede (-1)         → pending (ödeme bekleniyor)
Deneme (0)             → on_trial
Aktif (1)              → active
OdemesiGecikti (2)     → past_due
Askida (3)             → paused
IptalEdildi (4)        → cancelled
SuresiDoldu (5)        → expired
```

## Lemon Squeezy Ürün Yapısı

### Products (Ürünler)
```yaml
stocker-starter:
  name: "Stocker Starter"
  description: "Küçük işletmeler için temel stok yönetimi"
  variants:
    - monthly: ₺299/ay
    - quarterly: ₺807/3ay (₺269/ay - %10 indirim)
    - semiannual: ₺1,524/6ay (₺254/ay - %15 indirim)
    - annual: ₺2,870/yıl (₺239/ay - %20 indirim)

stocker-professional:
  name: "Stocker Professional"
  description: "Büyüyen işletmeler için gelişmiş özellikler"
  variants:
    - monthly: ₺599/ay
    - quarterly: ₺1,617/3ay
    - semiannual: ₺3,054/6ay
    - annual: ₺5,750/yıl

stocker-business:
  name: "Stocker Business"
  description: "Orta ölçekli işletmeler için tam çözüm"
  variants:
    - monthly: ₺999/ay
    - quarterly: ₺2,697/3ay
    - semiannual: ₺5,094/6ay
    - annual: ₺9,590/yıl

stocker-enterprise:
  name: "Stocker Enterprise"
  description: "Kurumsal müşteriler için özel çözümler"
  variants:
    - monthly: ₺1,999/ay
    - custom: Özel fiyatlandırma
```

## Teknik Entegrasyon

### 1. Backend Değişiklikleri

#### Yeni Entity: LemonSqueezySubscription
```csharp
public class LemonSqueezySubscription
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid SubscriptionId { get; set; }  // Mevcut Subscription FK

    // Lemon Squeezy IDs
    public string LsSubscriptionId { get; set; }
    public string LsCustomerId { get; set; }
    public string LsProductId { get; set; }
    public string LsVariantId { get; set; }
    public string LsOrderId { get; set; }

    // Sync fields
    public string Status { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? RenewsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public bool IsPaused { get; set; }

    // Metadata
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? WebhookPayload { get; set; }  // Son webhook verisi
}
```

#### Yeni Service: ILemonSqueezyService
```csharp
public interface ILemonSqueezyService
{
    // Checkout
    Task<CheckoutResult> CreateCheckoutAsync(CreateCheckoutRequest request);
    Task<string> GetCheckoutUrlAsync(Guid tenantId, string variantId);

    // Subscription Management
    Task<SubscriptionInfo> GetSubscriptionAsync(string subscriptionId);
    Task<bool> CancelSubscriptionAsync(string subscriptionId);
    Task<bool> PauseSubscriptionAsync(string subscriptionId);
    Task<bool> ResumeSubscriptionAsync(string subscriptionId);
    Task<bool> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionRequest request);

    // Customer Portal
    Task<string> GetCustomerPortalUrlAsync(string customerId);

    // Webhooks
    Task ProcessWebhookAsync(string payload, string signature);
}
```

### 2. Webhook Handler

```csharp
// POST /api/webhooks/lemonsqueezy
[AllowAnonymous]
public class LemonSqueezyWebhookController : ControllerBase
{
    // Dinlenecek eventler:
    // - subscription_created
    // - subscription_updated
    // - subscription_cancelled
    // - subscription_resumed
    // - subscription_paused
    // - subscription_unpaused
    // - subscription_expired
    // - subscription_payment_failed
    // - subscription_payment_success
    // - subscription_payment_recovered
    // - order_created
    // - order_refunded
}
```

### 3. Frontend Değişiklikleri

#### Checkout Flow
```typescript
// Kullanıcı paket seçer → LS Checkout URL alınır → LS Hosted Checkout'a yönlendirilir
const handleSubscribe = async (variantId: string) => {
  const response = await api.post('/api/billing/checkout', { variantId });
  window.location.href = response.data.checkoutUrl;
};
```

#### Customer Portal
```typescript
// Kullanıcı aboneliğini yönetmek istediğinde
const openBillingPortal = async () => {
  const response = await api.get('/api/billing/portal-url');
  window.open(response.data.portalUrl, '_blank');
};
```

## API Endpoints

### Billing Controller
```
POST   /api/billing/checkout           → Checkout URL oluştur
GET    /api/billing/subscription       → Mevcut abonelik bilgisi
POST   /api/billing/cancel             → Abonelik iptal
POST   /api/billing/pause              → Abonelik duraklat
POST   /api/billing/resume             → Abonelik devam ettir
GET    /api/billing/portal-url         → Customer portal URL
GET    /api/billing/invoices           → Fatura listesi
POST   /api/webhooks/lemonsqueezy      → Webhook handler
```

## Konfigürasyon

### appsettings.json
```json
{
  "LemonSqueezy": {
    "ApiKey": "ls_xxx",
    "StoreId": "xxx",
    "WebhookSecret": "xxx",
    "Products": {
      "Starter": {
        "ProductId": "xxx",
        "Variants": {
          "Monthly": "xxx",
          "Quarterly": "xxx",
          "SemiAnnual": "xxx",
          "Annual": "xxx"
        }
      },
      "Professional": { ... },
      "Business": { ... },
      "Enterprise": { ... }
    }
  }
}
```

## Migration Planı

### Faz 1: Altyapı (1-2 gün)
1. [ ] LemonSqueezySubscription entity oluştur
2. [ ] Migration ekle
3. [ ] ILemonSqueezyService interface ve implementasyonu
4. [ ] Webhook signature validation
5. [ ] Configuration setup

### Faz 2: Core Integration (2-3 gün)
1. [ ] Checkout flow implementasyonu
2. [ ] Webhook handler tüm eventler için
3. [ ] Subscription status sync
4. [ ] Customer portal integration

### Faz 3: Frontend (1-2 gün)
1. [ ] Pricing page güncelleme
2. [ ] Checkout button integration
3. [ ] Billing management page
4. [ ] Invoice görüntüleme

### Faz 4: Test & Deploy (1 gün)
1. [ ] Test mode ile tam test
2. [ ] Webhook test
3. [ ] Production deployment
4. [ ] Mevcut kullanıcılar için migration (gerekirse)

## Lemon Squeezy Dashboard Kurulumu

### 1. Store Oluştur
- https://lemonsqueezy.com adresinde hesap aç
- Store oluştur (örn: "Stocker")
- Tax settings: Türkiye TRY

### 2. Products Oluştur
Her paket için:
1. Product oluştur
2. 4 variant ekle (monthly, quarterly, semiannual, annual)
3. Fiyatları TRY olarak ayarla
4. Subscription type seç

### 3. Webhook Ayarla
- URL: `https://api.stoocker.app/api/webhooks/lemonsqueezy`
- Events: Tüm subscription events
- Secret key kaydet

### 4. API Key Al
- Settings → API → Create API Key
- appsettings.json'a ekle

## Güvenlik Notları

1. **Webhook Signature**: Her webhook'u HMAC-SHA256 ile doğrula
2. **API Key**: Sadece backend'de kullan, frontend'e asla gönderme
3. **Idempotency**: Duplicate webhook'ları handle et
4. **Audit Log**: Tüm ödeme işlemlerini logla

## Mevcut PaymentService ile Entegrasyon

Mevcut `PaymentService` (Iyzico) korunacak ve `ILemonSqueezyService` paralel çalışacak:

```csharp
public interface IPaymentProvider
{
    string ProviderName { get; }
    Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request);
}

// Iyzico - Türkiye için tek seferlik ödemeler
public class IyzicoPaymentProvider : IPaymentProvider { }

// Lemon Squeezy - Global SaaS abonelikler
public class LemonSqueezyPaymentProvider : IPaymentProvider { }
```

## Sonraki Adımlar

1. **Lemon Squeezy hesabı aç** ve store oluştur
2. **Products/Variants** oluştur
3. **Test mode** ile geliştirme yap
4. Entegrasyon tamamlandıktan sonra **production** geçiş

---

Son Güncelleme: 2025-12-28

# Stocker Modül ve Fiyatlandırma Sistemi

Bu dokümantasyon, Stocker ERP için hibrit fiyatlandırma sisteminin teknik detaylarını içerir.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Fiyatlandırma Modeli](#fiyatlandırma-modeli)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Frontend Entegrasyonu](#frontend-entegrasyonu)
5. [Veritabanı Şeması](#veritabanı-şeması)
6. [Konfigürasyon](#konfigürasyon)

---

## Genel Bakış

Stocker fiyatlandırma sistemi **hibrit model** kullanır:

- **Paketler (Packages)**: Önceden tanımlı modül kombinasyonları
- **Modül Bundle'ları**: İndirimli modül paketleri
- **Bireysel Modüller (À la carte)**: Tek tek satın alınabilen modüller
- **Add-on'lar**: Ek özellikler (depolama, API erişimi, entegrasyonlar)
- **Per-User Pricing**: Kullanıcı başı ücretlendirme

### Desteklenen Ödeme Sistemleri

| Sistem | Bölge | Özellikler |
|--------|-------|------------|
| **Iyzico** | Türkiye | Taksit, 3D Secure, Abonelik |
| **LemonSqueezy** | Global | Subscription, Webhook |

---

## Fiyatlandırma Modeli

### Modüller (12 Adet)

| Modül Kodu | Modül Adı | Aylık Fiyat | Yıllık Fiyat | Core |
|------------|-----------|-------------|--------------|------|
| `CMS` | İçerik Yönetimi | ₺0 | ₺0 | ✓ |
| `INVENTORY` | Envanter Yönetimi | ₺199 | ₺1,990 | |
| `SALES` | Satış Yönetimi | ₺249 | ₺2,490 | |
| `PURCHASE` | Satın Alma | ₺179 | ₺1,790 | |
| `FINANCE` | Finans & Muhasebe | ₺299 | ₺2,990 | |
| `HR` | İnsan Kaynakları | ₺199 | ₺1,990 | |
| `CRM` | Müşteri İlişkileri | ₺199 | ₺1,990 | |
| `MANUFACTURING` | Üretim Yönetimi | ₺349 | ₺3,490 | |
| `WAREHOUSE` | Depo Yönetimi | ₺149 | ₺1,490 | |
| `LOGISTICS` | Lojistik | ₺179 | ₺1,790 | |
| `QUALITY` | Kalite Kontrol | ₺149 | ₺1,490 | |
| `REPORTING` | Gelişmiş Raporlama | ₺99 | ₺990 | |

### Bundle'lar (6 Adet)

| Bundle Kodu | Bundle Adı | Dahil Modüller | Aylık | İndirim |
|-------------|------------|----------------|-------|---------|
| `SALES_BUNDLE` | Satış Paketi | Sales, CRM, Finance | ₺599 | %20 |
| `MANUFACTURING_BUNDLE` | Üretim Paketi | Inventory, Manufacturing, Purchase, Quality | ₺699 | %20 |
| `HR_BUNDLE` | İK Paketi | HR, Finance | ₺399 | %20 |
| `FINANCE_BUNDLE` | Finans Paketi | Finance, Reporting | ₺349 | %15 |
| `COMMERCE_BUNDLE` | E-Ticaret Paketi | Inventory, Sales, CRM, Logistics | ₺649 | %20 |
| `FULL_ERP` | Tam ERP Paketi | Tüm modüller | ₺1,499 | %30 |

### Fiyat Hesaplama Kuralları

1. **Yıllık İndirim**: Yıllık ödemede %20 indirim
2. **KDV**: Tüm fiyatlara %20 KDV eklenir
3. **Bundle İndirimi**: Bundle seçildiğinde bireysel fiyatlardan %15-30 indirim
4. **Proration**: Plan değişikliğinde kalan gün hesaplaması

---

## Backend API Endpoints

### Admin API (Master)

Base URL: `/api/master/pricing`

#### Modül Fiyatlandırma

```http
GET /api/master/pricing/modules
```
Tüm modül fiyatlarını listeler.

**Response:**
```json
{
  "modules": [
    {
      "id": "guid",
      "moduleCode": "INVENTORY",
      "moduleName": "Envanter Yönetimi",
      "description": "Stok takibi ve envanter yönetimi",
      "icon": "📦",
      "monthlyPrice": 199,
      "yearlyPrice": 1990,
      "currency": "TRY",
      "isCore": false,
      "trialDays": 14,
      "displayOrder": 1,
      "includedFeatures": ["Stok Takibi", "Barkod Desteği"]
    }
  ]
}
```

---

```http
POST /api/master/pricing/modules
```
Yeni modül fiyatı oluşturur.

**Request Body:**
```json
{
  "moduleCode": "NEW_MODULE",
  "moduleName": "Yeni Modül",
  "description": "Modül açıklaması",
  "icon": "🆕",
  "monthlyPrice": 199,
  "yearlyPrice": 1990,
  "currency": "TRY",
  "isCore": false,
  "trialDays": 14,
  "displayOrder": 10,
  "includedFeatures": ["Feature 1", "Feature 2"]
}
```

---

```http
PUT /api/master/pricing/modules/{moduleCode}
```
Mevcut modül fiyatını günceller.

---

#### Bundle Yönetimi

```http
GET /api/master/pricing/bundles
```
Tüm bundle'ları listeler.

**Response:**
```json
{
  "bundles": [
    {
      "id": "guid",
      "bundleCode": "SALES_BUNDLE",
      "bundleName": "Satış Paketi",
      "description": "Satış ve CRM modüllerini içerir",
      "monthlyPrice": 599,
      "yearlyPrice": 5990,
      "discountPercent": 20,
      "displayOrder": 1,
      "moduleCodes": ["SALES", "CRM", "FINANCE"],
      "originalMonthlyPrice": 747,
      "savingsAmount": 148
    }
  ]
}
```

---

```http
POST /api/master/pricing/bundles
```
Yeni bundle oluşturur.

**Request Body:**
```json
{
  "bundleCode": "CUSTOM_BUNDLE",
  "bundleName": "Özel Paket",
  "description": "Paket açıklaması",
  "monthlyPrice": 499,
  "yearlyPrice": 4990,
  "discountPercent": 15,
  "displayOrder": 5,
  "moduleCodes": ["INVENTORY", "SALES"]
}
```

---

```http
PUT /api/master/pricing/bundles/{bundleCode}
```
Mevcut bundle'ı günceller.

---

```http
DELETE /api/master/pricing/bundles/{bundleCode}
```
Bundle'ı siler (soft delete).

---

#### Add-on Yönetimi

```http
GET /api/master/pricing/addons
```
Tüm add-on'ları listeler.

---

```http
PUT /api/master/pricing/addons/{addOnCode}
```
Add-on fiyatını günceller.

---

#### Fiyat Hesaplama

```http
POST /api/master/pricing/calculate
```
Fiyat önizlemesi hesaplar.

**Request Body:**
```json
{
  "packageId": "guid (optional)",
  "bundleCode": "SALES_BUNDLE (optional)",
  "moduleCodes": ["INVENTORY", "WAREHOUSE"],
  "addOnCodes": ["EXTRA_STORAGE"],
  "userCount": 10,
  "billingCycle": "Aylik"
}
```

**Response:**
```json
{
  "subtotal": 1000,
  "discount": 100,
  "tax": 180,
  "total": 1080,
  "currency": "TRY",
  "billingCycle": "Aylik",
  "lineItems": [
    {
      "code": "INVENTORY",
      "name": "Envanter Yönetimi",
      "type": "Module",
      "unitPrice": 199,
      "quantity": 1,
      "totalPrice": 199
    }
  ]
}
```

---

### Tenant API (Billing)

Base URL: `/api/tenant/billing`

#### Fiyat Bilgileri (Public)

```http
GET /api/tenant/billing/modules
```
Aktif modül fiyatlarını listeler. **AllowAnonymous**

**Response:**
```json
{
  "success": true,
  "modules": [...]
}
```

---

```http
GET /api/tenant/billing/bundles
```
Aktif bundle'ları listeler. **AllowAnonymous**

---

```http
GET /api/tenant/billing/addons?moduleCode=INVENTORY
```
Add-on'ları listeler. Opsiyonel modül filtresi. **AllowAnonymous**

---

```http
GET /api/tenant/billing/pricing
```
Tüm fiyatlandırma bilgisini tek seferde döner. **AllowAnonymous**

**Response:**
```json
{
  "success": true,
  "modules": [...],
  "bundles": [...],
  "addOns": [...]
}
```

---

```http
POST /api/tenant/billing/calculate-price
```
Abonelik fiyatı hesaplar. **AllowAnonymous**

**Request Body:**
```json
{
  "packageId": null,
  "bundleCode": "FULL_ERP",
  "moduleCodes": [],
  "addOnCodes": ["EXTRA_STORAGE"],
  "userCount": 5,
  "billingCycle": "yearly"
}
```

**Response:**
```json
{
  "success": true,
  "subtotal": 17988,
  "discount": 0,
  "tax": 3597.6,
  "total": 21585.6,
  "currency": "TRY",
  "billingCycle": "Yillik",
  "basePackagePrice": 0,
  "modulesPrice": 0,
  "bundlePrice": 17988,
  "addOnsPrice": 0,
  "userPrice": 0,
  "includedUsers": 5,
  "additionalUsers": 0,
  "pricePerAdditionalUser": 29,
  "lineItems": [...]
}
```

---

#### Iyzico Ödeme

```http
POST /api/tenant/billing/iyzico/checkout
```
Iyzico checkout formu oluşturur. **Authorize**

**Request Body:**
```json
{
  "packageId": "guid",
  "customerName": "Ad Soyad",
  "customerPhone": "+905551234567",
  "enableInstallment": true,
  "billingAddress": {
    "contactName": "Ad Soyad",
    "city": "İstanbul",
    "country": "Turkey",
    "address": "Adres detayı",
    "zipCode": "34000"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "checkout-token",
  "checkoutFormContent": "<script>...</script>",
  "paymentPageUrl": "https://...",
  "tokenExpireTime": 1234567890
}
```

---

```http
GET /api/tenant/billing/iyzico/installments?binNumber=123456&price=1000
```
Taksit seçeneklerini döner.

**Response:**
```json
{
  "success": true,
  "binNumber": "123456",
  "cardAssociation": "MASTER_CARD",
  "bankName": "Garanti Bankası",
  "installmentOptions": [
    { "installmentNumber": 1, "totalPrice": 1000, "installmentPrice": 1000 },
    { "installmentNumber": 3, "totalPrice": 1030, "installmentPrice": 343.33 },
    { "installmentNumber": 6, "totalPrice": 1060, "installmentPrice": 176.67 }
  ]
}
```

---

### Webhook Endpoints

```http
POST /api/webhooks/iyzico
```
Iyzico ödeme bildirimleri. **Public**

```http
POST /api/webhooks/lemonsqueezy
```
LemonSqueezy abonelik bildirimleri. **Public**

---

## Frontend Entegrasyonu

### Billing Service

```typescript
import { billingService } from '@/lib/api/services/billing.service';

// Tüm fiyatları getir
const pricing = await billingService.getFullPricing();

// Modülleri getir
const modules = await billingService.getModulePricings();

// Bundle'ları getir
const bundles = await billingService.getModuleBundles();

// Add-on'ları getir
const addOns = await billingService.getAddOns('INVENTORY'); // opsiyonel filtre

// Fiyat hesapla
const price = await billingService.calculatePrice({
  bundleCode: 'SALES_BUNDLE',
  moduleCodes: ['WAREHOUSE'],
  addOnCodes: [],
  userCount: 10,
  billingCycle: 'monthly'
});
```

### TypeScript Tipleri

```typescript
interface ModulePricingItem {
  id: string;
  moduleCode: string;
  moduleName: string;
  description?: string;
  icon?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isCore: boolean;
  trialDays?: number;
  displayOrder: number;
  includedFeatures: string[];
}

interface ModuleBundleItem {
  id: string;
  bundleCode: string;
  bundleName: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  discountPercent: number;
  displayOrder: number;
  moduleCodes: string[];
  originalMonthlyPrice: number;
  savingsAmount: number;
}

interface CalculatePriceRequest {
  packageId?: string;
  bundleCode?: string;
  moduleCodes?: string[];
  addOnCodes?: string[];
  userCount: number;
  billingCycle?: 'monthly' | 'yearly';
}

interface PriceCalculationResponse {
  success: boolean;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  billingCycle: string;
  lineItems: PriceLineItem[];
}
```

### Sayfalar

| Sayfa | Path | Açıklama |
|-------|------|----------|
| Fiyatlandırma | `/account/pricing` | Modül ve bundle seçimi, fiyat hesaplama |
| Billing | `/account/billing` | Abonelik yönetimi, ödeme |
| Iyzico Callback | `/account/billing/iyzico-callback` | 3D Secure dönüş |

---

## Veritabanı Şeması

### Entity'ler

#### ModulePricing

```csharp
public class ModulePricing : AuditableEntity
{
    public string ModuleCode { get; private set; }
    public string ModuleName { get; private set; }
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public Money MonthlyPrice { get; private set; }
    public Money YearlyPrice { get; private set; }
    public bool IsCore { get; private set; }
    public bool IsActive { get; private set; }
    public int? TrialDays { get; private set; }
    public int DisplayOrder { get; private set; }
    public string[] IncludedFeatures { get; private set; }
}
```

#### ModuleBundle

```csharp
public class ModuleBundle : AuditableEntity
{
    public string BundleCode { get; private set; }
    public string BundleName { get; private set; }
    public string? Description { get; private set; }
    public Money MonthlyPrice { get; private set; }
    public Money YearlyPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    public ICollection<ModuleBundleItem> Modules { get; }
}
```

#### IyzicoSubscription

```csharp
public class IyzicoSubscription : AuditableEntity
{
    public Guid TenantId { get; private set; }
    public string IyzicoSubscriptionReferenceCode { get; private set; }
    public string IyzicoCustomerReferenceCode { get; private set; }
    public string Status { get; private set; }
    public string PricingPlanReferenceCode { get; private set; }
    public DateTime? CurrentPeriodStart { get; private set; }
    public DateTime? CurrentPeriodEnd { get; private set; }
}
```

### Migration

```bash
# Migration oluşturma (zaten mevcut)
dotnet ef migrations add AddModulePricingAndIyzicoSupport -c MasterDbContext

# Migration uygulama
dotnet ef database update -c MasterDbContext
```

---

## Konfigürasyon

### appsettings.json

```json
{
  "Iyzico": {
    "ApiKey": "sandbox-xxx",
    "SecretKey": "sandbox-xxx",
    "BaseUrl": "https://sandbox-api.iyzipay.com",
    "MerchantId": "xxx",
    "WebhookSecret": "xxx",
    "CallbackUrl": "https://app.stocker.com/api/webhooks/iyzico"
  },
  "LemonSqueezy": {
    "ApiKey": "xxx",
    "StoreId": "xxx",
    "WebhookSecret": "xxx"
  }
}
```

### Environment Variables

```bash
# Iyzico (Production)
IYZICO_API_KEY=live-xxx
IYZICO_SECRET_KEY=live-xxx
IYZICO_BASE_URL=https://api.iyzipay.com

# LemonSqueezy
LEMONSQUEEZY_API_KEY=xxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxx
```

---

## Akış Diyagramları

### Abonelik Başlatma Akışı

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │   Iyzico    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. GET /pricing   │                   │
       │──────────────────>│                   │
       │                   │                   │
       │ 2. Modül/Bundle   │                   │
       │<──────────────────│                   │
       │                   │                   │
       │ 3. POST /calculate│                   │
       │──────────────────>│                   │
       │                   │                   │
       │ 4. Fiyat hesabı   │                   │
       │<──────────────────│                   │
       │                   │                   │
       │ 5. POST /checkout │                   │
       │──────────────────>│                   │
       │                   │ 6. Create Form   │
       │                   │──────────────────>│
       │                   │                   │
       │                   │ 7. Form Content  │
       │                   │<──────────────────│
       │                   │                   │
       │ 8. Checkout Form  │                   │
       │<──────────────────│                   │
       │                   │                   │
       │ 9. 3D Secure      │                   │
       │───────────────────────────────────────>│
       │                   │                   │
       │                   │ 10. Webhook      │
       │                   │<──────────────────│
       │                   │                   │
       │ 11. Callback      │                   │
       │<──────────────────────────────────────│
       │                   │                   │
```

### Fiyat Hesaplama Akışı

```
1. Kullanıcı modül/bundle seçer
2. Frontend: POST /calculate-price
3. Backend:
   - Bundle seçildiyse → bundle fiyatı
   - Bireysel modüller → modül fiyatları toplamı
   - Add-on'lar → add-on fiyatları
   - Kullanıcı sayısı → ek kullanıcı ücreti
   - Yıllık seçildiyse → %20 indirim
   - KDV hesapla → %20
4. Response: Detaylı fiyat dökümü
```

---

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `PRICING_001` | Modül bulunamadı |
| `PRICING_002` | Bundle bulunamadı |
| `PRICING_003` | Geçersiz billing cycle |
| `PRICING_004` | Fiyat hesaplama hatası |
| `IYZICO_001` | Checkout oluşturma hatası |
| `IYZICO_002` | Ödeme doğrulama hatası |
| `IYZICO_003` | Webhook imza hatası |

---

## Güvenlik

1. **Admin Endpoints**: `RequireAdminRole` policy ile korunur
2. **Tenant Endpoints**: JWT authentication gerektirir
3. **Public Endpoints**: Sadece fiyat görüntüleme (AllowAnonymous)
4. **Webhook**: HMAC imza doğrulaması
5. **Iyzico**: 3D Secure zorunlu

---

## Test

```bash
# Backend build
dotnet build --no-restore

# Frontend type check
cd stocker-nextjs && npx tsc --noEmit

# API test (Swagger)
https://localhost:5001/swagger
```

---

## Versiyon Geçmişi

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.0.0 | 2026-01-29 | İlk sürüm - Hibrit fiyatlandırma, Iyzico entegrasyonu |

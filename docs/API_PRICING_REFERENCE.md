# Stocker Pricing API - Hızlı Referans

## Admin API Endpoints

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| `GET` | `/api/master/pricing/modules` | Tüm modül fiyatlarını listele | Admin |
| `POST` | `/api/master/pricing/modules` | Yeni modül fiyatı oluştur | Admin |
| `PUT` | `/api/master/pricing/modules/{code}` | Modül fiyatını güncelle | Admin |
| `GET` | `/api/master/pricing/bundles` | Tüm bundle'ları listele | Admin |
| `POST` | `/api/master/pricing/bundles` | Yeni bundle oluştur | Admin |
| `PUT` | `/api/master/pricing/bundles/{code}` | Bundle güncelle | Admin |
| `DELETE` | `/api/master/pricing/bundles/{code}` | Bundle sil | Admin |
| `GET` | `/api/master/pricing/addons` | Tüm add-on'ları listele | Admin |
| `PUT` | `/api/master/pricing/addons/{code}` | Add-on güncelle | Admin |
| `POST` | `/api/master/pricing/calculate` | Fiyat hesapla | Admin |

## Tenant API Endpoints

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| `GET` | `/api/tenant/billing/modules` | Modül fiyatları | Public |
| `GET` | `/api/tenant/billing/bundles` | Bundle'lar | Public |
| `GET` | `/api/tenant/billing/addons` | Add-on'lar | Public |
| `GET` | `/api/tenant/billing/pricing` | Tüm fiyatlandırma | Public |
| `POST` | `/api/tenant/billing/calculate-price` | Fiyat hesapla | Public |
| `POST` | `/api/tenant/billing/iyzico/checkout` | Iyzico checkout | Tenant |
| `GET` | `/api/tenant/billing/iyzico/checkout-result` | Checkout sonucu | Tenant |
| `GET` | `/api/tenant/billing/iyzico/installments` | Taksit seçenekleri | Tenant |
| `GET` | `/api/tenant/billing/subscription` | Abonelik bilgisi | Tenant |
| `POST` | `/api/tenant/billing/subscription/cancel` | Abonelik iptal | Tenant |
| `POST` | `/api/tenant/billing/subscription/pause` | Abonelik duraklat | Tenant |
| `POST` | `/api/tenant/billing/subscription/resume` | Abonelik devam | Tenant |

## Webhook Endpoints

| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| `POST` | `/api/webhooks/iyzico` | Iyzico bildirimleri | HMAC |
| `POST` | `/api/webhooks/lemonsqueezy` | LemonSqueezy bildirimleri | HMAC |

---

## Request/Response Örnekleri

### Fiyat Hesaplama

**Request:**
```bash
curl -X POST https://api.stocker.com/api/tenant/billing/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "bundleCode": "SALES_BUNDLE",
    "addOnCodes": ["EXTRA_STORAGE"],
    "userCount": 10,
    "billingCycle": "monthly"
  }'
```

**Response:**
```json
{
  "success": true,
  "subtotal": 648,
  "discount": 0,
  "tax": 129.6,
  "total": 777.6,
  "currency": "TRY",
  "billingCycle": "Aylik",
  "basePackagePrice": 0,
  "modulesPrice": 0,
  "bundlePrice": 599,
  "addOnsPrice": 49,
  "userPrice": 0,
  "includedUsers": 10,
  "additionalUsers": 0,
  "pricePerAdditionalUser": 29,
  "lineItems": [
    {
      "code": "SALES_BUNDLE",
      "name": "Satış Paketi",
      "type": "Bundle",
      "unitPrice": 599,
      "quantity": 1,
      "totalPrice": 599
    },
    {
      "code": "EXTRA_STORAGE",
      "name": "Ek Depolama (50GB)",
      "type": "AddOn",
      "unitPrice": 49,
      "quantity": 1,
      "totalPrice": 49
    }
  ]
}
```

### Iyzico Checkout

**Request:**
```bash
curl -X POST https://api.stocker.com/api/tenant/billing/iyzico/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "packageId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "customerName": "Ahmet Yılmaz",
    "customerPhone": "+905551234567",
    "enableInstallment": true,
    "billingAddress": {
      "contactName": "Ahmet Yılmaz",
      "city": "İstanbul",
      "address": "Levent Mah. No:1",
      "zipCode": "34340"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "checkoutFormContent": "<script src=\"https://...\"></script><div id=\"iyzipay-checkout-form\"></div>",
  "paymentPageUrl": "https://sandbox-cpp.iyzipay.com?token=...",
  "tokenExpireTime": 1706612400000
}
```

### Taksit Sorgulama

**Request:**
```bash
curl "https://api.stocker.com/api/tenant/billing/iyzico/installments?binNumber=554960&price=1000"
```

**Response:**
```json
{
  "success": true,
  "binNumber": "554960",
  "cardAssociation": "MASTER_CARD",
  "cardFamily": "Bonus",
  "bankName": "Garanti Bankası",
  "installmentOptions": [
    { "installmentNumber": 1, "totalPrice": 1000, "installmentPrice": 1000 },
    { "installmentNumber": 2, "totalPrice": 1015, "installmentPrice": 507.5 },
    { "installmentNumber": 3, "totalPrice": 1030, "installmentPrice": 343.33 },
    { "installmentNumber": 6, "totalPrice": 1060, "installmentPrice": 176.67 },
    { "installmentNumber": 9, "totalPrice": 1090, "installmentPrice": 121.11 }
  ]
}
```

---

## HTTP Status Kodları

| Kod | Açıklama |
|-----|----------|
| `200` | Başarılı |
| `201` | Oluşturuldu |
| `400` | Geçersiz istek |
| `401` | Yetkilendirme hatası |
| `403` | Erişim reddedildi |
| `404` | Bulunamadı |
| `409` | Çakışma (duplicate) |
| `500` | Sunucu hatası |

---

## Frontend Kullanımı

```typescript
import { billingService } from '@/lib/api/services/billing.service';

// Tüm fiyatları getir
const { data } = await billingService.getFullPricing();

if (data.success) {
  console.log('Modüller:', data.modules);
  console.log('Bundle\'lar:', data.bundles);
  console.log('Add-on\'lar:', data.addOns);
}

// Fiyat hesapla
const priceResult = await billingService.calculatePrice({
  bundleCode: 'FULL_ERP',
  userCount: 25,
  billingCycle: 'yearly'
});

console.log('Toplam:', priceResult.data.total, priceResult.data.currency);
```

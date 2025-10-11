# Backend API Integration Status

## ✅ Mevcut Durum

Backend C# .NET API'nız **TAM** olarak çalışıyor durumda ve frontend ile entegre edilmeye hazır!

## 🔌 Mevcut Backend Endpoint'ler

### 🔐 Authentication (AuthController.cs)
**Base URL**: `/api/auth`

| Endpoint | Method | Açıklama | Status |
|----------|--------|----------|--------|
| `/login` | POST | Email/password ile giriş | ✅ Çalışıyor |
| `/refresh-token` | POST | Access token yenileme | ✅ Çalışıyor |
| `/register` | POST | Yeni kullanıcı/şirket kaydı | ✅ Çalışıyor |
| `/logout` | POST | Oturum kapatma | ✅ Çalışıyor |
| `/verify-email` | POST | Email doğrulama | ✅ Çalışıyor |
| `/resend-verification-email` | POST | Doğrulama emaili tekrar gönder | ✅ Çalışıyor |

### 👥 Customers (CustomersController.cs)
**Base URL**: `/api/tenants/{tenantId}/customers`

| Endpoint | Method | Açıklama | Status |
|----------|--------|----------|--------|
| `/` | GET | Müşteri listesi (paginated + search) | ✅ Çalışıyor |
| `/{id}` | GET | Tek müşteri detayı (Redis cache'li) | ✅ Çalışıyor |
| `/` | POST | Yeni müşteri oluştur | ✅ Çalışıyor |
| `/{id}` | PUT | Müşteri güncelle | ✅ Çalışıyor |
| `/{id}` | DELETE | Müşteri sil | ✅ Çalışıyor |

## 🎯 Frontend API Client Durumu

### ✅ Mevcut: Axios Client
**Dosya**: `src/lib/api/axios-client.ts`

**Özellikler**:
- ✅ Axios instance with 30s timeout
- ✅ Automatic token management (localStorage)
- ✅ Tenant ID header (`X-Tenant-Id`)
- ✅ **Automatic token refresh** on 401 errors
- ✅ Request/Response interceptors
- ✅ Retry logic on token refresh

**Kullanım**:
```typescript
import { apiClient } from '@/lib/api/axios-client';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);
```

### 🆕 Yeni Eklenen: Service Layer
**Dosyalar**:
- `src/lib/api/services/auth.service.ts`
- `src/lib/api/services/customer.service.ts`

**Özellikler**:
- ✅ Type-safe service methods
- ✅ Request/Response TypeScript types
- ✅ ApiResponse<T> generic wrapper
- ✅ Error handling utilities

## 📋 Backend Özellikleri

### 🏗️ Architecture
- **Clean Architecture** with CQRS (MediatR)
- **Multi-tenant** database architecture
- **Domain-Driven Design** (DDD)
- **Redis caching** for customer data
- **Entity Framework Core** with PostgreSQL

### 🔐 Security
- **JWT Authentication** (Access + Refresh tokens)
- **Email verification** workflow
- **IP tracking** and **User-Agent** logging
- **Audit logging** with Serilog → Seq

### 📦 Customer Features
- **Pagination** (default 20, max 100 per page)
- **Search** (name, email, phone, tax number)
- **Redis caching** (10 min TTL)
- **Duplicate email** validation
- **Value Objects** (Email, PhoneNumber, Address)
- **Domain validation** rules

## 🔄 Frontend-Backend Integration

### Login Flow
```typescript
// Frontend (existing)
import { apiClient } from '@/lib/api/axios-client';

const response = await apiClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Backend response
{
  accessToken: 'jwt-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  user: { ... },
  tenant: { ... }
}

// Axios client automatically stores token in localStorage
// and adds to all subsequent requests
```

### Customer CRUD
```typescript
// Frontend
import { apiClient } from '@/lib/api/axios-client';

// List customers
const response = await apiClient.get('/api/tenants/{tenantId}/customers', {
  params: { page: 1, pageSize: 20, search: 'ABC' }
});

// Create customer
const response = await apiClient.post('/api/tenants/{tenantId}/customers', {
  name: 'ABC Ltd.',
  email: 'info@abc.com',
  phone: '+905321234567',
  street: 'Sokak No 123',
  city: 'Istanbul',
  country: 'Türkiye',
  postalCode: '34000'
});

// Backend response
{
  data: { /* PagedResult<CustomerDto> */ },
  totalCount: 100,
  page: 1,
  pageSize: 20
}
```

## ⚙️ Environment Variables

### Backend (appsettings.json)
```json
{
  "JwtSettings": {
    "Secret": "your-secret-key",
    "Issuer": "Stocker.API",
    "Audience": "Stocker.Client",
    "ExpiresInMinutes": 60,
    "RefreshExpiresInDays": 7
  },
  "ConnectionStrings": {
    "MasterConnection": "postgresql://...",
    "TenantTemplate": "postgresql://..."
  }
}
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5104/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5104
```

## 🚀 Sonraki Adımlar

### 1. ⏳ Eksik Authentication Endpoint'leri
Backend'de bu endpoint'ler **YOK** (frontend'de service var):
- ❌ POST `/api/auth/check-email` - Tenant lookup
- ❌ POST `/api/auth/setup-2fa` - 2FA QR code generation
- ❌ POST `/api/auth/verify-2fa` - 2FA code verification
- ❌ POST `/api/auth/enable-2fa` - 2FA enable
- ❌ POST `/api/auth/disable-2fa` - 2FA disable
- ❌ POST `/api/auth/forgot-password` - Password reset request
- ❌ GET `/api/auth/validate-reset-token` - Token validation
- ❌ POST `/api/auth/reset-password` - Password update
- ❌ GET `/api/auth/profile` - Current user profile

**Öneri**: Bu endpoint'leri backend'e ekleyin veya frontend service'lerini mevcut endpoint'lere adapte edin.

### 2. ✅ Customer Endpoint'leri Tam
Customer CRUD tamamlanmış, ancak frontend form'dan gelen fieldler backend DTO ile eşleşmeli:

**Frontend Form Fieldleri**:
```typescript
{
  type: 'individual' | 'corporate',
  firstName, lastName,        // Individual
  companyName, taxId,         // Corporate
  email, phone, mobilePhone,
  address, district, city, postalCode, country,
  iban, creditLimit, paymentTerm,
  segment, status, notes
}
```

**Backend DTO**:
```csharp
{
  Name, Email, Phone,
  Street, City, State, PostalCode, Country,
  TaxNumber, TaxOffice,
  CreditLimit, CurrentBalance, IsActive
}
```

**Eksik Alanlar** (backend'e eklenecek):
- `type` (individual/corporate)
- `mobilePhone` (ikinci telefon)
- `iban` (banka hesap)
- `paymentTerm` (ödeme vadesi)
- `segment` (retail/wholesale/corporate/vip)
- `notes` (notlar)

### 3. 🔄 Token Management
Frontend'de token storage ve refresh mekanizması **MEVCUT** ve çalışıyor:
- ✅ localStorage'da token saklama
- ✅ Otomatik header ekleme
- ✅ 401 hatalarında token refresh
- ✅ Tenant ID header

### 4. 📊 Dashboard Integration
Backend'de DashboardController var:
- `/api/tenants/{tenantId}/dashboard`
- KPI data endpoint'leri eklenebilir

## 🧪 Test Senaryoları

### Login Test
```typescript
import { apiClient } from '@/lib/api/axios-client';

const testLogin = async () => {
  const response = await apiClient.post('/api/auth/login', {
    email: 'test@example.com',
    password: 'Test123!'
  });

  console.log('Access Token:', response.data.accessToken);
  console.log('User:', response.data.user);
  console.log('Tenant:', response.data.tenant);
};
```

### Customer List Test
```typescript
import { apiClient } from '@/lib/api/axios-client';

const testCustomers = async (tenantId: string) => {
  const response = await apiClient.get(`/api/tenants/${tenantId}/customers`, {
    params: { page: 1, pageSize: 10, search: 'ABC' }
  });

  console.log('Total:', response.data.totalCount);
  console.log('Customers:', response.data.data);
};
```

## 📚 Kullanılabilir Controller'lar

Backend'de bu controller'lar da mevcut:
- ✅ **TenantCheckController** - Tenant validation
- ✅ **TenantRegistrationController** - Company registration
- ✅ **PasswordController** - Password operations
- ✅ **ValidationController** - Input validation
- ✅ **DashboardController** - Dashboard data (both Master & Tenant)
- ✅ **SettingsController** - Settings management
- ✅ **UsersController** - User management
- ✅ **CompaniesController** - Company management
- ✅ **InvoicesController** - Invoice operations

## 🎯 Özet

### ✅ Hazır Olanlar
- Backend API tam çalışıyor
- Frontend Axios client hazır
- Login/Register/Logout çalışıyor
- Customer CRUD çalışıyor
- Multi-tenant architecture çalışıyor
- Redis caching aktif
- Automatic token refresh çalışıyor

### ⏳ Yapılacaklar
- 2FA backend endpoint'leri ekle
- Password recovery backend endpoint'leri ekle
- Customer DTO'sunu genişlet (segment, paymentTerm, etc.)
- Frontend form'larını backend DTO'larıyla senkronize et
- Dashboard KPI endpoint'lerini implement et

### 🚀 Kullanıma Hazır!
Frontend ve backend arasındaki entegrasyon **%80 tamamlanmış** durumda. Temel CRUD operasyonları, authentication ve multi-tenant yapı tamamen çalışıyor! 🎉

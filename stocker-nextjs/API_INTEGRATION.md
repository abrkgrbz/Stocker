# API Integration Guide

Bu doküman Stocker ERP Next.js frontend'inin backend API ile entegrasyonunu açıklar.

## 📦 API Client Yapısı

### Dosya Organizasyonu

```
src/lib/api/
├── client.ts                 # Ana API client (fetch wrapper)
├── types.ts                  # API response/error tipleri
├── services/
│   ├── auth.service.ts       # Authentication endpoints
│   ├── customer.service.ts   # Customer CRUD operations
│   └── index.ts             # Service exports
└── index.ts                  # Main exports
```

## 🔧 API Client Kullanımı

### Temel Kullanım

```typescript
import { apiClient } from '@/lib/api';

// GET request
const response = await apiClient.get('/endpoint', { param1: 'value' });

// POST request
const response = await apiClient.post('/endpoint', { data: 'value' });

// PUT request
const response = await apiClient.put('/endpoint', { data: 'value' });

// DELETE request
const response = await apiClient.delete('/endpoint');
```

### Authentication Token Yönetimi

```typescript
import { apiClient } from '@/lib/api';

// Set token
apiClient.setAuthToken('your-jwt-token');

// Clear token (logout)
apiClient.clearAuthToken();
```

### Error Handling

```typescript
import { apiClient, handleApiError, isApiError, ApiClientError } from '@/lib/api';

try {
  const response = await apiClient.post('/auth/login', credentials);
  // Success handling
} catch (error) {
  if (error instanceof ApiClientError) {
    console.log('Status:', error.statusCode);
    console.log('Error Code:', error.error.code);
    console.log('Message:', error.error.message);
  }

  // Simple error message extraction
  const errorMessage = handleApiError(error);
  message.error(errorMessage);

  // Check specific error type
  if (isApiError(error, 'INVALID_CREDENTIALS')) {
    // Handle invalid credentials
  }
}
```

## 🔐 Authentication Service

### Login Flow

```typescript
import { authService } from '@/lib/api/services';

// 1. Check email and get tenant info
const emailResponse = await authService.checkEmail('user@example.com');
const { tenant, exists } = emailResponse.data;

// 2. Login with password
const loginResponse = await authService.login({
  email: 'user@example.com',
  password: 'password123',
  tenantCode: tenant.code,
  tenantSignature: tenant.signature,
  tenantTimestamp: tenant.timestamp,
});

const { accessToken, refreshToken, requires2FA, user } = loginResponse.data;

// 3. If 2FA required, verify code
if (requires2FA) {
  const verify2FAResponse = await authService.verify2FA({
    email: 'user@example.com',
    code: '123456',
  });
  const { accessToken, refreshToken } = verify2FAResponse.data;
}

// 4. Set token for subsequent requests
apiClient.setAuthToken(accessToken);
```

### 2FA Setup

```typescript
import { authService } from '@/lib/api/services';

// 1. Setup 2FA (get QR code)
const setupResponse = await authService.setup2FA();
const { secret, qrCodeUrl, backupCodes } = setupResponse.data;

// 2. Enable 2FA after user scans QR and enters code
await authService.enable2FA('123456');

// 3. Disable 2FA
await authService.disable2FA('123456');
```

### Password Recovery

```typescript
import { authService } from '@/lib/api/services';

// 1. Request password reset
await authService.forgotPassword('user@example.com');

// 2. Validate reset token
const tokenResponse = await authService.validateResetToken('token-from-email');
const { valid, expiresAt } = tokenResponse.data;

// 3. Reset password
await authService.resetPassword({
  token: 'token-from-email',
  password: 'newPassword123',
});
```

## 👥 Customer Service

### CRUD Operations

```typescript
import { customerService } from '@/lib/api/services';

// 1. Get customers with pagination and filters
const customersResponse = await customerService.getCustomers({
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  type: 'corporate',
  status: 'active',
  search: 'ABC',
});

const { customers, meta } = customersResponse.data;

// 2. Get single customer
const customerResponse = await customerService.getCustomer('customer-id');
const customer = customerResponse.data;

// 3. Create customer
const createResponse = await customerService.createCustomer({
  type: 'corporate',
  companyName: 'ABC Ltd.',
  taxId: '1234567890',
  email: 'info@abc.com',
  phone: '+905321234567',
  // ... other fields
});

// 4. Update customer
const updateResponse = await customerService.updateCustomer('customer-id', {
  status: 'inactive',
  notes: 'Updated notes',
});

// 5. Delete customer
await customerService.deleteCustomer('customer-id');
```

### Advanced Features

```typescript
import { customerService } from '@/lib/api/services';

// Search customers
const searchResponse = await customerService.searchCustomers('ABC');

// Get by tax ID
const taxIdResponse = await customerService.getCustomerByTaxId('1234567890');

// Get statistics
const statsResponse = await customerService.getCustomerStats();
const { total, active, inactive, blocked, bySegment } = statsResponse.data;

// Toggle status
await customerService.toggleCustomerStatus('customer-id', 'blocked');

// Get transactions
const transactionsResponse = await customerService.getCustomerTransactions('customer-id', {
  page: 1,
  limit: 10,
});

// Get balance
const balanceResponse = await customerService.getCustomerBalance('customer-id');
const { balance, creditLimit, availableCredit } = balanceResponse.data;
```

## 🔄 API Response Format

### Success Response

```typescript
{
  success: true,
  data: {
    // Response data
  },
  message: "İşlem başarılı", // Optional
  meta: {                     // Optional (for pagination)
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### Error Response

```typescript
{
  success: false,
  message: "Hata mesajı",
  errors: {                   // Optional (validation errors)
    email: ["Geçerli bir e-posta adresi girin"],
    password: ["Şifre en az 8 karakter olmalıdır"]
  }
}
```

## 🛡️ Error Codes

```typescript
enum ApiErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

## 📝 TypeScript Types

### Authentication Types

```typescript
import type {
  LoginRequest,
  LoginResponse,
  Verify2FARequest,
  Setup2FAResponse,
} from '@/lib/api/services';
```

### Customer Types

```typescript
import type {
  Customer,
  CustomerListResponse,
  CustomerFilters,
} from '@/lib/api/services';
```

### API Types

```typescript
import type {
  ApiResponse,
  ApiError,
  PaginationParams,
  FilterParams,
} from '@/lib/api';
```

## 🔌 Backend API Endpoints

### Authentication

- `POST /api/auth/check-email` - Check email and get tenant
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/verify-2fa` - Verify 2FA code
- `POST /api/auth/setup-2fa` - Setup 2FA
- `POST /api/auth/enable-2fa` - Enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/validate-reset-token` - Validate reset token
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user

### Customers

- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/search` - Search customers
- `GET /api/customers/by-tax-id` - Get by tax ID
- `GET /api/customers/stats` - Get statistics
- `PATCH /api/customers/:id/status` - Update status
- `GET /api/customers/:id/transactions` - Get transactions
- `GET /api/customers/:id/balance` - Get balance

## ⚙️ Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🚀 Next Steps

1. **Backend Implementation**: C# .NET backend API'sini implement edin
2. **Token Storage**: JWT token'ları güvenli bir şekilde saklayın (httpOnly cookies veya secure localStorage)
3. **Refresh Token Logic**: Otomatik token yenileme mekanizması ekleyin
4. **Interceptors**: Request/Response interceptor'ları ekleyin (loading states, error handling)
5. **WebSocket Integration**: SignalR ile gerçek zamanlı güncellemeler için entegre edin

## 📚 Örnek Kullanım Senaryoları

### Login Page Integration

```typescript
// pages/login.tsx
import { authService } from '@/lib/api/services';

const handleLogin = async () => {
  try {
    const response = await authService.login(credentials);

    if (response.data.requires2FA) {
      router.push('/verify-2fa');
    } else {
      // Store token
      localStorage.setItem('accessToken', response.data.accessToken);
      apiClient.setAuthToken(response.data.accessToken);

      // Redirect to dashboard
      router.push('/dashboard');
    }
  } catch (error) {
    message.error(handleApiError(error));
  }
};
```

### Customer Form Integration

```typescript
// features/customers/components/CustomerForm.tsx
import { customerService } from '@/lib/api/services';

const handleSubmit = async (data: CustomerFormData) => {
  try {
    if (customerId) {
      await customerService.updateCustomer(customerId, data);
      message.success('Müşteri güncellendi');
    } else {
      await customerService.createCustomer(data);
      message.success('Müşteri oluşturuldu');
    }
    router.push('/customers');
  } catch (error) {
    message.error(handleApiError(error));
  }
};
```

## 🔍 Testing

```typescript
// Example test
import { authService } from '@/lib/api/services';

describe('AuthService', () => {
  it('should login successfully', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123',
      tenantCode: 'test',
      tenantSignature: 'signature',
      tenantTimestamp: Date.now(),
    });

    expect(response.success).toBe(true);
    expect(response.data.accessToken).toBeDefined();
  });
});
```

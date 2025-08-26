# Authentication API Guide

## İki Auth Controller Farkları

### 1. AuthController (`/api/auth`)
- **Kimler İçin**: Tenant kullanıcıları (normal kullanıcılar)
- **Endpoint**: `/api/auth/login`
- **Kullanım Alanı**: 
  - Tenant dashboard'a giriş
  - Şirket çalışanları
  - Normal kullanıcılar
- **Örnek Kullanım**:
```typescript
import { authApi } from '@/shared/api/auth.api';

// Tenant kullanıcı girişi
const loginTenant = async () => {
  const response = await authApi.login({
    email: 'user@company.com',
    password: 'password123',
    tenantCode: 'company-code' // Opsiyonel
  });
};
```

### 2. MasterAuthController (`/api/master/auth`)
- **Kimler İçin**: System Admin'ler (master yöneticiler)
- **Endpoint**: `/api/master/auth/login`
- **Kullanım Alanı**:
  - Master panel erişimi
  - Sistem yöneticileri
  - Platform sahipleri
- **Örnek Kullanım**:
```typescript
import { masterAuthApi } from '@/shared/api/auth.api';

// Master admin girişi
const loginMaster = async () => {
  const response = await masterAuthApi.login({
    email: 'admin@stoocker.app',
    password: 'admin123'
  });
};
```

## Frontend'te Kullanım

### Login Sayfasında Otomatik Seçim
```typescript
// Login sayfasında domain'e göre otomatik seçim
const handleLogin = async (values: LoginFormValues) => {
  const isMasterDomain = window.location.hostname === 'master.stoocker.app';
  
  if (isMasterDomain || values.email?.endsWith('@stoocker.app')) {
    // Master admin girişi
    await masterAuthApi.login(values);
    navigate('/master');
  } else {
    // Tenant kullanıcı girişi
    await authApi.login(values);
    navigate('/app');
  }
};
```

### Auth Store'da Güncelleme
```typescript
// auth.store.ts
login: async (credentials, isMaster = false) => {
  set({ isLoading: true, error: null });
  try {
    const api = isMaster ? masterAuthApi : authApi;
    const response = await api.login(credentials);
    
    // Token ve user bilgilerini kaydet
    const { accessToken, refreshToken, user } = response.data;
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
    
  } catch (error) {
    set({ error: error.message, isLoading: false });
    throw error;
  }
}
```

## URL Yapısı

### Tenant Login
- URL: `https://company.stoocker.app/login`
- API: `/api/auth/login`
- Dashboard: `/app/dashboard`

### Master Login  
- URL: `https://master.stoocker.app/login` veya `https://stoocker.app/master/login`
- API: `/api/master/auth/login`
- Dashboard: `/master/dashboard`

## Rol Tabanlı Yönlendirme

```typescript
// Login sonrası yönlendirme
const redirectAfterLogin = (user: User) => {
  if (user.roles.includes('SystemAdmin')) {
    return '/master';
  } else if (user.roles.includes('TenantAdmin')) {
    return '/admin';
  } else {
    return '/app';
  }
};
```

## Güvenlik Notları

1. **Master Admin Kontrolü**: MasterAuthController sadece SystemAdmin rolündeki kullanıcıları kabul eder
2. **Tenant İzolasyonu**: AuthController tenant context'inde çalışır
3. **Token Ayrımı**: Her iki sistem de ayrı token yapısı kullanabilir
4. **Cross-Origin**: Master ve tenant farklı subdomain'lerde olabilir, CORS ayarlarına dikkat

## Hata Durumları

### Master Login Hataları
- "Access denied. This endpoint is for system administrators only." - SystemAdmin rolü yok
- "Invalid credentials" - Yanlış kullanıcı adı/şifre

### Tenant Login Hataları
- "Tenant not found" - Tenant kodu yanlış
- "User not found in this tenant" - Kullanıcı bu tenant'ta yok
- "Invalid credentials" - Yanlış kullanıcı adı/şifre
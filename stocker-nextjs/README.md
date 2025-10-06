# Stocker Next.js

Modern stok yönetim sistemi için Next.js 15 tabanlı web uygulaması.

## 🚀 Özellikler

- ✅ **Next.js 15** - App Router ile modern React framework
- ✅ **TypeScript** - Tip güvenli kod geliştirme
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **Ant Design** - Kurumsal UI bileşen kütüphanesi
- ✅ **React Query** - Sunucu state yönetimi
- ✅ **Zustand** - Hafif ve hızlı client state yönetimi
- ✅ **Multi-tenant** - Çoklu kiracı mimarisi
- ✅ **Authentication** - Güvenli kimlik doğrulama sistemi
- ✅ **i18n** - Çoklu dil desteği (TR/EN)
- ✅ **Turbopack** - Hızlı geliştirme deneyimi

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Production sunucusunu başlat
npm start
```

## 🔧 Ortam Değişkenleri

`.env.local` dosyasını oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5104
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TENANT_MODE=subdomain
NEXTAUTH_SECRET=your-secret-key
```

## 🏗️ Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route grubu
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Dashboard route grubu
│   │   ├── dashboard/
│   │   ├── modules/
│   │   └── settings/
│   ├── (master)/          # Master admin route grubu
│   ├── (public)/          # Public route grubu
│   │   ├── pricing/
│   │   └── about/
│   ├── api/               # API routes
│   │   ├── auth/
│   │   └── proxy/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Ana sayfa
│   └── providers.tsx     # Global providers
├── components/            # Paylaşılan bileşenler
├── features/              # Özellik modülleri
│   ├── auth/
│   ├── dashboard/
│   └── modules/
├── lib/                   # Core utilities
│   ├── api/              # API client
│   ├── auth/             # Auth logic
│   └── tenant/           # Multi-tenant
├── hooks/                # Custom hooks
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── middleware.ts         # Next.js middleware
```

## 🔐 Multi-Tenant Yapılandırma

Üç farklı tenant modu desteklenir:

1. **Subdomain Mode**: `tenant1.stocker.com`
2. **Path Mode**: `stocker.com/t/tenant1`
3. **Header Mode**: `X-Tenant-Id` header ile

## 🌐 API Entegrasyonu

Backend API ile entegrasyon:

```typescript
import { ApiService } from '@/lib/api';

// GET request
const data = await ApiService.get<YourType>('/endpoint');

// POST request
await ApiService.post('/endpoint', { data });
```

## 🎨 UI Bileşenleri

Ant Design bileşenleri kullanılmaktadır:

```tsx
import { Button, Card, Form } from 'antd';

export default function MyComponent() {
  return <Button type="primary">Tıkla</Button>;
}
```

## 🔑 Kimlik Doğrulama

Custom auth context ile kullanım:

```tsx
import { useAuth } from '@/lib/auth';

export default function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  // Kullanım...
}
```

## 🏢 Tenant Yönetimi

```tsx
import { useTenant } from '@/lib/tenant';

export default function MyComponent() {
  const { tenant, isLoading, validateTenant } = useTenant();
  // Kullanım...
}
```

## 📚 Daha Fazla Bilgi

- [Next.js Dokümantasyon](https://nextjs.org/docs)
- [Ant Design](https://ant.design/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

## 📄 Lisans

MIT

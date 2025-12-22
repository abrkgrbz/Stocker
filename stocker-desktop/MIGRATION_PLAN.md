# Stocker Electron Migration - Complete Implementation Plan

## Executive Summary

This document outlines the complete migration strategy for converting the Stocker web application (Next.js + .NET API) into a standalone Electron desktop application with local SQLite database.

**Key Decisions:**
- **Frontend**: Preserve existing React/Ant Design UI, remove Next.js SSR dependencies
- **Backend**: Port .NET business logic to TypeScript services in Electron Main Process
- **Database**: SQLite via Prisma ORM (replaces PostgreSQL/EF Core)
- **Communication**: Electron IPC (replaces HTTP/REST)
- **Multi-tenancy**: Removed (single-tenant local app)

---

## 1. Project Structure

```
stocker-desktop/
├── package.json                    # Monorepo root
├── electron.vite.config.ts         # Vite config for Electron
├── tsconfig.json                   # Root TypeScript config
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # SQLite migrations
│   └── seed.ts                     # Initial data seeding
│
├── src/
│   ├── main/                       # Electron Main Process (Node.js)
│   │   ├── index.ts                # Main entry point
│   │   ├── ipc/                    # IPC Handlers
│   │   │   ├── index.ts            # IPC router
│   │   │   ├── inventory.ipc.ts    # Inventory IPC handlers
│   │   │   ├── sales.ipc.ts        # Sales IPC handlers
│   │   │   ├── crm.ipc.ts          # CRM IPC handlers
│   │   │   ├── hr.ipc.ts           # HR IPC handlers
│   │   │   └── auth.ipc.ts         # Auth IPC handlers
│   │   │
│   │   ├── services/               # Business Logic Services
│   │   │   ├── base.service.ts     # Base service with Result pattern
│   │   │   ├── inventory/
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── stock.service.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   └── warehouse.service.ts
│   │   │   ├── sales/
│   │   │   │   ├── sales-order.service.ts
│   │   │   │   ├── invoice.service.ts
│   │   │   │   └── payment.service.ts
│   │   │   ├── crm/
│   │   │   │   ├── customer.service.ts
│   │   │   │   ├── lead.service.ts
│   │   │   │   └── deal.service.ts
│   │   │   └── hr/
│   │   │       ├── employee.service.ts
│   │   │       └── payroll.service.ts
│   │   │
│   │   ├── domain/                 # Domain Models (TypeScript ports)
│   │   │   ├── common/
│   │   │   │   ├── result.ts       # Result<T> pattern
│   │   │   │   ├── error.ts        # Error types
│   │   │   │   └── value-objects/
│   │   │   │       └── money.ts    # Money value object
│   │   │   ├── inventory/
│   │   │   │   ├── product.ts
│   │   │   │   ├── stock.ts
│   │   │   │   └── enums.ts
│   │   │   ├── sales/
│   │   │   │   ├── sales-order.ts
│   │   │   │   ├── invoice.ts
│   │   │   │   └── enums.ts
│   │   │   └── crm/
│   │   │       ├── customer.ts
│   │   │       └── enums.ts
│   │   │
│   │   ├── database/               # Database layer
│   │   │   ├── prisma-client.ts    # Prisma client singleton
│   │   │   └── repositories/       # Repository pattern (optional)
│   │   │
│   │   └── utils/                  # Utilities
│   │       ├── logger.ts           # Logging
│   │       └── backup.ts           # Database backup
│   │
│   ├── preload/                    # Preload Scripts
│   │   ├── index.ts                # Main preload
│   │   └── api.ts                  # Exposed API bridge
│   │
│   └── renderer/                   # React UI (from stocker-nextjs)
│       ├── index.html              # Entry HTML
│       ├── main.tsx                # React entry
│       ├── App.tsx                 # Root component
│       ├── components/             # Migrated from stocker-nextjs
│       ├── features/               # Migrated from stocker-nextjs
│       ├── hooks/                  # Migrated from stocker-nextjs
│       ├── lib/
│       │   ├── api/
│       │   │   ├── api-service.ts  # REFACTORED: IPC-based
│       │   │   └── services/       # Migrated services
│       │   └── ...
│       ├── providers/              # Context providers
│       └── styles/                 # Tailwind + global CSS
│
├── resources/                      # App resources
│   ├── icon.ico                    # Windows icon
│   ├── icon.icns                   # macOS icon
│   └── icon.png                    # Linux icon
│
└── build/                          # Build output
    └── ...
```

---

## 2. Technology Stack

### Main Process (Node.js)
| Dependency | Purpose |
|------------|---------|
| electron | Desktop framework |
| @prisma/client | SQLite ORM |
| prisma | Schema management & migrations |
| electron-store | Local settings storage |
| electron-log | Logging |
| electron-updater | Auto-updates (optional) |

### Renderer Process (Chromium)
| Dependency | Purpose |
|------------|---------|
| react | UI framework (v19) |
| react-dom | DOM rendering |
| antd | UI component library |
| tailwindcss | Utility CSS |
| zustand | State management |
| @tanstack/react-query | Data fetching/caching |
| i18next | Internationalization |
| react-hook-form | Form handling |
| zod | Validation |

### Build Tools
| Dependency | Purpose |
|------------|---------|
| electron-vite | Build tooling |
| electron-builder | Packaging |
| typescript | Type safety |

---

## 3. Migration Phases

### Phase 1: Project Setup (Week 1)
1. Initialize Electron project with electron-vite
2. Set up Prisma with SQLite
3. Create Prisma schema from .NET entities
4. Implement Result pattern and base services
5. Set up IPC infrastructure

### Phase 2: Core Services (Week 2-3)
1. Port Inventory module services
2. Port Sales module services
3. Port CRM module services
4. Implement authentication (local-only)

### Phase 3: UI Migration (Week 3-4)
1. Copy React components from stocker-nextjs
2. Refactor api-service.ts to use IPC
3. Remove Next.js specific code (SSR, API routes)
4. Update routing to use react-router-dom

### Phase 4: Testing & Polish (Week 5)
1. Integration testing
2. Data migration tool (if needed)
3. Installer creation
4. Documentation

---

## 4. Key Architecture Patterns

### 4.1 Result Pattern (Error Handling)

```typescript
// src/main/domain/common/result.ts
export class Result<T = void> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: Error,
    private readonly _value?: T
  ) {}

  get value(): T {
    if (!this.isSuccess) throw new Error('Cannot get value from failed result');
    return this._value!;
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  static success<T>(value?: T): Result<T> {
    return new Result<T>(true, undefined, value);
  }

  static failure<T>(error: Error): Result<T> {
    return new Result<T>(false, error);
  }

  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isFailure) return Result.failure(this.error!);
    return Result.success(fn(this.value));
  }
}

export class Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly type: ErrorType = 'Validation'
  ) {}

  static validation(code: string, message: string): Error {
    return new Error(code, message, 'Validation');
  }

  static notFound(code: string, message: string): Error {
    return new Error(code, message, 'NotFound');
  }

  static conflict(code: string, message: string): Error {
    return new Error(code, message, 'Conflict');
  }
}

export type ErrorType = 'Validation' | 'NotFound' | 'Conflict' | 'Internal';
```

### 4.2 IPC Bridge Pattern

```typescript
// src/preload/api.ts
import { contextBridge, ipcRenderer } from 'electron';

export type IpcChannel =
  | 'inventory:products:list'
  | 'inventory:products:get'
  | 'inventory:products:create'
  | 'inventory:products:update'
  | 'sales:orders:list'
  | 'sales:orders:create'
  | 'sales:orders:approve'
  // ... more channels

export interface ElectronAPI {
  invoke: <T>(channel: IpcChannel, payload?: any) => Promise<T>;
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

const electronAPI: ElectronAPI = {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback),
};

contextBridge.exposeInMainWorld('electron', electronAPI);
```

### 4.3 Service Layer Pattern

```typescript
// src/main/services/sales/sales-order.service.ts
import { PrismaClient, SalesOrder, SalesOrderItem } from '@prisma/client';
import { Result, Error } from '../../domain/common/result';

export class SalesOrderService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSalesOrderDto): Promise<Result<SalesOrder>> {
    if (!data.orderNumber?.trim()) {
      return Result.failure(Error.validation('SalesOrder.OrderNumber', 'Order number is required'));
    }

    const order = await this.prisma.salesOrder.create({
      data: {
        id: crypto.randomUUID(),
        orderNumber: data.orderNumber,
        orderDate: new Date(data.orderDate),
        customerId: data.customerId,
        customerName: data.customerName,
        status: 'DRAFT',
        subTotal: 0,
        totalAmount: 0,
        createdAt: new Date(),
      },
    });

    return Result.success(order);
  }

  async approve(orderId: string, userId: string): Promise<Result<SalesOrder>> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return Result.failure(Error.notFound('SalesOrder', 'Order not found'));
    }

    if (order.isApproved) {
      return Result.failure(Error.conflict('SalesOrder.Status', 'Order is already approved'));
    }

    if (order.isCancelled) {
      return Result.failure(Error.conflict('SalesOrder.Status', 'Cannot approve a cancelled order'));
    }

    if (order.items.length === 0) {
      return Result.failure(Error.validation('SalesOrder.Items', 'Cannot approve an order without items'));
    }

    const updated = await this.prisma.salesOrder.update({
      where: { id: orderId },
      data: {
        isApproved: true,
        approvedBy: userId,
        approvedDate: new Date(),
        status: 'APPROVED',
        updatedAt: new Date(),
      },
    });

    return Result.success(updated);
  }

  // Port other methods from SalesOrder.cs...
}
```

---

## 5. Database Migration (Prisma Schema)

See `prisma/schema.prisma` for the complete schema.

Key mapping rules:
- C# `int Id` → Prisma `id Int @id @default(autoincrement())`
- C# `Guid Id` → Prisma `id String @id @default(uuid())`
- C# `decimal` → Prisma `Decimal` (SQLite uses REAL)
- C# `Money` value object → Two fields: `amount Decimal` + `currency String`
- C# enums → Prisma enums
- Navigation properties → Prisma relations

---

## 6. Frontend Refactoring

### 6.1 API Service Refactor

**Before (HTTP-based):**
```typescript
// stocker-nextjs/src/lib/api/api-service.ts
import { apiClient } from './axios-client';

export class ApiService {
  static async get<T>(url: string): Promise<T> {
    const response = await apiClient.get(url);
    return response.data;
  }
}
```

**After (IPC-based):**
```typescript
// stocker-desktop/src/renderer/lib/api/api-service.ts
export class ApiService {
  static async invoke<T>(channel: string, payload?: any): Promise<T> {
    const result = await window.electron.invoke(channel, payload);

    if (!result.isSuccess) {
      throw new ApiError(result.error.code, result.error.message);
    }

    return result.value;
  }

  // Convenience methods for common patterns
  static async get<T>(resource: string, id?: string): Promise<T> {
    const channel = id ? `${resource}:get` : `${resource}:list`;
    return this.invoke(channel, id ? { id } : undefined);
  }

  static async create<T>(resource: string, data: any): Promise<T> {
    return this.invoke(`${resource}:create`, data);
  }

  static async update<T>(resource: string, id: string, data: any): Promise<T> {
    return this.invoke(`${resource}:update`, { id, ...data });
  }

  static async delete(resource: string, id: string): Promise<void> {
    return this.invoke(`${resource}:delete`, { id });
  }
}
```

### 6.2 Service Migration Examples

**Before (InventoryService):**
```typescript
export class InventoryService {
  static async getProducts(params?: ProductFilters) {
    return ApiService.get('/api/inventory/products', { params });
  }
}
```

**After:**
```typescript
export class InventoryService {
  static async getProducts(params?: ProductFilters) {
    return ApiService.invoke('inventory:products:list', params);
  }

  static async getProduct(id: number) {
    return ApiService.invoke('inventory:products:get', { id });
  }

  static async createProduct(data: CreateProductDto) {
    return ApiService.invoke('inventory:products:create', data);
  }
}
```

---

## 7. Removed Features (Multi-tenant → Single-tenant)

| Feature | Status | Notes |
|---------|--------|-------|
| TenantId on all entities | Removed | Single user/company |
| X-Tenant-Code header | Removed | No HTTP headers |
| Tenant registration | Removed | Setup wizard instead |
| Subscription/Billing | Removed | One-time purchase or free |
| Multi-user auth | Simplified | Local PIN/password |
| SignalR | Replaced | Electron IPC events |

---

## 8. New Features for Desktop

| Feature | Implementation |
|---------|---------------|
| Offline-first | SQLite is always local |
| Auto-backup | Scheduled SQLite file copies |
| Data export | CSV/Excel export functions |
| Print support | Native print dialog |
| System tray | Background running |
| Auto-updates | electron-updater |
| Local file access | Native file dialogs |

---

## 9. Step-by-Step Migration Checklist

### Week 1: Foundation
- [ ] Initialize electron-vite project
- [ ] Configure TypeScript
- [ ] Set up Prisma with SQLite
- [ ] Create initial schema (core entities)
- [ ] Implement Result pattern
- [ ] Set up IPC infrastructure
- [ ] Create base service class

### Week 2: Inventory Module
- [ ] Port Product entity logic
- [ ] Port Stock entity logic
- [ ] Port Category entity logic
- [ ] Create inventory IPC handlers
- [ ] Migrate inventory UI components
- [ ] Test CRUD operations

### Week 3: Sales Module
- [ ] Port SalesOrder entity logic
- [ ] Port Invoice entity logic
- [ ] Port Payment entity logic
- [ ] Create sales IPC handlers
- [ ] Migrate sales UI components
- [ ] Test order workflow (Draft → Approved → Completed)

### Week 4: CRM & Polish
- [ ] Port Customer entity logic
- [ ] Port Lead/Deal entity logic
- [ ] Create CRM IPC handlers
- [ ] Migrate CRM UI components
- [ ] Implement settings/preferences
- [ ] Data seeding

### Week 5: Release Prep
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Create installer (Windows/Mac/Linux)
- [ ] Documentation
- [ ] Beta testing

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large codebase | Incremental migration by module |
| Data loss | Automatic backups + export tools |
| Performance issues | SQLite indices + query optimization |
| UI breaking changes | Keep Ant Design version consistent |
| Missing features | Document and prioritize post-MVP |

---

## Appendix A: Command Reference

```bash
# Development
npm run dev              # Start in dev mode
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations (dev)
npx prisma db push       # Push schema changes
npx prisma studio        # Open Prisma Studio

# Packaging
npm run package:win      # Build Windows installer
npm run package:mac      # Build macOS installer
npm run package:linux    # Build Linux installer
```

---

## Appendix B: File Migration Map

| Source (stocker-nextjs) | Destination (stocker-desktop) |
|------------------------|------------------------------|
| `src/components/` | `src/renderer/components/` |
| `src/features/` | `src/renderer/features/` |
| `src/hooks/` | `src/renderer/hooks/` |
| `src/lib/api/services/` | `src/renderer/lib/api/services/` |
| `src/lib/api/api-service.ts` | `src/renderer/lib/api/api-service.ts` (refactored) |
| `src/providers/` | `src/renderer/providers/` |
| `src/styles/` | `src/renderer/styles/` |
| `public/` | `resources/` |

---

This plan provides a complete roadmap for the migration. Each section can be expanded with implementation details as the project progresses.

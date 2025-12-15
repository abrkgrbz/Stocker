# Tenant Kayıt ve Modül Aktivasyon Akışı

Bu dokümantasyon, kullanıcının kayıt olmasından modüllerin aktif edilmesine kadar olan tüm süreci açıklamaktadır.

## Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT KAYIT AKIŞI                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. KAYIT FORMU  →  2. E-POSTA DOĞRULAMA  →  3. TENANT OLUŞTURMA           │
│                                                                             │
│  4. GİRİŞ  →  5. SETUP WIZARD  →  6. PAKET SEÇİMİ  →  7. MODÜL AKTİVASYON │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detaylı Akış Diyagramı

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                              1. KAYIT FORMU                                          │
│                         /register sayfası (Frontend)                                 │
│                                                                                      │
│   Kullanıcı Bilgileri:                                                              │
│   • Şirket Adı                                                                       │
│   • E-posta                                                                          │
│   • Şifre                                                                            │
│   • Telefon (Opsiyonel)                                                             │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                    POST /api/public/tenant-registration/register                     │
│                                                                                      │
│   RegisterTenantCommand → RegisterTenantCommandHandler                              │
│                                                                                      │
│   İşlemler:                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │ 1. E-posta benzersizlik kontrolü                                     │           │
│   │ 2. TenantRegistration kaydı oluştur (Status: PendingVerification)   │           │
│   │ 3. 6 haneli doğrulama kodu üret                                      │           │
│   │ 4. Doğrulama e-postası gönder                                        │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   Veritabanı: MasterDb.TenantRegistrations                                          │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                          2. E-POSTA DOĞRULAMA                                        │
│                   /verify-email?email=...&code=... (Frontend)                        │
│                                                                                      │
│   Kullanıcı e-postasındaki linke tıklar veya kodu girer                             │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                   POST /api/public/tenant-registration/verify-email                  │
│                                                                                      │
│   VerifyEmailCommand → VerifyEmailCommandHandler                                    │
│                                                                                      │
│   İşlemler:                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │ 1. Doğrulama kodunu kontrol et                                       │           │
│   │ 2. TenantRegistration.Status = EmailVerified                         │           │
│   │ 3. CreateTenantFromRegistrationCommand tetikle (MediatR)            │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   Return: { registrationId: Guid } → Frontend SignalR'a bağlanır                    │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                          3. TENANT OLUŞTURMA                                         │
│                    CreateTenantFromRegistrationCommandHandler                        │
│                                                                                      │
│   ⚡ SignalR ile gerçek zamanlı ilerleme bildirimi                                   │
│                                                                                      │
│   Adımlar (TenantCreationStep enum):                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │                                                                      │           │
│   │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │           │
│   │  │ 1. Starting  │ ──▶ │ 2. Creating  │ ──▶ │ 3. Creating  │        │           │
│   │  │              │     │    Tenant    │     │  MasterUser  │        │           │
│   │  └──────────────┘     └──────────────┘     └──────────────┘        │           │
│   │         │                    │                    │                 │           │
│   │         ▼                    ▼                    ▼                 │           │
│   │  SignalR: 10%         SignalR: 20%         SignalR: 30%            │           │
│   │                                                                      │           │
│   │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │           │
│   │  │ 4. Creating  │ ──▶ │ 5. Running   │ ──▶ │ 6. Seeding   │        │           │
│   │  │   Database   │     │  Migrations  │     │    Data      │        │           │
│   │  └──────────────┘     └──────────────┘     └──────────────┘        │           │
│   │         │                    │                    │                 │           │
│   │         ▼                    ▼                    ▼                 │           │
│   │  SignalR: 40%         SignalR: 60%         SignalR: 70%            │           │
│   │                                                                      │           │
│   │  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │           │
│   │  │ 7. Activating│ ──▶ │ 8. Sending   │ ──▶ │ 9. Completed │        │           │
│   │  │    Tenant    │     │ WelcomeEmail │     │              │        │           │
│   │  └──────────────┘     └──────────────┘     └──────────────┘        │           │
│   │         │                    │                    │                 │           │
│   │         ▼                    ▼                    ▼                 │           │
│   │  SignalR: 85%         SignalR: 95%         SignalR: 100%           │           │
│   │                                                                      │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   ⚠️ NOT: Bu aşamada Subscription OLUŞTURULMAZ!                                     │
│   Subscription, Setup Wizard'da paket seçildikten sonra oluşturulur.                │
│                                                                                      │
│   Oluşturulan Kayıtlar:                                                             │
│   • MasterDb.Tenants (Status: Active)                                               │
│   • MasterDb.MasterUsers (tenant admin kullanıcısı)                                 │
│   • TenantDb_[TenantId] (yeni PostgreSQL veritabanı)                               │
│   • TenantDb.TenantUsers (ilk kullanıcı)                                           │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                     Frontend: TenantCreationProgress.tsx                             │
│                                                                                      │
│   SignalR üzerinden ilerleme takibi:                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │  ✓ Başlatılıyor                    [████████████░░░░░░░░] 60%      │           │
│   │  ✓ Şirket kaydı oluşturuluyor                                       │           │
│   │  ✓ Kullanıcı hesabı oluşturuluyor                                   │           │
│   │  ● Veritabanı oluşturuluyor        ← Şu anki adım                   │           │
│   │  ○ Veritabanı yapılandırılıyor                                      │           │
│   │  ○ İlk veriler yükleniyor                                           │           │
│   │  ○ Hesabınız aktifleştiriliyor                                      │           │
│   │  ○ Hoşgeldin e-postası gönderiliyor                                 │           │
│   │  ○ Tamamlandı                                                        │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   Tamamlandığında → /login?message=tenant-created sayfasına yönlendir              │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                              4. GİRİŞ                                                │
│                           /login (Frontend)                                          │
│                                                                                      │
│   POST /api/auth/login                                                              │
│                                                                                      │
│   İşlemler:                                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │ 1. Kullanıcı kimlik doğrulama                                        │           │
│   │ 2. JWT token üret (tenantId claim dahil)                            │           │
│   │ 3. Tenant.SetupCompleted kontrolü                                    │           │
│   │    • false ise → /setup-wizard'a yönlendir                          │           │
│   │    • true ise → /dashboard'a yönlendir                              │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                           5. SETUP WIZARD                                            │
│                      /setup-wizard (Frontend)                                        │
│                                                                                      │
│   Adımlar:                                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │                                                                      │           │
│   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │           │
│   │  │   Adım 1    │ ─▶ │   Adım 2    │ ─▶ │   Adım 3    │             │           │
│   │  │  ŞİRKET     │    │   PAKET     │    │   ÖZET      │             │           │
│   │  │  BİLGİLERİ  │    │   SEÇİMİ    │    │   & ONAY    │             │           │
│   │  └─────────────┘    └─────────────┘    └─────────────┘             │           │
│   │                                                                      │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   Adım 1 - Şirket Bilgileri:                                                        │
│   • Şirket adı, vergi no, adres vb.                                                 │
│                                                                                      │
│   Adım 2 - Paket Seçimi:                                                            │
│   • Başlangıç, Profesyonel, Kurumsal paketler                                       │
│   • Her paketin içerdiği modüller görüntülenir                                      │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                      6. PAKET SEÇİMİ & KURULUM TAMAMLAMA                            │
│                                                                                      │
│                    POST /api/setup/complete-setup                                    │
│                                                                                      │
│   CompleteSetupCommand → CompleteSetupCommandHandler                                │
│                                                                                      │
│   Request Body:                                                                      │
│   {                                                                                  │
│     "tenantId": "guid",                                                             │
│     "packageId": "guid",           // Seçilen paket                                 │
│     "selectedModules": ["CRM", "Sales", "Inventory"],  // Modül kodları            │
│     "companyDetails": { ... }      // Şirket bilgileri                              │
│   }                                                                                  │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                    7. MODÜL AKTİVASYON SÜRECİ                                        │
│                    CompleteSetupCommandHandler                                       │
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │                                                                      │           │
│   │  1. Subscription Oluşturma                                           │           │
│   │  ┌────────────────────────────────────────────────────────────┐     │           │
│   │  │ • Subscription.Create(tenantId, packageId, price, ...)    │     │           │
│   │  │ • Status: Deneme (14 günlük trial)                         │     │           │
│   │  │ • MasterDb.Subscriptions tablosuna kaydet                  │     │           │
│   │  └────────────────────────────────────────────────────────────┘     │           │
│   │                          │                                           │           │
│   │                          ▼                                           │           │
│   │  2. Modülleri Subscription'a Ekle                                    │           │
│   │  ┌────────────────────────────────────────────────────────────┐     │           │
│   │  │ foreach (module in selectedModules)                        │     │           │
│   │  │ {                                                          │     │           │
│   │  │     subscription.AddModule(moduleCode, moduleName, max);   │     │           │
│   │  │ }                                                          │     │           │
│   │  │                                                            │     │           │
│   │  │ → MasterDb.SubscriptionModules tablosuna kaydet            │     │           │
│   │  └────────────────────────────────────────────────────────────┘     │           │
│   │                          │                                           │           │
│   │                          ▼                                           │           │
│   │  3. Modül Migration'larını Çalıştır                                  │           │
│   │  ┌────────────────────────────────────────────────────────────┐     │           │
│   │  │ MigrationService.ApplyModuleMigrationsAsync()              │     │           │
│   │  │                                                            │     │           │
│   │  │ Her modül için:                                            │     │           │
│   │  │ • CRM → CRMDbContext migrations                            │     │           │
│   │  │ • Sales → SalesDbContext migrations                        │     │           │
│   │  │ • Inventory → InventoryDbContext migrations                │     │           │
│   │  │ • HR → HRDbContext migrations                              │     │           │
│   │  │ • Finance → FinanceDbContext migrations                    │     │           │
│   │  │                                                            │     │           │
│   │  │ → Tenant veritabanında modül tablolarını oluştur           │     │           │
│   │  └────────────────────────────────────────────────────────────┘     │           │
│   │                          │                                           │           │
│   │                          ▼                                           │           │
│   │  4. Tenant'ı Güncelle                                                │           │
│   │  ┌────────────────────────────────────────────────────────────┐     │           │
│   │  │ tenant.CompleteSetup();                                    │     │           │
│   │  │ // SetupCompleted = true                                   │     │           │
│   │  │ // SetupCompletedAt = DateTime.UtcNow                      │     │           │
│   │  └────────────────────────────────────────────────────────────┘     │           │
│   │                                                                      │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
└────────────────────────────────────┬─────────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                         8. MODÜL KULLANIMI                                           │
│                                                                                      │
│   Frontend modül kontrolü:                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │                                                                      │           │
│   │  GET /api/tenant/user-modules/active                                 │           │
│   │                                                                      │           │
│   │  UserModulesController.GetActiveModules()                           │           │
│   │  ┌────────────────────────────────────────────────────────────┐     │           │
│   │  │ 1. Tenant'ın aktif Subscription'ını bul                    │     │           │
│   │  │ 2. subscription.Modules'dan modülleri al                   │     │           │
│   │  │ 3. ModuleInfo listesi döndür                               │     │           │
│   │  └────────────────────────────────────────────────────────────┘     │           │
│   │                                                                      │           │
│   │  Response:                                                           │           │
│   │  {                                                                   │           │
│   │    "tenantId": "guid",                                              │           │
│   │    "modules": [                                                      │           │
│   │      { "code": "crm", "name": "CRM", "isActive": true },            │           │
│   │      { "code": "sales", "name": "Satış", "isActive": true },        │           │
│   │      { "code": "inventory", "name": "Stok", "isActive": true }      │           │
│   │    ],                                                                │           │
│   │    "packageName": "Profesyonel",                                    │           │
│   │    "subscriptionStatus": "Deneme"                                   │           │
│   │  }                                                                   │           │
│   │                                                                      │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
│   Sidebar menü (Frontend):                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐           │
│   │  const { data } = useActiveModules();                               │           │
│   │  const hasModule = (code) => data?.modules?.some(m => m.code === code);        │
│   │                                                                      │           │
│   │  {hasModule('crm') && <CRMMenuItem />}                              │           │
│   │  {hasModule('sales') && <SalesMenuItem />}                          │           │
│   │  {hasModule('inventory') && <InventoryMenuItem />}                  │           │
│   │  {hasModule('hr') && <HRMenuItem />}                                │           │
│   └─────────────────────────────────────────────────────────────────────┘           │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Veritabanı Şeması

### Master Database

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MASTER DATABASE                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  TenantRegistrations                    Tenants                                     │
│  ┌────────────────────────┐            ┌────────────────────────┐                  │
│  │ Id (PK)                │            │ Id (PK)                │                  │
│  │ Email                  │            │ Name                   │                  │
│  │ CompanyName            │───────────▶│ Subdomain              │                  │
│  │ VerificationCode       │            │ Status                 │                  │
│  │ Status                 │            │ SetupCompleted         │                  │
│  │ TenantId (FK)          │            │ SetupCompletedAt       │                  │
│  └────────────────────────┘            │ ConnectionString       │                  │
│                                        └────────────────────────┘                  │
│                                                   │                                 │
│                                                   │ 1:N                             │
│                                                   ▼                                 │
│  Packages                              Subscriptions                                │
│  ┌────────────────────────┐            ┌────────────────────────┐                  │
│  │ Id (PK)                │            │ Id (PK)                │                  │
│  │ Name                   │◀───────────│ TenantId (FK)          │                  │
│  │ Type                   │            │ PackageId (FK)         │                  │
│  │ Price                  │            │ Status                 │                  │
│  │ MaxUsers               │            │ StartDate              │                  │
│  └────────────────────────┘            │ CurrentPeriodEnd       │                  │
│           │                            └────────────────────────┘                  │
│           │ 1:N                                   │                                 │
│           ▼                                       │ 1:N                             │
│  PackageModules                                   ▼                                 │
│  ┌────────────────────────┐            SubscriptionModules                         │
│  │ Id (PK)                │            ┌────────────────────────┐                  │
│  │ PackageId (FK)         │            │ Id (PK)                │                  │
│  │ ModuleCode             │            │ SubscriptionId (FK)    │                  │
│  │ ModuleName             │            │ ModuleCode             │                  │
│  │ IsIncluded             │            │ ModuleName             │                  │
│  │ MaxEntities            │            │ MaxEntities            │                  │
│  └────────────────────────┘            │ AddedAt                │                  │
│                                        └────────────────────────┘                  │
│                                                                                     │
│  MasterUsers                           ModuleDefinitions                           │
│  ┌────────────────────────┐            ┌────────────────────────┐                  │
│  │ Id (PK)                │            │ Id (PK)                │                  │
│  │ Email                  │            │ Code (unique)          │                  │
│  │ PasswordHash           │            │ Name                   │                  │
│  │ TenantId (FK)          │            │ Description            │                  │
│  │ IsTenantAdmin          │            │ DbContextName          │                  │
│  └────────────────────────┘            │ IsCore                 │                  │
│                                        └────────────────────────┘                  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Tenant Database (Her tenant için ayrı)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         TENANT DATABASE (tenant_[guid])                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  Core Schema (tenant)                                                               │
│  ┌────────────────────────┐                                                        │
│  │ TenantUsers            │                                                        │
│  │ Companies              │                                                        │
│  │ Branches               │                                                        │
│  │ Departments            │                                                        │
│  │ AuditLogs              │                                                        │
│  └────────────────────────┘                                                        │
│                                                                                     │
│  Module Schemas (Modül seçimine göre oluşturulur)                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐│
│  │ crm.*                  │  │ sales.*                │  │ inventory.*            ││
│  │ ──────────────         │  │ ──────────────         │  │ ──────────────         ││
│  │ Customers              │  │ SalesOrders            │  │ Products               ││
│  │ Contacts               │  │ Quotations             │  │ Warehouses             ││
│  │ Leads                  │  │ Invoices               │  │ StockMovements         ││
│  │ Opportunities          │  │ Payments               │  │ Transfers              ││
│  │ Pipelines              │  │ Shipments              │  │ Categories             ││
│  │ Campaigns              │  │ ...                    │  │ ...                    ││
│  └────────────────────────┘  └────────────────────────┘  └────────────────────────┘│
│                                                                                     │
│  ┌────────────────────────┐  ┌────────────────────────┐                           │
│  │ hr.*                   │  │ finance.*              │                           │
│  │ ──────────────         │  │ ──────────────         │                           │
│  │ Employees              │  │ Accounts               │                           │
│  │ LeaveRequests          │  │ JournalEntries         │                           │
│  │ Departments            │  │ AccountingPeriods      │                           │
│  │ Positions              │  │ Budgets                │                           │
│  │ Payroll                │  │ ...                    │                           │
│  │ ...                    │  │                        │                           │
│  └────────────────────────┘  └────────────────────────┘                           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Önemli Dosyalar

### Backend

| Dosya | Açıklama |
|-------|----------|
| `RegisterTenantCommandHandler.cs` | Kayıt formunu işler, doğrulama kodu gönderir |
| `VerifyEmailCommandHandler.cs` | E-posta doğrulamasını yapar |
| `CreateTenantFromRegistrationCommandHandler.cs` | Tenant ve veritabanı oluşturur |
| `CompleteSetupCommandHandler.cs` | Paket seçimi sonrası subscription ve modülleri oluşturur |
| `MigrationService.cs` | Modül migration'larını çalıştırır |
| `UserModulesController.cs` | Aktif modülleri frontend'e döner |
| `TenantCreationProgressService.cs` | SignalR ile ilerleme bildirimi |

### Frontend

| Dosya | Açıklama |
|-------|----------|
| `TenantCreationProgress.tsx` | Tenant oluşturma ilerleme sayfası |
| `setup-wizard/page.tsx` | Setup wizard ana sayfası |
| `useUserModules.ts` | Modül bilgilerini çeken React Query hook |
| `user-modules.service.ts` | Modül API servisi |

---

## SignalR Olayları

```typescript
// Hub: TenantCreationHub
// Group: registration_{registrationId}

// Events:
interface TenantCreationProgress {
  registrationId: Guid;
  step: TenantCreationStep;
  message: string;
  progressPercentage: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
}

enum TenantCreationStep {
  EmailVerified = 0,
  Starting = 1,
  CreatingTenant = 2,
  CreatingMasterUser = 4,
  CreatingDatabase = 5,
  RunningMigrations = 6,
  SeedingData = 7,
  ActivatingTenant = 9,
  SendingWelcomeEmail = 10,
  Completed = 11,
  Failed = 12
}
```

---

## Modül Kodları

| Kod | Modül Adı | DbContext |
|-----|-----------|-----------|
| `CRM` | Müşteri İlişkileri | CRMDbContext |
| `Sales` | Satış | SalesDbContext |
| `Inventory` | Stok Yönetimi | InventoryDbContext |
| `HR` | İnsan Kaynakları | HRDbContext |
| `Finance` | Finans/Muhasebe | FinanceDbContext |
| `Purchase` | Satın Alma | PurchaseDbContext |
| `Projects` | Proje Yönetimi | ProjectsDbContext |

---

## Hata Senaryoları

```
┌─────────────────────────────────────────────────────────────────┐
│                      HATA SENARYOLARI                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. E-posta doğrulama hatası                                    │
│     → Kullanıcıya hata mesajı göster                           │
│     → Yeni kod gönderme seçeneği sun                           │
│                                                                 │
│  2. Tenant oluşturma hatası                                     │
│     → SignalR ile Failed step gönder                           │
│     → TenantRegistration.Status = Failed                       │
│     → Kullanıcıya "Tekrar Dene" butonu göster                  │
│                                                                 │
│  3. Migration hatası                                            │
│     → Log'a detaylı hata yaz                                   │
│     → Subscription rollback yap                                │
│     → Kullanıcıya bilgi ver                                    │
│                                                                 │
│  4. Subscription bulunamadı                                     │
│     → UserModulesController boş modül listesi döner            │
│     → Frontend sidebar'da hiç modül göstermez                  │
│     → Setup Wizard'a yönlendir                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

# Database Tables - Deployment Reference

Bu dokümant, uygulama deploy edildiğinde oluşması gereken tüm veritabanı tablolarını listeler.

## 📊 Master Database (StockerMasterDb)

Master veritabanı tüm tenant'lar için ortak bilgileri tutar.

### Schema: `master`

#### 1. Tenant Management (Tenant Yönetimi)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `Tenants` | Kayıtlı firmalar | Id, CompanyCode, Name, ConnectionString, IsActive |
| `TenantRegistrations` | Firma kayıt talepleri | Id, RegistrationCode, CompanyName, Status, ContactEmail |
| `TenantDomains` | Tenant subdomain'leri | Id, TenantId, DomainName, IsActive |
| `TenantLimits` | Tenant kullanım limitleri | Id, TenantId, MaxUsers, MaxStorage, MaxTransactions |
| `TenantBillings` | Fatura bilgileri | Id, TenantId, BillingCycle, TotalAmount |
| `TenantContracts` | Sözleşmeler | Id, TenantId, StartDate, EndDate |
| `TenantHealthChecks` | Sistem sağlık kontrolleri | Id, TenantId, LastCheckDate, Status |
| `TenantBackups` | Yedekleme kayıtları | Id, TenantId, BackupDate, FilePath |

#### 2. User Management (Kullanıcı Yönetimi)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `MasterUsers` | System admin kullanıcıları | Id, Username, Email, PasswordHash, UserType |
| `MasterUserRefreshTokens` | Refresh token'lar | Id, UserId, Token, ExpiresAt |

#### 3. Package & Subscription (Paket & Abonelik)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `Packages` | Hizmet paketleri | Id, Name, Type, BasePrice, TrialDays, IsActive |
| `PackageFeatures` | Paket özellikleri | Id, PackageId, FeatureCode, FeatureName |
| `PackageModules` | Paket modülleri | Id, PackageId, ModuleCode, ModuleName |
| `Subscriptions` | Aktif abonelikler | Id, TenantId, PackageId, Status, StartDate, EndDate |
| `SubscriptionModules` | Abonelik modülleri | Id, SubscriptionId, ModuleCode, IsActive |
| `SubscriptionUsages` | Kullanım istatistikleri | Id, SubscriptionId, UsageType, UsageCount |

#### 4. Billing (Faturalama)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `Invoices` | Faturalar | Id, SubscriptionId, InvoiceNumber, IssueDate, DueDate |
| `InvoiceItems` | Fatura kalemleri | Id, InvoiceId, Description, Quantity, UnitPrice |
| `Payments` | Ödemeler | Id, InvoiceId, PaymentDate, Amount, PaymentMethod |

#### 5. System Settings (Sistem Ayarları)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `SystemSettings` | Genel sistem ayarları | Id, Key, Value, Category, IsSystem |

### 📋 Master DB Toplam: 20 Tablo

---

## 🏢 Tenant Database (StockerTenantDb_{TenantCode})

Her tenant için ayrı bir veritabanı oluşturulur.

### Schema: `dbo` (default)

#### 1. Company & Organization (Şirket & Organizasyon)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `Companies` | Şirket bilgileri | Id, Name, TaxNumber, Address |
| `Branches` | Şubeler | Id, Name, Address, IsActive |
| `Departments` | Departmanlar | Id, Name, BranchId, IsActive |

#### 2. User & Authorization (Kullanıcı & Yetkilendirme)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantUsers` | Tenant kullanıcıları | Id, Username, Email, PasswordHash, IsActive |
| `UserTenants` | Kullanıcı-tenant ilişkisi | Id, UserId, Role, IsActive |
| `Roles` | Roller | Id, Name, Description, IsSystem |
| `UserRoles` | Kullanıcı rolleri | UserId, RoleId |
| `RolePermissions` | Rol izinleri | RoleId, PermissionId |
| `UserPermissions` | Kullanıcı izinleri | UserId, PermissionId |
| `PasswordHistories` | Şifre geçmişi | Id, UserId, PasswordHash, ChangedAt |

#### 3. Business Operations (İş Operasyonları)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `Customers` | Müşteriler | Id, Name, Email, Phone, TaxNumber |
| `Products` | Ürünler | Id, Name, SKU, Price, Stock |
| `Invoices` | Satış faturaları | Id, InvoiceNumber, CustomerId, IssueDate |
| `InvoiceItems` | Fatura kalemleri | Id, InvoiceId, ProductId, Quantity, UnitPrice |
| `Payments` | Ödemeler | Id, InvoiceId, PaymentDate, Amount |

#### 4. Tenant Settings & Configuration (Ayarlar & Yapılandırma)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantSettings` | Tenant ayarları | Id, Key, Value, Category |
| `TenantModules` | Aktif modüller | Id, ModuleCode, IsEnabled |
| `TenantFeatures` | Aktif özellikler | Id, FeatureCode, IsEnabled |
| `TenantCustomizations` | UI özelleştirmeleri | Id, Key, Value, Type |
| `TenantSecuritySettings` | Güvenlik ayarları | Id, PasswordPolicy, SessionTimeout |

#### 5. Onboarding & Setup (Kurulum & Başlangıç)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantInitialData` | İlk kurulum verileri | Id, DataType, IsCompleted |
| `TenantOnboardings` | Onboarding süreci | Id, CurrentStep, IsCompleted |
| `OnboardingSteps` | Onboarding adımları | Id, OnboardingId, StepName, IsCompleted |
| `OnboardingTasks` | Onboarding görevleri | Id, StepId, TaskName, IsCompleted |
| `SetupWizards` | Kurulum sihirbazı | Id, WizardType, CurrentStep |
| `SetupWizardSteps` | Sihirbaz adımları | Id, WizardId, StepName, IsCompleted |
| `TenantSetupChecklists` | Kurulum kontrol listesi | Id, ItemName, IsCompleted |

#### 6. Integration & API (Entegrasyon & API)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantApiKeys` | API anahtarları | Id, KeyName, ApiKey, ExpiresAt |
| `TenantIntegrations` | Entegrasyonlar | Id, IntegrationType, IsActive |
| `TenantWebhooks` | Webhook kayıtları | Id, Url, Event, IsActive |

#### 7. Compliance & Security (Uyumluluk & Güvenlik)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantCompliances` | Uyumluluk kayıtları | Id, ComplianceType, Status |
| `TenantDocuments` | Dökümanlar | Id, DocumentType, FilePath |
| `AuditLogs` | Denetim logları | Id, UserId, Action, Timestamp |
| `TenantActivityLogs` | Aktivite logları | Id, UserId, ActivityType, CreatedAt |

#### 8. Notifications (Bildirimler)
| Tablo | Açıklama | Anahtar Alanlar |
|-------|----------|----------------|
| `TenantNotifications` | Bildirimler | Id, UserId, Title, Message, IsRead |

### 📋 Tenant DB Toplam: 34 Tablo

---

## 🔄 Migration History Tables

Her iki veritabanında da otomatik oluşturulur:

| Tablo | Açıklama |
|-------|----------|
| `__EFMigrationsHistory` | EF Core migration geçmişi |

---

## 🚀 Deployment Checklist

### 1. Master Database Oluşturma
```bash
# Otomatik olarak Program.cs startup'ta çalışır
await migrationService.MigrateMasterDatabaseAsync();
await migrationService.SeedMasterDataAsync();
```

**Oluşturulan veriler:**
- ✅ 20 Master tablo
- ✅ System admin kullanıcısı
- ✅ 3 Paket (Starter, Professional, Enterprise)
- ✅ Paket özellikleri ve modülleri

### 2. Tenant Database Oluşturma
```bash
# Her tenant kaydı onaylandığında
await migrationService.MigrateTenantDatabaseAsync(tenantId);
await migrationService.SeedTenantDataAsync(tenantId);
```

**Oluşturulan veriler:**
- ✅ 34 Tenant tablo
- ✅ Varsayılan roller (Admin, Manager, User)
- ✅ Varsayılan ayarlar
- ✅ Onboarding workflow

### 3. Verification (Doğrulama)

**Master DB kontrolü:**
```sql
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'master';
-- Beklenen: 20 tablo
```

**Tenant DB kontrolü:**
```sql
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'dbo';
-- Beklenen: 34 tablo
```

---

## 📊 Toplam İstatistikler

- **Master Database:** 20 tablo
- **Tenant Database:** 34 tablo (her tenant için)
- **Toplam:** 54 tablo yapısı
- **Migration Files:** 20 migration (10 Master + 10 Tenant)

---

## ⚠️ Önemli Notlar

1. **Master DB** deploy sırasında otomatik oluşturulur
2. **Tenant DB** her yeni firma kaydında ayrı ayrı oluşturulur
3. Tüm migration'lar `MigrateAsync()` ile otomatik uygulanır
4. Database yoksa otomatik oluşturulur
5. Production'da connection string environment variable'lardan gelir
6. Seed data sadece ilk deployment'ta eklenir

---

## 🔗 İlgili Dosyalar

- Migration Service: `src/Infrastructure/Stocker.Persistence/Migrations/MigrationService.cs`
- Master DbContext: `src/Infrastructure/Stocker.Persistence/Contexts/MasterDbContext.cs`
- Tenant DbContext: `src/Infrastructure/Stocker.Persistence/Contexts/TenantDbContext.cs`
- Startup: `src/API/Stocker.API/Program.cs` (Line 670-716)
- Docker: `src/API/Stocker.API/Dockerfile` (Line 40-95)

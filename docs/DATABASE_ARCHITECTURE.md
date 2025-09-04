# Stocker Multi-Tenant Database Architecture

## 🏗️ Veritabanı Mimarisi

### 1. Master Database (`StockerMasterDb`)
Ana veritabanı - Tüm sistem geneli veriler burada tutulur.

**Tablolar:**
- `Tenants` - Tüm kiracı bilgileri
- `Subscriptions` - Abonelik bilgileri
- `Packages` - Paket tanımları
- `PackageModules` - Paket-modül ilişkileri
- `SubscriptionModules` - Tenant'ın aktif modülleri
- `MasterUsers` - Sistem yöneticileri
- `Invoices` - Fatura bilgileri
- `Payments` - Ödeme kayıtları

### 2. Tenant Databases (`Stocker_[TenantName]`)
Her tenant için ayrı veritabanı oluşturulur.

**Örnek:** `Stocker_Test_Teknoloji`

#### Core Tablolar (Her Tenant'ta Varsayılan)
- `dbo.Companies` - Şirket bilgileri
- `dbo.Branches` - Şube bilgileri
- `dbo.Departments` - Departmanlar
- `dbo.TenantUsers` - Kullanıcılar
- `dbo.Roles` - Roller
- `dbo.Permissions` - Yetkiler

#### Modül Tabloları (Satın Alındığında Eklenir)

**CRM Modülü (`crm` schema):**
- `crm.Customers` - Müşteriler
- `crm.Contacts` - Kişiler
- `crm.Leads` - Potansiyel müşteriler
- `crm.Opportunities` - Fırsatlar
- `crm.Deals` - Anlaşmalar
- `crm.Activities` - Aktiviteler
- `crm.Campaigns` - Kampanyalar
- `crm.Pipelines` - Satış hunileri
- `crm.PipelineStages` - Huni aşamaları

**Inventory Modülü (`inventory` schema):**
- `inventory.Products` - Ürünler
- `inventory.Categories` - Kategoriler
- `inventory.Warehouses` - Depolar
- `inventory.Stocks` - Stok seviyeleri
- `inventory.StockMovements` - Stok hareketleri

## 🔄 İşleyiş Akışı

### Yeni Tenant Kaydı:
```csharp
1. Kullanıcı kayıt formu doldurur
2. Master DB'de Tenant kaydı oluşturulur
3. Yeni veritabanı oluşturulur: Stocker_[TenantName]
4. Core migration'lar çalıştırılır
5. Varsayılan veriler (seed data) eklenir
6. Kullanıcıya giriş bilgileri gönderilir
```

### Modül Aktivasyonu:
```csharp
1. Tenant CRM modülü satın alır
2. Master DB'de SubscriptionModules tablosuna kayıt eklenir
3. Tenant'ın veritabanına bağlanılır
4. CRM migration'ları çalıştırılır
5. CRM tabloları oluşturulur (crm schema altında)
6. CRM seed data eklenir (default pipeline vb.)
7. Modül kullanıma hazır!
```

## 🔐 Güvenlik ve İzolasyon

### Veritabanı Seviyesi İzolasyon:
- Her tenant'ın **tamamen ayrı veritabanı**
- Fiziksel izolasyon - veri karışması imkansız
- Bağımsız backup/restore imkanı

### Uygulama Seviyesi İzolasyon:
- `ITenantService` ile aktif tenant kontrolü
- DbContext'te otomatik tenant filtreleme
- Query interceptor'lar ile ekstra güvenlik

## 📊 Örnek Senaryo

**Firma:** Test Teknoloji A.Ş.
**Tenant ID:** `3fa85f64-5717-4562-b3fc-2c963f66afa6`
**Database:** `Stocker_Test_Teknoloji`

### 1. İlk Kayıt:
```sql
-- Master DB'de
INSERT INTO Tenants (Id, Name, Code, DatabaseName, ConnectionString)
VALUES ('3fa85f64...', 'Test Teknoloji', 'TEST_TEK', 'Stocker_Test_Teknoloji', '...')

-- Yeni DB oluştur
CREATE DATABASE Stocker_Test_Teknoloji

-- Core tablolar migrate edilir
-- dbo.Companies, dbo.Users, dbo.Roles vb.
```

### 2. CRM Modülü Aktivasyonu:
```sql
-- Master DB'de
INSERT INTO SubscriptionModules (SubscriptionId, ModuleName, IsActive)
VALUES (123, 'CRM', 1)

-- Tenant DB'de (Stocker_Test_Teknoloji)
CREATE SCHEMA crm

-- CRM tabloları oluşturulur
CREATE TABLE crm.Customers (...)
CREATE TABLE crm.Leads (...)
CREATE TABLE crm.Opportunities (...)
-- vb.
```

### 3. Inventory Modülü Aktivasyonu:
```sql
-- Master DB'de
INSERT INTO SubscriptionModules (SubscriptionId, ModuleName, IsActive)
VALUES (123, 'Inventory', 1)

-- Tenant DB'de (Stocker_Test_Teknoloji)
CREATE SCHEMA inventory

-- Inventory tabloları oluşturulur
CREATE TABLE inventory.Products (...)
CREATE TABLE inventory.Warehouses (...)
-- vb.
```

## 🎯 Avantajları

1. **Tam İzolasyon:** Her tenant'ın verisi fiziksel olarak ayrı
2. **Modüler Yapı:** Sadece satın alınan modüllerin tabloları oluşturulur
3. **Performans:** Her tenant kendi indexleri ve optimizasyonları
4. **Güvenlik:** Veri sızıntısı riski minimum
5. **Esneklik:** Her tenant için özel ayarlar yapılabilir
6. **Kolay Yönetim:** Backup, restore, migration işlemleri bağımsız

## 🔧 Teknik Detaylar

### Connection String Yönetimi:
```csharp
// Master DB'den tenant bilgisi alınır
var tenant = await masterDb.Tenants.FindAsync(tenantId);

// Tenant DB'ye bağlanılır
var connectionString = tenant.ConnectionString;
var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
optionsBuilder.UseSqlServer(connectionString);
```

### Modül Kontrolü:
```csharp
// Tenant'ın aktif modülleri kontrol edilir
var activeModules = await masterDb.SubscriptionModules
    .Where(sm => sm.Subscription.TenantId == tenantId && sm.IsActive)
    .Select(sm => sm.ModuleName)
    .ToListAsync();

if (activeModules.Contains("CRM"))
{
    // CRM özellikleri aktif
}
```

## 📝 Notlar

- Her modül kendi schema'sını kullanır (crm, inventory, hr vb.)
- Core tablolar dbo schema'sında
- Migration history her tenant DB'sinde ayrı tutulur
- Modül deaktivasyonunda tablolar silinmez, sadece erişim kapatılır
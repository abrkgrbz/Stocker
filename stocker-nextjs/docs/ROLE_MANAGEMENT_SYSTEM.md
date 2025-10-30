# Dinamik Rol Yönetim Sistemi

FirmaYöneticisi (Admin) kullanıcıların özel roller oluşturup yetki atayabildiği kapsamlı rol yönetim sistemi.

## Sistem Mimarisi

### Backend (.NET Core)

#### Domain Entities
- **[Role](../../src/Core/Stocker.Domain/Tenant/Entities/Role.cs)**: Rol entity'si
  - `Name`: Rol adı
  - `Description`: Rol açıklaması
  - `IsSystemRole`: Sistem rolü mü? (değiştirilemez)
  - `IsActive`: Aktif mi?
  - `Permissions`: Rol yetkileri koleksiyonu

- **[RolePermission](../../src/Core/Stocker.Domain/Tenant/Entities/RolePermission.cs)**: Rol yetkisi entity'si
  - `Resource`: Kaynak adı (Users, Roles, CRM.Customers, vb.)
  - `PermissionType`: Yetki tipi (View, Create, Edit, Delete, Export, Import, Approve, Execute)

#### Application Layer

**Commands**:
- `CreateRoleCommand`: Yeni rol oluştur
- `UpdateRoleCommand`: Rolü güncelle
- `DeleteRoleCommand`: Rolü sil

**Queries**:
- `GetRolesQuery`: Tüm rolleri listele (mevcut)

**Handlers**:
- [CreateRoleCommandHandler](../../src/Core/Stocker.Application/Features/Tenant/Roles/Handlers/CreateRoleCommandHandler.cs)
- [UpdateRoleCommandHandler](../../src/Core/Stocker.Application/Features/Tenant/Roles/Handlers/UpdateRoleCommandHandler.cs)
- [DeleteRoleCommandHandler](../../src/Core/Stocker.Application/Features/Tenant/Roles/Handlers/DeleteRoleCommandHandler.cs)

#### API Controller

[RolesController](../../src/API/Stocker.API/Controllers/Tenant/RolesController.cs) - REST API Endpoints:
- `GET /api/tenant/roles` - Tüm rolleri listele
- `POST /api/tenant/roles` - Yeni rol oluştur
- `PUT /api/tenant/roles/{id}` - Rolü güncelle
- `DELETE /api/tenant/roles/{id}` - Rolü sil

### Frontend (Next.js)

#### API Services

[roles.ts](../src/lib/api/roles.ts) - Role Management API Client:
- `getRoles()`: Rolleri getir
- `createRole(data)`: Rol oluştur
- `updateRole(roleId, data)`: Rol güncelle
- `deleteRole(roleId)`: Rol sil
- `parsePermission()`: Yetki string'ini parse et
- `getPermissionLabel()`: Yetki etiketini al

**Tanımlar**:
- `PermissionType` Enum: View(0), Create(1), Edit(2), Delete(3), Export(4), Import(5), Approve(6), Execute(7)
- `AVAILABLE_RESOURCES`: Sistemdeki tüm kaynaklar (Users, Roles, CRM modülleri, vb.)

#### React Query Hooks

[useRoles.ts](../src/hooks/useRoles.ts) - Data Fetching Hooks:
- `useRoles()`: Rolleri fetch et
- `useCreateRole()`: Rol oluşturma mutation
- `useUpdateRole()`: Rol güncelleme mutation
- `useDeleteRole()`: Rol silme mutation

#### RBAC Utilities

[roles.ts](../src/lib/utils/roles.ts) - Role-Based Access Control:

**Fonksiyonlar**:
- `isAdmin(role)`: FirmaYöneticisi kontrolü
- `isManager(role)`: Yönetici kontrolü
- `getRolePermissions(role, customRole?)`: Rol yetkilerini al (hem sistem hem custom rolleri destekler)
- `hasPermission(role, permission, customRole?)`: Belirli yetki kontrolü
- `derivePermissionsFromCustomRole(customRole)`: Backend yetkilerinden frontend permission flag'lerini türet

**Custom Role Desteği**:
Backend'den gelen dinamik rollerin permission'larını frontend permission sistemine map eder:
- `Users` resource → `canManageUsers`
- `Roles` resource → `canManageRoles`
- `Settings` resource → `canManageTenantSettings`
- `PermissionType.Export` → `canExportData`
- `PermissionType.Delete` → `canDeleteData`

#### UI Components

**Sayfalar**:
- [RolesPage](../src/app/(dashboard)/settings/roles/page.tsx): Rol yönetim ana sayfası
  - Rol listesi tablosu
  - Rol oluştur/düzenle/sil işlemleri
  - Expandable rows ile yetki detayları
  - Admin-only erişim kontrolü

**Components**:
- [RoleModal](../src/features/roles/components/RoleModal.tsx): Rol oluştur/düzenle modal'ı
  - Rol adı ve açıklama girişi
  - Kaynak bazlı yetki seçimi (checkbox'lar)
  - "Tümünü Seç" özelliği
  - Seçilen yetkiler önizlemesi
  - Form validasyonu

**Auth Components** (Mevcut):
- [AdminRoute](../src/components/auth/AdminRoute.tsx): Admin-only route koruma
- [PermissionGate](../src/components/auth/PermissionGate.tsx): Permission-based conditional rendering
- [useRole](../src/hooks/useRole.ts): Role bilgilerine erişim hook'u

#### Navigation

[Dashboard Layout](../src/app/(dashboard)/layout.tsx) - Ayarlar menüsüne eklenmiş altmenüler:
- Genel Ayarlar (`/settings/general`)
- Kullanıcı Yönetimi (`/settings/users`)
- **Rol Yönetimi** (`/settings/roles`) ← YENİ
- Güvenlik (`/settings/security`)

## Rol Hiyerarşisi

### Sistem Rolleri (Değiştirilemez)

1. **FirmaYöneticisi** (Admin)
   - Tüm yetkiler
   - Diğer rolleri oluşturabilir/düzenleyebilir
   - Kullanıcılara rol atayabilir
   - Sistem rollerini değiştiremez
   - Badge: Kırmızı

2. **Yönetici** (Manager)
   - Sınırlı admin yetkileri
   - Tüm verileri görüntüleme
   - Entegrasyon yönetimi
   - Veri dışa aktarma
   - Badge: Mavi

3. **Kullanıcı** (User)
   - Temel kullanıcı yetkileri
   - Sadece kendi verileri
   - Badge: Varsayılan

### Custom Roller (Dinamik)

FirmaYöneticisi tarafından oluşturulan özel roller:
- İstenilen kaynaklara istenilen yetki tipleri atanabilir
- Kullanıcılara atanabilir
- Düzenlenebilir/silinebilir (kullanıcı atanmamışsa)
- Sistem rolleri gibi davranır ancak `isSystemRole: false`

## Yetki Sistemi

### Backend Permission Types

```typescript
enum PermissionType {
  View = 0,      // Görüntüleme
  Create = 1,    // Oluşturma
  Edit = 2,      // Düzenleme
  Delete = 3,    // Silme
  Export = 4,    // Dışa Aktarma
  Import = 5,    // İçe Aktarma
  Approve = 6,   // Onaylama
  Execute = 7    // Yürütme
}
```

### Frontend Permission Flags

```typescript
interface RolePermissions {
  canManageUsers: boolean;
  canManageTenantSettings: boolean;
  canManageModules: boolean;
  canViewAllData: boolean;
  canManageIntegrations: boolean;
  canManageBilling: boolean;
  canManageSecurity: boolean;
  canManageRoles: boolean;
  canDeleteData: boolean;
  canExportData: boolean;
}
```

### Kaynak Örnekleri

**Sistem Kaynakları**:
- `Users`: Kullanıcı yönetimi
- `Roles`: Rol yönetimi
- `Tenants`: Tenant yönetimi
- `Modules`: Modül yönetimi
- `Settings`: Ayarlar
- `Integrations`: Entegrasyonlar
- `Billing`: Faturalandırma
- `Security`: Güvenlik
- `Audit`: Denetim kayıtları
- `Reports`: Raporlar

**CRM Kaynakları**:
- `CRM.Customers`: Müşteriler
- `CRM.Leads`: Potansiyel müşteriler
- `CRM.Deals`: Fırsatlar
- `CRM.Activities`: Aktiviteler
- `CRM.Pipelines`: Satış süreçleri
- `CRM.Campaigns`: Kampanyalar

## Kullanım Senaryoları

### Senaryo 1: Satış Müdürü Rolü Oluşturma

1. FirmaYöneticisi `/settings/roles` sayfasına gider
2. "Yeni Rol Oluştur" butonuna tıklar
3. Rol bilgilerini doldurur:
   - Ad: "Satış Müdürü"
   - Açıklama: "Satış ekibinin yöneticisi, CRM modülüne tam erişim"
4. Yetkileri seçer:
   - CRM.Customers: View, Create, Edit, Export
   - CRM.Leads: View, Create, Edit, Delete, Export
   - CRM.Deals: View, Create, Edit, Approve, Export
   - CRM.Activities: View, Create, Edit, Delete
   - CRM.Pipelines: View, Edit
   - Reports: View, Export
5. "Oluştur" butonuna tıklar
6. Rol başarıyla oluşturulur ve listede görünür

### Senaryo 2: Muhasebeci Rolü Oluşturma

1. FirmaYöneticisi yeni rol oluşturur
2. Rol bilgileri:
   - Ad: "Muhasebeci"
   - Açıklama: "Finansal işlemler ve raporlama"
3. Yetkileri:
   - Billing: View, Create, Edit, Export
   - Reports: View, Export
   - Audit: View
   - Users: View (kullanıcı bilgilerini görüntüleme)
4. Rol oluşturulur
5. İlgili kullanıcılara bu rol atanır

### Senaryo 3: Rol Güncelleme

1. Rol listesinden "Satış Müdürü" rolünün "Düzenle" butonuna tıklanır
2. Modal açılır, mevcut yetkiler görünür
3. Yeni yetkiler eklenir:
   - CRM.Campaigns: View, Create, Edit
4. "Güncelle" butonuna tıklanır
5. Bu role sahip tüm kullanıcılar otomatik olarak yeni yetkileri alır

### Senaryo 4: Rol Silme

1. Silinecek rol listeden seçilir
2. "Sil" butonuna tıklanır
3. Sistem kontrol eder:
   - Eğer role atanmış kullanıcı varsa → Hata mesajı gösterir
   - Eğer kullanıcı yoksa → Silme onayı ister
4. Onay verilirse rol silinir

## Güvenlik

### Backend Güvenliği

1. **Authorization**: Tüm role management endpoint'leri `[Authorize]` attribute'u ile korunmuş
2. **Tenant İzolasyonu**: Roller tenant bazlı, her tenant sadece kendi rollerini görebilir
3. **Sistem Rolü Koruması**: Sistem rolleri (`IsSystemRole: true`) değiştirilemez/silinemez
4. **Kullanıcı Kontrolü**: Kullanıcısı olan roller silinemez
5. **Validasyon**: Rol adı zorunlu, benzersiz olmalı

### Frontend Güvenliği

1. **Admin-Only Access**: Rol yönetimi sayfası sadece FirmaYöneticisi erişebilir
2. **Permission-Based UI**: UI elementleri kullanıcı yetkilerine göre gösterilir/gizlenir
3. **Double Validation**: Hem client-side hem server-side validasyon
4. **CSRF Protection**: HttpOnly cookie authentication ile korunma

## API Kullanım Örnekleri

### Rolleri Listele

```bash
GET /api/tenant/roles
Authorization: Bearer {token}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "name": "Satış Müdürü",
      "description": "Satış ekibinin yöneticisi",
      "permissions": [
        "CRM.Customers:0",
        "CRM.Customers:1",
        "CRM.Leads:0",
        "CRM.Leads:1",
        "CRM.Leads:2"
      ],
      "userCount": 3,
      "isSystemRole": false,
      "createdDate": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Yeni Rol Oluştur

```bash
POST /api/tenant/roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Muhasebeci",
  "description": "Finansal işlemler",
  "permissions": [
    {
      "resource": "Billing",
      "permissionType": 0
    },
    {
      "resource": "Billing",
      "permissionType": 1
    },
    {
      "resource": "Reports",
      "permissionType": 4
    }
  ]
}
```

### Rol Güncelle

```bash
PUT /api/tenant/roles/{roleId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Satış Müdürü",
  "description": "Güncel açıklama",
  "permissions": [
    {
      "resource": "CRM.Customers",
      "permissionType": 0
    }
  ]
}
```

### Rol Sil

```bash
DELETE /api/tenant/roles/{roleId}
Authorization: Bearer {token}
```

## Test Senaryoları

### Unit Tests

1. **Role Entity Tests**:
   - ✅ Rol oluşturma
   - ✅ Yetki ekleme
   - ✅ Yetki kaldırma
   - ✅ Sistem rolü koruma

2. **Handler Tests**:
   - ✅ CreateRoleCommandHandler başarılı senaryo
   - ✅ Aynı isimle rol oluşturma hatası
   - ✅ UpdateRoleCommandHandler sistem rolü hatası
   - ✅ DeleteRoleCommandHandler kullanıcı var hatası

### Integration Tests

1. **API Tests**:
   - ✅ GET /roles - Başarılı listeleme
   - ✅ POST /roles - Başarılı oluşturma
   - ✅ PUT /roles/{id} - Başarılı güncelleme
   - ✅ DELETE /roles/{id} - Başarılı silme
   - ✅ Unauthorized erişim kontrolü

### E2E Tests

1. **UI Tests**:
   - ✅ Admin rolü yönetim sayfasına erişebilir
   - ✅ Normal kullanıcı erişemez
   - ✅ Rol oluşturma flow'u çalışır
   - ✅ Rol düzenleme flow'u çalışır
   - ✅ Rol silme flow'u çalışır

## Performans Optimizasyonları

1. **React Query Caching**: Roller client-side cache'lenir
2. **Optimistic Updates**: Mutation'lar optimistic update ile hızlı UX
3. **Lazy Loading**: RoleModal component lazy load
4. **Indexed Queries**: Role tablosunda Name ve TenantId index'li
5. **Permission Derivation**: Custom role permission'ları cache'lenir

## Gelecek Geliştirmeler

1. **Role Templates**: Hazır rol şablonları (Satış, Muhasebe, vb.)
2. **Role Inheritance**: Rol kalıtımı (Manager'dan türeyen SalesManager)
3. **Temporal Permissions**: Zamana bağlı geçici yetkiler
4. **Permission Groups**: Yetki grupları (CRM_FULL, REPORTS_READ)
5. **Audit Log**: Rol değişiklik geçmişi
6. **Bulk Operations**: Toplu rol atama/kaldırma
7. **Role Analytics**: Rol kullanım istatistikleri
8. **Permission Conflicts**: Çakışan yetki uyarıları
9. **Role Suggestions**: AI ile rol önerisi
10. **Export/Import**: Rol yapılandırma dışa/içe aktarma

## Sorun Giderme

### Rol oluşturulamıyor
- Backend'de `IsSystemRole` kontrolü yapıyor mu?
- Aynı isimde rol var mı?
- TenantId doğru mu?

### Yetkiler UI'da görünmüyor
- `derivePermissionsFromCustomRole()` fonksiyonu çalışıyor mu?
- Permission string formatı doğru mu? (`resource:permissionType`)
- `useRole()` hook'u custom role parametresi alıyor mu?

### Rol silinemez hatası
- Role atanmış kullanıcı var mı?
- Sistem rolü mu? (sistem rolleri silinemez)
- Backend'de cascade delete ayarlanmış mı?

## Dokümantasyon

- [RBAC.md](./RBAC.md): Rol tabanlı erişim kontrol sistemi kullanım kılavuzu
- [API Documentation](./API.md): REST API endpoint'leri
- [Permission Matrix](./PERMISSIONS.md): Yetki matrisi ve açıklamaları

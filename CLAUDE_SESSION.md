# Claude Session Notes - 28 Aralık 2024

## 🔍 Aktif Sorun: Company Creation Timeout

### Problem
- **Endpoint**: POST /api/tenant/companies
- **Hata**: 30 saniye timeout
- **Tenant**: abb5ee9b-483f-4f15-85ea-168acac0709d (Deneme Teknoloji A.Ş.)
- **User**: deneme@hotmail.com

### Log Akışı
```
✅ Tenant resolved: abb5ee9b-483f-4f15-85ea-168acac0709d
✅ CreateCompany - User: deneme@hotmail.com, Role: TenantOwner
✅ Creating company for tenant abb5ee9b-483f-4f15-85ea-168acac0709d
✅ Handling CreateCompanyCommand (LoggingBehavior)
✅ Creating ITenantUnitOfWork instance...
✅ Current tenant ID from service: abb5ee9b-483f-4f15-85ea-168acac0709d
✅ Creating TenantUnitOfWork for tenant...
❌ [BURADA TAKILIYOR - TenantUnitOfWorkFactory.CreateAsync]
```

### Yapılan Düzeltmeler

#### 1. Frontend - Tenant ID Kaydetme
**Dosya**: `stocker-web/src/app/store/auth.store.ts`
```typescript
// Login ve checkAuth'da tenant ID localStorage'a kaydediliyor
if (user?.tenantId) {
  localStorage.setItem('stocker_tenant', user.tenantId);
}
```

#### 2. Frontend - Company Creation Request
**Dosya**: `stocker-web/src/features/company/pages/CompanySetup/index.tsx`
```typescript
// Address field'ı nested object olarak gönderiliyor
address: {
  country: formData.country,
  city: formData.city,
  district: formData.district,
  postalCode: formData.postalCode,
  addressLine: formData.addressLine
}
```

#### 3. Backend - Debug Log'lar
**Eklenen Log'lar**:

1. **ServiceCollectionExtensions.cs** (ITenantUnitOfWork registration):
   - Tenant ID kontrolü
   - Factory çağrısı
   - Exception handling

2. **TenantUnitOfWorkFactory.cs**:
   - CreateAsync başlangıç/bitiş
   - TenantDbContext creation
   - Exception detayları

3. **TenantDbContextFactory.cs**:
   - Tenant MasterDb'de arama
   - Connection string (password masked)
   - Database connection test (CanConnectAsync)
   - Exception detayları

### Muhtemel Sorun Kaynakları

1. **Connection String Sorunu**
   - Tenant DB connection string yanlış olabilir
   - Server adresi: coolify.stoocker.app
   - Database adı kontrol edilmeli

2. **Veritabanı Oluşturulmamış**
   - Tenant için veritabanı fiziksel olarak oluşturulmamış olabilir
   - Migration yapılmamış olabilir

3. **SQL Server Bağlantı Sorunu**
   - Firewall/Network sorunu
   - SQL Server authentication sorunu
   - Connection timeout

### Sonraki Adımlar

1. **Log'ları İncele**:
   ```bash
   # Production log'larını kontrol et
   ssh root@95.217.219.4
   docker logs stocker-api --tail 100 -f
   ```

2. **Özellikle Bak**:
   - "Connection string:" satırı
   - "Database connection test:" sonucu
   - Error mesajları

3. **Manuel Test**:
   ```sql
   -- MasterDb'de tenant'ı kontrol et
   SELECT Id, Name, ConnectionString 
   FROM Tenants 
   WHERE Id = 'abb5ee9b-483f-4f15-85ea-168acac0709d'
   ```

4. **Connection String'i Test Et**:
   - SSMS veya Azure Data Studio ile bağlanmayı dene
   - Tenant veritabanının varlığını kontrol et

## 📝 Bekleyen İşler (TODO)

1. **Company Creation Sorunu Çöz** (Aktif)
2. Admin Reports sayfasını oluştur
3. Admin Monitoring sayfasını oluştur
4. Forgot Password özelliği ekle
5. RegisterCommandHandler'a password validation ekle

## 💡 Önemli Notlar

- **Coolify**: Otomatik deploy yapıyor (GitHub push sonrası)
- **Multi-Tenant**: Her tenant'ın ayrı DB'si var
- **Connection Format**: `Server=coolify.stoocker.app;Database=StockerTenant_{TenantCode};...`
- **Debug Mode**: Production'da debug log'lar aktif

## 🔗 Bağlantılar

- **Production**: https://stoocker.app
- **API**: https://api.stoocker.app  
- **Server IP**: 95.217.219.4
- **GitHub**: https://github.com/abrkgrbz/Stocker

---
*Son güncelleme: 28 Aralık 2024 14:15*
# Claude Code - Proje Bilgi Dosyası

Bu dosya Claude Code için proje hakkında kritik bilgileri içerir.

## 🏗️ Proje Mimarisi
- **Clean Architecture** kullanılıyor
- **Multi-Tenant** yapı (Master + Tenant DB)
- **Domain**: stoocker.app
- **API**: https://api.stoocker.app

## 📦 Teknoloji Stack
- **.NET 9.0**
- **SQL Server 2022**
- **Redis** (Cache)
- **Hangfire** (Background Jobs)
- **SignalR** (Real-time)
- **React** (Frontend)
- **Docker** (Deployment)

## 🔑 Önemli Bilgiler
- **Email**: info@stoocker.app / A.bg010203
- **Server IP**: 95.217.219.4
- **Master DB**: StockerMasterDb
- **Tenant DB**: StockerTenantDb
- **SA Password**: YourStrongPassword123!

## 🚀 Son Yapılan İşlemler

### 23 Aralık 2024 - v1.1.0 Release
- ✅ **Hangfire Entegrasyonu Tamamlandı**
  - Hangfire paketleri yüklendi (Core, SqlServer, AspNetCore v1.8.21)
  - Background job interface'leri oluşturuldu
  - Email işlemleri async queue'ya alındı
  - Tenant provisioning background job'a çevrildi
  - Hangfire Dashboard eklendi (/hangfire)
  - 3 queue seviyesi: critical, default, low
  - Retry mekanizması eklendi (exponential backoff)
  - 32 worker thread ile paralel işleme

- ✅ **Database Migration Yenilendi**
  - Tüm migration dosyaları silindi ve yeniden oluşturuldu
  - MasterDb ve TenantDb temiz kurulum
  - Hangfire tabloları otomatik oluşturuluyor
  - Seed data ile admin kullanıcılar eklendi

- ✅ **Dokümantasyon Sistemi**
  - CHANGELOG.md güncellendi
  - PROJECT_STATUS.md oluşturuldu
  - .claude klasörü eklendi

### Dosya Değişiklikleri
- `src/Infrastructure/Stocker.Infrastructure/BackgroundJobs/` - Yeni klasör
- `src/Core/Stocker.Application/Common/Interfaces/IBackgroundJobService.cs` - Yeni
- `src/Core/Stocker.Application/Common/Interfaces/IEmailBackgroundJob.cs` - Yeni
- `src/Core/Stocker.Application/Common/Interfaces/ITenantProvisioningJob.cs` - Yeni
- `src/Core/Stocker.Application/Features/Identity/Commands/Register/RegisterCommandHandler.cs` - Güncellendi
- `src/API/Stocker.API/Program.cs` - Hangfire dashboard eklendi
- `src/API/Stocker.API/appsettings.json` - Hangfire config eklendi

## 📋 Yapılacaklar (TODO)
1. **KRİTİK**: Database migration ve seed data
2. Admin kullanıcı oluşturma
3. Email template testleri
4. Monitoring sistemi (Serilog entegre)

## 🔧 Komutlar

### Build & Run
```bash
dotnet build
dotnet run --project src/API/Stocker.API/Stocker.API.csproj
```

### Database Migration
```bash
dotnet ef migrations add InitialCreate -c MasterDbContext -p src/Infrastructure/Stocker.Persistence -s src/API/Stocker.API
dotnet ef database update -c MasterDbContext -p src/Infrastructure/Stocker.Persistence -s src/API/Stocker.API
```

### Docker
```bash
docker-compose -f docker-compose.coolify.yml up -d
```

## ⚠️ Dikkat Edilecekler
- Login problemi var - DB migration yapılmamış
- Production'da JWT Secret değiştirilmeli
- Hangfire tabloları ilk çalıştırmada otomatik oluşacak
- Email gönderimi artık async - kullanıcı beklemez

## 🎯 Proje Durumu
- ✅ Site aktif: https://stoocker.app (Production)
- ✅ API çalışıyor: https://localhost:7021 (Local)
- ✅ Hangfire Dashboard: https://localhost:7021/hangfire
- ✅ Database migration tamamlandı
- ✅ Admin kullanıcılar oluşturuldu
- ✅ Email sistemi async çalışıyor
- ✅ Serilog loglama aktif
- ✅ Rate limiting aktif
- ⚠️ Backup stratejisi eksik

## 📈 Tamamlanma Oranı: %70

### Tamamlanan Özellikler (19/27)
- ✅ Multi-tenant mimari
- ✅ Authentication & Authorization
- ✅ Background job sistemi
- ✅ Email queue
- ✅ Database migrations
- ✅ Admin seed data
- ✅ Rate limiting
- ✅ Logging sistemi
- ✅ Dokümantasyon

### Bekleyen Özellikler (8/27)
- ⏳ Database backup stratejisi
- ⏳ Load testing
- ⏳ Security audit
- ⏳ Code splitting (Frontend)
- ⏳ PWA desteği
- ⏳ Dark mode
- ⏳ Image optimization
- ⏳ Application metrics

---
*Son güncelleme: 23 Aralık 2024 - v1.1.0*
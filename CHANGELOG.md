# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 24 Aralık 2024

### Added
- **Modern Registration Wizard System**
  - ROI Calculator tarzında split-screen tasarım
  - Sol tarafta form paneli (750px genişlik)
  - Sağ tarafta animasyonlu görsel panel
  - 3 adımlı kayıt süreci (Şirket, İletişim, Güvenlik)
  - Adım bazlı dinamik animasyonlar ve içerik

- **Real-time Validation System**
  - SignalR entegrasyonu ile canlı doğrulama
  - E-posta format ve kullanılabilirlik kontrolü
  - Telefon numarası format validasyonu
  - Şirket adı müsaitlik kontrolü
  - Domain (şirket kodu) müsaitlik kontrolü
  - Şifre güç analizi ve gerçek zamanlı geri bildirim
  - Bağlantı durumu göstergesi

- **Auto-complete System for Company Names**
  - Dinamik öneri oluşturucu (kullanıcı ne yazarsa yazsın öneriler üretir)
  - 2+ karakter: Temel şirket tipleri (A.Ş., Ltd. Şti.)
  - 3+ karakter: Sektörel öneriler (Teknoloji, Yazılım, İnşaat vb.)
  - 4+ karakter: Holding ve Grup şirket önerileri
  - Otomatik şirket kodu oluşturma (şirket adından)
  - Renkli badge'ler (Teknoloji, Yazılım, Holding vb.)
  - İlk harf otomatik büyük harf dönüşümü

- **React-Select Integration**
  - Sektör ve çalışan sayısı için modern dropdown
  - Özelleştirilmiş stiller (54px yükseklik, 14px border-radius)
  - Arama özelliği (sektör seçiminde)
  - Temizleme butonu (isClearable)
  - Türkçe placeholder ve mesajlar
  - Focus/hover animasyonları

- **Enhanced Form Validation**
  - Boş alan kontrolleri (tüm zorunlu alanlar)
  - TC Kimlik No (11 haneli) validasyonu
  - Vergi No (10 haneli) validasyonu
  - E-posta format kontrolü
  - Telefon format kontrolü (10-11 haneli)
  - Şifre güç kontrolü (minimum skor: 3)
  - Şifre eşleşme kontrolü
  - Kullanım koşulları onay kontrolü
  - Adım bazlı validasyon mesajları

### Changed
- RegisterPage artık ModernWizard kullanıyor (NeonWizard yerine)
- App.tsx routing düzenlendi (/register → RegisterPage)
- Input icon'ları düzgün hizalandı (dikey ortalama)
- Form elemanları büyütüldü (54px yükseklik)
- Visual panel sağa taşındı, form panel sola alındı

### Fixed
- Input içindeki logo hizalama sorunu çözüldü
- Boş alan bırakıldığında validasyon uyarıları eklendi
- Select alanlarının modern görünümü sağlandı
- Wizard features alanının taşma sorunu düzeltildi
- Error mesajlarının görünürlüğü iyileştirildi

### UI/UX Improvements
- **Animasyonlar**:
  - Floating elements (yüzen daireler)
  - Chart bars (grafik çubukları) animasyonu
  - Step geçişlerinde içerik animasyonu
  - Dropdown açılma animasyonları
  - Error mesajı slideDown animasyonu

- **Görsel İyileştirmeler**:
  - Gradient arka planlar
  - Glass morphism efektleri
  - Box shadow'lar
  - Hover efektleri
  - Focus state'leri
  - Loading spinner'lar

- **Responsive Tasarım**:
  - 1400px altında form panel 650px
  - 1200px altında visual panel gizlenir
  - Mobile uyumlu form elemanları
  - Flex-wrap ile responsive feature items

### Technical Details
- Added react-select v5.x for modern dropdowns
- Implemented custom select styles with TypeScript
- Created generateCompanySuggestions function for dynamic suggestions
- Added showCompanySuggestions state management
- Implemented selectCompanySuggestion handler
- Added validation error state management per field
- Created custom CSS animations (float, slideDown, pulse, growBar)

### Security Enhancements
- Password strength requirements enforced
- Real-time validation prevents weak passwords
- TC/VKN validation for business verification
- Email uniqueness check via SignalR
- Domain availability check for company codes

## [1.1.0] - 23 Aralık 2024

### Added
- **Hangfire Background Job System**
  - Complete background job processing infrastructure
  - Email queue with retry mechanism (critical/default/low priorities)
  - Tenant provisioning background jobs
  - Hangfire Dashboard at `/hangfire` endpoint with authentication
  - Background job interfaces in Application layer (Clean Architecture)
  - Automatic retry policies with exponential backoff
  - 3 queue priorities: critical, default, low
  - 32 worker threads for parallel processing

- **Documentation System**
  - CLAUDE.md for AI assistant context
  - PROJECT_STATUS.md for project tracking
  - .claude/project_context.md for quick reference

- **Database Infrastructure**
  - Fresh database migrations for Master and Tenant databases
  - Automatic migration on application startup
  - Seed data with default admin users
  - Hangfire tables automatic creation

### Changed
- Email sending moved from synchronous to asynchronous processing
- User registration now uses background jobs for emails
- Tenant provisioning now runs as background job
- Migration files recreated from scratch for clean structure

### Fixed
- Database migration issues resolved
- Build errors in RegisterCommandHandler fixed
- Clean Architecture violation fixed (moved interfaces to Application layer)

### Security
- Admin default credentials configured:
  - System Admin: `admin@stocker.com` / `Admin123!`
  - Tenant Admin: `admin@tenant.local` / `Admin123!`
- Hangfire Dashboard secured with authorization filter

### Technical Details
- Added Hangfire.Core v1.8.21
- Added Hangfire.SqlServer v1.8.21
- Added Hangfire.AspNetCore v1.8.21
- Created IBackgroundJobService interface
- Created IEmailBackgroundJob interface
- Created ITenantProvisioningJob interface
- Implemented HangfireBackgroundJobService
- Implemented EmailBackgroundJob with retry policies
- Implemented TenantProvisioningJob with concurrency control

### Infrastructure
- **Completed Components**:
  - ✅ Database migrations and seed data
  - ✅ Admin user creation with defaults
  - ✅ Email template system with fallbacks
  - ✅ Serilog monitoring and file logging
  - ✅ API rate limiting (Global: 100/min, Auth: 5/min, API: 60/min)
  - ✅ Hangfire integration with SQL Server storage

### Known Issues
- Backup strategy not implemented
- Load testing scenarios missing
- Security audit pending
- Frontend optimizations needed (code splitting, PWA, dark mode)

## [1.0.0] - 21 Aralık 2024

### Initial Production Release
- Multi-tenant architecture
- User authentication & authorization
- Email service integration
- Turkish localization
- Rate limiting
- Security headers
- CORS configuration
- Health check endpoints

### Known Issues
- Database migration pending
- Admin user seed data missing
- Login functionality blocked due to missing migrations
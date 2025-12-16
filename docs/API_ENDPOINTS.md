# Stocker Platform - API Endpoint Documentation

> **Son Guncelleme**: 16 Aralik 2025
> **Toplam Controller**: 130+
> **Toplam Endpoint**: 510+

---

## Ozet Tablo

| Modul | Controller | Endpoint | Auth | Aciklama |
|-------|-----------|----------|------|----------|
| **Public** | 7 | 30+ | Hayir | Kayit, Dogrulama, Health |
| **Tenant Core** | 12 | 50+ | Evet | Auth, Users, Settings |
| **Master Admin** | 15 | 45+ | Master | Tenant Yonetimi, Faturalama |
| **Admin** | 4 | 20+ | Admin | Secrets, Logs, Migration |
| **CRM** | 18 | 80+ | Modul | Musteriler, Leads, Firsatlar |
| **Inventory** | 25 | 90+ | Modul | Urunler, Stok, Depolar |
| **HR** | 20 | 70+ | Modul | Calisanlar, Bordro, Yoklama |
| **Sales** | 8 | 40+ | Modul | Siparisler, Faturalar |
| **Purchase** | 10 | 50+ | Modul | Satin Alma, Tedarikciler |
| **TOPLAM** | **130+** | **510+** | - | Tam ERP Suite |

---

## 1. PUBLIC API (Kimlik Dogrulama Gerektirmeyen)

**Route Prefix**: `api/public/`
**Authentication**: `AllowAnonymous`
**Toplam**: 30+ endpoint

### 1.1 Health & Status

**HealthController** (`/health`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | API saglik durumu kontrolu |
| GET | `/detailed` | Detayli saglik (DB, Redis, Email) |
| GET | `/ready` | Kubernetes readiness probe |
| GET | `/live` | Kubernetes liveness probe |

### 1.2 Tenant Kayit

**TenantRegistrationController** (`/tenant-registration`) - 7 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/register` | Yeni tenant firma kaydi |
| GET | `/status/{code}` | Kayit durumu sorgulama |
| GET | `/wizard/{tenantId}` | Setup wizard getir |
| PUT | `/wizard/{wizardId}/step` | Wizard adimi guncelle |
| GET | `/checklist/{tenantId}` | Setup checklist getir |
| PUT | `/checklist/{id}/item` | Checklist item guncelle |
| POST | `/verify-email` | Email dogrulama |

### 1.3 Dogrulama Servisleri

**ValidationController** (`/validate`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/email` | Email format ve musaitlik kontrolu |
| POST | `/phone` | Telefon numara dogrulama |
| POST | `/password-strength` | Sifre guc kontrolu |
| POST | `/domain` | Domain musaitlik kontrolu |
| POST | `/company-name` | Sirket adi benzersizlik |
| POST | `/identity` | TC/Vergi No dogrulama |

### 1.4 Genel Bilgiler

**PublicController** (`/public`) - 11 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/packages` | Fiyat paketleri listesi |
| GET | `/modules` | Mevcut moduller |
| POST | `/calculate-price` | Ozel paket fiyat hesapla |
| GET | `/setup-options` | Kurulum secenekleri |
| POST | `/register` | Tenant kayit (paketli) |
| POST | `/process-payment` | Odeme islemi (simulasyon) |
| GET | `/verify-email` | Email token dogrula |
| GET | `/check-domain` | Domain kontrol |
| POST | `/test-email` | Email servis testi |
| POST | `/check-email` | Email varlik kontrolu |
| GET | `/tenant-check/{code}` | Tenant kod kontrolu |

### 1.5 Tenant Kesfet

**TenantCheckController** (`/tenants`) - 1 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/check/{slug}` | Subdomain ile tenant kontrol |

### 1.6 Sifre Servisleri

**PasswordController** (`/password`) - 2 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/check-strength` | Sifre guc analizi |
| POST | `/validate` | Sifre politika dogrulama |

---

## 2. TENANT AUTHENTICATION & CORE

**Route Prefix**: `api/`
**Authentication**: JWT Required
**Toplam**: 50+ endpoint

### 2.1 Kimlik Dogrulama

**AuthController** (`/auth`) - 18 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/login` | Email/sifre ile giris |
| POST | `/refresh-token` | Access token yenile |
| POST | `/register` | Yeni kullanici kayit |
| POST | `/logout` | Cikis ve cookie temizle |
| POST | `/verify-email` | Email dogrula |
| POST | `/resend-verification-email` | Dogrulama emaili tekrar gonder |
| POST | `/check-email` | Email varlik kontrolu |
| GET | `/me` | Mevcut kullanici bilgisi |
| POST | `/forgot-password` | Sifre sifirlama talebi |
| GET | `/validate-reset-token` | Reset token dogrula |
| POST | `/reset-password` | Sifre sifirla |
| POST | `/setup-2fa` | 2FA kurulumu |
| POST | `/enable-2fa` | 2FA etkinlestir |
| POST | `/verify-2fa` | 2FA dogrula |
| POST | `/disable-2fa` | 2FA devre disi |
| GET | `/check-2fa-lockout` | 2FA kilit durumu |

### 2.2 Kullanici Yonetimi

**UsersController** (`/tenant/users`) - 10 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Kullanici listesi (sayfalamali) |
| GET | `/{id}` | Kullanici detay |
| POST | `/` | Yeni kullanici olustur |
| PUT | `/{id}` | Kullanici guncelle |
| DELETE | `/{id}` | Kullanici sil (soft) |
| POST | `/{id}/toggle-status` | Aktif/pasif yap |
| POST | `/{id}/reset-password` | Admin sifre sifirla |
| GET | `/roles` | Mevcut roller |
| GET | `/subscription-info` | Abonelik bilgisi |
| POST | `/{id}/assign-role` | Rol ata |

### 2.3 Tenant Ayarlari

**SettingsController** (`/tenant/settings`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Tenant ayarlari getir |
| PUT | `/` | Tenant ayarlari guncelle |
| POST | `/test-connection` | DB baglanti testi |

**CompaniesController** (`/tenant/companies`) - 2 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Sirket bilgisi |
| PUT | `/` | Sirket bilgisi guncelle |

**ModulesController** (`/tenant/modules`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Aktif moduller |
| POST | `/{id}/activate` | Modul etkinlestir |
| POST | `/{id}/deactivate` | Modul devre disi |

### 2.4 Rol Yonetimi

**RolesController** (`/tenant/roles`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Roller listesi |
| POST | `/` | Rol olustur |
| PUT | `/{id}` | Rol guncelle |
| DELETE | `/{id}` | Rol sil |

### 2.5 Dashboard & Bildirimler

**DashboardController** (`/tenant/dashboard`) - 1 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Dashboard verileri |

**NotificationsController** (`/tenant/notifications`) - 2 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Bildirimler listesi |
| PUT | `/{id}/mark-as-read` | Okundu isaretle |

### 2.6 Departman Yonetimi

**DepartmentController** (`/tenant/departments`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Departman listesi |
| GET | `/{id}` | Departman detay |
| POST | `/` | Departman olustur |
| PUT | `/{id}` | Departman guncelle |
| DELETE | `/{id}` | Departman sil |

### 2.7 Onboarding

**OnboardingController** (`/tenant/onboarding`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/status` | Onboarding durumu |
| POST | `/complete-step` | Adim tamamla |
| POST | `/skip-step` | Adim atla |

---

## 3. MASTER ADMIN PANEL

**Route Prefix**: `api/master/`
**Policy**: `RequireMasterAccess`
**Toplam**: 45+ endpoint

### 3.1 Master Authentication

**MasterAuthController** (`/master/auth`) - 14 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/login` | Master admin giris |
| POST | `/refresh-token` | Token yenile |
| POST | `/logout` | Cikis |
| GET | `/me` | Mevcut kullanici |
| GET | `/validate-token` | Token dogrula |
| GET | `/check-2fa-lockout` | 2FA kilit durumu |
| POST | `/verify-2fa` | 2FA dogrula |
| POST | `/verify-backup-code` | Yedek kod dogrula |
| POST | `/verify-email` | Email dogrula |
| POST | `/setup-2fa` | 2FA kur |
| POST | `/enable-2fa` | 2FA etkinlestir |
| POST | `/disable-2fa` | 2FA kapat |
| GET | `/2fa-status` | 2FA durumu |

### 3.2 Tenant Yonetimi

**TenantsController** (`/master/tenants`) - 25 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Tenant listesi (filtreli) |
| GET | `/statistics` | Genel istatistikler |
| GET | `/registrations` | Bekleyen kayitlar |
| GET | `/{id}` | Tenant detay |
| GET | `/{id}/statistics` | Tenant istatistikleri |
| POST | `/` | Tenant olustur |
| PUT | `/{id}` | Tenant guncelle |
| POST | `/{id}/toggle-status` | Aktif/pasif |
| DELETE | `/{id}` | Tenant sil |
| POST | `/{id}/suspend` | Askiya al |
| POST | `/{id}/activate` | Aktifle |
| POST | `/from-registration` | Kayittan olustur |
| POST | `/{id}/login` | Tenant'a giris yap |
| POST | `/{id}/migrate` | Migration baslat |
| POST | `/{id}/backup` | Yedek al |
| GET | `/{id}/setup-wizard` | Setup wizard |
| PUT | `/{id}/setup-wizard/{wid}` | Wizard guncelle |
| GET | `/{id}/setup-checklist` | Checklist |
| PUT | `/{id}/setup-checklist/{cid}` | Checklist guncelle |
| GET | `/{id}/activities` | Aktiviteler |
| GET | `/{id}/activity-logs` | Log kayitlari |
| GET | `/{id}/activity-logs/export` | Log export |
| GET | `/{id}/security-events` | Guvenlik olaylari |
| GET | `/{id}/settings` | Tenant ayarlari |
| PUT | `/{id}/settings` | Ayarlari guncelle |

### 3.3 Dashboard & Analitik

**DashboardController** (`/master/dashboard`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/stats` | Genel istatistikler |
| GET | `/revenue-overview` | Gelir ozeti |
| GET | `/tenant-stats` | Tenant istatistikleri |
| GET | `/system-health` | Sistem sagligi |
| GET | `/recent-tenants` | Son tenantlar |
| GET | `/recent-users` | Son aktiviteler |

### 3.4 Faturalama & Odemeler

**PaymentsController** (`/master/payments`) - 10 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Odeme listesi |
| GET | `/{id}` | Odeme detay |
| GET | `/tenant/{tenantId}` | Tenant odemeleri |
| POST | `/process` | Odeme isle |
| POST | `/{id}/refund` | Iade yap |
| POST | `/{id}/cancel` | Iptal et |
| GET | `/tenant/{tenantId}/statistics` | Odeme istatistikleri |
| GET | `/failed` | Basarisiz odemeler |
| POST | `/{id}/retry` | Tekrar dene |

**SubscriptionsController** (`/master/subscriptions`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Abonelik listesi |
| GET | `/{id}` | Abonelik detay |
| POST | `/` | Abonelik olustur |
| PUT | `/{id}` | Abonelik guncelle |
| POST | `/{id}/upgrade` | Yukselt |
| POST | `/{id}/downgrade` | Dusur |
| POST | `/{id}/renew` | Yenile |
| POST | `/{id}/cancel` | Iptal |

### 3.5 Paket Yonetimi

**PackagesController** (`/master/packages`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Paket listesi |
| POST | `/` | Paket olustur |
| PUT | `/{id}` | Paket guncelle |
| DELETE | `/{id}` | Paket sil |

**ModuleActivationController** (`/master/module-activation`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/activate` | Modul aktifle |
| POST | `/deactivate` | Modul kapat |
| GET | `/tenant/{id}` | Tenant modulleri |

### 3.6 Sistem Yonetimi

**SystemManagementController** (`/master/system`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/configuration` | Sistem konfig |
| PUT | `/configuration` | Konfig guncelle |
| POST | `/maintenance-mode` | Bakim modu ac |
| DELETE | `/maintenance-mode` | Bakim modu kapat |
| POST | `/cache-clear` | Cache temizle |

**MonitoringController** (`/master/monitoring`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/system-health` | Sistem sagligi |
| GET | `/performance` | Performans metrikleri |
| GET | `/logs` | Sistem loglari |

**TenantHealthController** (`/master/tenant-health`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/{tenantId}/status` | Tenant saglik durumu |
| GET | `/{tenantId}/database` | DB sagligi |
| POST | `/{tenantId}/ping` | Ping kontrolu |

### 3.7 Audit & Raporlama

**AuditLogsController** (`/master/audit-logs`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Audit loglari |
| GET | `/by-user/{userId}` | Kullanici loglari |
| GET | `/by-action/{action}` | Aksiyon loglari |
| DELETE | `/` | Eski loglari temizle |

**ReportsController** (`/master/reports`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/revenue` | Gelir raporu |
| GET | `/users` | Kullanici raporu |
| GET | `/tenants` | Tenant raporu |
| POST | `/generate` | Ozel rapor uret |
| GET | `/export` | Rapor export |

### 3.8 Kullanici Yonetimi (Master)

**MasterUsersController** (`/master/users`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Master kullanici listesi |
| GET | `/{id}` | Kullanici detay |
| POST | `/` | Kullanici olustur |
| PUT | `/{id}` | Kullanici guncelle |
| DELETE | `/{id}` | Kullanici sil |

### 3.9 Migration

**MigrationController** (`/master/migration`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/start` | Migration baslat |
| GET | `/{id}/status` | Durum kontrol |
| POST | `/{id}/rollback` | Geri al |

---

## 4. ADMIN PANEL (Tenant-Level)

**Route Prefix**: `api/admin/`
**Authentication**: Admin Required
**Toplam**: 20+ endpoint

### 4.1 Secrets Yonetimi

**SecretsController** (`/admin/secrets`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Secret listesi |
| GET | `/{secretName}` | Secret metadata |
| DELETE | `/{secretName}` | Secret sil |
| DELETE | `/tenant/{shortId}` | Tenant secretlari sil |
| GET | `/status` | Secret store durumu |

### 4.2 Log Yonetimi

**LogsController** (`/admin/logs`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Log listesi |
| GET | `/{id}` | Log detay |
| POST | `/query` | Log sorgula |

### 4.3 Tenant Migration

**TenantMigrationController** (`/admin/tenant-migration`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/initiate` | Migration baslat |
| GET | `/{id}/status` | Durum kontrol |
| POST | `/{id}/complete` | Tamamla |

### 4.4 Modul Yonetimi

**TenantModulesController** (`/admin/tenant-modules`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/{tenantId}` | Tenant modulleri |
| POST | `/{tenantId}/activate` | Modul aktifle |
| POST | `/{tenantId}/deactivate` | Modul kapat |

---

## 5. CRM MODULU

**Route Prefix**: `api/crm/`
**Policy**: `RequireModule("CRM")`
**Toplam**: 80+ endpoint

### 5.1 Musteriler

**CustomersController** (`/crm/customers`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Musteri listesi |
| GET | `/paged` | Sayfalamali liste |
| GET | `/{id}` | Musteri detay |
| POST | `/` | Musteri olustur |
| PUT | `/{id}` | Musteri guncelle |
| DELETE | `/{id}` | Musteri sil |

### 5.2 Potansiyel Musteriler (Leads)

**LeadsController** (`/crm/leads`) - 12 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Lead listesi |
| GET | `/{id}` | Lead detay |
| POST | `/` | Lead olustur |
| PUT | `/{id}` | Lead guncelle |
| DELETE | `/{id}` | Lead sil |
| POST | `/{id}/convert` | Musteriye donustur |
| POST | `/{id}/qualify` | Nitelendir |
| POST | `/{id}/disqualify` | Reddet |
| POST | `/{id}/assign` | Satisciya ata |
| GET | `/{id}/activities` | Aktiviteler |
| POST | `/{id}/score` | Skor guncelle |
| GET | `/statistics` | Istatistikler |

### 5.3 Firsatlar

**OpportunitiesController** (`/crm/opportunities`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Firsat listesi |
| GET | `/{id}` | Firsat detay |
| POST | `/` | Firsat olustur |
| PUT | `/{id}` | Firsat guncelle |
| DELETE | `/{id}` | Firsat sil |
| POST | `/{id}/move-stage` | Asama degistir |
| POST | `/{id}/close-won` | Kazanildi olarak kapat |
| POST | `/{id}/close-lost` | Kaybedildi olarak kapat |

### 5.4 Anlasmalar

**DealsController** (`/crm/deals`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Anlasma listesi |
| GET | `/{id}` | Anlasma detay |
| POST | `/` | Anlasma olustur |
| PUT | `/{id}` | Anlasma guncelle |
| DELETE | `/{id}` | Anlasma sil |
| GET | `/statistics` | Istatistikler |

### 5.5 Pipeline Yonetimi

**PipelinesController** (`/crm/pipelines`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Pipeline listesi |
| GET | `/{id}` | Pipeline detay |
| POST | `/` | Pipeline olustur |
| PUT | `/{id}` | Pipeline guncelle |
| DELETE | `/{id}` | Pipeline sil |
| POST | `/{id}/stages` | Asama ekle |
| PUT | `/{id}/stages/{stageId}` | Asama guncelle |
| DELETE | `/{id}/stages/{stageId}` | Asama sil |

### 5.6 Aktiviteler

**ActivitiesController** (`/crm/activities`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Aktivite listesi |
| GET | `/{id}` | Aktivite detay |
| POST | `/` | Aktivite olustur |
| PUT | `/{id}` | Aktivite guncelle |
| DELETE | `/{id}` | Aktivite sil |
| POST | `/{id}/complete` | Tamamla |

### 5.7 Kampanyalar

**CampaignsController** (`/crm/campaigns`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Kampanya listesi |
| GET | `/{id}` | Kampanya detay |
| POST | `/` | Kampanya olustur |
| PUT | `/{id}` | Kampanya guncelle |
| DELETE | `/{id}` | Kampanya sil |
| POST | `/{id}/start` | Baslat |
| POST | `/{id}/pause` | Duraklat |
| GET | `/{id}/statistics` | Istatistikler |

### 5.8 Musteri Segmentleri

**CustomerSegmentsController** (`/crm/segments`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Segment listesi |
| GET | `/{id}` | Segment detay |
| POST | `/` | Segment olustur |
| PUT | `/{id}` | Segment guncelle |
| DELETE | `/{id}` | Segment sil |
| GET | `/{id}/members` | Segment uyeleri |

### 5.9 Etiketler

**CustomerTagsController** (`/crm/tags`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Etiket listesi |
| POST | `/` | Etiket olustur |
| PUT | `/{id}` | Etiket guncelle |
| DELETE | `/{id}` | Etiket sil |
| POST | `/assign` | Musteriye etiket ata |

### 5.10 Is Akislari

**WorkflowsController** (`/crm/workflows`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Workflow listesi |
| POST | `/` | Workflow olustur |
| PUT | `/{id}` | Workflow guncelle |
| DELETE | `/{id}` | Workflow sil |
| POST | `/{id}/activate` | Aktifle |
| POST | `/{id}/deactivate` | Devre disi birak |

### 5.11 Email

**EmailController** (`/crm/email`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| POST | `/send` | Email gonder |
| GET | `/templates` | Sablonlar |
| POST | `/templates` | Sablon olustur |
| GET | `/history/{customerId}` | Email gecmisi |

### 5.12 Dokumanlar

**DocumentsController** (`/crm/documents`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Dokuman listesi |
| GET | `/{id}` | Dokuman detay |
| POST | `/` | Dokuman yukle |
| PUT | `/{id}` | Dokuman guncelle |
| DELETE | `/{id}` | Dokuman sil |

### 5.13 Hatirlaticilar

**RemindersController** (`/crm/reminders`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Hatirlatici listesi |
| POST | `/` | Hatirlatici olustur |
| PUT | `/{id}` | Hatirlatici guncelle |
| DELETE | `/{id}` | Hatirlatici sil |
| POST | `/{id}/dismiss` | Kapat |

### 5.14 Bildirimler

**NotificationsController** (`/crm/notifications`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Bildirim listesi |
| PUT | `/{id}/read` | Okundu isaretle |
| DELETE | `/{id}` | Bildirim sil |

---

## 6. INVENTORY (ENVANTER) MODULU

**Route Prefix**: `api/inventory/`
**Policy**: `RequireModule("Inventory")`
**Toplam**: 90+ endpoint

### 6.1 Urunler

**ProductsController** (`/inventory/products`) - 15 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Urun listesi |
| GET | `/{id}` | Urun detay |
| GET | `/low-stock` | Dusuk stoklu urunler |
| POST | `/` | Urun olustur |
| PUT | `/{id}` | Urun guncelle |
| DELETE | `/{id}` | Urun sil |
| POST | `/{id}/activate` | Aktifle |
| POST | `/{id}/deactivate` | Devre disi birak |
| GET | `/{id}/images` | Urun resimleri |
| POST | `/{id}/images` | Resim yukle |
| DELETE | `/{id}/images/{imgId}` | Resim sil |
| POST | `/{id}/images/{imgId}/set-primary` | Ana resim yap |
| POST | `/{id}/images/reorder` | Resimleri sirala |
| GET | `/{id}/variants` | Varyantlar |
| GET | `/{id}/stock` | Stok durumu |

### 6.2 Stok Yonetimi

**StockController** (`/inventory/stock`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Stok seviyeleri |
| GET | `/summary/{productId}` | Urun stok ozeti |
| GET | `/movements` | Stok hareketleri |
| POST | `/adjust` | Stok ayarla |
| POST | `/move` | Depolar arasi transfer |
| GET | `/expiring` | Tarihi geçecekler |

**StockMovementsController** (`/inventory/stock-movements`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Hareket listesi |
| GET | `/{id}` | Hareket detay |
| POST | `/` | Hareket kaydet |
| GET | `/by-product/{productId}` | Urun hareketleri |

**StockCountsController** (`/inventory/stock-counts`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Sayim listesi |
| POST | `/` | Sayim baslat |
| PUT | `/{id}` | Sayim guncelle |
| POST | `/{id}/complete` | Sayimi tamamla |
| POST | `/{id}/cancel` | Sayimi iptal et |

**StockReservationsController** (`/inventory/reservations`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Rezervasyon listesi |
| POST | `/` | Rezervasyon olustur |
| DELETE | `/{id}` | Rezervasyon iptal |
| POST | `/{id}/confirm` | Onayla |
| GET | `/by-product/{productId}` | Urun rezervasyonlari |

**StockTransfersController** (`/inventory/transfers`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Transfer listesi |
| GET | `/{id}` | Transfer detay |
| POST | `/` | Transfer olustur |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/complete` | Tamamla |
| POST | `/{id}/cancel` | Iptal et |

### 6.3 Depolar

**WarehousesController** (`/inventory/warehouses`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Depo listesi |
| GET | `/{id}` | Depo detay |
| POST | `/` | Depo olustur |
| PUT | `/{id}` | Depo guncelle |
| DELETE | `/{id}` | Depo sil |

**LocationsController** (`/inventory/locations`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Lokasyon listesi |
| GET | `/{id}` | Lokasyon detay |
| POST | `/` | Lokasyon olustur |
| PUT | `/{id}` | Lokasyon guncelle |
| DELETE | `/{id}` | Lokasyon sil |

### 6.4 Kategoriler & Markalar

**CategoriesController** (`/inventory/categories`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Kategori listesi |
| GET | `/{id}` | Kategori detay |
| POST | `/` | Kategori olustur |
| PUT | `/{id}` | Kategori guncelle |
| DELETE | `/{id}` | Kategori sil |

**BrandsController** (`/inventory/brands`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Marka listesi |
| GET | `/{id}` | Marka detay |
| POST | `/` | Marka olustur |
| PUT | `/{id}` | Marka guncelle |
| DELETE | `/{id}` | Marka sil |

### 6.5 Urun Ozellikleri

**ProductVariantsController** (`/inventory/variants`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Varyant listesi |
| GET | `/{id}` | Varyant detay |
| POST | `/` | Varyant olustur |
| PUT | `/{id}` | Varyant guncelle |
| DELETE | `/{id}` | Varyant sil |

**ProductAttributesController** (`/inventory/attributes`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Ozellik listesi |
| POST | `/` | Ozellik olustur |
| PUT | `/{id}` | Ozellik guncelle |
| DELETE | `/{id}` | Ozellik sil |
| POST | `/assign` | Urune ata |

**ProductBundlesController** (`/inventory/bundles`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Bundle listesi |
| GET | `/{id}` | Bundle detay |
| POST | `/` | Bundle olustur |
| PUT | `/{id}` | Bundle guncelle |
| DELETE | `/{id}` | Bundle sil |

### 6.6 Tedarikciler

**SuppliersController** (`/inventory/suppliers`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Tedarikci listesi |
| GET | `/{id}` | Tedarikci detay |
| POST | `/` | Tedarikci olustur |
| PUT | `/{id}` | Tedarikci guncelle |
| DELETE | `/{id}` | Tedarikci sil |
| GET | `/{id}/products` | Tedarikci urunleri |

### 6.7 Birimler & Fiyatlar

**UnitsController** (`/inventory/units`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Birim listesi |
| GET | `/{id}` | Birim detay |
| POST | `/` | Birim olustur |
| PUT | `/{id}` | Birim guncelle |
| DELETE | `/{id}` | Birim sil |

**PriceListsController** (`/inventory/price-lists`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Fiyat listesi |
| GET | `/{id}` | Liste detay |
| POST | `/` | Liste olustur |
| PUT | `/{id}` | Liste guncelle |
| DELETE | `/{id}` | Liste sil |
| POST | `/{id}/items` | Fiyat ekle |

### 6.8 Lot & Seri Numarasi

**LotBatchesController** (`/inventory/lots`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Lot listesi |
| GET | `/{id}` | Lot detay |
| POST | `/` | Lot olustur |
| PUT | `/{id}` | Lot guncelle |
| GET | `/expiring` | Suresi dolacaklar |

**SerialNumbersController** (`/inventory/serial-numbers`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Seri no listesi |
| GET | `/{id}` | Seri no detay |
| POST | `/` | Seri no kaydet |
| PUT | `/{id}` | Seri no guncelle |
| GET | `/by-product/{productId}` | Urun seri nolari |

### 6.9 Barkod

**BarcodeController** (`/inventory/barcode`) - 4 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/generate/{productId}` | Barkod uret |
| POST | `/scan` | Barkod tara |
| GET | `/lookup/{code}` | Barkod ara |
| POST | `/print` | Barkod yazdir |

### 6.10 Analitik & Raporlar

**AnalyticsController** (`/inventory/analytics`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/overview` | Genel bakis |
| GET | `/trends` | Trendler |
| GET | `/turnover` | Stok devir hizi |
| GET | `/valuation` | Stok degerleme |
| GET | `/abc-analysis` | ABC analizi |

**InventoryAuditController** (`/inventory/audit`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Audit kayitlari |
| GET | `/{id}` | Audit detay |
| GET | `/by-product/{productId}` | Urun auditi |

**InventoryCostingController** (`/inventory/costing`) - 3 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/methods` | Maliyet yontemleri |
| POST | `/calculate` | Maliyet hesapla |
| GET | `/report` | Maliyet raporu |

---

## 7. HR (INSAN KAYNAKLARI) MODULU

**Route Prefix**: `api/hr/`
**Policy**: `RequireModule("HR")`
**Toplam**: 70+ endpoint

### 7.1 Calisanlar

**EmployeesController** (`/hr/employees`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Calisan listesi |
| GET | `/{id}` | Calisan detay |
| POST | `/` | Calisan ekle |
| PUT | `/{id}` | Calisan guncelle |
| DELETE | `/{id}` | Calisan sil |
| POST | `/{id}/terminate` | Isten cikar |
| GET | `/{id}/documents` | Belgeler |
| GET | `/{id}/leaves` | Izinler |

### 7.2 Organizasyon Yapisi

**DepartmentsController** (`/hr/departments`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Departman listesi |
| GET | `/{id}` | Departman detay |
| POST | `/` | Departman olustur |
| PUT | `/{id}` | Departman guncelle |
| DELETE | `/{id}` | Departman sil |

**PositionsController** (`/hr/positions`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Pozisyon listesi |
| GET | `/{id}` | Pozisyon detay |
| POST | `/` | Pozisyon olustur |
| PUT | `/{id}` | Pozisyon guncelle |
| DELETE | `/{id}` | Pozisyon sil |

**WorkLocationsController** (`/hr/work-locations`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Lokasyon listesi |
| GET | `/{id}` | Lokasyon detay |
| POST | `/` | Lokasyon olustur |
| PUT | `/{id}` | Lokasyon guncelle |
| DELETE | `/{id}` | Lokasyon sil |

### 7.3 Yoklama & Mesai

**AttendanceController** (`/hr/attendance`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Yoklama kayitlari |
| POST | `/check-in` | Giris yap |
| POST | `/check-out` | Cikis yap |
| GET | `/report` | Yoklama raporu |
| GET | `/employee/{id}` | Calisan yoklamasi |
| PUT | `/{id}` | Kayit duzelt |

**ShiftsController** (`/hr/shifts`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Vardiya listesi |
| GET | `/{id}` | Vardiya detay |
| POST | `/` | Vardiya olustur |
| PUT | `/{id}` | Vardiya guncelle |
| DELETE | `/{id}` | Vardiya sil |

**WorkSchedulesController** (`/hr/schedules`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Program listesi |
| GET | `/{id}` | Program detay |
| POST | `/` | Program olustur |
| PUT | `/{id}` | Program guncelle |
| DELETE | `/{id}` | Program sil |

### 7.4 Izin Yonetimi

**LeavesController** (`/hr/leaves`) - 7 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Izin talepleri |
| GET | `/{id}` | Izin detay |
| POST | `/` | Izin talep et |
| PUT | `/{id}` | Izin guncelle |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/reject` | Reddet |
| DELETE | `/{id}` | Iptal et |

**LeaveTypesController** (`/hr/leave-types`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Izin turu listesi |
| GET | `/{id}` | Tur detay |
| POST | `/` | Tur olustur |
| PUT | `/{id}` | Tur guncelle |
| DELETE | `/{id}` | Tur sil |

**HolidaysController** (`/hr/holidays`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Tatil listesi |
| GET | `/{id}` | Tatil detay |
| POST | `/` | Tatil ekle |
| PUT | `/{id}` | Tatil guncelle |
| DELETE | `/{id}` | Tatil sil |

### 7.5 Performans & Egitim

**PerformanceController** (`/hr/performance`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Degerlendirme listesi |
| GET | `/{id}` | Degerlendirme detay |
| POST | `/` | Degerlendirme olustur |
| PUT | `/{id}` | Degerlendirme guncelle |
| GET | `/employee/{id}` | Calisan degerlendirmeleri |
| GET | `/report` | Performans raporu |

**TrainingController** (`/hr/training`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Egitim listesi |
| GET | `/{id}` | Egitim detay |
| POST | `/` | Egitim olustur |
| PUT | `/{id}` | Egitim guncelle |
| DELETE | `/{id}` | Egitim sil |
| POST | `/{id}/enroll` | Kayit ol |

### 7.6 Belgeler & Masraflar

**EmployeeDocumentsController** (`/hr/documents`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Belge listesi |
| GET | `/{id}` | Belge detay |
| POST | `/` | Belge yukle |
| PUT | `/{id}` | Belge guncelle |
| DELETE | `/{id}` | Belge sil |

**ExpensesController** (`/hr/expenses`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Masraf listesi |
| GET | `/{id}` | Masraf detay |
| POST | `/` | Masraf girisi |
| PUT | `/{id}` | Masraf guncelle |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/reject` | Reddet |

### 7.7 Bordro

**PayrollController** (`/hr/payroll`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Bordro listesi |
| GET | `/{id}` | Bordro detay |
| POST | `/calculate` | Bordro hesapla |
| POST | `/process` | Bordro isle |
| GET | `/report` | Bordro raporu |
| GET | `/employee/{id}` | Calisan bordrosu |

### 7.8 Duyurular

**AnnouncementsController** (`/hr/announcements`) - 5 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Duyuru listesi |
| GET | `/{id}` | Duyuru detay |
| POST | `/` | Duyuru olustur |
| PUT | `/{id}` | Duyuru guncelle |
| DELETE | `/{id}` | Duyuru sil |

---

## 8. SALES (SATIS) MODULU

**Route Prefix**: `api/sales/`
**Policy**: `RequireModule("Sales")`
**Toplam**: 40+ endpoint

### 8.1 Satis Siparisleri

**SalesOrdersController** (`/sales/orders`) - 10 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Siparis listesi |
| GET | `/{id}` | Siparis detay |
| GET | `/statistics` | Istatistikler |
| POST | `/` | Siparis olustur |
| PUT | `/{id}` | Siparis guncelle |
| POST | `/{id}/items` | Kalem ekle |
| DELETE | `/{orderId}/items/{itemId}` | Kalem sil |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/cancel` | Iptal et |
| DELETE | `/{id}` | Siparis sil |

### 8.2 Faturalar

**InvoicesController** (`/sales/invoices`) - 7 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Fatura listesi |
| GET | `/{id}` | Fatura detay |
| POST | `/` | Fatura olustur |
| PUT | `/{id}` | Fatura guncelle |
| POST | `/{id}/send` | Fatura gonder |
| POST | `/{id}/cancel` | Iptal et |
| GET | `/overdue` | Vadesi gecmisler |

### 8.3 Odemeler

**PaymentsController** (`/sales/payments`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Odeme listesi |
| GET | `/{id}` | Odeme detay |
| POST | `/` | Odeme kaydet |
| PUT | `/{id}` | Odeme guncelle |
| POST | `/{id}/refund` | Iade yap |
| GET | `/by-invoice/{invoiceId}` | Fatura odemeleri |

---

## 9. PURCHASE (SATIN ALMA) MODULU

**Route Prefix**: `api/purchase/`
**Policy**: `RequireModule("Purchase")`
**Toplam**: 50+ endpoint

### 9.1 Satin Alma Siparisleri

**PurchaseOrdersController** (`/purchase/orders`) - 8 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Siparis listesi |
| GET | `/{id}` | Siparis detay |
| POST | `/` | Siparis olustur |
| PUT | `/{id}` | Siparis guncelle |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/receive` | Mal kabul |
| POST | `/{id}/cancel` | Iptal et |
| DELETE | `/{id}` | Siparis sil |

### 9.2 Mal Kabul

**GoodsReceiptsController** (`/purchase/receipts`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Kabul listesi |
| GET | `/{id}` | Kabul detay |
| POST | `/` | Kabul olustur |
| PUT | `/{id}` | Kabul guncelle |
| POST | `/{id}/complete` | Tamamla |
| POST | `/{id}/cancel` | Iptal et |

### 9.3 Satin Alma Faturalari

**PurchaseInvoicesController** (`/purchase/invoices`) - 6 endpoint
| Metod | Route | Aciklama |
|-------|-------|----------|
| GET | `/` | Fatura listesi |
| GET | `/{id}` | Fatura detay |
| POST | `/` | Fatura olustur |
| PUT | `/{id}` | Fatura guncelle |
| POST | `/{id}/approve` | Onayla |
| POST | `/{id}/pay` | Ode |

---

## 10. RESPONSE YAPISI

### Standart API Yaniti
```json
{
  "success": true,
  "data": { ... },
  "message": "Islem basarili",
  "timestamp": "2025-12-16T10:30:00Z",
  "errors": []
}
```

### Sayfalamali Yanit
```json
{
  "items": [ ... ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 150,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### Hata Yaniti
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Gecersiz email formati"],
    "password": ["Sifre en az 8 karakter olmali"]
  },
  "timestamp": "2025-12-16T10:30:00Z"
}
```

---

## 11. HTTP STATUS KODLARI

| Kod | Anlam | Kullanim |
|-----|-------|----------|
| 200 | OK | Basarili GET/PUT/POST |
| 201 | Created | Kaynak olusturma basarili |
| 204 | No Content | Basarili DELETE |
| 400 | Bad Request | Validation hatalari |
| 401 | Unauthorized | Kimlik dogrulama gerekli |
| 403 | Forbidden | Yetki yetersiz |
| 404 | Not Found | Kaynak bulunamadi |
| 409 | Conflict | Cakisma (duplicate) |
| 422 | Unprocessable | Business rule ihlali |
| 500 | Internal Error | Sunucu hatasi |
| 503 | Unavailable | Bakim modu |

---

## 12. HEADER'LAR

### Zorunlu Header'lar
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Opsiyonel Header'lar
```
X-Tenant-Code: {tenant_code}
X-Tenant-Id: {tenant_uuid}
X-Request-Id: {correlation_id}
Accept-Language: tr-TR
```

---

## 13. AUTHENTICATION

### JWT Token Yapisi
- **Access Token**: 15 dakika gecerli
- **Refresh Token**: 7 gun gecerli
- **HttpOnly Cookie**: Guvenli token saklama

### 2FA Destegi
- TOTP (Time-based One-Time Password)
- Backup kodlar
- Guvenilir cihaz hatirlatma

### Yetkilendirme Politikalari
- `RequireMasterAccess`: Master admin endpoint'leri
- `RequireModule("ModuleName")`: Modul bazli erisim
- Role-based: SuperAdmin, Admin, User rolleri
- Tenant-scoped: Multi-tenant izolasyonu

---

> **Not**: Bu dokuman otomatik olarak controller dosyalarindan uretilmistir.
> Guncel bilgi icin her zaman kod tabanini kontrol edin.

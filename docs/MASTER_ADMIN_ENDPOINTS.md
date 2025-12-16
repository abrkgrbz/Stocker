# Master Admin Panel (stocker-admin) API Endpoints

Bu dokumantasyon, `stocker-admin` projesindeki tum API service dosyalarini ve endpoint'lerini listeler.

## Genel Bakis

| Service | Endpoint Sayisi | Base Path |
|---------|----------------|-----------|
| Tenant Service | 13 | `/api/master/tenants` |
| Dashboard Service | 10 | `/api/master/dashboard` |
| User Service | 13 | `/api/master/users` |
| Subscription Service | 7 | `/api/master/subscriptions` |
| Package Service | 7 | `/api/master/packages` |
| Invoice Service | 9 | `/api/master/invoices` |
| Monitoring Service | 4 | `/api/master/monitoring` |
| Settings Service | 10 | `/api/master/settings` |
| Activity Log Service | 3 | `/api/master/tenants` |
| Audit Log Service | 6 | `/api/master/auditlogs` |
| Report Service | 7 | `/api/master/reports` |
| Migration Service | 11 | `/api/master/migrations` |
| System Management | 11 | `/api/master/system-management` |
| System Monitoring | 3 | `/api/master/system-monitoring` |
| Tenant Registration | 5 | `/api/master/tenants` |
| Tenant Module Service | 10 | `/api/master/ModuleActivation` |
| Secrets Service | 5 | `/api/admin/secrets` |
| Role Service | 6 | `/api/master/roles` |
| Storage Service | 3 | `/api/master/storage` |
| Feature Service | 8 | `/api/master/features` |
| Module Service | 10 | `/api/master/modules` |
| CMS Service | 100+ | `/api/cms/*` |
| **TOPLAM** | **350+** | - |

---

## 1. Tenant Service

**Dosya:** `src/services/api/tenantService.ts`
**Base Path:** `/api/master/tenants`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAll | GET | `/api/master/tenants` | Tum tenant'lari getir (sayfalama + filtreleme) |
| getById | GET | `/api/master/tenants/{id}` | ID ile tenant getir |
| getStatistics | GET | `/api/master/tenants/{id}/statistics` | Tenant istatistikleri |
| create | POST | `/api/master/tenants` | Yeni tenant olustur |
| update | PUT | `/api/master/tenants/{id}` | Tenant guncelle |
| toggleStatus | POST | `/api/master/tenants/{id}/toggle-status` | Tenant aktif/pasif |
| delete | DELETE | `/api/master/tenants/{id}` | Tenant sil |
| getAllStatistics | GET | `/api/master/tenants/statistics` | Dashboard icin tum istatistikler |
| getModules | GET | `/api/admin/tenant-modules/{tenantId}` | Tenant modulleri |
| toggleModule | POST | `/api/admin/tenant-modules/{tenantId}/toggle/{moduleId}` | Modul ac/kapat |
| getUsers | GET | `/api/tenant/users` | Tenant kullanicilari |
| getBillingHistory | GET | `/api/master/invoices` | Faturalama gecmisi |
| getActivityLogs | GET | `/api/admin/logs` | Aktivite loglari |

---

## 2. Dashboard Service

**Dosya:** `src/services/api/dashboardService.ts`
**Base Path:** `/api/master/dashboard`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getStats | GET | `/api/master/dashboard/stats` | Dashboard istatistikleri |
| getRevenueOverview | GET | `/api/master/dashboard/revenue-overview` | Gelir ozeti |
| getTenantStats | GET | `/api/master/dashboard/tenant-stats` | Tenant istatistikleri |
| getSystemHealth | GET | `/api/master/dashboard/system-health` | Sistem sagligi |
| getRecentTenants | GET | `/api/master/dashboard/recent-tenants` | Son tenant'lar |
| getRecentUsers | GET | `/api/master/dashboard/recent-users` | Son kullanicilar |
| getRecentActivities | (Mock) | N/A | Son aktiviteler |
| getRevenueChartData | GET | `/api/master/dashboard/revenue-overview` | Gelir grafik verisi |
| getTenantGrowthChartData | GET | `/api/master/dashboard/tenant-stats` | Tenant buyume grafigi |
| getPackageDistribution | GET | `/api/master/dashboard/tenant-stats` | Paket dagilimi |

---

## 3. User Service

**Dosya:** `src/services/api/userService.ts`
**Base Path:** `/api/master/users`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAll | GET | `/api/master/users` | Tum kullanicilari getir |
| getById | GET | `/api/master/users/{id}` | ID ile kullanici getir |
| create | POST | `/api/master/users` | Yeni kullanici olustur |
| update | PUT | `/api/master/users/{id}` | Kullanici guncelle |
| delete | DELETE | `/api/master/users/{id}` | Kullanici sil |
| activate | POST | `/api/master/users/{id}/activate` | Kullanici aktif |
| deactivate | POST | `/api/master/users/{id}/deactivate` | Kullanici pasif |
| resetPassword | POST | `/api/master/users/{userId}/reset-password` | Sifre sifirla |
| sendPasswordResetEmail | POST | `/api/master/users/{userId}/send-password-reset` | Sifre sifirlama emaili |
| getStatistics | GET | `/api/master/users/statistics` | Kullanici istatistikleri |
| export | GET | `/api/master/users/export` | CSV/Excel export |
| getActivityLogs | GET | `/api/master/users/{userId}/activity-logs` | Kullanici loglari |
| getByTenant | GET | `/api/tenants/{tenantId}/users` | Tenant kullanicilari |

---

## 4. Subscription Service

**Dosya:** `src/services/api/subscriptionService.ts`
**Base Path:** `/api/master/subscriptions`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAll | GET | `/api/master/subscriptions` | Tum abonelikler |
| getById | GET | `/api/master/subscriptions/{id}` | ID ile abonelik |
| create | POST | `/api/master/subscriptions` | Yeni abonelik |
| update | PUT | `/api/master/subscriptions/{id}` | Abonelik guncelle |
| cancel | POST | `/api/master/subscriptions/{id}/cancel` | Abonelik iptal |
| renew | POST | `/api/master/subscriptions/{id}/renew` | Abonelik yenile |
| changePackage | POST | `/api/master/subscriptions/tenant/{tenantId}/change-package` | Paket degistir |

---

## 5. Package Service

**Dosya:** `src/services/api/packageService.ts`
**Base Path:** `/api/master/packages`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAll | GET | `/api/master/packages` | Tum paketler |
| getById | GET | `/api/master/packages/{id}` | ID ile paket |
| create | POST | `/api/master/packages` | Yeni paket |
| update | PUT | `/api/master/packages/{id}` | Paket guncelle |
| delete | DELETE | `/api/master/packages/{id}` | Paket sil |
| getActivePackages | GET | `/api/master/packages` | Aktif paketler |
| getPublicPackages | GET | `/api/master/packages` | Public paketler |

---

## 6. Invoice Service

**Dosya:** `src/services/api/invoiceService.ts`
**Base Path:** `/api/master/invoices`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAll | GET | `/api/master/invoices` | Tum faturalar |
| getById | GET | `/api/master/invoices/{id}` | ID ile fatura |
| getByTenant | GET | `/api/master/invoices/tenant/{tenantId}` | Tenant faturalari |
| create | POST | `/api/master/invoices` | Yeni fatura |
| markAsPaid | POST | `/api/master/invoices/{id}/mark-paid` | Odendi isaretle |
| updateStatus | PUT | `/api/master/invoices/{id}/status` | Durum guncelle |
| cancel | POST | `/api/master/invoices/{id}/cancel` | Fatura iptal |
| getOverdue | GET | `/api/master/invoices/overdue` | Vadesi gecmisler |
| sendReminder | POST | `/api/master/invoices/{id}/send-reminder` | Hatirlatma gonder |

---

## 7. Migration Service

**Dosya:** `src/services/api/migrationService.ts`
**Base Path:** `/api/master/migrations`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getPendingMigrations | GET | `/api/master/migrations/pending` | Bekleyen migration'lar |
| applyMigration | POST | `/api/master/migrations/apply/{tenantId}` | Migration uygula |
| applyAllMigrations | POST | `/api/master/migrations/apply-all` | Tum migration'lari uygula |
| getMigrationHistory | GET | `/api/master/migrations/history/{tenantId}` | Migration gecmisi |
| getMigrationScriptPreview | GET | `/api/master/migrations/preview/{tenantId}/{moduleName}/{migrationName}` | SQL onizleme |
| rollbackMigration | POST | `/api/master/migrations/rollback/{tenantId}/{moduleName}/{migrationName}` | Migration geri al |
| scheduleMigration | POST | `/api/master/migrations/schedule` | Migration zamanla |
| getScheduledMigrations | GET | `/api/master/migrations/scheduled` | Zamanlanmis migration'lar |
| cancelScheduledMigration | DELETE | `/api/master/migrations/scheduled/{scheduleId}` | Zamanlama iptal |
| getMigrationSettings | GET | `/api/master/migrations/settings` | Migration ayarlari |
| updateMigrationSettings | PUT | `/api/master/migrations/settings` | Ayarlari guncelle |

---

## 8. System Management Service

**Dosya:** `src/services/api/systemManagementService.ts`
**Base Path:** `/api/master/system-management`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getDockerStats | GET | `/api/master/system-management/docker/stats` | Docker istatistikleri |
| cleanDockerBuildCache | POST | `/api/master/system-management/docker/clean-build-cache` | Build cache temizle |
| cleanDockerImages | POST | `/api/master/system-management/docker/clean-images` | Image'lari temizle |
| cleanDockerContainers | POST | `/api/master/system-management/docker/clean-containers` | Container'lari temizle |
| cleanDockerVolumes | POST | `/api/master/system-management/docker/clean-volumes` | Volume'lari temizle |
| cleanAllDocker | POST | `/api/master/system-management/docker/clean-all` | Tum Docker temizle |
| getSystemErrors | GET | `/api/master/system-management/errors` | Sistem hatalari |
| getErrorStatistics | GET | `/api/master/system-management/errors/statistics` | Hata istatistikleri |
| resolveError | POST | `/api/master/system-management/errors/{errorId}/resolve` | Hata cozuldu isaretle |
| deleteError | DELETE | `/api/master/system-management/errors/{errorId}` | Hata sil |
| clearResolvedErrors | DELETE | `/api/master/system-management/errors/resolved` | Cozulmus hatalari temizle |

---

## 9. Tenant Module Service

**Dosya:** `src/services/api/tenantModuleService.ts`
**Base Path:** `/api/master/ModuleActivation`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getAvailableModules | GET | `/api/master/ModuleActivation/available-modules` | Mevcut moduller |
| getTenantModuleStatus | GET | `/api/master/ModuleActivation/{tenantId}/status` | Tenant modul durumu |
| activateModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/{moduleName}/activate` | Modul aktifle |
| deactivateModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/{moduleName}/deactivate` | Modul deaktif |
| getModuleStatus | GET | `/api/master/ModuleActivation/{tenantId}/modules/{moduleName}/status` | Tekil modul durumu |
| getActiveModules | GET | `/api/master/ModuleActivation/{tenantId}/modules` | Aktif moduller |
| initializeCRMModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/crm/initialize` | CRM baslat |
| initializeHRModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/hr/initialize` | HR baslat |
| initializeInventoryModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/inventory/initialize` | Inventory baslat |
| initializeSalesModule | POST | `/api/master/ModuleActivation/{tenantId}/modules/sales/initialize` | Sales baslat |

---

## 10. Secrets Service

**Dosya:** `src/services/api/secretsService.ts`
**Base Path:** `/api/admin/secrets`

| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getStatus | GET | `/api/admin/secrets/status` | Secret store durumu |
| listSecrets | GET | `/api/admin/secrets` | Secret listele |
| getSecretMetadata | GET | `/api/admin/secrets/{secretName}` | Secret metadata |
| deleteSecret | DELETE | `/api/admin/secrets/{secretName}` | Secret sil |
| deleteTenantSecrets | DELETE | `/api/admin/secrets/tenant/{tenantShortId}` | Tenant secret'lari sil |

---

## 11. CMS Service

**Dosya:** `src/services/api/cmsService.ts`
**Base Path:** `/api/cms`

### Pages
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getPages | GET | `/api/cms/pages` | Tum sayfalar |
| getPageBySlug | GET | `/api/cms/pages/by-slug/{slug}` | Slug ile sayfa |
| getPageById | GET | `/api/cms/pages/{id}` | ID ile sayfa |
| createPage | POST | `/api/cms/pages` | Sayfa olustur |
| updatePage | PUT | `/api/cms/pages/{id}` | Sayfa guncelle |
| deletePage | DELETE | `/api/cms/pages/{id}` | Sayfa sil |
| publishPage | POST | `/api/cms/pages/{id}/publish` | Sayfa yayinla |
| unpublishPage | POST | `/api/cms/pages/{id}/unpublish` | Yayindan kaldir |

### Blog
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getBlogCategories | GET | `/api/cms/blog/categories` | Blog kategorileri |
| createBlogCategory | POST | `/api/cms/blog/categories` | Kategori olustur |
| getBlogPosts | GET | `/api/cms/blog/posts` | Blog yazilari |
| createBlogPost | POST | `/api/cms/blog/posts` | Yazi olustur |
| publishBlogPost | POST | `/api/cms/blog/posts/{id}/publish` | Yazi yayinla |

### FAQ
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getFAQCategories | GET | `/api/cms/faq/categories` | FAQ kategorileri |
| getFAQItems | GET | `/api/cms/faq/items` | FAQ maddeleri |
| createFAQItem | POST | `/api/cms/faq/items` | FAQ olustur |
| submitFAQFeedback | POST | `/api/cms/faq/items/{id}/feedback` | FAQ geri bildirim |

### Landing Page
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getTestimonials | GET | `/api/cms/landing/testimonials` | Referanslar |
| getPricingPlans | GET | `/api/cms/landing/pricing-plans` | Fiyat planlari |
| getFeatures | GET | `/api/cms/landing/features` | Ozellikler |
| getIndustries | GET | `/api/cms/landing/industries` | Sektorler |
| getIntegrations | GET | `/api/cms/landing/integrations` | Entegrasyonlar |
| getStats | GET | `/api/cms/landing/stats` | Istatistikler |
| getPartners | GET | `/api/cms/landing/partners` | Partnerler |
| getAchievements | GET | `/api/cms/landing/achievements` | Basarilar |

### Company Page
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getTeamMembers | GET | `/api/cms/company/team-members` | Takim uyeleri |
| getCompanyValues | GET | `/api/cms/company/values` | Sirket degerleri |
| getContactInfos | GET | `/api/cms/company/contact-info` | Iletisim bilgileri |
| getSocialLinks | GET | `/api/cms/company/social-links` | Sosyal medya |

### Documentation
| Fonksiyon | Method | Endpoint | Aciklama |
|-----------|--------|----------|----------|
| getDocCategories | GET | `/api/cms/docs/categories` | Dokumantasyon kategorileri |
| getDocArticles | GET | `/api/cms/docs/articles` | Dokumantasyon makaleleri |

---

## 12. Diger Servisler

### Monitoring Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getHealth | GET | `/api/master/monitoring/health` |
| getMetrics | GET | `/api/master/monitoring/metrics` |
| getServiceStatus | GET | `/api/master/monitoring/services` |
| getAlerts | GET | `/api/master/monitoring/alerts` |

### Settings Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/settings` |
| updateGeneral | PUT | `/api/master/settings/general` |
| updateEmail | PUT | `/api/master/settings/email` |
| updateSecurity | PUT | `/api/master/settings/security` |
| backupNow | POST | `/api/master/settings/backup-now` |
| clearCache | POST | `/api/master/settings/clear-cache` |

### Audit Log Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/auditlogs` |
| getById | GET | `/api/master/auditlogs/{id}` |
| getStatistics | GET | `/api/master/auditlogs/statistics` |
| export | GET | `/api/master/auditlogs/export/csv` |
| getSecurityEvents | GET | `/api/master/auditlogs/security-events` |

### Report Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/reports` |
| generate | POST | `/api/master/reports/generate` |
| getResults | GET | `/api/master/reports/results` |
| download | GET | `/api/master/reports/results/{resultId}/download` |
| schedule | POST | `/api/master/reports/{reportId}/schedule` |

### Role Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/roles` |
| getById | GET | `/api/master/roles/{id}` |
| getAllPermissions | GET | `/api/master/roles/permissions` |
| create | POST | `/api/master/roles` |
| update | PUT | `/api/master/roles/{id}` |
| delete | DELETE | `/api/master/roles/{id}` |

### Storage Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAllBuckets | GET | `/api/master/storage/buckets` |
| deleteBucket | DELETE | `/api/master/storage/buckets/{bucketName}` |
| deleteMultipleBuckets | POST | `/api/master/storage/buckets/delete-multiple` |

### Feature Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/features` |
| getById | GET | `/api/master/features/{id}` |
| create | POST | `/api/master/features` |
| update | PUT | `/api/master/features/{id}` |
| delete | DELETE | `/api/master/features/{id}` |
| toggleActive | PATCH | `/api/master/features/{id}/toggle-active` |

### Module Service
| Fonksiyon | Method | Endpoint |
|-----------|--------|----------|
| getAll | GET | `/api/master/modules` |
| getById | GET | `/api/master/modules/{id}` |
| create | POST | `/api/master/modules` |
| update | PUT | `/api/master/modules/{id}` |
| delete | DELETE | `/api/master/modules/{id}` |
| getHierarchy | GET | `/api/master/modules/hierarchy` |
| updateSortOrder | POST | `/api/master/modules/sort-order` |

---

## Ozet

**Toplam Service Dosyasi:** 22
**Toplam Endpoint:** 350+
**Ana Base Path'ler:**
- `/api/master/*` - Master admin panel endpoint'leri
- `/api/admin/*` - Admin ozel endpoint'leri
- `/api/cms/*` - Content Management System
- `/api/public/*` - Public endpoint'ler

**Kullanilan HTTP Metodlari:**
- GET (Okuma islemleri)
- POST (Olusturma/Aksiyon islemleri)
- PUT (Guncelleme islemleri)
- DELETE (Silme islemleri)
- PATCH (Kismi guncelleme)

---

*Son Guncelleme: 2025-12-16*

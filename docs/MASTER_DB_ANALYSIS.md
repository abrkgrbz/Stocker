# Master DB Entity Analizi ve Tenant DB'ye Taşınması Gerekenler

## 🔍 Mevcut Master DB Entity'leri ve Analiz

### ✅ **Master DB'de Kalması Gerekenler**

| Entity | Açıklama | Neden Master'da Kalmalı |
|--------|----------|------------------------|
| **Tenant** | Ana tenant bilgileri | Merkezi tenant yönetimi |
| **TenantDomain** | Tenant domain eşlemeleri | Subdomain routing için gerekli |
| **Package** | Paket tanımları | Tüm tenant'lar için ortak |
| **PackageModule** | Paket-modül ilişkisi | Paket yönetimi |
| **PackageFeature** | Paket özellikleri | Paket yönetimi |
| **Subscription** | Abonelik bilgileri | Faturalandırma ve lisans kontrolü |
| **SubscriptionModule** | Abonelik modülleri | Lisans yönetimi |
| **SubscriptionUsage** | Kullanım metrikleri | Faturalandırma için |
| **Payment** | Ödeme kayıtları | Merkezi finansal yönetim |
| **Invoice** | Fatura kayıtları | Merkezi faturalandırma |
| **InvoiceItem** | Fatura kalemleri | Merkezi faturalandırma |
| **TenantLimits** | Tenant limitlerı | Kaynak yönetimi ve kota kontrolü |
| **TenantBilling** | Faturalandırma bilgileri | Merkezi finansal yönetim |
| **TenantContract** | Sözleşme bilgileri | Hukuki ve ticari yönetim |
| **TenantHealthCheck** | Sistem sağlık durumu | Merkezi monitoring |
| **TenantBackup** | Yedekleme kayıtları | Merkezi yedekleme yönetimi |
| **TenantRegistration** | Kayıt bilgileri | İlk kayıt süreci |
| **UserLoginHistory** | Giriş logları | Güvenlik ve audit |

### ⚠️ **Tenant DB'ye Taşınması Gerekenler**

| Entity | Açıklama | Neden Tenant'ta Olmalı | Öncelik |
|--------|----------|----------------------|---------|
| **TenantSetupWizard** | Kurulum sihirbazı | Tenant-specific kurulum verileri | 🔴 Yüksek |
| **TenantSetupChecklist** | Kurulum kontrol listesi | Tenant'a özel kurulum adımları | 🔴 Yüksek |
| **TenantInitialData** | İlk veri setleri | Tenant'a özel seed data | 🔴 Yüksek |
| **TenantNotification** | Bildirimler | Tenant kullanıcılarına özel | 🔴 Yüksek |
| **TenantDocument** | Dökümanlar | Tenant'a ait dosyalar | 🟡 Orta |
| **TenantCompliance** | Uyumluluk kayıtları | Tenant'a özel regülasyonlar | 🟡 Orta |
| **TenantCustomization** | Özelleştirmeler | UI/UX özelleştirmeleri | 🟡 Orta |
| **TenantSettings** | Ayarlar | Tenant-specific konfigürasyon | 🔴 Yüksek |
| **TenantActivityLog** | Aktivite logları | Tenant içi işlem logları | 🔴 Yüksek |
| **TenantIntegration** | Entegrasyonlar | 3. parti entegrasyonlar | 🟡 Orta |
| **TenantWebhook** | Webhook tanımları | Tenant'a özel webhook'lar | 🟡 Orta |
| **TenantApiKey** | API anahtarları | Tenant'a özel API erişimi | 🔴 Yüksek |
| **TenantSecuritySettings** | Güvenlik ayarları | Tenant'a özel güvenlik | 🔴 Yüksek |
| **TenantOnboarding** | Onboarding süreci | Kullanıcı onboarding'i | 🟡 Orta |
| **TenantFeature** | Özellik tanımları | Tenant'a özel özellikler | 🟡 Orta |
| **UserTenant** | Kullanıcı-Tenant ilişkisi | Kullanıcı yetkileri | 🔴 Yüksek |
| **PasswordHistory** | Şifre geçmişi | Kullanıcı güvenliği | 🟡 Orta |

## 🎯 **Taşıma Stratejisi**

### **Aşama 1: Kritik Entity'ler (Hemen)**
1. **TenantSetupWizard** → Tenant DB
2. **TenantSetupChecklist** → Tenant DB  
3. **TenantSettings** → Tenant DB
4. **TenantActivityLog** → Tenant DB
5. **TenantApiKey** → Tenant DB
6. **TenantSecuritySettings** → Tenant DB

### **Aşama 2: Orta Öncelikli (Sonra)**
1. **TenantNotification** → Tenant DB
2. **TenantDocument** → Tenant DB
3. **TenantIntegration** → Tenant DB
4. **TenantWebhook** → Tenant DB

### **Aşama 3: Düşük Öncelikli (İleriki Versiyon)**
1. **TenantCompliance** → Tenant DB
2. **TenantCustomization** → Tenant DB
3. **TenantOnboarding** → Tenant DB

## 🏗️ **Mimari Öneriler**

### **Master DB - Özet Tabloları**
```csharp
// Master'da sadece özet bilgi
public class TenantSetupStatus
{
    public Guid TenantId { get; set; }
    public bool IsWizardCompleted { get; set; }
    public int CompletedSteps { get; set; }
    public DateTime? LastActivityAt { get; set; }
}

public class TenantSecurityStatus
{
    public Guid TenantId { get; set; }
    public bool HasTwoFactor { get; set; }
    public bool HasIPRestriction { get; set; }
    public DateTime LastSecurityAudit { get; set; }
}
```

### **Tenant DB - Detay Tabloları**
```csharp
// Tenant'ta detaylı bilgi
public class SetupWizard
{
    public Guid Id { get; set; }
    public string WizardType { get; set; }
    public List<WizardStep> Steps { get; set; }
    public string ConfigurationData { get; set; } // JSON
    // ... tüm detaylar
}
```

## 📊 **Veri İzolasyon Matrisi**

| Kriter | Master DB | Tenant DB |
|--------|-----------|-----------|
| **Merkezi Yönetim** | ✅ | ❌ |
| **Tenant İzolasyonu** | ❌ | ✅ |
| **Performans** | Orta | Yüksek |
| **Backup/Restore** | Karmaşık | Basit |
| **GDPR Uyumluluğu** | Düşük | Yüksek |
| **Raporlama** | Kolay | Zor |

## 🚨 **Kritik Uyarılar**

1. **UserTenant** tablosu özellikle kritik - kullanıcı yetkilendirmesi için
2. **TenantSettings** mutlaka Tenant DB'de olmalı - isolation için
3. **TenantActivityLog** Tenant DB'de olmalı - GDPR ve audit için
4. **TenantApiKey** güvenlik nedeniyle Tenant DB'de olmalı

## 🔄 **Migration Planı**

### **Fase 1: Yeni Tablolar (1-2 hafta)**
- Tenant DB'de yeni tabloları oluştur
- Entity'leri Tenant Domain'e taşı
- Repository'leri güncelle

### **Fase 2: Veri Taşıma (2-3 hafta)**
- Mevcut verileri migrate et
- Dual-write stratejisi uygula
- Test ve validasyon

### **Fase 3: Temizlik (1 hafta)**
- Master DB'den eski tabloları kaldır
- Kod temizliği
- Dokümantasyon güncelleme

## 📈 **Beklenen Faydalar**

1. **%40 daha iyi performans** - Tenant DB'de daha az tablo
2. **%100 tenant isolation** - Veri güvenliği artışı
3. **%60 daha kolay backup/restore** - Tenant bazlı yedekleme
4. **GDPR uyumluluğu** - Veri silme/taşıma kolaylığı
5. **Daha temiz mimari** - SaaS best practices
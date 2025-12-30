using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Seeds.Master;
using Stocker.SharedKernel.Settings;

namespace Stocker.Persistence.SeedData;

public class MasterDataSeeder
{
    private readonly MasterDbContext _context;
    private readonly ILogger<MasterDataSeeder> _logger;
    private readonly AdminCredentials _adminCredentials;
    private readonly IHostEnvironment _environment;

    public MasterDataSeeder(
        MasterDbContext context,
        ILogger<MasterDataSeeder> logger,
        IOptions<AdminCredentials> adminCredentials,
        IHostEnvironment environment)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _adminCredentials = adminCredentials?.Value ?? new AdminCredentials();
        _environment = environment ?? throw new ArgumentNullException(nameof(environment));
    }

    public async Task SeedAsync()
    {
        await SeedModuleDefinitionsAsync();
        await SeedPackagesAsync();
        await SeedUserTiersAsync();
        await SeedStoragePlansAsync();
        await SeedAddOnsAsync();
        await SeedIndustriesAsync();
        await SeedSystemAdminAsync();
        await SeedEmailTemplatesAsync();

        // Only seed test admin in Development environment
        if (_environment.IsDevelopment())
        {
            await SeedTenantAdminAsync();
        }

        await SystemSettingsSeed.SeedAsync(_context);
        await _context.SaveChangesAsync();
    }

    private async Task SeedModuleDefinitionsAsync()
    {
        if (await _context.ModuleDefinitions.AnyAsync())
        {
            _logger.LogInformation("Module definitions already seeded.");
            return;
        }

        var modules = new List<ModuleDefinition>();

        // ==================== CORE MODÜLLER (Zorunlu) ====================

        // Core - Temel Sistem (Ücretsiz, her pakete dahil)
        var coreModule = ModuleDefinition.Create(
            code: "Core",
            name: "Temel Sistem",
            monthlyPrice: Money.Create(0m, "TRY"),
            description: "Kullanıcı yönetimi, ayarlar ve temel sistem özellikleri",
            icon: "⚙️",
            isCore: true,
            displayOrder: 0,
            category: "Temel");
        coreModule.AddFeature("Kullanıcı Yönetimi", "Kullanıcı ekleme, düzenleme ve yetkilendirme");
        coreModule.AddFeature("Rol ve İzin Yönetimi", "Detaylı rol ve izin sistemi");
        coreModule.AddFeature("Sistem Ayarları", "Genel sistem yapılandırması");
        coreModule.AddFeature("Dashboard", "Özet görünüm ve widget'lar");
        modules.Add(coreModule);

        // ==================== SATIŞ VE MÜŞTERİ YÖNETİMİ ====================

        // CRM Modülü
        var crmModule = ModuleDefinition.Create(
            code: "CRM",
            name: "CRM",
            monthlyPrice: Money.Create(199m, "TRY"),
            description: "Müşteri ilişkileri yönetimi, potansiyel müşteriler, fırsatlar ve kampanyalar",
            icon: "👥",
            isCore: false,
            displayOrder: 10,
            category: "Satış ve Müşteri");
        crmModule.AddFeature("Müşteri Kartları", "Detaylı müşteri bilgi yönetimi");
        crmModule.AddFeature("Potansiyel Müşteri Takibi", "Lead yönetimi ve dönüşüm takibi");
        crmModule.AddFeature("Fırsat Yönetimi", "Satış fırsatlarının pipeline görünümü");
        crmModule.AddFeature("Kampanya Yönetimi", "Pazarlama kampanyalarının planlanması");
        crmModule.AddFeature("Aktivite Takibi", "Görüşme, toplantı ve görev yönetimi");
        crmModule.AddFeature("Müşteri Segmentasyonu", "Hedef kitle analizi");
        modules.Add(crmModule);

        // Satış Modülü
        var salesModule = ModuleDefinition.Create(
            code: "Sales",
            name: "Satış Yönetimi",
            monthlyPrice: Money.Create(249m, "TRY"),
            description: "Satış siparişleri, teklifler, faturalar ve satış raporları",
            icon: "🛒",
            isCore: false,
            displayOrder: 11,
            category: "Satış ve Müşteri");
        salesModule.AddFeature("Teklif Oluşturma", "Profesyonel teklif hazırlama");
        salesModule.AddFeature("Sipariş Yönetimi", "Satış siparişi takibi");
        salesModule.AddFeature("Fatura Kesimi", "e-Fatura ve e-Arşiv entegrasyonu");
        salesModule.AddFeature("Satış Raporları", "Detaylı satış analitiği");
        salesModule.AddFeature("Fiyat Listeleri", "Çoklu fiyat listesi yönetimi");
        salesModule.AddDependency("CRM"); // CRM modülüne bağımlı
        modules.Add(salesModule);

        // ==================== STOK VE DEPO YÖNETİMİ ====================

        // Stok Yönetimi
        var inventoryModule = ModuleDefinition.Create(
            code: "Inventory",
            name: "Stok Yönetimi",
            monthlyPrice: Money.Create(299m, "TRY"),
            description: "Depo, ürün, stok hareketleri ve envanter yönetimi",
            icon: "📦",
            isCore: false,
            displayOrder: 20,
            category: "Stok ve Depo");
        inventoryModule.AddFeature("Ürün Kataloğu", "Ürün ve varyant yönetimi");
        inventoryModule.AddFeature("Depo Yönetimi", "Çoklu depo desteği");
        inventoryModule.AddFeature("Stok Hareketleri", "Giriş, çıkış ve transfer işlemleri");
        inventoryModule.AddFeature("Barkod Sistemi", "Barkod okuma ve yazdırma");
        inventoryModule.AddFeature("Sayım İşlemleri", "Periyodik envanter sayımı");
        inventoryModule.AddFeature("Minimum Stok Uyarısı", "Kritik stok seviyesi bildirimleri");
        inventoryModule.AddFeature("ABC/XYZ Analizi", "Stok sınıflandırma ve analiz");
        modules.Add(inventoryModule);

        // ==================== SATIN ALMA ====================

        // Satın Alma Modülü
        var purchaseModule = ModuleDefinition.Create(
            code: "Purchase",
            name: "Satın Alma",
            monthlyPrice: Money.Create(199m, "TRY"),
            description: "Tedarikçi yönetimi, satın alma siparişleri ve maliyet takibi",
            icon: "🏪",
            isCore: false,
            displayOrder: 30,
            category: "Satın Alma");
        purchaseModule.AddFeature("Tedarikçi Kartları", "Tedarikçi bilgi yönetimi");
        purchaseModule.AddFeature("Satın Alma Siparişi", "Sipariş oluşturma ve takip");
        purchaseModule.AddFeature("Teklif Toplama", "Tedarikçilerden teklif alma");
        purchaseModule.AddFeature("Mal Kabul", "İrsaliye ve giriş işlemleri");
        purchaseModule.AddFeature("Maliyet Takibi", "Satın alma maliyetlerinin analizi");
        purchaseModule.AddDependency("Inventory"); // Stok modülüne bağımlı
        modules.Add(purchaseModule);

        // ==================== FİNANS VE MUHASEBE ====================

        // Finans Modülü
        var financeModule = ModuleDefinition.Create(
            code: "Finance",
            name: "Finans",
            monthlyPrice: Money.Create(349m, "TRY"),
            description: "Nakit akışı, banka hesapları ve finansal raporlama",
            icon: "🏦",
            isCore: false,
            displayOrder: 40,
            category: "Finans");
        financeModule.AddFeature("Kasa Yönetimi", "Nakit hareketleri takibi");
        financeModule.AddFeature("Banka Hesapları", "Banka entegrasyonu ve mutabakat");
        financeModule.AddFeature("Çek/Senet Takibi", "Vadeli ödeme yönetimi");
        financeModule.AddFeature("Nakit Akışı", "Gelir/gider projeksiyonu");
        financeModule.AddFeature("Döviz İşlemleri", "Çoklu döviz desteği");
        modules.Add(financeModule);

        // Muhasebe Modülü
        var accountingModule = ModuleDefinition.Create(
            code: "Accounting",
            name: "Muhasebe",
            monthlyPrice: Money.Create(399m, "TRY"),
            description: "Genel muhasebe, hesap planı ve mali raporlar",
            icon: "🧮",
            isCore: false,
            displayOrder: 41,
            category: "Finans");
        accountingModule.AddFeature("Hesap Planı", "Standart hesap planı yönetimi");
        accountingModule.AddFeature("Fişler", "Muhasebe fişi girişi");
        accountingModule.AddFeature("Mizan", "Mizan raporları");
        accountingModule.AddFeature("Bilanço", "Bilanço hazırlama");
        accountingModule.AddFeature("Gelir Tablosu", "Kar/Zarar raporları");
        accountingModule.AddFeature("KDV Beyanname", "KDV hesaplama ve raporlama");
        accountingModule.AddDependency("Finance"); // Finans modülüne bağımlı
        modules.Add(accountingModule);

        // ==================== İNSAN KAYNAKLARI ====================

        // İK Modülü
        var hrModule = ModuleDefinition.Create(
            code: "HR",
            name: "İnsan Kaynakları",
            monthlyPrice: Money.Create(299m, "TRY"),
            description: "Personel yönetimi, izin takibi, vardiya ve organizasyon",
            icon: "👤",
            isCore: false,
            displayOrder: 50,
            category: "İnsan Kaynakları");
        hrModule.AddFeature("Personel Kartları", "Detaylı personel bilgi yönetimi");
        hrModule.AddFeature("Organizasyon Şeması", "Departman ve pozisyon yapısı");
        hrModule.AddFeature("İzin Yönetimi", "İzin talep ve onay süreci");
        hrModule.AddFeature("Vardiya Planlama", "Çalışma saati yönetimi");
        hrModule.AddFeature("Performans Değerlendirme", "KPI ve hedef takibi");
        hrModule.AddFeature("Eğitim Takibi", "Personel eğitim kayıtları");
        modules.Add(hrModule);

        // Bordro Modülü
        var payrollModule = ModuleDefinition.Create(
            code: "Payroll",
            name: "Bordro",
            monthlyPrice: Money.Create(249m, "TRY"),
            description: "Maaş hesaplama, SGK bildirgeleri ve yasal kesintiler",
            icon: "💰",
            isCore: false,
            displayOrder: 51,
            category: "İnsan Kaynakları");
        payrollModule.AddFeature("Maaş Hesaplama", "Otomatik bordro hesaplama");
        payrollModule.AddFeature("SGK Bildirgeleri", "SGK entegrasyonu");
        payrollModule.AddFeature("Vergi Hesaplama", "Gelir vergisi ve damga vergisi");
        payrollModule.AddFeature("Banka Listesi", "Toplu ödeme listesi");
        payrollModule.AddFeature("Kıdem/İhbar", "Tazminat hesaplama");
        payrollModule.AddDependency("HR"); // İK modülüne bağımlı
        modules.Add(payrollModule);

        // ==================== PROJE YÖNETİMİ ====================

        // Proje Modülü
        var projectsModule = ModuleDefinition.Create(
            code: "Projects",
            name: "Proje Yönetimi",
            monthlyPrice: Money.Create(199m, "TRY"),
            description: "Proje planlama, görev yönetimi ve zaman takibi",
            icon: "📋",
            isCore: false,
            displayOrder: 60,
            category: "Proje");
        projectsModule.AddFeature("Proje Oluşturma", "Proje kartları ve detayları");
        projectsModule.AddFeature("Görev Yönetimi", "Kanban ve liste görünümü");
        projectsModule.AddFeature("Gantt Chart", "Proje zaman çizelgesi");
        projectsModule.AddFeature("Zaman Takibi", "Çalışma saati kaydı");
        projectsModule.AddFeature("Kaynak Planlama", "Ekip ve kaynak ataması");
        projectsModule.AddFeature("Proje Raporları", "İlerleme ve maliyet raporları");
        modules.Add(projectsModule);

        // ==================== RAPORLAMA VE ANALİTİK ====================

        // Raporlama Modülü
        var reportsModule = ModuleDefinition.Create(
            code: "Reports",
            name: "Gelişmiş Raporlama",
            monthlyPrice: Money.Create(149m, "TRY"),
            description: "Özel rapor tasarlama, dashboard oluşturma ve veri analizi",
            icon: "📊",
            isCore: false,
            displayOrder: 70,
            category: "Raporlama");
        reportsModule.AddFeature("Rapor Tasarımcı", "Sürükle-bırak rapor oluşturma");
        reportsModule.AddFeature("Dashboard Builder", "Özel dashboard tasarlama");
        reportsModule.AddFeature("Excel Export", "Detaylı Excel çıktıları");
        reportsModule.AddFeature("PDF Raporları", "Profesyonel PDF raporlar");
        reportsModule.AddFeature("Zamanlanmış Raporlar", "Otomatik rapor gönderimi");
        modules.Add(reportsModule);

        await _context.ModuleDefinitions.AddRangeAsync(modules);
        _logger.LogInformation("Seeded {Count} module definitions.", modules.Count);
    }

    private async Task SeedPackagesAsync()
    {
        if (await _context.Packages.AnyAsync())
        {
            _logger.LogInformation("Packages already seeded.");
            return;
        }

        var packages = new List<Package>();

        // Trial Package (Deneme Paketi)
        var trialPackage = Package.Create(
            name: "Deneme",
            type: PackageType.Trial,
            basePrice: Money.Create(0m, "TRY"),
            limits: PackageLimit.Create(
                maxUsers: 2,
                maxStorage: 5,
                maxProjects: 1,
                maxApiCalls: 5000,
                moduleLimits: new Dictionary<string, int>
                {
                    ["CRM"] = 50
                }),
            description: "Sistemi tanımak için ücretsiz deneme paketi",
            trialDays: 14,
            displayOrder: 0,
            isPublic: true);

        trialPackage.AddFeature("TRIAL_PERIOD", "14 Günlük Deneme", "Ücretsiz 14 gün deneme süresi", true);
        trialPackage.AddFeature("BASIC_FEATURES", "Temel Özellikler", "Tüm temel özelliklere erişim", true);
        trialPackage.AddFeature("EMAIL_SUPPORT", "E-posta Desteği", "Deneme süresi boyunca e-posta desteği");
        trialPackage.AddFeature("USER_MANAGEMENT", "2 Kullanıcı", "2 kullanıcıya kadar");
        trialPackage.AddFeature("STORAGE", "5 GB Depolama", "5 GB bulut depolama alanı");

        trialPackage.AddModule("CRM", "CRM Modülü", true, 50);

        packages.Add(trialPackage);

        // Başlangıç Package
        var starterPackage = Package.Create(
            name: "Başlangıç",
            type: PackageType.Baslangic,
            basePrice: Money.Create(499m, "TRY"),
            limits: PackageLimit.Create(
                maxUsers: 5,
                maxStorage: 10,
                maxProjects: 3,
                maxApiCalls: 10000,
                moduleLimits: new Dictionary<string, int>
                {
                    ["CRM"] = 100,
                    ["Accounting"] = 50
                }),
            description: "Küçük işletmeler için ideal başlangıç paketi",
            trialDays: 14,
            displayOrder: 1,
            isPublic: true);

        starterPackage.AddFeature("BASIC_REPORTS", "Temel Raporlama", "Temel raporlama özellikleri", true);
        starterPackage.AddFeature("EMAIL_SUPPORT", "E-posta Desteği", "Mesai saatleri içinde e-posta desteği");
        starterPackage.AddFeature("MOBILE_ACCESS", "Mobil Erişim", "Mobil cihazlardan erişim");
        starterPackage.AddFeature("USER_MANAGEMENT", "5 Kullanıcı", "5 kullanıcıya kadar");
        starterPackage.AddFeature("STORAGE", "10 GB Depolama", "10 GB bulut depolama alanı");
        
        starterPackage.AddModule("CRM", "CRM Modülü", true, 100);
        starterPackage.AddModule("Accounting", "Temel Muhasebe", true, 50);

        packages.Add(starterPackage);

        // Profesyonel Package
        var professionalPackage = Package.Create(
            name: "Profesyonel",
            type: PackageType.Profesyonel,
            basePrice: Money.Create(999m, "TRY"),
            limits: PackageLimit.Create(
                maxUsers: 20,
                maxStorage: 50,
                maxProjects: 10,
                maxApiCalls: 50000,
                moduleLimits: new Dictionary<string, int>
                {
                    ["CRM"] = 1000,
                    ["Accounting"] = 500,
                    ["Inventory"] = 100
                }),
            description: "Büyüyen işletmeler için profesyonel çözüm",
            trialDays: 30,
            displayOrder: 2,
            isPublic: true);

        professionalPackage.AddFeature("ADVANCED_REPORTS", "Gelişmiş Raporlama", "Detaylı raporlama ve analitik", true);
        professionalPackage.AddFeature("PRIORITY_SUPPORT", "Öncelikli Destek", "7/24 öncelikli destek", true);
        professionalPackage.AddFeature("API_ACCESS", "API Erişimi", "Entegrasyonlar için tam API erişimi");
        professionalPackage.AddFeature("CUSTOM_FIELDS", "Özel Alanlar", "Özel alan ve formlar oluşturma");
        professionalPackage.AddFeature("USER_MANAGEMENT", "20 Kullanıcı", "20 kullanıcıya kadar");
        professionalPackage.AddFeature("STORAGE", "50 GB Depolama", "50 GB bulut depolama alanı");
        professionalPackage.AddFeature("TRAINING", "Özel Eğitim", "Ekibiniz için özel eğitim");
        
        professionalPackage.AddModule("CRM", "CRM Modülü", true, 1000);
        professionalPackage.AddModule("Accounting", "Profesyonel Muhasebe", true, 500);
        professionalPackage.AddModule("Inventory", "Stok Yönetimi", true, 100);
        professionalPackage.AddModule("HR", "İnsan Kaynakları", true, 50);

        packages.Add(professionalPackage);

        // Enterprise Package
        var enterprisePackage = Package.Create(
            name: "Enterprise",
            type: PackageType.Kurumsal,
            basePrice: Money.Create(2499m, "TRY"),
            limits: PackageLimit.Unlimited(),
            description: "Büyük ölçekli işletmeler için kurumsal paket",
            trialDays: 30,
            displayOrder: 3,
            isPublic: true);

        enterprisePackage.AddFeature("CUSTOM_DEVELOPMENT", "Özel Geliştirme", "İhtiyaçlarınıza özel geliştirme", true);
        enterprisePackage.AddFeature("SLA", "%99.99 SLA Garantisi", "Kurumsal SLA garantisi", true);
        enterprisePackage.AddFeature("ONBOARDING", "Özel Kurulum", "Kişiselleştirilmiş kurulum hizmeti");
        enterprisePackage.AddFeature("TRAINING", "Kapsamlı Eğitim", "Tüm kullanıcılar için eğitim programı");
        enterprisePackage.AddFeature("USER_MANAGEMENT", "Sınırsız Kullanıcı", "Kullanıcı limiti yok");
        enterprisePackage.AddFeature("STORAGE", "500 GB Depolama", "500 GB bulut depolama alanı");
        enterprisePackage.AddFeature("DEDICATED_SUPPORT", "Özel Destek Ekibi", "Size özel atanmış destek ekibi");
        enterprisePackage.AddFeature("CUSTOM_SERVER", "Özel Sunucu", "İsteğe bağlı özel sunucu seçeneği");
        
        enterprisePackage.AddModule("CRM", "CRM Modülü", true);
        enterprisePackage.AddModule("Accounting", "Kurumsal Muhasebe", true);
        enterprisePackage.AddModule("Inventory", "Stok Yönetimi", true);
        enterprisePackage.AddModule("HR", "İnsan Kaynakları", true);
        enterprisePackage.AddModule("Projects", "Proje Yönetimi", true);

        packages.Add(enterprisePackage);

        await _context.Packages.AddRangeAsync(packages);
        _logger.LogInformation("Seeded {Count} packages: Trial, Starter, Professional, Enterprise.", packages.Count);
    }

    private async Task SeedSystemAdminAsync()
    {
        if (await _context.MasterUsers.AnyAsync(u => u.UserType == UserType.SistemYoneticisi))
        {
            _logger.LogInformation("System admin already seeded.");
            return;
        }

        var emailResult = Email.Create(_adminCredentials.DefaultAdminEmail);
        if (emailResult.IsFailure)
        {
            _logger.LogError("Failed to create admin email: {Error}", emailResult.Error.Description);
            return;
        }

        var systemAdmin = MasterUser.Create(
            username: "admin",
            email: emailResult.Value,
            plainPassword: _adminCredentials.DefaultAdminPassword,
            firstName: _adminCredentials.DefaultAdminFirstName,
            lastName: _adminCredentials.DefaultAdminLastName,
            userType: UserType.SistemYoneticisi);

        systemAdmin.Activate();
        systemAdmin.VerifyEmail();

        await _context.MasterUsers.AddAsync(systemAdmin);
        _logger.LogInformation("System administrator user created successfully with username '{Username}'.", systemAdmin.Username);
    }

    private async Task SeedTenantAdminAsync()
    {
        // DEVELOPMENT ONLY: Create a test tenant admin user
        _logger.LogWarning("DEVELOPMENT ENVIRONMENT: Creating test tenant admin user. This should NOT be used in production.");

        if (await _context.MasterUsers.AnyAsync(u => u.Username == "tenantadmin"))
        {
            _logger.LogInformation("Test tenant admin user already exists.");
            return;
        }

        var emailResult = Email.Create("admin@tenant.local");
        if (emailResult.IsFailure)
        {
            _logger.LogError("Failed to create tenant admin email: {Error}", emailResult.Error.Description);
            return;
        }

        var phoneResult = PhoneNumber.Create("+905555555555");
        if (phoneResult.IsFailure)
        {
            _logger.LogError("Failed to create tenant admin phone: {Error}", emailResult.Error.Description);
            return;
        }

        var tenantAdmin = MasterUser.Create(
            username: "tenantadmin",
            email: emailResult.Value,
            plainPassword: "Admin123!",
            firstName: "Test",
            lastName: "Admin",
            phoneNumber: phoneResult.Value,
            userType: UserType.FirmaYoneticisi);

        tenantAdmin.Activate();
        tenantAdmin.VerifyEmail();

        await _context.MasterUsers.AddAsync(tenantAdmin);
        _logger.LogInformation("DEVELOPMENT: Created test tenant admin (Username: 'tenantadmin', Password: 'Admin123!')");
    }

    private async Task SeedUserTiersAsync()
    {
        if (await _context.UserTiers.AnyAsync())
        {
            _logger.LogInformation("User tiers already seeded.");
            return;
        }

        var tiers = new List<UserTier>
        {
            UserTier.Create(
                code: "MICRO",
                name: "Mikro İşletme",
                minUsers: 1,
                maxUsers: 5,
                pricePerUser: Money.Create(49m, "TRY"),
                basePrice: null,
                description: "1-5 kullanıcı için ideal",
                displayOrder: 0),

            UserTier.Create(
                code: "SMALL",
                name: "Küçük İşletme",
                minUsers: 6,
                maxUsers: 15,
                pricePerUser: Money.Create(39m, "TRY"),
                basePrice: Money.Create(100m, "TRY"),
                description: "6-15 kullanıcı için tasarlandı",
                displayOrder: 1),

            UserTier.Create(
                code: "MEDIUM",
                name: "Orta Ölçekli",
                minUsers: 16,
                maxUsers: 50,
                pricePerUser: Money.Create(29m, "TRY"),
                basePrice: Money.Create(300m, "TRY"),
                description: "16-50 kullanıcı için uygun",
                displayOrder: 2),

            UserTier.Create(
                code: "LARGE",
                name: "Büyük İşletme",
                minUsers: 51,
                maxUsers: 200,
                pricePerUser: Money.Create(19m, "TRY"),
                basePrice: Money.Create(500m, "TRY"),
                description: "51-200 kullanıcı için",
                displayOrder: 3),

            UserTier.Create(
                code: "ENTERPRISE",
                name: "Kurumsal",
                minUsers: 201,
                maxUsers: -1, // Sınırsız
                pricePerUser: Money.Create(14m, "TRY"),
                basePrice: Money.Create(1000m, "TRY"),
                description: "200+ kullanıcı için kurumsal plan",
                displayOrder: 4)
        };

        await _context.UserTiers.AddRangeAsync(tiers);
        _logger.LogInformation("Seeded {Count} user tiers.", tiers.Count);
    }

    private async Task SeedStoragePlansAsync()
    {
        if (await _context.StoragePlans.AnyAsync())
        {
            _logger.LogInformation("Storage plans already seeded.");
            return;
        }

        var plans = new List<StoragePlan>
        {
            StoragePlan.Create(
                code: "BASIC",
                name: "Temel Depolama",
                storageGB: 5,
                monthlyPrice: Money.Create(0m, "TRY"),
                description: "5 GB ücretsiz depolama alanı",
                isDefault: true,
                displayOrder: 0),

            StoragePlan.Create(
                code: "STANDARD",
                name: "Standart Depolama",
                storageGB: 25,
                monthlyPrice: Money.Create(49m, "TRY"),
                description: "25 GB depolama alanı",
                isDefault: false,
                displayOrder: 1),

            StoragePlan.Create(
                code: "PROFESSIONAL",
                name: "Profesyonel Depolama",
                storageGB: 100,
                monthlyPrice: Money.Create(149m, "TRY"),
                description: "100 GB depolama alanı",
                isDefault: false,
                displayOrder: 2),

            StoragePlan.Create(
                code: "ENTERPRISE",
                name: "Kurumsal Depolama",
                storageGB: 500,
                monthlyPrice: Money.Create(399m, "TRY"),
                description: "500 GB depolama alanı",
                isDefault: false,
                displayOrder: 3),

            StoragePlan.Create(
                code: "UNLIMITED",
                name: "Sınırsız Depolama",
                storageGB: 2000,
                monthlyPrice: Money.Create(799m, "TRY"),
                description: "2 TB depolama alanı",
                isDefault: false,
                displayOrder: 4)
        };

        await _context.StoragePlans.AddRangeAsync(plans);
        _logger.LogInformation("Seeded {Count} storage plans.", plans.Count);
    }

    private async Task SeedAddOnsAsync()
    {
        if (await _context.AddOns.AnyAsync())
        {
            _logger.LogInformation("Add-ons already seeded.");
            return;
        }

        var addOns = new List<AddOn>();

        // API Erişimi
        var apiAccess = AddOn.Create(
            code: "API_ACCESS",
            name: "API Erişimi",
            monthlyPrice: Money.Create(199m, "TRY"),
            description: "REST API ve webhook entegrasyonları",
            icon: "🔌",
            displayOrder: 0,
            category: "Entegrasyon");
        apiAccess.AddFeature("REST API", "Tam REST API erişimi");
        apiAccess.AddFeature("Webhook", "Gerçek zamanlı webhook bildirimleri");
        apiAccess.AddFeature("API Dokümantasyonu", "Detaylı API belgeleri");
        apiAccess.AddFeature("Rate Limit", "Dakikada 1000 istek");
        addOns.Add(apiAccess);

        // Öncelikli Destek
        var prioritySupport = AddOn.Create(
            code: "PRIORITY_SUPPORT",
            name: "Öncelikli Destek",
            monthlyPrice: Money.Create(299m, "TRY"),
            description: "7/24 öncelikli teknik destek",
            icon: "🎧",
            displayOrder: 1,
            category: "Destek");
        prioritySupport.AddFeature("7/24 Destek", "Her zaman ulaşılabilir destek");
        prioritySupport.AddFeature("Öncelikli Yanıt", "1 saat içinde yanıt garantisi");
        prioritySupport.AddFeature("Telefon Desteği", "Doğrudan telefon hattı");
        prioritySupport.AddFeature("Uzaktan Yardım", "Ekran paylaşımı ile destek");
        addOns.Add(prioritySupport);

        // İleri Güvenlik
        var advancedSecurity = AddOn.Create(
            code: "ADVANCED_SECURITY",
            name: "İleri Güvenlik",
            monthlyPrice: Money.Create(249m, "TRY"),
            description: "Gelişmiş güvenlik özellikleri",
            icon: "🛡️",
            displayOrder: 2,
            category: "Güvenlik");
        advancedSecurity.AddFeature("İki Faktörlü Doğrulama", "2FA zorunluluğu");
        advancedSecurity.AddFeature("IP Kısıtlama", "İzin verilen IP listesi");
        advancedSecurity.AddFeature("Oturum Yönetimi", "Gelişmiş oturum kontrolü");
        advancedSecurity.AddFeature("Güvenlik Raporları", "Haftalık güvenlik raporları");
        advancedSecurity.AddFeature("SSO Entegrasyonu", "Single Sign-On desteği");
        addOns.Add(advancedSecurity);

        // Özel Alan Adı
        var customDomain = AddOn.Create(
            code: "CUSTOM_DOMAIN",
            name: "Özel Alan Adı",
            monthlyPrice: Money.Create(99m, "TRY"),
            description: "Kendi alan adınızla erişim",
            icon: "🌐",
            displayOrder: 3,
            category: "Özelleştirme");
        customDomain.AddFeature("Özel Domain", "firma.sizinalan.com");
        customDomain.AddFeature("SSL Sertifikası", "Ücretsiz SSL sertifikası");
        customDomain.AddFeature("DNS Yönetimi", "Kolay DNS yapılandırması");
        addOns.Add(customDomain);

        // Beyaz Etiket
        var whiteLabel = AddOn.Create(
            code: "WHITE_LABEL",
            name: "Beyaz Etiket",
            monthlyPrice: Money.Create(499m, "TRY"),
            description: "Kendi markanızla sunun",
            icon: "🏷️",
            displayOrder: 4,
            category: "Özelleştirme");
        whiteLabel.AddFeature("Özel Logo", "Kendi logonuzu kullanın");
        whiteLabel.AddFeature("Özel Renkler", "Marka renkleriniz");
        whiteLabel.AddFeature("Özel E-posta Şablonları", "Markalı e-postalar");
        whiteLabel.AddFeature("Giriş Sayfası Özelleştirme", "Özel giriş ekranı");
        addOns.Add(whiteLabel);

        // Otomatik Yedekleme
        var autoBackup = AddOn.Create(
            code: "AUTO_BACKUP",
            name: "Otomatik Yedekleme",
            monthlyPrice: Money.Create(149m, "TRY"),
            description: "Gelişmiş yedekleme ve kurtarma",
            icon: "☁️",
            displayOrder: 5,
            category: "Güvenlik");
        autoBackup.AddFeature("Saatlik Yedekleme", "Her saat otomatik yedek");
        autoBackup.AddFeature("30 Gün Saklama", "30 günlük yedek geçmişi");
        autoBackup.AddFeature("Tek Tık Geri Yükleme", "Kolay geri yükleme");
        autoBackup.AddFeature("Farklı Lokasyon", "Coğrafi yedeklilik");
        addOns.Add(autoBackup);

        // E-Fatura Entegrasyonu
        var eInvoice = AddOn.Create(
            code: "E_INVOICE",
            name: "e-Fatura Entegrasyonu",
            monthlyPrice: Money.Create(199m, "TRY"),
            description: "GİB entegrasyonu ile e-fatura",
            icon: "📄",
            displayOrder: 6,
            category: "Entegrasyon");
        eInvoice.AddFeature("e-Fatura Gönderimi", "Doğrudan GİB'e gönderim");
        eInvoice.AddFeature("e-Arşiv", "e-Arşiv fatura desteği");
        eInvoice.AddFeature("Otomatik Numaralama", "Seri no yönetimi");
        eInvoice.AddFeature("XML/PDF Export", "Çoklu format desteği");
        addOns.Add(eInvoice);

        // Çoklu Dil Desteği
        var multiLanguage = AddOn.Create(
            code: "MULTI_LANGUAGE",
            name: "Çoklu Dil Desteği",
            monthlyPrice: Money.Create(79m, "TRY"),
            description: "10+ dilde kullanım imkanı",
            icon: "🌍",
            displayOrder: 7,
            category: "Özelleştirme");
        multiLanguage.AddFeature("10+ Dil", "Türkçe, İngilizce, Almanca, vb.");
        multiLanguage.AddFeature("Otomatik Çeviri", "İçerik otomatik çevirisi");
        multiLanguage.AddFeature("Çok Dilli Raporlar", "Farklı dillerde raporlar");
        addOns.Add(multiLanguage);

        await _context.AddOns.AddRangeAsync(addOns);
        _logger.LogInformation("Seeded {Count} add-ons.", addOns.Count);
    }

    private async Task SeedIndustriesAsync()
    {
        if (await _context.Industries.AnyAsync())
        {
            _logger.LogInformation("Industries already seeded.");
            return;
        }

        var industries = new List<Industry>();

        // Perakende
        var retail = Industry.Create(
            code: "RETAIL",
            name: "Perakende",
            description: "Mağaza, market, butik ve perakende satış işletmeleri",
            icon: "🏪",
            displayOrder: 0);
        retail.AddRecommendedModule("CRM");
        retail.AddRecommendedModule("Sales");
        retail.AddRecommendedModule("Inventory");
        retail.AddRecommendedModule("Finance");
        industries.Add(retail);

        // E-Ticaret
        var ecommerce = Industry.Create(
            code: "ECOMMERCE",
            name: "E-Ticaret",
            description: "Online satış ve e-ticaret platformları",
            icon: "🛒",
            displayOrder: 1);
        ecommerce.AddRecommendedModule("CRM");
        ecommerce.AddRecommendedModule("Sales");
        ecommerce.AddRecommendedModule("Inventory");
        ecommerce.AddRecommendedModule("Reports");
        industries.Add(ecommerce);

        // Üretim
        var manufacturing = Industry.Create(
            code: "MANUFACTURING",
            name: "Üretim",
            description: "İmalat, fabrika ve üretim tesisleri",
            icon: "🏭",
            displayOrder: 2);
        manufacturing.AddRecommendedModule("Inventory");
        manufacturing.AddRecommendedModule("Purchase");
        manufacturing.AddRecommendedModule("HR");
        manufacturing.AddRecommendedModule("Finance");
        manufacturing.AddRecommendedModule("Accounting");
        industries.Add(manufacturing);

        // Toptan Satış
        var wholesale = Industry.Create(
            code: "WHOLESALE",
            name: "Toptan Satış",
            description: "Toptancı ve distribütör firmalar",
            icon: "📦",
            displayOrder: 3);
        wholesale.AddRecommendedModule("CRM");
        wholesale.AddRecommendedModule("Sales");
        wholesale.AddRecommendedModule("Inventory");
        wholesale.AddRecommendedModule("Purchase");
        wholesale.AddRecommendedModule("Finance");
        industries.Add(wholesale);

        // Hizmet Sektörü
        var services = Industry.Create(
            code: "SERVICES",
            name: "Hizmet",
            description: "Danışmanlık, ajans ve profesyonel hizmet firmaları",
            icon: "💼",
            displayOrder: 4);
        services.AddRecommendedModule("CRM");
        services.AddRecommendedModule("Projects");
        services.AddRecommendedModule("HR");
        services.AddRecommendedModule("Finance");
        industries.Add(services);

        // Sağlık
        var healthcare = Industry.Create(
            code: "HEALTHCARE",
            name: "Sağlık",
            description: "Hastane, klinik ve sağlık kuruluşları",
            icon: "🏥",
            displayOrder: 5);
        healthcare.AddRecommendedModule("CRM");
        healthcare.AddRecommendedModule("HR");
        healthcare.AddRecommendedModule("Inventory");
        healthcare.AddRecommendedModule("Finance");
        healthcare.AddRecommendedModule("Accounting");
        industries.Add(healthcare);

        // İnşaat
        var construction = Industry.Create(
            code: "CONSTRUCTION",
            name: "İnşaat",
            description: "Müteahhitlik ve inşaat firmaları",
            icon: "🏗️",
            displayOrder: 6);
        construction.AddRecommendedModule("Projects");
        construction.AddRecommendedModule("Purchase");
        construction.AddRecommendedModule("HR");
        construction.AddRecommendedModule("Finance");
        construction.AddRecommendedModule("Accounting");
        industries.Add(construction);

        // Eğitim
        var education = Industry.Create(
            code: "EDUCATION",
            name: "Eğitim",
            description: "Okul, kurs ve eğitim kurumları",
            icon: "🎓",
            displayOrder: 7);
        education.AddRecommendedModule("CRM");
        education.AddRecommendedModule("HR");
        education.AddRecommendedModule("Finance");
        education.AddRecommendedModule("Reports");
        industries.Add(education);

        // Restoran & Gıda
        var restaurant = Industry.Create(
            code: "RESTAURANT",
            name: "Restoran & Gıda",
            description: "Restoran, kafe ve yiyecek içecek işletmeleri",
            icon: "🍽️",
            displayOrder: 8);
        restaurant.AddRecommendedModule("Sales");
        restaurant.AddRecommendedModule("Inventory");
        restaurant.AddRecommendedModule("HR");
        restaurant.AddRecommendedModule("Finance");
        industries.Add(restaurant);

        // Lojistik
        var logistics = Industry.Create(
            code: "LOGISTICS",
            name: "Lojistik",
            description: "Taşımacılık, kargo ve lojistik firmaları",
            icon: "🚚",
            displayOrder: 9);
        logistics.AddRecommendedModule("CRM");
        logistics.AddRecommendedModule("Inventory");
        logistics.AddRecommendedModule("HR");
        logistics.AddRecommendedModule("Finance");
        logistics.AddRecommendedModule("Projects");
        industries.Add(logistics);

        // Otomotiv
        var automotive = Industry.Create(
            code: "AUTOMOTIVE",
            name: "Otomotiv",
            description: "Oto galeri, servis ve yedek parça",
            icon: "🚗",
            displayOrder: 10);
        automotive.AddRecommendedModule("CRM");
        automotive.AddRecommendedModule("Sales");
        automotive.AddRecommendedModule("Inventory");
        automotive.AddRecommendedModule("Finance");
        industries.Add(automotive);

        // Diğer
        var other = Industry.Create(
            code: "OTHER",
            name: "Diğer",
            description: "Yukarıdaki kategorilere uymayan işletmeler",
            icon: "🏢",
            displayOrder: 99);
        other.AddRecommendedModule("Core");
        industries.Add(other);

        await _context.Industries.AddRangeAsync(industries);
        _logger.LogInformation("Seeded {Count} industries.", industries.Count);
    }

    private async Task SeedEmailTemplatesAsync()
    {
        // Get existing template keys to check for missing ones
        var existingKeys = await _context.EmailTemplates
            .Select(t => t.TemplateKey)
            .ToListAsync();

        var templates = new List<EmailTemplate>();

        // Tenant Email Verification with Code (Turkish) - Main email verification
        if (!existingKeys.Contains("tenant-email-verification"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "tenant-email-verification",
                name: "Tenant Email Doğrulama",
                subject: "E-posta Doğrulama: Stoocker",
                htmlBody: GetTenantEmailVerificationTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Authentication,
                variables: "[\"userName\", \"verificationCode\", \"verificationUrl\", \"logoUrl\", \"year\"]",
                description: "Tenant kayıt sonrası 6 haneli doğrulama kodu ile email doğrulama",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"verificationCode\":\"123456\",\"verificationUrl\":\"https://stoocker.app/verify\",\"year\":\"2024\"}"));
        }

        // Password Reset Template (Turkish)
        if (!existingKeys.Contains("password-reset"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "password-reset",
                name: "Şifre Sıfırlama",
                subject: "Şifre Sıfırlama: Stoocker",
                htmlBody: GetPasswordResetTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Authentication,
                variables: "[\"userName\", \"resetUrl\", \"logoUrl\", \"year\"]",
                description: "Şifre sıfırlama talebi için gönderilen mail",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"resetUrl\":\"https://stoocker.app/reset\",\"year\":\"2024\"}"));
        }

        // Welcome Email Template (Turkish)
        if (!existingKeys.Contains("welcome"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "welcome",
                name: "Hoşgeldiniz",
                subject: "Hoş Geldiniz: Stoocker",
                htmlBody: GetWelcomeTemplate(),
                language: "tr",
                category: EmailTemplateCategory.UserManagement,
                variables: "[\"userName\", \"companyName\", \"loginUrl\", \"logoUrl\", \"year\"]",
                description: "Kayıt tamamlandıktan sonra gönderilen hoşgeldiniz maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"companyName\":\"ABC Ltd.\",\"loginUrl\":\"https://stoocker.app/login\",\"year\":\"2024\"}"));
        }

        // User Invitation Template (Turkish)
        if (!existingKeys.Contains("user-invitation"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "user-invitation",
                name: "Kullanıcı Daveti",
                subject: "Davet: {{ appName }}",
                htmlBody: GetUserInvitationTemplate(),
                language: "tr",
                category: EmailTemplateCategory.UserManagement,
                variables: "[\"userName\", \"inviterName\", \"companyName\", \"activationUrl\", \"email\", \"domain\", \"appName\", \"expirationDays\", \"logoUrl\", \"year\"]",
                description: "Admin tarafından oluşturulan kullanıcı için aktivasyon daveti",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"inviterName\":\"Mehmet Demir\",\"companyName\":\"ABC Ltd.\",\"activationUrl\":\"https://stoocker.app/setup-password\",\"email\":\"ahmet@example.com\",\"domain\":\"abc.stoocker.app\",\"appName\":\"Stoocker\",\"expirationDays\":7,\"year\":\"2024\"}"));
        }

        // Trial Ending Template (Turkish)
        if (!existingKeys.Contains("trial-ending"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "trial-ending",
                name: "Deneme Süresi Bitiyor",
                subject: "Deneme Süresi Hatırlatması",
                htmlBody: GetTrialEndingTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"userName\", \"daysLeft\", \"upgradeUrl\", \"logoUrl\", \"year\"]",
                description: "Deneme süresi bitmeden önce gönderilen hatırlatma maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"daysLeft\":\"3\",\"upgradeUrl\":\"https://stoocker.app/upgrade\",\"year\":\"2024\"}"));
        }

        // Critical Stock Alert Template (Turkish)
        if (!existingKeys.Contains("critical-stock"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "critical-stock",
                name: "Kritik Stok Uyarısı",
                subject: "Kritik Stok Uyarısı",
                htmlBody: GetCriticalStockTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"productName\", \"skuCode\", \"currentStock\", \"minLimit\", \"inventoryUrl\", \"logoUrl\", \"year\"]",
                description: "Stok seviyesi kritik seviyenin altına düştüğünde gönderilen uyarı maili",
                sampleData: "{\"productName\":\"iPhone 15 Pro\",\"skuCode\":\"IPH15PRO-256\",\"currentStock\":\"5\",\"minLimit\":\"10\",\"inventoryUrl\":\"https://stoocker.app/inventory\",\"year\":\"2024\"}"));
        }

        // Payment Receipt Template (Turkish)
        if (!existingKeys.Contains("payment-receipt"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "payment-receipt",
                name: "Ödeme Makbuzu",
                subject: "Ödeme Makbuzu",
                htmlBody: GetPaymentReceiptTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Transaction,
                variables: "[\"userName\", \"invoiceNumber\", \"planName\", \"billingPeriod\", \"amount\", \"taxAmount\", \"totalAmount\", \"invoicePdfUrl\", \"logoUrl\", \"year\"]",
                description: "Başarılı ödeme sonrası gönderilen makbuz maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"invoiceNumber\":\"INV-2024-0001\",\"planName\":\"Profesyonel\",\"billingPeriod\":\"Aylık\",\"amount\":\"999\",\"taxAmount\":\"199.80\",\"totalAmount\":\"1198.80\",\"invoicePdfUrl\":\"https://stoocker.app/invoice/123\",\"year\":\"2024\"}"));
        }

        // Payment Failed Template (Turkish)
        if (!existingKeys.Contains("payment-failed"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "payment-failed",
                name: "Ödeme Başarısız",
                subject: "Ödeme Alınamadı",
                htmlBody: GetPaymentFailedTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Transaction,
                variables: "[\"userName\", \"planName\", \"last4Digits\", \"billingUrl\", \"logoUrl\", \"year\"]",
                description: "Başarısız ödeme sonrası gönderilen uyarı maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"planName\":\"Profesyonel\",\"last4Digits\":\"4242\",\"billingUrl\":\"https://stoocker.app/billing\",\"year\":\"2024\"}"));
        }

        // New Task Assignment Template (Turkish)
        if (!existingKeys.Contains("new-task"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "new-task",
                name: "Yeni Görev Atandı",
                subject: "Yeni Görev Atandı",
                htmlBody: GetNewTaskTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"assignerName\", \"taskTitle\", \"dueDate\", \"priority\", \"taskUrl\", \"logoUrl\", \"year\"]",
                description: "Yeni görev atandığında gönderilen bildirim maili",
                sampleData: "{\"assignerName\":\"Mehmet Demir\",\"taskTitle\":\"Stok Sayımı Yapılacak\",\"dueDate\":\"15 Ocak 2024\",\"priority\":\"Yüksek\",\"taskUrl\":\"https://stoocker.app/tasks/123\",\"year\":\"2024\"}"));
        }

        // Subscription Cancel Template (Turkish)
        if (!existingKeys.Contains("subscription-cancel"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "subscription-cancel",
                name: "Abonelik İptali",
                subject: "Abonelik İptali: Stoocker",
                htmlBody: GetSubscriptionCancelTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Transaction,
                variables: "[\"planName\", \"expiryDate\", \"retentionDays\", \"reactivateUrl\", \"logoUrl\", \"year\"]",
                description: "Abonelik iptal edildiğinde gönderilen bildirim maili",
                sampleData: "{\"planName\":\"Profesyonel\",\"expiryDate\":\"31 Ocak 2024\",\"retentionDays\":\"30\",\"reactivateUrl\":\"https://stoocker.app/billing\",\"year\":\"2024\"}"));
        }

        // Support Ticket Template (Turkish)
        if (!existingKeys.Contains("support-ticket"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "support-ticket",
                name: "Destek Talebi",
                subject: "Destek Talebi Alındı: #{{ ticketId }}",
                htmlBody: GetSupportTicketTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"userName\", \"ticketId\", \"subject\", \"ticketUrl\", \"logoUrl\", \"year\"]",
                description: "Destek talebi oluşturulduğunda gönderilen onay maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"ticketId\":\"T-2024-0001\",\"subject\":\"Fatura sorunu\",\"ticketUrl\":\"https://stoocker.app/support/T-2024-0001\",\"year\":\"2024\"}"));
        }

        // File Export Template (Turkish)
        if (!existingKeys.Contains("file-export"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "file-export",
                name: "Dosya İndirme",
                subject: "Dosyanız İndirilmeye Hazır",
                htmlBody: GetFileExportTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"exportName\", \"fileSize\", \"downloadUrl\", \"logoUrl\", \"year\"]",
                description: "Dışa aktarma tamamlandığında gönderilen bildirim maili",
                sampleData: "{\"exportName\":\"Stok_Raporu_Ocak_2024.xlsx\",\"fileSize\":\"2.5 MB\",\"downloadUrl\":\"https://stoocker.app/downloads/abc123\",\"year\":\"2024\"}"));
        }

        // Weekly Report Template (Turkish)
        if (!existingKeys.Contains("weekly-report"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "weekly-report",
                name: "Haftalık Rapor",
                subject: "Haftalık Performans Raporu",
                htmlBody: GetWeeklyReportTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Notification,
                variables: "[\"userName\", \"startDate\", \"endDate\", \"totalSales\", \"salesGrowth\", \"newCustomers\", \"lowStockCount\", \"product1Name\", \"product1Sales\", \"product2Name\", \"product2Sales\", \"product3Name\", \"product3Sales\", \"dashboardUrl\", \"logoUrl\", \"year\"]",
                description: "Haftalık performans özeti maili",
                sampleData: "{\"userName\":\"Ahmet Yılmaz\",\"startDate\":\"8 Ocak 2024\",\"endDate\":\"14 Ocak 2024\",\"totalSales\":\"125.450\",\"salesGrowth\":\"12.5\",\"newCustomers\":\"45\",\"lowStockCount\":\"8\",\"product1Name\":\"iPhone 15 Pro\",\"product1Sales\":\"32\",\"product2Name\":\"Samsung S24\",\"product2Sales\":\"28\",\"product3Name\":\"MacBook Air\",\"product3Sales\":\"15\",\"dashboardUrl\":\"https://stoocker.app/dashboard\",\"year\":\"2024\"}"));
        }

        // New Device Login Template (Turkish)
        if (!existingKeys.Contains("new-device-login"))
        {
            templates.Add(EmailTemplate.CreateSystem(
                templateKey: "new-device-login",
                name: "Yeni Cihaz Girişi",
                subject: "Yeni Cihaz Girişi Tespit Edildi",
                htmlBody: GetNewDeviceLoginTemplate(),
                language: "tr",
                category: EmailTemplateCategory.Authentication,
                variables: "[\"deviceName\", \"browser\", \"location\", \"ipAddress\", \"loginTime\", \"securityUrl\", \"logoUrl\", \"year\"]",
                description: "Yeni cihazdan giriş yapıldığında gönderilen güvenlik uyarısı",
                sampleData: "{\"deviceName\":\"Windows PC\",\"browser\":\"Chrome 120\",\"location\":\"İstanbul, Türkiye\",\"ipAddress\":\"88.xxx.xxx.xxx\",\"loginTime\":\"15 Ocak 2024, 14:30\",\"securityUrl\":\"https://stoocker.app/security\",\"year\":\"2024\"}"));
        }

        if (templates.Count > 0)
        {
            await _context.EmailTemplates.AddRangeAsync(templates);
            _logger.LogInformation("Seeded {Count} missing email templates.", templates.Count);
        }
        else
        {
            _logger.LogInformation("All email templates already exist.");
        }
    }

    private static string GetTenantEmailVerificationTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>E-posta Doğrulama: Stoocker</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
        }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f8fafc;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; text-align: center; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #0f172a; text-align: center; letter-spacing: -0.5px; line-height: 1.3;"">
                                E-posta adresinizi doğrulayın
                            </h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Merhaba <strong>{{ userName }}</strong>,<br>
                                Stoocker hesabınızın güvenliği için lütfen aşağıdaki doğrulama kodunu kullanın.
                            </p>
                            <div style=""background-color: #f1f5f9; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;"">
                                <span style=""font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 8px; display: block;"">
                                    {{ verificationCode }}
                                </span>
                            </div>
                            <p style=""margin: 0 0 30px 0; font-size: 13px; color: #64748b; text-align: center;"">
                                Bu kod <strong>24 saat</strong> boyunca geçerlidir.<br>Kodu kimseyle paylaşmayınız.
                            </p>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td style=""border-top: 1px solid #e2e8f0; padding-bottom: 30px;""></td>
                                </tr>
                            </table>
                            <p style=""margin: 0 0 15px 0; font-size: 14px; color: #475569; text-align: center;"">
                                Veya doğrudan aşağıdaki butona tıklayabilirsiniz:
                            </p>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ verificationUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
                                            Hesabımı Doğrula
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; word-break: break-all;"">
                                {{ verificationUrl }}
                            </p>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">
                            &copy; {{ year }} Stoocker, Inc. Tüm hakları saklıdır.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetPasswordResetTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Şifre Sıfırlama: Stoocker</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
        }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f8fafc;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; text-align: center; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #0f172a; text-align: center; letter-spacing: -0.5px; line-height: 1.3;"">
                                Şifre sıfırlama talebi
                            </h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Merhaba <strong>{{ userName }}</strong>,<br>
                                Stoocker hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi yenilemek için aşağıdaki butonu kullanabilirsiniz.
                            </p>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ resetUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
                                            Şifremi Sıfırla
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 24px 0 0 0; font-size: 13px; color: #64748b; text-align: center;"">
                                Bu bağlantı güvenliğiniz için <strong>1 saat</strong> sonra geçerliliğini yitirecektir.
                            </p>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td style=""border-top: 1px solid #e2e8f0; padding-bottom: 24px; padding-top: 24px;""></td>
                                </tr>
                            </table>
                            <p style=""margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;"">
                                <strong>Bu talebi siz yapmadınız mı?</strong><br>
                                Endişelenmenize gerek yok. Bu e-postayı görmezden gelebilirsiniz, şifreniz değişmeyecektir.
                            </p>
                            <div style=""margin-top: 24px; padding-top: 20px; border-top: 1px dashed #e2e8f0; text-align: center;"">
                                <p style=""margin: 0 0 10px 0; font-size: 12px; color: #64748b;"">Buton çalışmıyor mu? Linki tarayıcınıza yapıştırın:</p>
                                <p style=""margin: 0; font-size: 11px; font-family: monospace; color: #64748b; word-break: break-all;"">
                                    {{ resetUrl }}
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">
                            &copy; {{ year }} Stoocker, Inc. Tüm hakları saklıdır.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetWelcomeTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Hoş Geldiniz: Stoocker</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
        }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f8fafc;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; text-align: center; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""200"" height=""200"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;"">
                                Hesabınız başarıyla oluşturuldu.
                            </h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;"">
                                Merhaba <strong>{{ userName }}</strong>,<br><br>
                                <strong>{{ companyName }}</strong> hesabınızın kurulumu tamamlandı. Artık Stoocker paneline erişebilir ve iş akışlarınızı yönetmeye başlayabilirsiniz.
                            </p>
                            <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                                <p style=""margin: 0 0 15px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;"">ERİŞİM DETAYLARI</p>
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td width=""20"" valign=""top"" style=""padding-bottom: 12px;"">
                                            <span style=""font-size: 16px; color: #0f172a;"">&bull;</span>
                                        </td>
                                        <td style=""padding-bottom: 12px; font-size: 14px; color: #334155;"">
                                            <strong style=""color: #0f172a;"">CRM Modülü:</strong> Müşteri ilişkileri ve satış süreçleri.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width=""20"" valign=""top"" style=""padding-bottom: 12px;"">
                                            <span style=""font-size: 16px; color: #0f172a;"">&bull;</span>
                                        </td>
                                        <td style=""padding-bottom: 12px; font-size: 14px; color: #334155;"">
                                            <strong style=""color: #0f172a;"">Stok & Envanter:</strong> Ürün giriş/çıkış ve depo takibi.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width=""20"" valign=""top"" style=""padding-bottom: 12px;"">
                                            <span style=""font-size: 16px; color: #0f172a;"">&bull;</span>
                                        </td>
                                        <td style=""padding-bottom: 12px; font-size: 14px; color: #334155;"">
                                            <strong style=""color: #0f172a;"">Finansal Raporlar:</strong> Gelir/gider analizleri.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width=""20"" valign=""top"" style=""padding-bottom: 0;"">
                                            <span style=""font-size: 16px; color: #0f172a;"">&bull;</span>
                                        </td>
                                        <td style=""padding-bottom: 0; font-size: 14px; color: #334155;"">
                                            <strong style=""color: #0f172a;"">Destek:</strong> 7/24 teknik yardım paneli.
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""left"">
                                        <a href=""{{ loginUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
                                            Panele Giriş Yap &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 30px 0 0 0; font-size: 14px; line-height: 1.6; color: #475569;"">
                                Sorularınız mı var? <a href=""https://stoocker.app/docs"" style=""color: #0f172a; text-decoration: underline;"">Dokümantasyonu inceleyin</a> veya bu e-postayı yanıtlayın.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">
                            &copy; {{ year }} Stoocker, Inc. Tüm hakları saklıdır.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetUserInvitationTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Davet: {{ appName }}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        img { border: 0; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px !important; }
            .content-table { width: 100% !important; border: none !important; }
        }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f8fafc;"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; text-align: center; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 40px 40px 20px 40px; text-align: left;"">
                            <div style=""font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;"">
                                {{ appName }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 0 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;"">
                                <span style=""color: #64748b;"">{{ inviterName }}</span> sizi <span style=""color: #0f172a;"">{{ companyName }}</span> ekibine davet etti.
                            </h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;"">
                                Merhaba <strong>{{ userName }}</strong>,<br><br>
                                İş akışlarını yönetmek ve ekiple işbirliği yapmak için Stoocker üzerinde bir hesap oluşturmanız istendi. Aşağıdaki detaylarla giriş yapabilirsiniz:
                            </p>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""background-color: #f1f5f9; border-radius: 8px; margin-bottom: 30px;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                            <tr>
                                                <td style=""padding-bottom: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;"">Şirket</td>
                                                <td style=""padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #0f172a; text-align: right;"">{{ companyName }}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding-bottom: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;"">Domain</td>
                                                <td style=""padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #0f172a; text-align: right; font-family: monospace;"">{{ domain }}</td>
                                            </tr>
                                            <tr>
                                                <td style=""padding-bottom: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;"">E-posta</td>
                                                <td style=""padding-bottom: 8px; font-size: 14px; font-weight: 500; color: #0f172a; text-align: right;"">{{ email }}</td>
                                            </tr>
                                            <tr>
                                                <td style=""font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;"">Rol</td>
                                                <td style=""font-size: 14px; font-weight: 500; color: #0f172a; text-align: right;"">Ekip Üyesi</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""left"">
                                        <a href=""{{ activationUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"">
                                            Daveti Kabul Et ve Şifre Belirle &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 20px 0 0 0; font-size: 13px; color: #94a3b8;"">
                                Bu davet linki güvenlik nedeniyle <strong>{{ expirationDays }} gün</strong> içinde geçersiz olacaktır.
                            </p>
                            <div style=""margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;"">
                                <p style=""margin: 0 0 10px 0; font-size: 12px; color: #64748b;"">Buton çalışmıyor mu? Linki tarayıcınıza yapıştırın:</p>
                                <p style=""margin: 0; font-size: 11px; font-family: monospace; color: #64748b; word-break: break-all;"">
                                    {{ activationUrl }}
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">
                            &copy; {{ year }} {{ appName }}, Inc. Tüm hakları saklıdır.<br>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetTrialEndingTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Deneme Süresi Hatırlatması</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Deneme Süreniz Sona Eriyor</h1>
                            <p style=""margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Sayın <strong>{{ userName }}</strong>,<br>
                                Ücretsiz deneme sürenizin bitmesine <strong>{{ daysLeft }} gün</strong> kaldı. Kesintisiz erişim için planınızı şimdi yükseltin.
                            </p>
                            <div style=""background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td valign=""middle"">
                                            <p style=""margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #0f172a;"">Starter Plan</p>
                                            <p style=""margin: 0; font-size: 13px; color: #64748b;"">Tüm özelliklere erişim devam etsin.</p>
                                        </td>
                                        <td valign=""middle"" style=""text-align: right;"">
                                            <span style=""font-size: 18px; font-weight: 700; color: #0f172a;"">₺499</span><span style=""font-size: 13px; color: #64748b;"">/ay</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ upgradeUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Planı Yükselt &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 24px 0 0 0; font-size: 13px; color: #64748b; text-align: center;"">
                                Sorularınız varsa bizimle iletişime geçebilirsiniz.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetCriticalStockTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Kritik Stok Uyarısı</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #b45309; text-align: center;"">⚠️ Kritik Stok Seviyesi</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Aşağıdaki ürün için belirlediğiniz minimum stok seviyesinin altına düşüldü.
                            </p>
                            <div style=""background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td width=""60"" valign=""middle"" style=""padding-right: 20px;"">
                                            <div style=""width: 60px; height: 60px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; line-height: 60px; font-size: 24px;"">📦</div>
                                        </td>
                                        <td valign=""middle"">
                                            <p style=""margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;"">{{ productName }}</p>
                                            <p style=""margin: 0; font-size: 13px; color: #64748b;"">SKU: {{ skuCode }}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan=""2"" style=""padding-top: 15px;"">
                                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                                <tr>
                                                    <td style=""font-size: 13px; color: #78350f;"">Mevcut Stok:</td>
                                                    <td style=""font-size: 16px; font-weight: 700; color: #b45309; text-align: right;"">{{ currentStock }} Adet</td>
                                                </tr>
                                                <tr>
                                                    <td style=""font-size: 13px; color: #92400e;"">Minimum Limit:</td>
                                                    <td style=""font-size: 13px; color: #92400e; text-align: right;"">{{ minLimit }} Adet</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ inventoryUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Stok Yönetimine Git
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetPaymentReceiptTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Ödeme Makbuzu</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { padding: 0; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px; background-color: #ffffff;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #0f172a; text-align: center;"">Ödeme Alındı</h1>
                            <p style=""margin: 0 0 30px 0; font-size: 14px; color: #64748b; text-align: center;"">Referans No: #{{ invoiceNumber }}</p>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;"">
                                Sayın <strong>{{ userName }}</strong>,<br>
                                {{ planName }} aboneliğiniz için ödemeniz başarıyla alınmıştır. Teşekkür ederiz.
                            </p>
                            <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0; margin-bottom: 30px;"">
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr style=""background-color: #f1f5f9;"">
                                        <td style=""padding: 12px 20px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Açıklama</td>
                                        <td style=""padding: 12px 20px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; text-align: right;"">Tutar</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 16px 20px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;"">
                                            {{ planName }} ({{ billingPeriod }})
                                        </td>
                                        <td style=""padding: 16px 20px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-align: right;"">
                                            {{ amount }} TL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 12px 20px; font-size: 13px; color: #64748b; text-align: right;"">KDV (%20)</td>
                                        <td style=""padding: 12px 20px; font-size: 13px; color: #64748b; text-align: right;"">{{ taxAmount }} TL</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 12px 20px; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right;"">TOPLAM</td>
                                        <td style=""padding: 12px 20px; font-size: 16px; font-weight: 700; color: #0f172a; text-align: right;"">{{ totalAmount }} TL</td>
                                    </tr>
                                </table>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ invoicePdfUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Faturayı İndir (PDF)
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetPaymentFailedTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Ödeme Alınamadı</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #b91c1c; text-align: center;"">Ödeme İşlemi Başarısız</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Sayın <strong>{{ userName }}</strong>,<br>
                                <strong>{{ planName }}</strong> aboneliğinizin yenilenmesi sırasında <strong>•••• {{ last4Digits }}</strong> ile biten kartınızdan ödeme alınamadı.
                            </p>
                            <div style=""background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;"">
                                <p style=""margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #7f1d1d;"">Hizmet kesintisi yaşamamanız için</p>
                                <p style=""margin: 0; font-size: 13px; color: #991b1b;"">Lütfen ödeme bilgilerinizi güncelleyin veya bankanızla iletişime geçin.</p>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ billingUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Ödeme Yöntemini Güncelle
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 30px 0 0 0; font-size: 13px; color: #64748b; text-align: center;"">
                                Bir hata olduğunu düşünüyorsanız, tekrar denemek için yukarıdaki butona tıklayabilirsiniz.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetNewTaskTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Yeni Görev Atandı</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Size Yeni Bir Görev Atandı</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                <strong>{{ assignerName }}</strong> tarafından aşağıdaki görev için atandınız.
                            </p>
                            <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 30px;"">
                                <p style=""margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">GÖREV BAŞLIĞI</p>
                                <p style=""margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #0f172a;"">{{ taskTitle }}</p>
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td style=""padding-bottom: 5px; width: 50%;"">
                                            <p style=""margin: 0; font-size: 12px; color: #64748b;"">SON TARİH</p>
                                        </td>
                                        <td style=""padding-bottom: 5px; width: 50%;"">
                                            <p style=""margin: 0; font-size: 12px; color: #64748b;"">ÖNCELİK</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <p style=""margin: 0; font-size: 14px; font-weight: 500; color: #0f172a;"">{{ dueDate }}</p>
                                        </td>
                                        <td>
                                            <span style=""background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;"">{{ priority }}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ taskUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Görevi Görüntüle
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr>
                        <td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetSubscriptionCancelTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Abonelik İptali</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Sizi Görmek Üzücü</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                <strong>{{ planName }}</strong> aboneliğiniz talebiniz üzerine iptal edilmiştir. Hesabınız <strong>{{ expiryDate }}</strong> tarihine kadar aktif kalacaktır.
                            </p>

                            <div style=""background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;"">
                                <p style=""margin: 0; font-size: 14px; color: #334155;"">Verileriniz {{ retentionDays }} gün boyunca saklanacak, daha sonra kalıcı olarak silinecektir.</p>
                            </div>

                            <p style=""margin: 0 0 20px 0; font-size: 15px; color: #475569; text-align: center;"">
                                Fikrinizi değiştirirseniz, tek tıkla kaldığınız yerden devam edebilirsiniz.
                            </p>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ reactivateUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Aboneliğimi Yenile
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr><td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetSupportTicketTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Destek Talebi Alındı</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">

                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Talebiniz Bize Ulaştı</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Merhaba <strong>{{ userName }}</strong>,<br>
                                Destek talebiniz başarıyla oluşturuldu. Ekibimiz konuyu inceleyip en kısa sürede (genellikle 24 saat içinde) size dönüş yapacaktır.
                            </p>

                            <div style=""background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;"">
                                <p style=""margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">TALEP NO</p>
                                <p style=""margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace;"">#{{ ticketId }}</p>

                                <p style=""margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">KONU</p>
                                <p style=""margin: 0; font-size: 15px; color: #334155;"">{{ subject }}</p>
                            </div>

                            <p style=""margin: 0 0 20px 0; font-size: 14px; color: #475569; text-align: center;"">
                                Bu e-postayı yanıtlayarak talebinize ek bilgi veya dosya ekleyebilirsiniz.
                            </p>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ ticketUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #ffffff; color: #0f172a; border: 1px solid #0f172a; padding: 12px 30px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Talebi Görüntüle
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr><td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetFileExportTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Dışa Aktarma Tamamlandı</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <div style=""text-align: center; font-size: 40px; margin-bottom: 20px;"">📂</div>

                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Dosyanız İndirilmeye Hazır</h1>
                            <p style=""margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Talep ettiğiniz <strong>{{ exportName }}</strong> ({{ fileSize }}) başarıyla oluşturuldu. Aşağıdaki butonu kullanarak dosyayı cihazınıza indirebilirsiniz.
                            </p>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ downloadUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Dosyayı İndir
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style=""margin: 20px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;"">
                                Bu link güvenlik nedeniyle 24 saat sonra geçersiz olacaktır.
                            </p>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr><td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetWeeklyReportTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Haftalık Özet</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } .metric-col { display: block !important; width: 100% !important; margin-bottom: 10px; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">

    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">

                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>

                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">

                            <h1 style=""margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Haftalık Performans Raporu</h1>
                            <p style=""margin: 0 0 30px 0; font-size: 14px; color: #64748b; text-align: center;"">{{ startDate }} - {{ endDate }}</p>

                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;"">
                                Merhaba <strong>{{ userName }}</strong>,<br>
                                İşletmenizin geçen haftaki performansı aşağıdadır. Detaylı analizler için panele göz atın.
                            </p>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""margin-bottom: 30px;"">
                                <tr>
                                    <td class=""metric-col"" width=""32%"" valign=""top"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;"">
                                        <p style=""margin: 0 0 5px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Toplam Satış</p>
                                        <p style=""margin: 0; font-size: 18px; font-weight: 700; color: #0f172a;"">{{ totalSales }}₺</p>
                                        <p style=""margin: 5px 0 0 0; font-size: 12px; color: #16a34a;"">▲ {{ salesGrowth }}%</p>
                                    </td>
                                    <td width=""2%""></td>
                                    <td class=""metric-col"" width=""32%"" valign=""top"" style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;"">
                                        <p style=""margin: 0 0 5px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Yeni Müşteri</p>
                                        <p style=""margin: 0; font-size: 18px; font-weight: 700; color: #0f172a;"">{{ newCustomers }}</p>
                                        <p style=""margin: 5px 0 0 0; font-size: 12px; color: #64748b;"">Kişi</p>
                                    </td>
                                    <td width=""2%""></td>
                                    <td class=""metric-col"" width=""32%"" valign=""top"" style=""background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 15px; text-align: center;"">
                                        <p style=""margin: 0 0 5px 0; font-size: 12px; font-weight: 700; color: #9f1239; text-transform: uppercase;"">Kritik Stok</p>
                                        <p style=""margin: 0; font-size: 18px; font-weight: 700; color: #9f1239;"">{{ lowStockCount }}</p>
                                        <p style=""margin: 5px 0 0 0; font-size: 12px; color: #9f1239;"">Ürün</p>
                                    </td>
                                </tr>
                            </table>

                            <div style=""margin-bottom: 30px;"">
                                <p style=""margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #0f172a;"">🚀 En Çok Satan Ürünler</p>
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;"">{{ product1Name }}</td>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;"">{{ product1Sales }} Adet</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;"">{{ product2Name }}</td>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;"">{{ product2Sales }} Adet</td>
                                    </tr>
                                     <tr>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;"">{{ product3Name }}</td>
                                        <td style=""padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;"">{{ product3Sales }} Adet</td>
                                    </tr>
                                </table>
                            </div>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ dashboardUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Panele Git
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr><td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

    private static string GetNewDeviceLoginTemplate() => @"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Yeni Cihaz Girişi</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) { .container { width: 100% !important; padding: 20px !important; } }
    </style>
</head>
<body style=""background-color: #f8fafc; margin: 0; padding: 40px 0;"">
    <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
        <tr>
            <td align=""center"">
                <table role=""presentation"" class=""container"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);"">
                    <tr>
                        <td align=""center"" style=""padding: 30px 40px 10px 40px;"">
                            <img src=""{{ logoUrl }}"" width=""180"" height=""180"" alt=""STOOCKER"" style=""display: block; margin: 0 auto; border: 0;"">
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 20px 40px 40px 40px; text-align: left;"">
                            <h1 style=""margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #0f172a; text-align: center;"">Yeni Cihaz Girişi Tespit Edildi</h1>
                            <p style=""margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;"">
                                Hesabınıza yeni bir cihazdan veya konumdan giriş yapıldı. Bu işlem size aitse endişelenmenize gerek yok.
                            </p>

                            <div style=""background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;"">
                                <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                    <tr>
                                        <td style=""padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Cihaz / Tarayıcı</td>
                                        <td style=""padding-bottom: 8px; font-size: 14px; color: #0f172a; text-align: right;"">{{ deviceName }} / {{ browser }}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Konum (IP)</td>
                                        <td style=""padding-bottom: 8px; font-size: 14px; color: #0f172a; text-align: right;"">{{ location }} ({{ ipAddress }})</td>
                                    </tr>
                                    <tr>
                                        <td style=""font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;"">Zaman</td>
                                        <td style=""font-size: 14px; color: #0f172a; text-align: right;"">{{ loginTime }}</td>
                                    </tr>
                                </table>
                            </div>

                            <p style=""margin: 0 0 20px 0; font-size: 14px; color: #475569; text-align: center;"">
                                Bu girişi siz yapmadıysanız, hesabınızı güvenceye almak için hemen şifrenizi değiştirin.
                            </p>

                            <table role=""presentation"" width=""100%"" border=""0"" cellspacing=""0"" cellpadding=""0"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{{ securityUrl }}"" target=""_blank"" style=""display: inline-block; background-color: #ef4444; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;"">
                                            Bu Ben Değilim / Hesabı Kilitle
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <table role=""presentation"" width=""600"" border=""0"" cellspacing=""0"" cellpadding=""0"" style=""max-width: 600px; margin-top: 20px;"">
                    <tr><td align=""center"" style=""font-size: 12px; color: #94a3b8;"">&copy; {{ year }} Stoocker, Inc.</td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
}
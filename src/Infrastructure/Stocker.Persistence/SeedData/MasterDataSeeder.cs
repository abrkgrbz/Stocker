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
}
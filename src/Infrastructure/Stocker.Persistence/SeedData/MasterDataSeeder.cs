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
            icon: "SettingOutlined",
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
            icon: "TeamOutlined",
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
            icon: "ShoppingCartOutlined",
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
            icon: "InboxOutlined",
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
            icon: "ShopOutlined",
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
            icon: "BankOutlined",
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
            code: "ACCOUNTING",
            name: "Muhasebe",
            monthlyPrice: Money.Create(399m, "TRY"),
            description: "Genel muhasebe, hesap planı ve mali raporlar",
            icon: "CalculatorOutlined",
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
            icon: "UserOutlined",
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
            icon: "WalletOutlined",
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
            icon: "ProjectOutlined",
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
            icon: "BarChartOutlined",
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
                    ["ACCOUNTING"] = 50
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
        starterPackage.AddModule("ACCOUNTING", "Temel Muhasebe", true, 50);

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
                    ["ACCOUNTING"] = 500,
                    ["ERP"] = 100
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
        professionalPackage.AddModule("ACCOUNTING", "Profesyonel Muhasebe", true, 500);
        professionalPackage.AddModule("INVENTORY", "Stok Yönetimi", true, 100);
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
        enterprisePackage.AddModule("ACCOUNTING", "Kurumsal Muhasebe", true);
        enterprisePackage.AddModule("INVENTORY", "Stok Yönetimi", true);
        enterprisePackage.AddModule("HR", "İnsan Kaynakları", true);
        enterprisePackage.AddModule("PROJECTS", "Proje Yönetimi", true);

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
}
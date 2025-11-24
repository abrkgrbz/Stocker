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
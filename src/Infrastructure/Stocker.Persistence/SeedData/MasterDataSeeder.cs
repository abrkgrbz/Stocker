using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Settings;

namespace Stocker.Persistence.SeedData;

public class MasterDataSeeder
{
    private readonly MasterDbContext _context;
    private readonly ILogger<MasterDataSeeder> _logger;
    private readonly AdminCredentials _adminCredentials;

    public MasterDataSeeder(
        MasterDbContext context, 
        ILogger<MasterDataSeeder> logger,
        IOptions<AdminCredentials> adminCredentials)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _adminCredentials = adminCredentials?.Value ?? new AdminCredentials();
    }

    public async Task SeedAsync()
    {
        await SeedPackagesAsync();
        await SeedSystemAdminAsync();
        await SeedTenantAdminAsync();
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

        // Starter Package
        var starterPackage = Package.Create(
            name: "Starter",
            type: PackageType.Starter,
            basePrice: Money.Create(29.99m, "USD"),
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
            description: "Perfect for small businesses and startups",
            trialDays: 14,
            displayOrder: 1,
            isPublic: true);

        starterPackage.AddFeature("BASIC_REPORTS", "Basic Reports", "Access to basic reporting features", true);
        starterPackage.AddFeature("EMAIL_SUPPORT", "Email Support", "Email support during business hours");
        starterPackage.AddFeature("MOBILE_ACCESS", "Mobile Access", "Access from mobile devices");
        
        starterPackage.AddModule("CRM", "Customer Relationship Management", true, 100);
        starterPackage.AddModule("ACCOUNTING", "Basic Accounting", true, 50);

        packages.Add(starterPackage);

        // Professional Package
        var professionalPackage = Package.Create(
            name: "Professional",
            type: PackageType.Professional,
            basePrice: Money.Create(79.99m, "USD"),
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
            description: "For growing businesses with advanced needs",
            trialDays: 30,
            displayOrder: 2,
            isPublic: true);

        professionalPackage.AddFeature("ADVANCED_REPORTS", "Advanced Reports", "Comprehensive reporting and analytics", true);
        professionalPackage.AddFeature("PRIORITY_SUPPORT", "Priority Support", "24/7 priority support", true);
        professionalPackage.AddFeature("API_ACCESS", "API Access", "Full API access for integrations");
        professionalPackage.AddFeature("CUSTOM_FIELDS", "Custom Fields", "Create custom fields and forms");
        
        professionalPackage.AddModule("CRM", "Customer Relationship Management", true, 1000);
        professionalPackage.AddModule("ACCOUNTING", "Professional Accounting", true, 500);
        professionalPackage.AddModule("ERP", "Enterprise Resource Planning", true, 100);

        packages.Add(professionalPackage);

        // Business Package
        var businessPackage = Package.Create(
            name: "Business",
            type: PackageType.Business,
            basePrice: Money.Create(199.99m, "USD"),
            limits: PackageLimit.Create(
                maxUsers: 100,
                maxStorage: 200,
                maxProjects: 50,
                maxApiCalls: 200000),
            description: "Complete solution for established businesses",
            trialDays: 30,
            displayOrder: 3,
            isPublic: true);

        businessPackage.AddFeature("ENTERPRISE_REPORTS", "Enterprise Reports", "Real-time dashboards and custom reports", true);
        businessPackage.AddFeature("DEDICATED_SUPPORT", "Dedicated Support", "Dedicated account manager");
        businessPackage.AddFeature("SSO", "Single Sign-On", "Enterprise SSO integration");
        businessPackage.AddFeature("AUDIT_LOGS", "Audit Logs", "Complete audit trail");
        businessPackage.AddFeature("BACKUP", "Automated Backups", "Daily automated backups");
        
        businessPackage.AddModule("CRM", "Customer Relationship Management", true);
        businessPackage.AddModule("ACCOUNTING", "Enterprise Accounting", true);
        businessPackage.AddModule("ERP", "Enterprise Resource Planning", true);

        packages.Add(businessPackage);

        // Enterprise Package
        var enterprisePackage = Package.Create(
            name: "Enterprise",
            type: PackageType.Enterprise,
            basePrice: Money.Create(499.99m, "USD"),
            limits: PackageLimit.Unlimited(),
            description: "Unlimited everything for large enterprises",
            trialDays: 30,
            displayOrder: 4,
            isPublic: true);

        enterprisePackage.AddFeature("CUSTOM_DEVELOPMENT", "Custom Development", "Custom feature development", true);
        enterprisePackage.AddFeature("SLA", "99.99% SLA", "Enterprise SLA guarantee", true);
        enterprisePackage.AddFeature("ONBOARDING", "Dedicated Onboarding", "White-glove onboarding service");
        enterprisePackage.AddFeature("TRAINING", "Training Program", "Comprehensive training for all users");
        
        enterprisePackage.AddModule("CRM", "Customer Relationship Management", true);
        enterprisePackage.AddModule("ACCOUNTING", "Enterprise Accounting", true);
        enterprisePackage.AddModule("ERP", "Enterprise Resource Planning", true);

        packages.Add(enterprisePackage);

        await _context.Packages.AddRangeAsync(packages);
        _logger.LogInformation("Seeded {Count} packages.", packages.Count);
    }

    private async Task SeedSystemAdminAsync()
    {
        if (await _context.MasterUsers.AnyAsync(u => u.UserType == UserType.SystemAdmin))
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
            userType: UserType.SystemAdmin);

        systemAdmin.Activate();
        systemAdmin.VerifyEmail();

        await _context.MasterUsers.AddAsync(systemAdmin);
        _logger.LogInformation("Seeded system administrator.");
    }

    private async Task SeedTenantAdminAsync()
    {
        // Her tenant için kullanılabilecek bir default admin user oluştur
        if (await _context.MasterUsers.AnyAsync(u => u.Username == "tenantadmin"))
        {
            _logger.LogInformation("Tenant admin user already exists.");
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
            _logger.LogError("Failed to create tenant admin phone: {Error}", phoneResult.Error.Description);
            return;
        }

        var tenantAdmin = MasterUser.Create(
            username: "admin",
            email: emailResult.Value,
            plainPassword: "Admin123!",
            firstName: "Tenant",
            lastName: "Administrator",
            phoneNumber: phoneResult.Value,
            userType: UserType.TenantOwner);

        tenantAdmin.Activate();
        tenantAdmin.VerifyEmail();

        await _context.MasterUsers.AddAsync(tenantAdmin);
        _logger.LogInformation("Created default tenant admin user with username 'tenantadmin' and password 'Admin123!'");
    }
}
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Entities.GeoLocation;
using Stocker.Domain.Entities.Settings;
using Stocker.Domain.Entities.Migration;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Persistence.Contexts;

public class MasterDbContext : BaseDbContext, IMasterDbContext, IApplicationDbContext
{
    public MasterDbContext(DbContextOptions<MasterDbContext> options) : base(options)
    {
    }

    // Tenant Management (Core - Stays in Master)
    public DbSet<Tenant> Tenants => Set<Tenant>();

    // Email Templates (System-wide templates with Liquid support)
    public DbSet<Domain.Master.Entities.EmailTemplate> EmailTemplates => Set<Domain.Master.Entities.EmailTemplate>();
    public DbSet<TenantDomain> TenantDomains => Set<TenantDomain>();
    public DbSet<TenantHealthCheck> TenantHealthChecks => Set<TenantHealthCheck>();
    public DbSet<TenantBackup> TenantBackups => Set<TenantBackup>();
    public DbSet<BackupSchedule> BackupSchedules => Set<BackupSchedule>();
    public DbSet<TenantLimits> TenantLimits => Set<TenantLimits>();
    
    // Tenant Registration & Contracts (Stays in Master)
    public DbSet<TenantRegistration> TenantRegistrations => Set<TenantRegistration>();
    public DbSet<TenantContract> TenantContracts => Set<TenantContract>();
    public DbSet<TenantBilling> TenantBillings => Set<TenantBilling>();
    public DbSet<TenantSettings> TenantSettings => Set<TenantSettings>();

    // Invited User Emails (for efficient email lookup during login)
    public DbSet<TenantUserEmail> TenantUserEmails => Set<TenantUserEmail>();
    
    // All tenant-specific entities have been moved to Tenant DB
    
    // NOTE: Following entities have been MOVED to Tenant DB (Phase 1-3):
    // Phase 1-2: TenantApiKey, TenantActivityLog, TenantSecuritySettings, TenantNotification
    //           TenantSetupWizard (now SetupWizard), TenantSetupChecklist, TenantInitialData
    //           TenantDocument, TenantIntegration, UserTenant, TenantSettings
    // Phase 3:  TenantWebhook, TenantCompliance, TenantCustomization, TenantOnboarding
    //           OnboardingStep, OnboardingTask, TenantFeature, PasswordHistory

    // Module Definitions (Available modules with pricing)
    public DbSet<ModuleDefinition> ModuleDefinitions => Set<ModuleDefinition>();
    public DbSet<ModuleFeature> ModuleFeatures => Set<ModuleFeature>();
    public DbSet<ModuleDependency> ModuleDependencies => Set<ModuleDependency>();

    // Package & Subscription Management
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<PackageFeature> PackageFeatures => Set<PackageFeature>();
    public DbSet<PackageModule> PackageModules => Set<PackageModule>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<SubscriptionModule> SubscriptionModules => Set<SubscriptionModule>();
    public DbSet<SubscriptionUsage> SubscriptionUsages => Set<SubscriptionUsage>();

    // Billing & Payment
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<LemonSqueezySubscription> LemonSqueezySubscriptions => Set<LemonSqueezySubscription>();

    // User Management
    public DbSet<MasterUser> MasterUsers => Set<MasterUser>();
    public DbSet<UserLoginHistory> UserLoginHistories => Set<UserLoginHistory>();
    // UserTenant has been moved to Tenant DB

    // Mobile Push Notifications
    public DbSet<DeviceToken> DeviceTokens => Set<DeviceToken>();
    public DbSet<MasterNotification> MasterNotifications => Set<MasterNotification>();

    // Security & Audit
    public DbSet<SecurityAuditLog> SecurityAuditLogs => Set<SecurityAuditLog>();

    // System Monitoring & Reporting
    public DbSet<SystemAlert> SystemAlerts => Set<SystemAlert>();
    public DbSet<ReportSchedule> ReportSchedules => Set<ReportSchedule>();
    public DbSet<ReportExecution> ReportExecutions => Set<ReportExecution>();

    // System Settings
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();

    // Pricing & Setup entities
    public DbSet<AddOn> AddOns => Set<AddOn>();
    public DbSet<AddOnFeature> AddOnFeatures => Set<AddOnFeature>();
    public DbSet<StoragePlan> StoragePlans => Set<StoragePlan>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<IndustryRecommendedModule> IndustryRecommendedModules => Set<IndustryRecommendedModule>();
    public DbSet<UserTier> UserTiers => Set<UserTier>();

    // Migration Management
    public DbSet<ScheduledMigration> ScheduledMigrations => Set<ScheduledMigration>();

    // Data Migration entities moved to Tenant DB for proper tenant isolation

    // GeoLocation (Shared Reference Data)
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<District> Districts => Set<District>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Set schema for master database
        modelBuilder.HasDefaultSchema("master");
        
        // Apply only Master configurations
        var masterConfigNamespace = "Stocker.Persistence.Configurations.Master";
        var configurations = GetType().Assembly.GetTypes()
            .Where(t => t.Namespace == masterConfigNamespace && 
                       !t.IsAbstract && 
                       !t.IsGenericTypeDefinition &&
                       t.GetInterfaces().Any(i => i.IsGenericType && 
                                                  i.GetGenericTypeDefinition() == typeof(Microsoft.EntityFrameworkCore.IEntityTypeConfiguration<>)))
            .ToList();

        foreach (var configurationType in configurations)
        {
            dynamic? configurationInstance = Activator.CreateInstance(configurationType);
            if (configurationInstance != null)
            {
                modelBuilder.ApplyConfiguration(configurationInstance);
            }
        }
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
    }
}
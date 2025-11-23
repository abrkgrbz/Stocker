using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Master.Entities;
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
    public DbSet<TenantDomain> TenantDomains => Set<TenantDomain>();
    public DbSet<TenantHealthCheck> TenantHealthChecks => Set<TenantHealthCheck>();
    public DbSet<TenantBackup> TenantBackups => Set<TenantBackup>();
    public DbSet<TenantLimits> TenantLimits => Set<TenantLimits>();
    
    // Tenant Registration & Contracts (Stays in Master)
    public DbSet<TenantRegistration> TenantRegistrations => Set<TenantRegistration>();
    public DbSet<TenantContract> TenantContracts => Set<TenantContract>();
    public DbSet<TenantBilling> TenantBillings => Set<TenantBilling>();
    public DbSet<TenantSettings> TenantSettings => Set<TenantSettings>();
    
    // All tenant-specific entities have been moved to Tenant DB
    
    // NOTE: Following entities have been MOVED to Tenant DB (Phase 1-3):
    // Phase 1-2: TenantApiKey, TenantActivityLog, TenantSecuritySettings, TenantNotification
    //           TenantSetupWizard (now SetupWizard), TenantSetupChecklist, TenantInitialData
    //           TenantDocument, TenantIntegration, UserTenant, TenantSettings
    // Phase 3:  TenantWebhook, TenantCompliance, TenantCustomization, TenantOnboarding
    //           OnboardingStep, OnboardingTask, TenantFeature, PasswordHistory

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

    // User Management
    public DbSet<MasterUser> MasterUsers => Set<MasterUser>();
    public DbSet<UserLoginHistory> UserLoginHistories => Set<UserLoginHistory>();
    // UserTenant has been moved to Tenant DB

    // Security & Audit
    public DbSet<SecurityAuditLog> SecurityAuditLogs => Set<SecurityAuditLog>();

    // System Settings
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();

    // Migration Management
    public DbSet<ScheduledMigration> ScheduledMigrations => Set<ScheduledMigration>();

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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

        // Enable legacy timestamp behavior for Npgsql
        // This allows DateTime to work with both 'timestamp with time zone' and 'timestamp without time zone'
        // Without this, Npgsql enforces strict Kind checking which causes errors with mixed column types
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
    }
}
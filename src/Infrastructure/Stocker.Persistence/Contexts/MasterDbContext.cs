using Microsoft.EntityFrameworkCore;  
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Entities.Settings;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Persistence.Contexts;

public class MasterDbContext : BaseDbContext, IMasterDbContext, IApplicationDbContext 
{
    public MasterDbContext(DbContextOptions<MasterDbContext> options) : base(options)
    {
    }

    // Tenant Management
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantDomain> TenantDomains => Set<TenantDomain>();
    public DbSet<TenantFeature> TenantFeatures => Set<TenantFeature>();
    public DbSet<TenantApiKey> TenantApiKeys => Set<TenantApiKey>();
    public DbSet<TenantWebhook> TenantWebhooks => Set<TenantWebhook>();
    public DbSet<TenantIntegration> TenantIntegrations => Set<TenantIntegration>();
    public DbSet<TenantActivityLog> TenantActivityLogs => Set<TenantActivityLog>();
    public DbSet<TenantSettings> TenantSettings => Set<TenantSettings>();
    public DbSet<TenantSecuritySettings> TenantSecuritySettings => Set<TenantSecuritySettings>();
    public DbSet<TenantHealthCheck> TenantHealthChecks => Set<TenantHealthCheck>();
    public DbSet<TenantBackup> TenantBackups => Set<TenantBackup>();
    
    // Tenant Registration & Onboarding
    public DbSet<TenantRegistration> TenantRegistrations => Set<TenantRegistration>();
    public DbSet<TenantContract> TenantContracts => Set<TenantContract>();
    public DbSet<TenantBilling> TenantBillings => Set<TenantBilling>();
    public DbSet<TenantOnboarding> TenantOnboardings => Set<TenantOnboarding>();
    public DbSet<TenantLimits> TenantLimits => Set<TenantLimits>();
    public DbSet<OnboardingStep> OnboardingSteps => Set<OnboardingStep>();
    public DbSet<OnboardingTask> OnboardingTasks => Set<OnboardingTask>();
    
    // Tenant Management & Compliance
    public DbSet<TenantNotification> TenantNotifications => Set<TenantNotification>();
    public DbSet<TenantCustomization> TenantCustomizations => Set<TenantCustomization>();
    public DbSet<TenantCompliance> TenantCompliances => Set<TenantCompliance>();
    public DbSet<TenantDocument> TenantDocuments => Set<TenantDocument>();
    
    // Tenant Setup & Wizard
    public DbSet<TenantSetupWizard> TenantSetupWizards => Set<TenantSetupWizard>();
    public DbSet<TenantInitialData> TenantInitialData => Set<TenantInitialData>();
    public DbSet<TenantSetupChecklist> TenantSetupChecklists => Set<TenantSetupChecklist>();

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
    public DbSet<UserTenant> UserTenants => Set<UserTenant>();
    public DbSet<UserLoginHistory> UserLoginHistories => Set<UserLoginHistory>();
    
    // System Settings
    public DbSet<SystemSettings> SystemSettings => Set<SystemSettings>();

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
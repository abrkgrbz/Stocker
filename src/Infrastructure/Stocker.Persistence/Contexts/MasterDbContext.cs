using Microsoft.EntityFrameworkCore;  
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Contexts;

public class MasterDbContext : BaseDbContext 
{
    public MasterDbContext(DbContextOptions<MasterDbContext> options) : base(options)
    {
    }

    // Tenant Management
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantDomain> TenantDomains => Set<TenantDomain>();
    public DbSet<TenantFeature> TenantFeatures => Set<TenantFeature>();

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
            dynamic configurationInstance = Activator.CreateInstance(configurationType);
            modelBuilder.ApplyConfiguration(configurationInstance);
        }
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
    }
}
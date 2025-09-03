using Microsoft.EntityFrameworkCore; 
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Persistence.Contexts;

public class TenantDbContext : BaseDbContext 
{
    private readonly ITenantService _tenantService;
    
    public TenantDbContext(DbContextOptions<TenantDbContext> options, ITenantService tenantService) 
        : base(options)
    {
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
    }

    // Tenant Id property for Unit of Work
    public Guid TenantId => _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("TenantId is not set");

    // Company & Organization
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Branch> Branches => Set<Branch>();

    // User & Authorization
    public DbSet<TenantUser> TenantUsers => Set<TenantUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();
    
    // Financial
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();

    // Inventory
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();

    // CRM Module - TODO: Move to separate CRM DbContext to avoid circular reference
    // public DbSet<Customer> Customers => Set<Customer>();
    // public DbSet<Contact> Contacts => Set<Contact>();
    // public DbSet<Lead> Leads => Set<Lead>();
    // public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    // public DbSet<Activity> Activities => Set<Activity>();
    // public DbSet<Note> Notes => Set<Note>();
    // public DbSet<OpportunityProduct> OpportunityProducts => Set<OpportunityProduct>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Set schema based on tenant
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            // Each tenant can have its own schema if needed
            // For now, we'll use the default schema
            modelBuilder.HasDefaultSchema("tenant");
        }
        
        // Apply only Tenant configurations
        var tenantConfigNamespace = "Stocker.Persistence.Configurations.Tenant";
        
        var configurations = GetType().Assembly.GetTypes()
            .Where(t => t.Namespace == tenantConfigNamespace && 
                       !t.IsAbstract && 
                       !t.IsGenericTypeDefinition &&
                       t.GetInterfaces().Any(i => i.IsGenericType && 
                                                  i.GetGenericTypeDefinition() == typeof(Microsoft.EntityFrameworkCore.IEntityTypeConfiguration<>)))
            .ToList();

        // CRM configurations are now handled in the separate CRMDbContext

        foreach (var configurationType in configurations)
        {
            dynamic? configurationInstance = Activator.CreateInstance(configurationType);
            if (configurationInstance != null)
            {
                modelBuilder.ApplyConfiguration(configurationInstance);
            }
        }

        // Apply global query filter for multi-tenancy
        modelBuilder.Entity<Company>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Department>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Branch>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<TenantUser>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Role>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Stock>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
        modelBuilder.Entity<Warehouse>().HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            throw new InvalidOperationException("TenantId is required for all operations in tenant context.");
        }

        // Automatically set TenantId for new entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                // Use reflection to set TenantId since it's a private setter
                var tenantIdProperty = entry.Entity.GetType().GetProperty(nameof(ITenantEntity.TenantId));
                if (tenantIdProperty != null && tenantIdProperty.CanWrite)
                {
                    var setTenantIdMethod = entry.Entity.GetType().GetMethod("SetTenantId", 
                        System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                    setTenantIdMethod?.Invoke(entry.Entity, new object[] { tenantId.Value });
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
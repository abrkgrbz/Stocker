using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Infrastructure.Persistence;

/// <summary>
/// Database context for the CRM module
/// </summary>
public class CRMDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Contact> Contacts { get; set; } = null!;
    public DbSet<Lead> Leads { get; set; } = null!;

    public CRMDbContext(
        DbContextOptions<CRMDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CRMDbContext).Assembly);

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            modelBuilder.Entity<Customer>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Contact>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Lead>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _tenantService.GetCurrentTenantId();
        
        if (tenantId.HasValue)
        {
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
            {
                if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId.Value;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
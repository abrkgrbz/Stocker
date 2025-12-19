using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Sales.Infrastructure.Persistence;

/// <summary>
/// Database context for the Sales module
/// </summary>
public class SalesDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    // Sales Orders
    public DbSet<SalesOrder> SalesOrders { get; set; } = null!;
    public DbSet<SalesOrderItem> SalesOrderItems { get; set; } = null!;

    // Invoices
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;

    // Payments
    public DbSet<Payment> Payments { get; set; } = null!;

    // Quotations
    public DbSet<Quotation> Quotations { get; set; } = null!;
    public DbSet<QuotationItem> QuotationItems { get; set; } = null!;

    // Discounts & Promotions
    public DbSet<Discount> Discounts { get; set; } = null!;
    public DbSet<Promotion> Promotions { get; set; } = null!;
    public DbSet<PromotionRule> PromotionRules { get; set; } = null!;

    // Commissions
    public DbSet<CommissionPlan> CommissionPlans { get; set; } = null!;
    public DbSet<CommissionTier> CommissionTiers { get; set; } = null!;
    public DbSet<SalesCommission> SalesCommissions { get; set; } = null!;

    // Returns
    public DbSet<SalesReturn> SalesReturns { get; set; } = null!;
    public DbSet<SalesReturnItem> SalesReturnItems { get; set; } = null!;

    public SalesDbContext(
        DbContextOptions<SalesDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SalesDbContext).Assembly);

        // Set default schema for Sales module
        modelBuilder.HasDefaultSchema("sales");

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            modelBuilder.Entity<SalesOrder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SalesOrderItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Invoice>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<InvoiceItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Payment>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Quotation>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<QuotationItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Discount>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Promotion>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CommissionPlan>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SalesCommission>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SalesReturn>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SalesReturnItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Set TenantId for new entities
        var tenantId = _tenantService.GetCurrentTenantId();

        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                if (!tenantId.HasValue)
                {
                    throw new InvalidOperationException(
                        $"Cannot save entity '{entry.Entity.GetType().Name}' without TenantId. " +
                        "Either set TenantId explicitly on the entity or ensure tenant context is available.");
                }
                entry.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId.Value;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

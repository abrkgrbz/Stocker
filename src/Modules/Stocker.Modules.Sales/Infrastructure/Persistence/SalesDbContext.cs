using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using AuditLog = Stocker.Domain.Tenant.Entities.AuditLog;

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

    // Advance Payments
    public DbSet<AdvancePayment> AdvancePayments { get; set; } = null!;

    // Credit Notes
    public DbSet<CreditNote> CreditNotes { get; set; } = null!;
    public DbSet<CreditNoteItem> CreditNoteItems { get; set; } = null!;

    // Service Orders
    public DbSet<ServiceOrder> ServiceOrders { get; set; } = null!;
    public DbSet<ServiceOrderItem> ServiceOrderItems { get; set; } = null!;
    public DbSet<ServiceOrderNote> ServiceOrderNotes { get; set; } = null!;

    // Warranties
    public DbSet<Warranty> Warranties { get; set; } = null!;
    public DbSet<WarrantyClaim> WarrantyClaims { get; set; } = null!;

    // Price Lists
    public DbSet<PriceList> PriceLists { get; set; } = null!;
    public DbSet<PriceListItem> PriceListItems { get; set; } = null!;
    public DbSet<PriceListCustomer> PriceListCustomers { get; set; } = null!;

    // Delivery Notes
    public DbSet<DeliveryNote> DeliveryNotes { get; set; } = null!;
    public DbSet<DeliveryNoteItem> DeliveryNoteItems { get; set; } = null!;

    // Back Orders
    public DbSet<BackOrder> BackOrders { get; set; } = null!;
    public DbSet<BackOrderItem> BackOrderItems { get; set; } = null!;

    // Inventory Reservations
    public DbSet<InventoryReservation> InventoryReservations { get; set; } = null!;

    // Opportunities
    public DbSet<Opportunity> Opportunities { get; set; } = null!;

    // Sales Pipelines
    public DbSet<SalesPipeline> SalesPipelines { get; set; } = null!;
    public DbSet<PipelineStage> PipelineStages { get; set; } = null!;

    // Sales Targets
    public DbSet<SalesTarget> SalesTargets { get; set; } = null!;
    public DbSet<SalesTargetPeriod> SalesTargetPeriods { get; set; } = null!;
    public DbSet<SalesTargetProduct> SalesTargetProducts { get; set; } = null!;
    public DbSet<SalesTargetAchievement> SalesTargetAchievements { get; set; } = null!;

    // Customer Segments
    public DbSet<CustomerSegment> CustomerSegments { get; set; } = null!;

    // Audit Logs
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

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

            // Advance Payments
            modelBuilder.Entity<AdvancePayment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Credit Notes
            modelBuilder.Entity<CreditNote>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<CreditNoteItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Service Orders
            modelBuilder.Entity<ServiceOrder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ServiceOrderItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ServiceOrderNote>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Warranties
            modelBuilder.Entity<Warranty>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<WarrantyClaim>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Price Lists
            modelBuilder.Entity<PriceList>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Delivery Notes
            modelBuilder.Entity<DeliveryNote>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Back Orders
            modelBuilder.Entity<BackOrder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<BackOrderItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Inventory Reservations
            modelBuilder.Entity<InventoryReservation>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Opportunities
            modelBuilder.Entity<Opportunity>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Sales Pipelines
            modelBuilder.Entity<SalesPipeline>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PipelineStage>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Sales Targets
            modelBuilder.Entity<SalesTarget>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Customer Segments
            modelBuilder.Entity<CustomerSegment>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Audit Logs
            modelBuilder.Entity<AuditLog>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }

        // Configure AuditLog entity
        ConfigureAuditLog(modelBuilder);
    }

    private static void ConfigureAuditLog(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs", "sales");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EntityName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Action).HasMaxLength(50).IsRequired();
            entity.Property(e => e.UserId).HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserName).HasMaxLength(255).IsRequired();
            entity.Property(e => e.UserEmail).HasMaxLength(255);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            entity.HasIndex(e => new { e.EntityName, e.EntityId });
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.UserId);
        });
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

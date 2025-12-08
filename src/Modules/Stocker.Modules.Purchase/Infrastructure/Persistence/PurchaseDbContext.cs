using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence;

public class PurchaseDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public PurchaseDbContext(DbContextOptions<PurchaseDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    // Suppliers
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<SupplierContact> SupplierContacts { get; set; } = null!;
    public DbSet<SupplierProduct> SupplierProducts { get; set; } = null!;

    // Purchase Requests
    public DbSet<PurchaseRequest> PurchaseRequests { get; set; } = null!;
    public DbSet<PurchaseRequestItem> PurchaseRequestItems { get; set; } = null!;

    // Purchase Orders
    public DbSet<PurchaseOrder> PurchaseOrders { get; set; } = null!;
    public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; } = null!;

    // Goods Receipts
    public DbSet<GoodsReceipt> GoodsReceipts { get; set; } = null!;
    public DbSet<GoodsReceiptItem> GoodsReceiptItems { get; set; } = null!;

    // Purchase Invoices
    public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; } = null!;
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = null!;

    // Purchase Returns
    public DbSet<PurchaseReturn> PurchaseReturns { get; set; } = null!;
    public DbSet<PurchaseReturnItem> PurchaseReturnItems { get; set; } = null!;

    // Payments
    public DbSet<SupplierPayment> SupplierPayments { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasDefaultSchema("purchase");

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PurchaseDbContext).Assembly);

        // Global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();

        if (tenantId.HasValue)
        {
            modelBuilder.Entity<Supplier>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierContact>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseRequest>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseRequestItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseOrder>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseOrderItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<GoodsReceipt>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<GoodsReceiptItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseInvoice>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseInvoiceItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseReturn>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PurchaseReturnItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierPayment>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
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

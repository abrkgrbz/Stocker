using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using AuditLog = Stocker.Domain.Tenant.Entities.AuditLog;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence;

/// <summary>
/// Database context for the Inventory module.
///
/// IMPORTANT: This class is now a PURE DbContext.
/// IUnitOfWork implementation has been moved to InventoryUnitOfWork (Report Issue #4 - Pattern C Elimination).
///
/// Responsibilities:
/// - Entity configuration and mapping
/// - Multi-tenancy query filters
/// - TenantId auto-population on save
///
/// Transaction management is handled by InventoryUnitOfWork.
/// </summary>
public class InventoryDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    #region DbSets - Product Management

    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Brand> Brands { get; set; } = null!;
    public DbSet<Unit> Units { get; set; } = null!;
    public DbSet<ProductImage> ProductImages { get; set; } = null!;
    public DbSet<ProductBundle> ProductBundles { get; set; } = null!;
    public DbSet<ProductBundleItem> ProductBundleItems { get; set; } = null!;
    public DbSet<ProductVariant> ProductVariants { get; set; } = null!;
    public DbSet<ProductVariantOption> ProductVariantOptions { get; set; } = null!;

    #endregion

    #region DbSets - Product Attributes

    public DbSet<ProductAttribute> ProductAttributes { get; set; } = null!;
    public DbSet<ProductAttributeOption> ProductAttributeOptions { get; set; } = null!;
    public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; } = null!;

    #endregion

    #region DbSets - Warehouse Management

    public DbSet<Warehouse> Warehouses { get; set; } = null!;
    public DbSet<Location> Locations { get; set; } = null!;

    #endregion

    #region DbSets - Stock Management

    public DbSet<Stock> Stocks { get; set; } = null!;
    public DbSet<StockMovement> StockMovements { get; set; } = null!;
    public DbSet<StockReservation> StockReservations { get; set; } = null!;

    #endregion

    #region DbSets - Stock Transfers

    public DbSet<StockTransfer> StockTransfers { get; set; } = null!;
    public DbSet<StockTransferItem> StockTransferItems { get; set; } = null!;

    #endregion

    #region DbSets - Stock Counts

    public DbSet<StockCount> StockCounts { get; set; } = null!;
    public DbSet<StockCountItem> StockCountItems { get; set; } = null!;

    #endregion

    #region DbSets - Supplier Management

    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<SupplierProduct> SupplierProducts { get; set; } = null!;
    public DbSet<SupplierProductPriceTier> SupplierProductPriceTiers { get; set; } = null!;

    #endregion

    #region DbSets - Price Management

    public DbSet<PriceList> PriceLists { get; set; } = null!;
    public DbSet<PriceListItem> PriceListItems { get; set; } = null!;

    #endregion

    #region DbSets - Lot/Batch and Serial Number Tracking

    public DbSet<LotBatch> LotBatches { get; set; } = null!;
    public DbSet<SerialNumber> SerialNumbers { get; set; } = null!;

    #endregion

    #region DbSets - Auto-Reorder Rules

    public DbSet<ReorderRule> ReorderRules { get; set; } = null!;
    public DbSet<ReorderSuggestion> ReorderSuggestions { get; set; } = null!;

    #endregion

    #region DbSets - Additional Features

    public DbSet<BarcodeDefinition> BarcodeDefinitions { get; set; } = null!;
    public DbSet<PackagingType> PackagingTypes { get; set; } = null!;
    public DbSet<WarehouseZone> WarehouseZones { get; set; } = null!;
    public DbSet<ShelfLife> ShelfLives { get; set; } = null!;

    #endregion

    #region DbSets - Quality Control

    public DbSet<QualityControl> QualityControls { get; set; } = null!;
    public DbSet<QualityControlItem> QualityControlItems { get; set; } = null!;

    #endregion

    #region DbSets - Consignment Stock

    public DbSet<ConsignmentStock> ConsignmentStocks { get; set; } = null!;
    public DbSet<ConsignmentStockMovement> ConsignmentStockMovements { get; set; } = null!;

    #endregion

    #region DbSets - Cycle Counts

    public DbSet<CycleCount> CycleCounts { get; set; } = null!;
    public DbSet<CycleCountItem> CycleCountItems { get; set; } = null!;

    #endregion

    #region DbSets - Inventory Adjustments

    public DbSet<InventoryAdjustment> InventoryAdjustments { get; set; } = null!;
    public DbSet<InventoryAdjustmentItem> InventoryAdjustmentItems { get; set; } = null!;

    #endregion

    #region DbSets - Audit

    public DbSet<AuditLog> AuditLogs { get; set; } = null!;

    #endregion

    #region Constructor

    public InventoryDbContext(
        DbContextOptions<InventoryDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    #endregion

    #region Public Properties

    /// <summary>
    /// Gets the current tenant identifier from the tenant service.
    /// </summary>
    public Guid? CurrentTenantId => _tenantService.GetCurrentTenantId();

    #endregion

    #region Model Configuration

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InventoryDbContext).Assembly);

        // Set default schema for Inventory module
        modelBuilder.HasDefaultSchema("inventory");

        // Apply global query filters for multi-tenancy
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            ApplyTenantQueryFilters(modelBuilder, tenantId.Value);
        }

        // Configure AuditLog entity
        ConfigureAuditLog(modelBuilder);
    }

    private static void ApplyTenantQueryFilters(ModelBuilder modelBuilder, Guid tenantId)
    {
        // Product Management entities
        modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<Category>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<Brand>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<Unit>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductImage>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductBundle>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductBundleItem>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductVariant>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductVariantOption>().HasQueryFilter(e => e.TenantId == tenantId);

        // Product Attribute entities
        modelBuilder.Entity<ProductAttribute>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductAttributeOption>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ProductAttributeValue>().HasQueryFilter(e => e.TenantId == tenantId);

        // Warehouse Management entities
        modelBuilder.Entity<Warehouse>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<Location>().HasQueryFilter(e => e.TenantId == tenantId);

        // Stock Management entities
        modelBuilder.Entity<Stock>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<StockMovement>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<StockReservation>().HasQueryFilter(e => e.TenantId == tenantId);

        // Stock Transfer entities
        modelBuilder.Entity<StockTransfer>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<StockTransferItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Stock Count entities
        modelBuilder.Entity<StockCount>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<StockCountItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Supplier entities
        modelBuilder.Entity<Supplier>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<SupplierProduct>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<SupplierProductPriceTier>().HasQueryFilter(e => e.TenantId == tenantId);

        // Price Management entities
        modelBuilder.Entity<PriceList>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<PriceListItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Lot/Batch and Serial Number entities
        modelBuilder.Entity<LotBatch>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<SerialNumber>().HasQueryFilter(e => e.TenantId == tenantId);

        // Auto-Reorder entities
        modelBuilder.Entity<ReorderRule>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ReorderSuggestion>().HasQueryFilter(e => e.TenantId == tenantId);

        // Additional feature entities
        modelBuilder.Entity<BarcodeDefinition>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<PackagingType>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<WarehouseZone>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ShelfLife>().HasQueryFilter(e => e.TenantId == tenantId);

        // Quality Control entities
        modelBuilder.Entity<QualityControl>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<QualityControlItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Consignment Stock entities
        modelBuilder.Entity<ConsignmentStock>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<ConsignmentStockMovement>().HasQueryFilter(e => e.TenantId == tenantId);

        // Cycle Count entities
        modelBuilder.Entity<CycleCount>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<CycleCountItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Inventory Adjustment entities
        modelBuilder.Entity<InventoryAdjustment>().HasQueryFilter(e => e.TenantId == tenantId);
        modelBuilder.Entity<InventoryAdjustmentItem>().HasQueryFilter(e => e.TenantId == tenantId);

        // Audit Log entity
        modelBuilder.Entity<AuditLog>().HasQueryFilter(e => e.TenantId == tenantId);
    }

    private static void ConfigureAuditLog(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs", "inventory");
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

    #endregion

    #region Save Changes Override

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

    #endregion

    // NOTE: IUnitOfWork implementation has been REMOVED from this class.
    // Transaction management is now handled by InventoryUnitOfWork (Report Issue #4 fix).
}

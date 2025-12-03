using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence;

/// <summary>
/// Database context for the Inventory module
/// </summary>
public class InventoryDbContext : DbContext, IUnitOfWork
{
    private readonly ITenantService _tenantService;
    private Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? _currentTransaction;

    // Product Management
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Brand> Brands { get; set; } = null!;
    public DbSet<Unit> Units { get; set; } = null!;
    public DbSet<ProductImage> ProductImages { get; set; } = null!;
    public DbSet<ProductBundle> ProductBundles { get; set; } = null!;
    public DbSet<ProductBundleItem> ProductBundleItems { get; set; } = null!;
    public DbSet<ProductVariant> ProductVariants { get; set; } = null!;
    public DbSet<ProductVariantOption> ProductVariantOptions { get; set; } = null!;

    // Product Attributes
    public DbSet<ProductAttribute> ProductAttributes { get; set; } = null!;
    public DbSet<ProductAttributeOption> ProductAttributeOptions { get; set; } = null!;
    public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; } = null!;

    // Warehouse Management
    public DbSet<Warehouse> Warehouses { get; set; } = null!;
    public DbSet<Location> Locations { get; set; } = null!;

    // Stock Management
    public DbSet<Stock> Stocks { get; set; } = null!;
    public DbSet<StockMovement> StockMovements { get; set; } = null!;
    public DbSet<StockReservation> StockReservations { get; set; } = null!;

    // Stock Transfers
    public DbSet<StockTransfer> StockTransfers { get; set; } = null!;
    public DbSet<StockTransferItem> StockTransferItems { get; set; } = null!;

    // Stock Counts (Inventory Counting)
    public DbSet<StockCount> StockCounts { get; set; } = null!;
    public DbSet<StockCountItem> StockCountItems { get; set; } = null!;

    // Supplier Management
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<SupplierProduct> SupplierProducts { get; set; } = null!;
    public DbSet<SupplierProductPriceTier> SupplierProductPriceTiers { get; set; } = null!;

    // Price Management
    public DbSet<PriceList> PriceLists { get; set; } = null!;
    public DbSet<PriceListItem> PriceListItems { get; set; } = null!;

    // Lot/Batch and Serial Number Tracking
    public DbSet<LotBatch> LotBatches { get; set; } = null!;
    public DbSet<SerialNumber> SerialNumbers { get; set; } = null!;

    public InventoryDbContext(
        DbContextOptions<InventoryDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

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
            // Product Management entities
            modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Category>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Brand>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Unit>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductImage>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductBundle>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductBundleItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductVariant>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductVariantOption>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Product Attribute entities
            modelBuilder.Entity<ProductAttribute>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductAttributeOption>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<ProductAttributeValue>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Warehouse Management entities
            modelBuilder.Entity<Warehouse>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<Location>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Stock Management entities
            modelBuilder.Entity<Stock>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<StockMovement>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<StockReservation>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Stock Transfer entities
            modelBuilder.Entity<StockTransfer>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<StockTransferItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Stock Count entities
            modelBuilder.Entity<StockCount>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<StockCountItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Supplier entities
            modelBuilder.Entity<Supplier>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierProduct>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SupplierProductPriceTier>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Price Management entities
            modelBuilder.Entity<PriceList>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<PriceListItem>().HasQueryFilter(e => e.TenantId == tenantId.Value);

            // Lot/Batch and Serial Number entities
            modelBuilder.Entity<LotBatch>().HasQueryFilter(e => e.TenantId == tenantId.Value);
            modelBuilder.Entity<SerialNumber>().HasQueryFilter(e => e.TenantId == tenantId.Value);
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

    #region IUnitOfWork Implementation

    /// <inheritdoc />
    public bool HasActiveTransaction => _currentTransaction != null;

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _currentTransaction = await Database.BeginTransactionAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _currentTransaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction == null)
        {
            return;
        }

        try
        {
            await _currentTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await _currentTransaction.DisposeAsync();
            _currentTransaction = null;
        }
    }

    #endregion
}

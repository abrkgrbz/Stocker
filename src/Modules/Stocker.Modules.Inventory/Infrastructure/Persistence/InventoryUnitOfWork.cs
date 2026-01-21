using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Repositories;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the Inventory module.
/// Implements IUnitOfWork directly to avoid circular dependency with Stocker.Persistence.
///
/// This class provides:
/// - Transaction management with strict mode
/// - Repository access with caching
/// - Domain-specific repository properties for type-safe dependency injection
/// - Multi-tenancy support via TenantId property
/// - IAsyncDisposable for proper async cleanup
/// </summary>
/// <remarks>
/// Key features:
/// - Thread-safe repository caching using ConcurrentDictionary
/// - Strict transaction management (throws on duplicate begin, instead of silent return)
/// - Correlation ID logging for transaction lifecycle
/// - Exposes ALL Inventory repositories
///
/// IMPORTANT: The Inventory module uses BaseEntity with int Id (not Entity&lt;Guid&gt;),
/// so the generic Repository&lt;T&gt; and ReadRepository&lt;T&gt; methods are not supported.
/// Use the domain-specific repository properties instead.
///
/// Usage in handlers:
/// <code>
/// public class CreateProductHandler
/// {
///     private readonly IInventoryUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreateProductCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var product = new Product(...);
///             await _unitOfWork.Products.AddAsync(product);
///             await _unitOfWork.CommitTransactionAsync();
///         }
///         catch
///         {
///             await _unitOfWork.RollbackTransactionAsync();
///             throw;
///         }
///     }
/// }
/// </code>
/// </remarks>
public sealed class InventoryUnitOfWork : IInventoryUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly InventoryDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<InventoryUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Lazy-initialized repository backing fields
    private IProductRepository? _products;
    private ICategoryRepository? _categories;
    private IBrandRepository? _brands;
    private IUnitRepository? _units;
    private IWarehouseRepository? _warehouses;
    private ILocationRepository? _locations;
    private IStockRepository? _stocks;
    private IStockMovementRepository? _stockMovements;
    private IStockReservationRepository? _stockReservations;
    private IStockTransferRepository? _stockTransfers;
    private IStockCountRepository? _stockCounts;
    private ISupplierRepository? _suppliers;
    private IPriceListRepository? _priceLists;
    private ILotBatchRepository? _lotBatches;
    private ISerialNumberRepository? _serialNumbers;
    private IProductAttributeRepository? _productAttributes;
    private IProductVariantRepository? _productVariants;
    private IProductBundleRepository? _productBundles;
    private IBarcodeDefinitionRepository? _barcodeDefinitions;
    private IPackagingTypeRepository? _packagingTypes;
    private IWarehouseZoneRepository? _warehouseZones;
    private IShelfLifeRepository? _shelfLives;
    private IQualityControlRepository? _qualityControls;
    private IConsignmentStockRepository? _consignmentStocks;
    private ICycleCountRepository? _cycleCounts;
    private IInventoryAdjustmentRepository? _inventoryAdjustments;
    private IReorderRuleRepository? _reorderRules;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="InventoryUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Inventory database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public InventoryUnitOfWork(
        InventoryDbContext context,
        ITenantService tenantService,
        ILogger<InventoryUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region IInventoryUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

    #endregion

    #region Domain-Specific Repositories

    /// <inheritdoc />
    public IProductRepository Products =>
        _products ??= GetOrAddSpecificRepository<IProductRepository, ProductRepository>();

    /// <inheritdoc />
    public ICategoryRepository Categories =>
        _categories ??= GetOrAddSpecificRepository<ICategoryRepository, CategoryRepository>();

    /// <inheritdoc />
    public IBrandRepository Brands =>
        _brands ??= GetOrAddSpecificRepository<IBrandRepository, BrandRepository>();

    /// <inheritdoc />
    public IUnitRepository Units =>
        _units ??= GetOrAddSpecificRepository<IUnitRepository, UnitRepository>();

    /// <inheritdoc />
    public IWarehouseRepository Warehouses =>
        _warehouses ??= GetOrAddSpecificRepository<IWarehouseRepository, WarehouseRepository>();

    /// <inheritdoc />
    public ILocationRepository Locations =>
        _locations ??= GetOrAddSpecificRepository<ILocationRepository, LocationRepository>();

    /// <inheritdoc />
    public IStockRepository Stocks =>
        _stocks ??= GetOrAddSpecificRepository<IStockRepository, StockRepository>();

    /// <inheritdoc />
    public IStockMovementRepository StockMovements =>
        _stockMovements ??= GetOrAddSpecificRepository<IStockMovementRepository, StockMovementRepository>();

    /// <inheritdoc />
    public IStockReservationRepository StockReservations =>
        _stockReservations ??= GetOrAddSpecificRepository<IStockReservationRepository, StockReservationRepository>();

    /// <inheritdoc />
    public IStockTransferRepository StockTransfers =>
        _stockTransfers ??= GetOrAddSpecificRepository<IStockTransferRepository, StockTransferRepository>();

    /// <inheritdoc />
    public IStockCountRepository StockCounts =>
        _stockCounts ??= GetOrAddSpecificRepository<IStockCountRepository, StockCountRepository>();

    /// <inheritdoc />
    public ISupplierRepository Suppliers =>
        _suppliers ??= GetOrAddSpecificRepository<ISupplierRepository, SupplierRepository>();

    /// <inheritdoc />
    public IPriceListRepository PriceLists =>
        _priceLists ??= GetOrAddSpecificRepository<IPriceListRepository, PriceListRepository>();

    /// <inheritdoc />
    public ILotBatchRepository LotBatches =>
        _lotBatches ??= GetOrAddSpecificRepository<ILotBatchRepository, LotBatchRepository>();

    /// <inheritdoc />
    public ISerialNumberRepository SerialNumbers =>
        _serialNumbers ??= GetOrAddSpecificRepository<ISerialNumberRepository, SerialNumberRepository>();

    /// <inheritdoc />
    public IProductAttributeRepository ProductAttributes =>
        _productAttributes ??= GetOrAddSpecificRepository<IProductAttributeRepository, ProductAttributeRepository>();

    /// <inheritdoc />
    public IProductVariantRepository ProductVariants =>
        _productVariants ??= GetOrAddSpecificRepository<IProductVariantRepository, ProductVariantRepository>();

    /// <inheritdoc />
    public IProductBundleRepository ProductBundles =>
        _productBundles ??= GetOrAddSpecificRepository<IProductBundleRepository, ProductBundleRepository>();

    /// <inheritdoc />
    public IBarcodeDefinitionRepository BarcodeDefinitions =>
        _barcodeDefinitions ??= GetOrAddSpecificRepository<IBarcodeDefinitionRepository, BarcodeDefinitionRepository>();

    /// <inheritdoc />
    public IPackagingTypeRepository PackagingTypes =>
        _packagingTypes ??= GetOrAddSpecificRepository<IPackagingTypeRepository, PackagingTypeRepository>();

    /// <inheritdoc />
    public IWarehouseZoneRepository WarehouseZones =>
        _warehouseZones ??= GetOrAddSpecificRepository<IWarehouseZoneRepository, WarehouseZoneRepository>();

    /// <inheritdoc />
    public IShelfLifeRepository ShelfLives =>
        _shelfLives ??= GetOrAddSpecificRepository<IShelfLifeRepository, ShelfLifeRepository>();

    /// <inheritdoc />
    public IQualityControlRepository QualityControls =>
        _qualityControls ??= GetOrAddSpecificRepository<IQualityControlRepository, QualityControlRepository>();

    /// <inheritdoc />
    public IConsignmentStockRepository ConsignmentStocks =>
        _consignmentStocks ??= GetOrAddSpecificRepository<IConsignmentStockRepository, ConsignmentStockRepository>();

    /// <inheritdoc />
    public ICycleCountRepository CycleCounts =>
        _cycleCounts ??= GetOrAddSpecificRepository<ICycleCountRepository, CycleCountRepository>();

    /// <inheritdoc />
    public IInventoryAdjustmentRepository InventoryAdjustments =>
        _inventoryAdjustments ??= GetOrAddSpecificRepository<IInventoryAdjustmentRepository, InventoryAdjustmentRepository>();

    /// <inheritdoc />
    public IReorderRuleRepository ReorderRules =>
        _reorderRules ??= GetOrAddSpecificRepository<IReorderRuleRepository, ReorderRuleRepository>();

    #endregion

    #region IUnitOfWork Implementation - Persistence Operations

    /// <inheritdoc />
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        return await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public int SaveChanges()
    {
        ThrowIfDisposed();
        return _context.SaveChanges();
    }

    /// <inheritdoc />
    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        var result = await _context.SaveChangesAsync(cancellationToken);
        return result > 0;
    }

    #endregion

    #region IUnitOfWork Implementation - Transaction Management

    /// <inheritdoc />
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction != null)
        {
            _transactionCorrelationId = Guid.NewGuid();
            var message = $"Cannot begin transaction. A transaction is already active. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        _transactionCorrelationId = Guid.NewGuid();
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        _logger?.LogDebug(
            "Transaction started. CorrelationId: {CorrelationId}, Context: InventoryDbContext",
            _transactionCorrelationId);
    }

    /// <inheritdoc />
    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot commit transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _transaction.CommitAsync(cancellationToken);

            _logger?.LogInformation(
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: InventoryDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: InventoryDbContext",
                _transactionCorrelationId);

            await RollbackTransactionInternalAsync(cancellationToken);
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    /// <inheritdoc />
    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot rollback transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            _logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        await RollbackTransactionInternalAsync(cancellationToken);
        await DisposeTransactionAsync();
    }

    /// <inheritdoc />
    public bool HasActiveTransaction => _transaction != null;

    private async Task RollbackTransactionInternalAsync(CancellationToken cancellationToken)
    {
        if (_transaction == null) return;

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
            _logger?.LogWarning(
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: InventoryDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: InventoryDbContext",
                _transactionCorrelationId);
            throw;
        }
    }

    private async Task DisposeTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region IUnitOfWork Implementation - Repository Access

    /// <summary>
    /// Gets a repository for the specified entity type.
    /// NOT SUPPORTED in Inventory module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Inventory module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like Products, Categories, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Inventory module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Inventory module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (Products, Categories, etc.) instead.");
    }

    /// <summary>
    /// Gets a read-only repository for the specified entity type.
    /// NOT SUPPORTED in Inventory module - use domain-specific repository properties instead.
    /// </summary>
    /// <remarks>
    /// The Inventory module uses BaseEntity with int Id, not Entity&lt;Guid&gt;.
    /// Use the typed repository properties like Products, Categories, etc.
    /// </remarks>
    /// <exception cref="NotSupportedException">
    /// Always thrown. Inventory module uses int-based IDs and does not support generic Entity&lt;Guid&gt; repositories.
    /// </exception>
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        throw new NotSupportedException(
            "Inventory module uses BaseEntity with int Id, not Entity<Guid>. " +
            "Use the domain-specific repository properties (Products, Categories, etc.) instead.");
    }

    /// <summary>
    /// Gets or creates a cached instance of a specific repository type.
    /// </summary>
    private TRepository GetOrAddSpecificRepository<TRepository, TImplementation>()
        where TRepository : class
        where TImplementation : TRepository
    {
        var repositoryType = typeof(TRepository);
        return (TRepository)_repositories.GetOrAdd(
            repositoryType,
            _ => Activator.CreateInstance(typeof(TImplementation), _context)
                 ?? throw new InvalidOperationException(
                     $"Failed to create repository instance of type {typeof(TImplementation).Name}"));
    }

    #endregion

    #region Disposal

    /// <inheritdoc />
    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    /// <inheritdoc />
    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    private async ValueTask DisposeAsyncCore()
    {
        if (_disposed) return;

        if (_transaction != null)
        {
            _logger?.LogError(
                "UnitOfWork disposed with uncommitted transaction! " +
                "CorrelationId: {CorrelationId}, Context: InventoryDbContext. " +
                "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                _transactionCorrelationId);

            await _transaction.DisposeAsync();
            _transaction = null;
        }

        await _context.DisposeAsync();
        _repositories.Clear();
    }

    private void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            if (_transaction != null)
            {
                _logger?.LogError(
                    "UnitOfWork disposed with uncommitted transaction! " +
                    "CorrelationId: {CorrelationId}, Context: InventoryDbContext. " +
                    "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                    _transactionCorrelationId);

                _transaction.Dispose();
                _transaction = null;
            }

            _context.Dispose();
            _repositories.Clear();
        }

        _disposed = true;
    }

    private void ThrowIfDisposed()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(GetType().Name);
        }
    }

    #endregion
}

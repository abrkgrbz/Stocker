using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.Sales.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the Sales module.
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
/// - Exposes ALL Sales repositories
///
/// Usage in handlers:
/// <code>
/// public class CreateSalesOrderHandler
/// {
///     private readonly ISalesUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreateSalesOrderCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var order = new SalesOrder(...);
///             await _unitOfWork.SalesOrders.AddAsync(order);
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
public sealed class SalesUnitOfWork : ISalesUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<SalesUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    // Domain-specific repository backing fields
    private ISalesOrderRepository? _salesOrders;
    private IInvoiceRepository? _invoices;
    private IPaymentRepository? _payments;
    private ICustomerContractRepository? _customerContracts;
    private ISalesTerritoryRepository? _salesTerritories;
    private IShipmentRepository? _shipments;
    private IQuotationRepository? _quotations;
    private IDiscountRepository? _discounts;
    private IPromotionRepository? _promotions;
    private ICommissionRepository? _commissions;
    private ISalesReturnRepository? _salesReturns;
    private IAdvancePaymentRepository? _advancePayments;
    private ICreditNoteRepository? _creditNotes;
    private IServiceOrderRepository? _serviceOrders;
    private IWarrantyRepository? _warranties;
    private IPriceListRepository? _priceLists;
    private IDeliveryNoteRepository? _deliveryNotes;
    private IBackOrderRepository? _backOrders;
    private IInventoryReservationRepository? _inventoryReservations;
    private IOpportunityRepository? _opportunities;
    private ISalesPipelineRepository? _salesPipelines;
    private ISalesTargetRepository? _salesTargets;
    private ICustomerSegmentRepository? _customerSegments;

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="SalesUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Sales database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public SalesUnitOfWork(
        SalesDbContext context,
        ITenantService tenantService,
        ILogger<SalesUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region ISalesUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

    /// <inheritdoc />
    public ISalesOrderRepository SalesOrders =>
        _salesOrders ??= GetOrAddSpecificRepository<ISalesOrderRepository, SalesOrderRepository>();

    /// <inheritdoc />
    public IInvoiceRepository Invoices =>
        _invoices ??= GetOrAddSpecificRepository<IInvoiceRepository, InvoiceRepository>();

    /// <inheritdoc />
    public IPaymentRepository Payments =>
        _payments ??= GetOrAddSpecificRepository<IPaymentRepository, PaymentRepository>();

    /// <inheritdoc />
    public ICustomerContractRepository CustomerContracts =>
        _customerContracts ??= GetOrAddSpecificRepository<ICustomerContractRepository, CustomerContractRepository>();

    /// <inheritdoc />
    public ISalesTerritoryRepository SalesTerritories =>
        _salesTerritories ??= GetOrAddSpecificRepository<ISalesTerritoryRepository, SalesTerritoryRepository>();

    /// <inheritdoc />
    public IShipmentRepository Shipments =>
        _shipments ??= GetOrAddSpecificRepository<IShipmentRepository, ShipmentRepository>();

    /// <inheritdoc />
    public IQuotationRepository Quotations =>
        _quotations ??= GetOrAddSpecificRepository<IQuotationRepository, QuotationRepository>();

    /// <inheritdoc />
    public IDiscountRepository Discounts =>
        _discounts ??= GetOrAddSpecificRepository<IDiscountRepository, DiscountRepository>();

    /// <inheritdoc />
    public IPromotionRepository Promotions =>
        _promotions ??= GetOrAddSpecificRepository<IPromotionRepository, PromotionRepository>();

    /// <inheritdoc />
    public ICommissionRepository Commissions =>
        _commissions ??= GetOrAddSpecificRepository<ICommissionRepository, CommissionRepository>();

    /// <inheritdoc />
    public ISalesReturnRepository SalesReturns =>
        _salesReturns ??= GetOrAddSpecificRepository<ISalesReturnRepository, SalesReturnRepository>();

    /// <inheritdoc />
    public IAdvancePaymentRepository AdvancePayments =>
        _advancePayments ??= GetOrAddSpecificRepository<IAdvancePaymentRepository, AdvancePaymentRepository>();

    /// <inheritdoc />
    public ICreditNoteRepository CreditNotes =>
        _creditNotes ??= GetOrAddSpecificRepository<ICreditNoteRepository, CreditNoteRepository>();

    /// <inheritdoc />
    public IServiceOrderRepository ServiceOrders =>
        _serviceOrders ??= GetOrAddSpecificRepository<IServiceOrderRepository, ServiceOrderRepository>();

    /// <inheritdoc />
    public IWarrantyRepository Warranties =>
        _warranties ??= GetOrAddSpecificRepository<IWarrantyRepository, WarrantyRepository>();

    /// <inheritdoc />
    public IPriceListRepository PriceLists =>
        _priceLists ??= GetOrAddSpecificRepository<IPriceListRepository, PriceListRepository>();

    /// <inheritdoc />
    public IDeliveryNoteRepository DeliveryNotes =>
        _deliveryNotes ??= GetOrAddSpecificRepository<IDeliveryNoteRepository, DeliveryNoteRepository>();

    /// <inheritdoc />
    public IBackOrderRepository BackOrders =>
        _backOrders ??= GetOrAddSpecificRepository<IBackOrderRepository, BackOrderRepository>();

    /// <inheritdoc />
    public IInventoryReservationRepository InventoryReservations =>
        _inventoryReservations ??= GetOrAddSpecificRepository<IInventoryReservationRepository, InventoryReservationRepository>();

    /// <inheritdoc />
    public IOpportunityRepository Opportunities =>
        _opportunities ??= GetOrAddSpecificRepository<IOpportunityRepository, OpportunityRepository>();

    /// <inheritdoc />
    public ISalesPipelineRepository SalesPipelines =>
        _salesPipelines ??= GetOrAddSpecificRepository<ISalesPipelineRepository, SalesPipelineRepository>();

    /// <inheritdoc />
    public ISalesTargetRepository SalesTargets =>
        _salesTargets ??= GetOrAddSpecificRepository<ISalesTargetRepository, SalesTargetRepository>();

    /// <inheritdoc />
    public ICustomerSegmentRepository CustomerSegments =>
        _customerSegments ??= GetOrAddSpecificRepository<ICustomerSegmentRepository, CustomerSegmentRepository>();

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
            "Transaction started. CorrelationId: {CorrelationId}, Context: SalesDbContext",
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
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: SalesDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: SalesDbContext",
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
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: SalesDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: SalesDbContext",
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

    /// <inheritdoc />
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        return GetOrAddRepository<TEntity>();
    }

    /// <inheritdoc />
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        return GetOrAddReadRepository<TEntity>();
    }

    private IRepository<TEntity> GetOrAddRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        return (IRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new SalesGenericRepository<TEntity>(_context));
    }

    private IReadRepository<TEntity> GetOrAddReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        // Use same cache key but cast to IReadRepository - SalesGenericRepository implements both
        return (IReadRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new SalesGenericRepository<TEntity>(_context));
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
                "CorrelationId: {CorrelationId}, Context: SalesDbContext. " +
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
                    "CorrelationId: {CorrelationId}, Context: SalesDbContext. " +
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

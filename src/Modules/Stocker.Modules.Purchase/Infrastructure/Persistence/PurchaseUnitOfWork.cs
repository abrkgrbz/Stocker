using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Purchase.Infrastructure.Persistence.Repositories;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Modules.Purchase.Infrastructure.Persistence;

/// <summary>
/// Unit of Work implementation for the Purchase module.
/// Implements IUnitOfWork directly to avoid circular dependency with Stocker.Persistence.
///
/// This class provides:
/// - Transaction management with strict mode
/// - Repository access with caching
/// - Multi-tenancy support via TenantId property
/// - IAsyncDisposable for proper async cleanup
/// </summary>
/// <remarks>
/// Key features:
/// - Thread-safe repository caching using ConcurrentDictionary
/// - Strict transaction management (throws on duplicate begin, instead of silent return)
/// - Correlation ID logging for transaction lifecycle
///
/// NOTE: Domain-specific repository properties will be added as the Purchase module repositories
/// are created. Currently the Purchase module uses generic Repository&lt;T&gt;() access.
///
/// Usage in handlers:
/// <code>
/// public class CreatePurchaseOrderHandler
/// {
///     private readonly IPurchaseUnitOfWork _unitOfWork;
///
///     public async Task Handle(CreatePurchaseOrderCommand command)
///     {
///         await _unitOfWork.BeginTransactionAsync();
///         try
///         {
///             var order = new PurchaseOrder(...);
///             _unitOfWork.Repository&lt;PurchaseOrder&gt;().Add(order);
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
public sealed class PurchaseUnitOfWork : IPurchaseUnitOfWork, IAsyncDisposable
{
    #region Fields

    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ILogger<PurchaseUnitOfWork>? _logger;

    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private Guid _transactionCorrelationId;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    #endregion

    #region Constructor

    /// <summary>
    /// Initializes a new instance of the <see cref="PurchaseUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Purchase database context.</param>
    /// <param name="tenantService">The tenant service for multi-tenancy support.</param>
    /// <param name="logger">Optional logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context or tenantService is null.</exception>
    public PurchaseUnitOfWork(
        PurchaseDbContext context,
        ITenantService tenantService,
        ILogger<PurchaseUnitOfWork>? logger = null)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger;
    }

    #endregion

    #region IPurchaseUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => _tenantService.GetCurrentTenantId()
        ?? throw new InvalidOperationException("No tenant context available. Ensure tenant middleware is configured.");

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
            "Transaction started. CorrelationId: {CorrelationId}, Context: PurchaseDbContext",
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
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: PurchaseDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: PurchaseDbContext",
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
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: PurchaseDbContext",
                _transactionCorrelationId);
        }
        catch (Exception ex)
        {
            _logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: PurchaseDbContext",
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
            _ => new PurchaseGenericRepository<TEntity>(_context));
    }

    private IReadRepository<TEntity> GetOrAddReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        // Use same cache key but cast to IReadRepository - PurchaseGenericRepository implements both
        return (IReadRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => new PurchaseGenericRepository<TEntity>(_context));
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
                "CorrelationId: {CorrelationId}, Context: PurchaseDbContext. " +
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
                    "CorrelationId: {CorrelationId}, Context: PurchaseDbContext. " +
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

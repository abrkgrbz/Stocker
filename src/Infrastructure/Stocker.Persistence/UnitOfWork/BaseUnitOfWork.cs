using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Abstract base class for all Unit of Work implementations.
/// This is the SINGLE SOURCE OF TRUTH for UoW pattern in the Stocker project.
///
/// All module-specific UnitOfWork classes MUST inherit from this base class.
/// Direct IUnitOfWork implementation on DbContext classes is FORBIDDEN.
///
/// Features:
/// - Thread-safe repository caching using ConcurrentDictionary (Report Issue #9)
/// - Strict transaction management with proper exception handling (Report Issue #5)
/// - IAsyncDisposable implementation for proper async cleanup (Report Issue #8)
/// - Logging for transaction lifecycle events
/// - LSP-compliant ReadRepository implementation (Report Issue #2)
/// </summary>
/// <typeparam name="TContext">The DbContext type this UnitOfWork manages.</typeparam>
public abstract class BaseUnitOfWork<TContext> : IUnitOfWork
    where TContext : DbContext
{
    #region Fields

    /// <summary>
    /// The underlying DbContext instance.
    /// </summary>
    protected readonly TContext Context;

    /// <summary>
    /// Logger for transaction lifecycle events.
    /// </summary>
    protected readonly ILogger? Logger;

    /// <summary>
    /// Current active transaction, if any.
    /// </summary>
    private IDbContextTransaction? _transaction;

    /// <summary>
    /// Flag to track disposal state.
    /// </summary>
    private bool _disposed;

    /// <summary>
    /// Thread-safe cache for repository instances.
    /// Repositories are cached per entity type for the lifetime of this UnitOfWork.
    /// </summary>
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    /// <summary>
    /// Correlation ID for tracking transactions across logs.
    /// </summary>
    private Guid _transactionCorrelationId;

    #endregion

    #region Constructors

    /// <summary>
    /// Initializes a new instance of the <see cref="BaseUnitOfWork{TContext}"/> class.
    /// </summary>
    /// <param name="context">The DbContext instance to use.</param>
    /// <exception cref="ArgumentNullException">Thrown when context is null.</exception>
    protected BaseUnitOfWork(TContext context)
    {
        Context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="BaseUnitOfWork{TContext}"/> class with logging support.
    /// </summary>
    /// <param name="context">The DbContext instance to use.</param>
    /// <param name="logger">Logger for transaction lifecycle events.</param>
    /// <exception cref="ArgumentNullException">Thrown when context is null.</exception>
    protected BaseUnitOfWork(TContext context, ILogger? logger)
        : this(context)
    {
        Logger = logger;
    }

    #endregion

    #region Persistence Operations

    /// <inheritdoc />
    public virtual async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        return await Context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public virtual int SaveChanges()
    {
        ThrowIfDisposed();
        return Context.SaveChanges();
    }

    /// <inheritdoc />
    /// <remarks>
    /// Added to interface to resolve Report Issue #3 (SaveEntitiesAsync missing from interface).
    /// </remarks>
    public virtual async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();
        var result = await Context.SaveChangesAsync(cancellationToken);
        return result > 0;
    }

    #endregion

    #region Transaction Management

    /// <inheritdoc />
    /// <remarks>
    /// STRICT MODE: Throws exception if transaction already active (Report Issue #5).
    /// NEVER fails silently.
    /// </remarks>
    public virtual async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction != null)
        {
            _transactionCorrelationId = Guid.NewGuid();
            var message = $"Cannot begin transaction. A transaction is already active. CorrelationId: {_transactionCorrelationId}";
            Logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        _transactionCorrelationId = Guid.NewGuid();
        _transaction = await Context.Database.BeginTransactionAsync(cancellationToken);

        Logger?.LogDebug(
            "Transaction started. CorrelationId: {CorrelationId}, Context: {ContextType}",
            _transactionCorrelationId,
            typeof(TContext).Name);
    }

    /// <inheritdoc />
    public virtual async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot commit transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            Logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _transaction.CommitAsync(cancellationToken);

            Logger?.LogInformation(
                "Transaction committed successfully. CorrelationId: {CorrelationId}, Context: {ContextType}",
                _transactionCorrelationId,
                typeof(TContext).Name);
        }
        catch (Exception ex)
        {
            Logger?.LogError(
                ex,
                "Transaction commit failed. Rolling back. CorrelationId: {CorrelationId}, Context: {ContextType}",
                _transactionCorrelationId,
                typeof(TContext).Name);

            await RollbackTransactionInternalAsync(cancellationToken);
            throw;
        }
        finally
        {
            await DisposeTransactionAsync();
        }
    }

    /// <inheritdoc />
    public virtual async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        ThrowIfDisposed();

        if (_transaction == null)
        {
            var message = $"Cannot rollback transaction. No active transaction found. CorrelationId: {_transactionCorrelationId}";
            Logger?.LogError(message);
            throw new InvalidOperationException(message);
        }

        await RollbackTransactionInternalAsync(cancellationToken);
        await DisposeTransactionAsync();
    }

    /// <inheritdoc />
    public bool HasActiveTransaction => _transaction != null;

    /// <summary>
    /// Internal rollback without disposal - used by CommitTransactionAsync on failure.
    /// </summary>
    private async Task RollbackTransactionInternalAsync(CancellationToken cancellationToken)
    {
        if (_transaction == null) return;

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
            Logger?.LogWarning(
                "Transaction rolled back. CorrelationId: {CorrelationId}, Context: {ContextType}",
                _transactionCorrelationId,
                typeof(TContext).Name);
        }
        catch (Exception ex)
        {
            Logger?.LogError(
                ex,
                "Transaction rollback failed. CorrelationId: {CorrelationId}, Context: {ContextType}",
                _transactionCorrelationId,
                typeof(TContext).Name);
            throw;
        }
    }

    /// <summary>
    /// Disposes the current transaction asynchronously.
    /// </summary>
    private async Task DisposeTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    #endregion

    #region Repository Access

    /// <inheritdoc />
    public IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        return GetOrAddRepository<TEntity>();
    }

    /// <inheritdoc />
    /// <remarks>
    /// Fixed LSP Violation - Report Issue #2:
    /// Returns valid repository instance instead of throwing NotSupportedException.
    /// IRepository inherits from IReadRepository, so we can safely return the same instance.
    /// </remarks>
    public IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>
    {
        ThrowIfDisposed();
        // IRepository<T> inherits from IReadRepository<T>, so we can safely return it
        return GetOrAddRepository<TEntity>();
    }

    /// <summary>
    /// Gets or creates a cached repository instance using thread-safe ConcurrentDictionary.
    /// Report Issue #9: Repository caching for performance.
    /// </summary>
    /// <typeparam name="TEntity">The entity type.</typeparam>
    /// <returns>A cached or newly created repository instance.</returns>
    protected IRepository<TEntity> GetOrAddRepository<TEntity>() where TEntity : Entity<Guid>
    {
        var entityType = typeof(TEntity);
        return (IRepository<TEntity>)_repositories.GetOrAdd(
            entityType,
            _ => CreateRepositoryInstance<TEntity>());
    }

    /// <summary>
    /// Creates a new repository instance for the specified entity type.
    /// Override in derived classes for custom repository implementations.
    /// </summary>
    /// <typeparam name="TEntity">The entity type.</typeparam>
    /// <returns>A new repository instance.</returns>
    protected virtual IRepository<TEntity> CreateRepositoryInstance<TEntity>() where TEntity : Entity<Guid>
    {
        return new GenericRepository<TEntity, TContext>(Context);
    }

    /// <summary>
    /// Gets or creates a cached instance of a specific repository type.
    /// Use this for domain-specific repositories that extend beyond generic operations.
    /// </summary>
    /// <typeparam name="TRepository">The repository interface type.</typeparam>
    /// <typeparam name="TImplementation">The repository implementation type.</typeparam>
    /// <returns>A cached or newly created specific repository instance.</returns>
    protected TRepository GetOrAddSpecificRepository<TRepository, TImplementation>()
        where TRepository : class
        where TImplementation : TRepository
    {
        var repositoryType = typeof(TRepository);
        return (TRepository)_repositories.GetOrAdd(
            repositoryType,
            _ => CreateSpecificRepositoryInstance<TImplementation>());
    }

    /// <summary>
    /// Creates a new instance of a specific repository type.
    /// Override for custom instantiation logic.
    /// </summary>
    /// <typeparam name="TImplementation">The repository implementation type.</typeparam>
    /// <returns>A new specific repository instance.</returns>
    protected virtual object CreateSpecificRepositoryInstance<TImplementation>()
    {
        return Activator.CreateInstance(typeof(TImplementation), Context)
               ?? throw new InvalidOperationException(
                   $"Failed to create repository instance of type {typeof(TImplementation).Name}");
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
    /// <remarks>
    /// Report Issue #8: Proper async disposal to prevent thread blocking.
    /// </remarks>
    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        Dispose(disposing: false);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// Core async disposal logic.
    /// </summary>
    protected virtual async ValueTask DisposeAsyncCore()
    {
        if (_disposed) return;

        // Log warning if disposing with active uncommitted transaction
        if (_transaction != null)
        {
            Logger?.LogError(
                "UnitOfWork disposed with uncommitted transaction! " +
                "CorrelationId: {CorrelationId}, Context: {ContextType}. " +
                "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                _transactionCorrelationId,
                typeof(TContext).Name);

            await _transaction.DisposeAsync();
            _transaction = null;
        }

        await Context.DisposeAsync();
        _repositories.Clear();
    }

    /// <summary>
    /// Releases the unmanaged resources used by the <see cref="BaseUnitOfWork{TContext}"/>
    /// and optionally releases the managed resources.
    /// </summary>
    /// <param name="disposing">
    /// true to release both managed and unmanaged resources;
    /// false to release only unmanaged resources.
    /// </param>
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            // Log warning if disposing with active uncommitted transaction
            if (_transaction != null)
            {
                Logger?.LogError(
                    "UnitOfWork disposed with uncommitted transaction! " +
                    "CorrelationId: {CorrelationId}, Context: {ContextType}. " +
                    "This may indicate a bug - transactions should be explicitly committed or rolled back.",
                    _transactionCorrelationId,
                    typeof(TContext).Name);

                _transaction.Dispose();
                _transaction = null;
            }

            Context.Dispose();
            _repositories.Clear();
        }

        _disposed = true;
    }

    /// <summary>
    /// Throws <see cref="ObjectDisposedException"/> if this instance has been disposed.
    /// </summary>
    protected void ThrowIfDisposed()
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(GetType().Name);
        }
    }

    #endregion
}

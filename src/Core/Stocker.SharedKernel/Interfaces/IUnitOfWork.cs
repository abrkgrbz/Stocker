using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.Interfaces;

/// <summary>
/// Unit of Work pattern interface providing transaction management and change persistence.
/// This is the standardized interface that ALL UnitOfWork implementations MUST inherit.
///
/// Design Decisions:
/// - Inherits IAsyncDisposable for proper async resource cleanup (Fixed Report Issue #8)
/// - Provides both sync and async save methods for flexibility
/// - Transaction management with strict mode (no silent failures)
/// - Repository access methods for generic entity operations
/// </summary>
/// <remarks>
/// IMPORTANT: This interface MUST be implemented through BaseUnitOfWork&lt;TContext&gt;.
/// Direct implementation on DbContext classes is FORBIDDEN (Report Issue #4).
/// </remarks>
public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    #region Persistence Operations

    /// <summary>
    /// Commits all changes made in this unit of work to the database asynchronously.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <returns>The number of state entries written to the database.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits all changes made in this unit of work to the database synchronously.
    /// Prefer <see cref="SaveChangesAsync"/> for async workflows.
    /// </summary>
    /// <returns>The number of state entries written to the database.</returns>
    int SaveChanges();

    /// <summary>
    /// Saves all pending entity changes and returns success status.
    /// This method is useful when you need a boolean result instead of affected row count.
    /// Added to interface to resolve Report Issue #3 (SaveEntitiesAsync missing from interface).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <returns>True if at least one entity was saved; otherwise, false.</returns>
    Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default);

    #endregion

    #region Transaction Management

    /// <summary>
    /// Begins a new database transaction asynchronously.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when a transaction is already in progress.
    /// STRICT MODE: This method NEVER fails silently (Fixed Report Issue #5).
    /// </exception>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commits the current transaction asynchronously.
    /// All pending changes will be saved before committing.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when no transaction is in progress.
    /// </exception>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rolls back the current transaction asynchronously.
    /// All pending changes will be discarded.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for the operation.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when no transaction is in progress.
    /// </exception>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a value indicating whether there is an active transaction.
    /// </summary>
    bool HasActiveTransaction { get; }

    #endregion

    #region Repository Access

    /// <summary>
    /// Gets a repository for the specified entity type.
    /// Repositories are cached per UnitOfWork instance for performance.
    /// </summary>
    /// <typeparam name="TEntity">The entity type.</typeparam>
    /// <returns>A repository instance for the specified entity type.</returns>
    IRepository<TEntity> Repository<TEntity>() where TEntity : Entity<Guid>;

    /// <summary>
    /// Gets a read-only repository for the specified entity type.
    /// This method returns the same repository instance as Repository&lt;T&gt;() since
    /// IRepository&lt;T&gt; inherits from IReadRepository&lt;T&gt;.
    ///
    /// Fixed LSP Violation - Report Issue #2:
    /// This method MUST return a valid repository instance, NEVER throw NotSupportedException.
    /// </summary>
    /// <typeparam name="TEntity">The entity type.</typeparam>
    /// <returns>A read-only repository instance for the specified entity type.</returns>
    IReadRepository<TEntity> ReadRepository<TEntity>() where TEntity : Entity<Guid>;

    #endregion
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using System.Collections.Concurrent;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Base Unit of Work implementation with repository caching
/// </summary>
public abstract class BaseUnitOfWork<TContext> : IUnitOfWork
    where TContext : DbContext
{
    protected readonly TContext Context;
    private IDbContextTransaction? _transaction;
    private bool _disposed;
    private readonly ConcurrentDictionary<Type, object> _repositories = new();

    protected BaseUnitOfWork(TContext context)
    {
        Context = context ?? throw new ArgumentNullException(nameof(context));
    }

    #region Transaction Management

    public virtual async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await Context.SaveChangesAsync(cancellationToken);
    }

    public virtual int SaveChanges()
    {
        return Context.SaveChanges();
    }

    public virtual async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _transaction = await Context.Database.BeginTransactionAsync(cancellationToken);
    }

    public virtual async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction in progress.");
        }

        try
        {
            await SaveChangesAsync(cancellationToken);
            await _transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public virtual async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction in progress.");
        }

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public bool HasActiveTransaction => _transaction != null;

    #endregion

    #region Repository Access

    /// <summary>
    /// Gets or creates a cached repository instance
    /// </summary>
    protected IRepository<T> GetOrAddRepository<T>() where T : Entity<Guid>
    {
        var type = typeof(T);
        return (IRepository<T>)_repositories.GetOrAdd(type, _ => CreateRepositoryInstance<T>());
    }

    /// <summary>
    /// Creates a new repository instance - override in derived classes
    /// </summary>
    protected abstract IRepository<T> CreateRepositoryInstance<T>() where T : Entity<Guid>;

    #endregion

    #region Disposal

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _transaction?.Dispose();
                Context.Dispose();
                _repositories.Clear();
            }

            _disposed = true;
        }
    }

    #endregion
}
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Repositories;

/// <summary>
/// Generic repository implementation for Sales entities
/// Provides concrete implementation of BaseRepository for entities without specific repositories
/// Implements IRepository (combines IReadRepository and IWriteRepository) for UnitOfWork usage
/// Also implements IReadRepository&lt;TEntity&gt; explicitly for ReadRepository&lt;T&gt;() access
/// </summary>
public class SalesGenericRepository<TEntity> : BaseRepository<TEntity>, IRepository<TEntity>, IReadRepository<TEntity>
    where TEntity : Entity<Guid>
{
    public SalesGenericRepository(SalesDbContext context) : base(context)
    {
    }
}

/// <summary>
/// Generic repository implementation for Sales entities with custom ID type
/// </summary>
public class SalesGenericRepository<TEntity, TId> : BaseRepository<TEntity, TId>, IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    public SalesGenericRepository(SalesDbContext context) : base(context)
    {
    }
}

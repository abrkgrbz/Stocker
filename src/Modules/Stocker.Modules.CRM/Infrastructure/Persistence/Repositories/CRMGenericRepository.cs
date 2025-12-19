using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Generic repository implementation for CRM entities
/// Provides concrete implementation of BaseRepository for entities without specific repositories
/// Implements IRepository (combines IReadRepository and IWriteRepository) for UnitOfWork usage
/// Also implements IReadRepository&lt;TEntity&gt; explicitly for ReadRepository&lt;T&gt;() access
/// </summary>
public class CRMGenericRepository<TEntity> : BaseRepository<TEntity>, IRepository<TEntity>, IReadRepository<TEntity>
    where TEntity : Entity<Guid>
{
    public CRMGenericRepository(CRMDbContext context) : base(context)
    {
    }
}

/// <summary>
/// Generic repository implementation for CRM entities with custom ID type
/// </summary>
public class CRMGenericRepository<TEntity, TId> : BaseRepository<TEntity, TId>, IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    public CRMGenericRepository(CRMDbContext context) : base(context)
    {
    }
}

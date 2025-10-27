using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Repositories;

/// <summary>
/// Generic repository implementation for CRM entities
/// Provides concrete implementation of BaseRepository for entities without specific repositories
/// Explicitly implements IReadRepository and IWriteRepository for DI resolution
/// </summary>
public class CRMGenericRepository<TEntity> : BaseRepository<TEntity>, IReadRepository<TEntity>, IWriteRepository<TEntity>
    where TEntity : Entity<Guid>
{
    public CRMGenericRepository(CRMDbContext context) : base(context)
    {
    }
}

/// <summary>
/// Generic repository implementation for CRM entities with custom ID type
/// </summary>
public class CRMGenericRepository<TEntity, TId> : BaseRepository<TEntity, TId>, IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    public CRMGenericRepository(CRMDbContext context) : base(context)
    {
    }
}

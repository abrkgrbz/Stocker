using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.Interfaces;

/// <summary>
/// Combined repository interface for both read and write operations
/// </summary>
public interface IRepository<TEntity> : IRepository<TEntity, Guid>
    where TEntity : Entity<Guid>
{
}

public interface IRepository<TEntity, TId> : IReadRepository<TEntity, TId>, IWriteRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
}
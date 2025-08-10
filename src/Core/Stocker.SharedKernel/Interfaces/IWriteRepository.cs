using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.Interfaces;

/// <summary>
/// Write-only repository interface following CQRS pattern
/// </summary>
public interface IWriteRepository<TEntity> : IWriteRepository<TEntity, Guid>
    where TEntity : Entity<Guid>
{
}

public interface IWriteRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    /// <summary>
    /// Adds an entity to the repository
    /// </summary>
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple entities to the repository
    /// </summary>
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an entity in the repository
    /// </summary>
    void Update(TEntity entity);

    /// <summary>
    /// Updates an entity in the repository asynchronously
    /// </summary>
    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates multiple entities in the repository
    /// </summary>
    void UpdateRange(IEnumerable<TEntity> entities);

    /// <summary>
    /// Removes an entity from the repository
    /// </summary>
    void Remove(TEntity entity);

    /// <summary>
    /// Removes multiple entities from the repository
    /// </summary>
    void RemoveRange(IEnumerable<TEntity> entities);

    /// <summary>
    /// Removes an entity by its identifier
    /// </summary>
    Task RemoveByIdAsync(TId id, CancellationToken cancellationToken = default);
}
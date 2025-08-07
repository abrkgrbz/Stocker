using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.Repositories;

/// <summary>
/// Unit of Work for Tenant database context
/// </summary>
public interface ITenantUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant ID
    /// </summary>
    Guid TenantId { get; }
    
    /// <summary>
    /// Gets a repository for the specified entity type
    /// </summary>
    IRepository<T> Repository<T>() where T : Entity<Guid>;

    /// <summary>
    /// Gets a read-only repository for the specified entity type
    /// </summary>
    IReadRepository<T> ReadRepository<T>() where T : Entity<Guid>;
}
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Unit of Work implementation for Tenant database context
/// </summary>
public class TenantUnitOfWork : BaseUnitOfWork<TenantDbContext>, ITenantUnitOfWork
{
    public TenantUnitOfWork(TenantDbContext context) : base(context)
    {
    }

    #region ITenantUnitOfWork Implementation

    public Guid TenantId => Context.TenantId;

    public IRepository<T> Repository<T>() where T : Entity<Guid>
    {
        return GetOrAddRepository<T>();
    }

    public IReadRepository<T> ReadRepository<T>() where T : Entity<Guid>
    {
        // IRepository<T> already contains all IReadRepository<T> methods
        // Use Repository<T>() directly instead - it has the same functionality
        // This method exists only to satisfy the interface contract
        throw new NotSupportedException(
            "Use Repository<T>() instead of ReadRepository<T>(). " +
            "IRepository<T> already includes all read operations from IReadRepository<T>.");
    }

    #endregion

    #region Protected Methods

    protected override IRepository<T> CreateRepositoryInstance<T>()
    {
        return new GenericRepository<T, TenantDbContext>(Context);
    }

    #endregion
}
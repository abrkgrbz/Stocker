using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Unit of Work implementation for Master database context
/// </summary>
public class MasterUnitOfWork : BaseUnitOfWork<MasterDbContext>, IMasterUnitOfWork
{
    public MasterUnitOfWork(MasterDbContext context) : base(context)
    {
    }

    #region IMasterUnitOfWork Implementation

    public IRepository<T> Repository<T>() where T : Entity<Guid>
    {
        return GetOrAddRepository<T>();
    }

    public IReadRepository<T> ReadRepository<T>() where T : Entity<Guid>
    {
        // Return the same repository instance but typed as IReadRepository
        // IRepository<T> implements IReadRepository<T>, so this cast is valid
        var repository = GetOrAddRepository<T>();
        return (IReadRepository<T>)(object)repository;
    }

    #endregion

    #region Protected Methods

    protected override IRepository<T> CreateRepositoryInstance<T>()
    {
        return new GenericRepository<T, MasterDbContext>(Context);
    }

    #endregion
}
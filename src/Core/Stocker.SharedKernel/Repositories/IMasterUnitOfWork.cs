using Stocker.SharedKernel.Interfaces;

namespace Stocker.SharedKernel.Repositories;

/// <summary>
/// Unit of Work interface for Master database context.
/// Used for tenant-agnostic operations (tenant management, system configuration, etc.)
///
/// Inherits all repository access and transaction management from IUnitOfWork.
/// </summary>
/// <remarks>
/// Implementation: <see cref="Stocker.Persistence.UnitOfWork.MasterUnitOfWork"/>
/// </remarks>
public interface IMasterUnitOfWork : IUnitOfWork
{
    // Repository<T>() and ReadRepository<T>() are inherited from IUnitOfWork
    // No additional members required for Master context
}

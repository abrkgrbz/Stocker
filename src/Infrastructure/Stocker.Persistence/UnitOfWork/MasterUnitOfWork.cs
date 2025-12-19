using Microsoft.Extensions.Logging;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Unit of Work implementation for Master database context.
/// Used for tenant-agnostic operations (tenant management, system configuration, etc.)
///
/// Inherits all functionality from BaseUnitOfWork.
/// Repository<T>() and ReadRepository<T>() are implemented in base class.
/// </summary>
public class MasterUnitOfWork : BaseUnitOfWork<MasterDbContext>, IMasterUnitOfWork
{
    /// <summary>
    /// Initializes a new instance of the <see cref="MasterUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Master database context.</param>
    public MasterUnitOfWork(MasterDbContext context)
        : base(context)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="MasterUnitOfWork"/> class with logging support.
    /// </summary>
    /// <param name="context">The Master database context.</param>
    /// <param name="logger">Logger for transaction lifecycle events.</param>
    public MasterUnitOfWork(MasterDbContext context, ILogger<MasterUnitOfWork> logger)
        : base(context, logger)
    {
    }

    // All methods (Repository<T>, ReadRepository<T>, transaction management, etc.)
    // are inherited from BaseUnitOfWork<MasterDbContext>
    // No additional implementation needed - base class handles everything correctly
}

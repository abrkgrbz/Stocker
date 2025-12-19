using Microsoft.Extensions.Logging;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Persistence.UnitOfWork;

/// <summary>
/// Unit of Work implementation for Tenant database context.
/// Used for tenant-specific operations with automatic tenant isolation.
///
/// Inherits all functionality from BaseUnitOfWork.
/// Adds TenantId property for multi-tenancy support.
/// </summary>
public class TenantUnitOfWork : BaseUnitOfWork<TenantDbContext>, ITenantUnitOfWork
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TenantUnitOfWork"/> class.
    /// </summary>
    /// <param name="context">The Tenant database context.</param>
    public TenantUnitOfWork(TenantDbContext context)
        : base(context)
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="TenantUnitOfWork"/> class with logging support.
    /// </summary>
    /// <param name="context">The Tenant database context.</param>
    /// <param name="logger">Logger for transaction lifecycle events.</param>
    public TenantUnitOfWork(TenantDbContext context, ILogger<TenantUnitOfWork> logger)
        : base(context, logger)
    {
    }

    #region ITenantUnitOfWork Implementation

    /// <inheritdoc />
    public Guid TenantId => Context.TenantId;

    #endregion

    // All other methods (Repository<T>, ReadRepository<T>, transaction management, etc.)
    // are inherited from BaseUnitOfWork<TenantDbContext>
}

using Stocker.SharedKernel.Interfaces;

namespace Stocker.SharedKernel.Repositories;

/// <summary>
/// Unit of Work interface for Tenant database context.
/// Used for tenant-specific operations with automatic tenant isolation.
///
/// Inherits all repository access and transaction management from IUnitOfWork.
/// Adds TenantId property for multi-tenancy support.
/// </summary>
/// <remarks>
/// Implementation: <see cref="Stocker.Persistence.UnitOfWork.TenantUnitOfWork"/>
/// </remarks>
public interface ITenantUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations performed through this UnitOfWork are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }
}

using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for CustomerSegment
/// </summary>
public interface ICustomerSegmentRepository : IRepository<CustomerSegment>
{
    Task<List<CustomerSegment>> GetByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<List<CustomerSegment>> GetActiveByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<CustomerSegment?> GetByIdWithMembersAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid tenantId, string name, CancellationToken cancellationToken = default);
}

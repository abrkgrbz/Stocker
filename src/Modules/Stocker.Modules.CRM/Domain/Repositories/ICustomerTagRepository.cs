using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.CRM.Domain.Repositories;

/// <summary>
/// Repository interface for CustomerTag
/// </summary>
public interface ICustomerTagRepository : IRepository<CustomerTag>
{
    Task<List<CustomerTag>> GetByCustomerAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<List<CustomerTag>> GetByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<CustomerTag?> GetByCustomerAndTagAsync(Guid customerId, string tag, CancellationToken cancellationToken = default);
    Task<List<string>> GetDistinctTagsAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
